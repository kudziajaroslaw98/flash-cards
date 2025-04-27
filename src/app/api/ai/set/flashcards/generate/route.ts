import { cardLengthDictionary } from '#/dictionaries/card-length.dictionary';
import { knowledgeLevelDictionary } from '#/dictionaries/knowledge-level.dictionary';
import { learningStyleDictionary } from '#/dictionaries/learning-style.dictionary';
import { mnemonicPreferenceDictionary } from '#/dictionaries/mnemonic-preference.dictionary';
import { cardLengthSchema } from '#/schemas/card-length.schema';
import { knowledgeLevelSchema } from '#/schemas/knowledge-level.schema';
import { learningStyleAdaptationSchema } from '#/schemas/learning-style-adaptation.schema';
import { mnemonicPreferencesSchema } from '#/schemas/mnemonic-preferences.schema';
import { Logger } from '#/shared/helpers/logger/logger';
import { RateLimit } from '#/shared/utils/api-limiter';
import checkValidity from '#/shared/utils/check-validity.util';
import { createClient } from '#/shared/utils/supabase/server';
import uuid from '#/shared/utils/uuid.util';
import { FlashcardGenerationOptions } from '#/types/flashcard-generation-options.type';
import type { KnowledgeLevel } from '#/types/knowledge-level.type';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

export const maxDuration = 30;
const routePath = 'ai/set/flashcards/generate';

async function validateBody(body: Record<string, unknown>) {
  const validationScheme = z.object({
    fileData: z.string().nullish(),
    mimeType: z
      .string()
      .refine(
        (type) => type.startsWith('image/') || type === 'application/pdf',
        'Invalid file type. Only images and PDFs are supported.',
      )
      .nullish(),
    options: z.object({
      knowledgeLevel: knowledgeLevelSchema.nullish(),
      learningStyle: learningStyleAdaptationSchema.nullish(),
      mnemonic: mnemonicPreferencesSchema.nullish(),
      cardLength: cardLengthSchema.nullish(),
      blacklist: z.array(z.string()).nullish(),
      focusAreas: z.array(z.string()).nullish(),
      additionalUserPrompt: z.string().nullish(),
      flashcardsNeeded: z.enum(['5', '10', '15', '20', '25', '50'], {
        message: 'Invalid number of flashcards',
      }),
    }),
    flashcards: z
      .array(
        z
          .string()
          .min(1, 'flashcard is required')
          .max(255, 'flashcard is too long'),
      )
      .nullish(),
    setName: z.string().min(1),
    setDescription: z.string().nullish(),
  });
  const validityCheck = checkValidity(body, validationScheme);

  if (!validityCheck.valid) {
    throw new Error(validityCheck.error);
  }
}

const rateLimit = new RateLimit(1, 10, routePath);

export async function POST(req: NextRequest) {
  const sessionId = uuid();
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;
  try {
    if (user === null) {
      Logger.error('User not logged in', routePath);
      throw new Error('User not logged in');
    }

    if (user.user_metadata?.stripe_subscription_status !== 'active') {
      Logger.error(
        ` User [${user.id}] is not subscribed to a paid plan`,
        routePath,
      );
      throw new Error('User is not subscribed to a paid plan');
    }

    rateLimit.checkRateLimit(user.id);
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Rate limit exceeded',
      }),
    );
  }

  const {
    flashcards: flashcards,
    setName,
    setDescription,
    options,
    fileData,
    mimeType,
  }: {
    flashcards: string[];
    setName: string;
    setDescription: string;
    options: Partial<FlashcardGenerationOptions>;
    fileData: string;
    mimeType: string;
  } = await req.json();

  try {
    validateBody({ flashcards, setName, setDescription, options });
  } catch {
    Logger.error(`Invalid request body from user [${user.id}]`, routePath);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid request body',
      }),
    );
  }

  let flashcardsRecords = [];

  if (flashcards.length > 0) {
    const { data } = await supabase
      .from('flashcards')
      .select()
      .in('frontUuid', flashcards);
    if (data === null) {
      flashcardsRecords = [];
    } else {
      flashcardsRecords = data;
    }
  }

  const focusTagsSet = new Set<string>();

  flashcardsRecords?.forEach((flashcard) =>
    flashcard.tags.forEach((tag: string) => focusTagsSet.add(tag)),
  );
  options.focusAreas?.forEach((area) => {
    focusTagsSet.add(area);
  });

  const pickedKnowledgeLevel = knowledgeLevelDictionary.find(
    (level) => level.value === options.knowledgeLevel,
  )?.label;

  const pickedLearningStyle = learningStyleDictionary.find(
    (style) => style.value === options.learningStyle,
  )?.label;
  const pickedCardLength = cardLengthDictionary.find(
    (style) => style.value === options.cardLength,
  )?.label;
  const pickedMemonic = mnemonicPreferenceDictionary.find(
    (style) => style.value === options.mnemonic,
  )?.label;

  const getTemperature = (knowledgeLevel: KnowledgeLevel) => {
    switch (knowledgeLevel) {
      case 'unfamiliar':
        return 1.0;
      case 'beginner':
        return 1.0;
      case 'developing':
        return 0.9;
      case 'proficient':
        return 0.8;
      case 'advanced':
        return 0.6;
      case 'expert':
        return 0.5;
    }
  };

  Logger.info(`User [ ${user.id} ] is generating flashcards.`, routePath);

  Logger.info(
    `User [ ${user.id} ] is generating flashcards. ${JSON.stringify({
      flashcards: flashcards,
      setName,
      setDescription,
      options,
      mimeType,
    })}`,
    routePath,
  );

  const prompt = `
      **IMPORTANT: All generated cards MUST strictly conform to the SINGLE specified Knowledge Level: ${pickedKnowledgeLevel}. Do NOT generate simpler content.**
      # ROLE: You are an expert educational content designer specializing in creating high-quality, pedagogically sound flashcards tailored to user specifications.

      # GOAL: Generate ${options.flashcardsNeeded} unique flashcards based on the provided inputs, strictly adhering to the specified knowledge level and content focus.

      # INPUTS:
      ${
        flashcardsRecords.length === 0 && focusTagsSet.size === 0
          ? '*   **Flashcard Deck name:** ' +
            setName +
            '  *   ** Flashcard Deck description:** ' +
            setDescription
          : ' (These define the specific topics/concepts to cover when focus tags are not provided)'
      }

      *   **Knowledge Level:** ${pickedKnowledgeLevel} (This is the PRIMARY determinant of difficulty for ALL cards)
      *   **Focus Tags:** [${focusTagsSet.size > 0 ? Array.from(focusTagsSet).join(', ') : 'None provided'}] (These define the specific topics/concepts to cover)
      *   **Subject Area & Topic:** (Infer the general Subject Area [e.g., Technical/STEM, Language Learning] and specific Topic Name from the Focus Tags. Use this context for applying style and knowledge level guidance.)
      *   **Excluded Topics (Blacklist):** ${options.blacklist && options.blacklist.length > 0 ? `[${options.blacklist.join(', ')}, ${flashcardsRecords.map((summary) => `${summary.query}`).join(', ')}]` : 'None specified'} (Strictly AVOID generating cards primarily about these concepts.)
      *   **Existing Cards (Avoid Duplication):**
          ${flashcardsRecords && flashcardsRecords.length > 0 ? flashcardsRecords.map((summary) => `• ID: ${summary.id}, Topic: ${summary.topic}, Question: ${summary.query}, Context: ${summary.context}`).join('\n') : '  None provided.'}
      *   **Optional User Preferences:**
          *   Learning style preference: ${pickedLearningStyle ?? 'Non specified'}
          *   Card length preference: ${pickedCardLength ?? 'Non specified'}
          *   Mnemonic preference: ${pickedMemonic ?? 'Non specified'}
          *   Additional instructions: ${options.additionalUserPrompt ?? 'Non specified'}
          *(Note: These preferences are secondary. Knowledge Level and Coverage Focus constraints MUST take precedence.)*

          # CORE INSTRUCTIONS & GUIDANCE:

          **1. Subject-Specific Style Guidance (Base Styles):**
              *   **Technical/STEM:** How/Why Questions, Process, Application Scenarios, Comparisons, Consequences, Components. Focus: Mechanisms, Problem-Solving.
              *   **Language Learning:** Example Sentences, Dialogues, Fill-in-Blank, Meaning in Context, Synonym/Antonym, Grammar Rules. Focus: Usage, Vocabulary, Conversation.
              *   **Humanities/Social Sciences:** Who/What/When/Where, Concept Definitions, Timelines, Cause-Effect, Compare-Contrast, Arguments. Focus: Facts, Concepts, Theories, Arguments.
              *   **Arts & Music:** Image/Audio-Based ID, Technique/Process, Definitions, Artist/Style Recognition. Focus: Recognition, Techniques, Concepts.
              *   **Law & Business:** Case Studies, Definitions, Principles/Rules, Ethical Scenarios, Process, Comparisons. Focus: Application, Terminology, Principles.
              *   **Medical/Healthcare:** Diagrams, Process/Mechanism, Terminology, Clinical Scenarios, Drug/Disease Info, Definitions. Focus: Structures, Processes, Terms, Scenarios.
              *(Select appropriate styles from this list based on the inferred Subject Area and the specific Focus Tags.)*

          **2. Knowledge Level Application (CRITICAL - Determines Complexity):**
              *(Apply ONE level consistently to ALL generated cards based on the 'Knowledge Level' input: ${pickedKnowledgeLevel})*

              *   **unfamiliar:** Focus ONLY on the absolute most basic definitions and identifications. Assume ZERO prior knowledge.
              *   **beginner:** Focus on understanding foundational concepts, simple rules, and core definitions. Assume familiarity ONLY with absolute basics.
              *   **developing:** Focus on connecting basic concepts, simple application, and explaining 'how' things work. Assume basic definitions are known. DO NOT ask for basic definitions.
              *   **proficient:** Focus on APPLYING concepts in context, understanding NUANCES, comparing simple approaches, and basic analysis. Assume fundamentals are well understood. DO NOT ask for basic definitions or simple 'what is' questions. Questions MUST require application or analysis.
              *   **advanced:** Focus on complex scenarios, evaluating trade-offs, synthesis, and subtle distinctions. Assume strong practical understanding. DO NOT ask basic/intermediate 'what is' or 'how does it work' questions. Questions MUST require evaluation or synthesis.
              *   **expert:** Focus on deep analysis, design trade-offs, critique, advanced theory, and teaching complex topics. Assume mastery. DO NOT ask questions covered in standard textbooks/undergrad courses. Questions MUST require high-level evaluation, design, or critical analysis. (Refer back to the detailed expert guidance section if needed for specific examples/constraints, especially for STEM).
                -   **(Optional: Keep the detailed expert section separate or integrate a shorter version here, but ensure the negative constraints are prominent).**

          **3. Content Selection (Applying Focus & Coverage):**
              *   **Prioritize Focus Tags:** Generate content *primarily* related to the concepts specified in the ''Focus Tags''.
              *   **Identify gaps:** Identify gaps in users flashcards set and fill it with suitable content.


          **4. Constraint Checklist & Quality Control:**
              *   **Knowledge Level Consistency:** ALL cards MUST strictly match the single ''Knowledge Level'' specified. NO mixing of difficulties.
              *   **Focus Tag Relevance:** Content MUST be directly relevant to the provided ''Focus Tags''.
              *   **Blacklist Adherence:** Verify NO card's primary subject is from the ''Excluded Topics (Blacklist)''.
              *   **Uniqueness:** Avoid semantic overlap or simple reformulations of ''Existing Cards'' or other generated cards in this batch.
              *   **Style Appropriateness:** Chosen flashcard style MUST fit the Subject Area, Focus Tag content, and the complexity required by the Knowledge Level.
              *   **Accuracy & Clarity: Information must be accurate. Questions (''query''), concise answers (''answer''), and explanations (''definition'') must be clear and sufficiently detailed for the level.
              *  **Answer & Explanation Quality:**
                  -   The ''answer'' MUST be the direct, concise, and correct response to the ''query''.
                  -   The ''definition'' MUST clearly elaborate on *why* the ''answer'' is correct, provide necessary context, or break down the concept further, appropriate to the ''Knowledge Level''.
                  -   Avoid including keywords from the ''query'' directly in the ''answer'' or ''definition'' where possible if it would make the answer too obvious (no trivial hints).

          # OUTPUT FORMAT:
          Generate the response as a JSON array, where each object represents a single flashcard conforming to this structure:
    [
      {
        "id": "unique_string_ID_for_this_card",
        "query": "The clear and concise question or prompt forming the front of the flashcard.",, // The front of the flashcard
        "definition": "The detailed explanation elaborating on WHY the 'answer' is correct, providing context, or further defining the concept.", // The back of the flashcard
        "context": "The main subject or topic inferred from the Focus Tags (e.g., 'Computer Science', 'English Grammar').",
        "tags": ["list", "of", "relevant", "tags", "derived", "from", "FocusTags", "and", "specific", "card", "content"],
        "answer1": "The correct, comprehensive answer.", // The back of the flashcard
        "answer2": "Incorrect plausible answer",
        "answer3": "Incorrect plausible answer",
        "answer4": "Incorrect plausible answer",
        "examples": "Optional: Usage example(s) separated by semicolon if multiple.",
        "keyPoints": "Optional: Key takeaway(s) or note(s) separated by semicolon if multiple.",
        "synonyms": "Optional: Alternative term(s) separated by semicolon if multiple.",
        "relatedFacts": "Optional: Related concept(s) or fact(s) separated by semicolon if multiple."
      }
    ]
    Only include optional fields (examples, keyPoints, synonyms, relatedFacts) when they add significant pedagogical value relevant to the card's content and knowledge level.
    Both answer and explanation fields are required.
    Ensure the JSON is valid.
    `;

  const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
  });

  const result = streamText({
    model: gemini('gemini-2.5-flash-preview-04-17'),
    temperature: options.knowledgeLevel
      ? getTemperature(options.knowledgeLevel!)
      : 1,
    messages: [
      {
        role: 'system',
        content: `You are an expert educational content designer specializing in creating high-quality, pedagogically sound flashcards based on detailed user specifications. Your primary responsibilities, guided by the main prompt, are:

    1.  **UNIQUENESS & RELEVANCE:** Generate flashcards exploring DISTINCT concepts relevant to the specified ''Focus Tags'', strictly avoiding semantic overlap or reformulation of ''Existing Cards'' or other generated content in the current batch.
    2.  **PEDAGOGICAL APPROPRIATENESS:** Employ varied question styles and cognitive tasks (e.g., application, analysis, evaluation) that are *strictly appropriate for the single Knowledge Level specified in the main prompt*. Do NOT mix difficulty levels across cards in one request.
    3.  **KNOWLEDGE CALIBRATION (Primary Directive):** Precisely match the complexity, depth, and scope of ALL generated content (''query'', ''answer'', ''definition'', optional fields) to the *single* ''Knowledge Level'' provided in the main prompt. Adhere meticulously to the detailed guidance for that specific level.
    4.  **ANSWER & EXPLANATION QUALITY:** Create a clearly correct, concise ''answer'' and a detailed, accurate ''definition'' that effectively clarifies *why* the answer is correct, provides necessary context, and aligns with the required ''Knowledge Level'', following the JSON structure defined in the main prompt.
    5.  **CONSTRAINT ADHERENCE:** Strictly follow all constraints specified in the main prompt, including ''Coverage Focus'', ''Excluded Topics (Blacklist)'', ''Subject-Specific Styles'', and the required ''OUTPUT FORMAT''. *The main prompt's detailed instructions always take precedence.*
`,
      },
      {
        role: 'user',
        content: fileData
          ? [
              {
                type: 'text',
                text: prompt,
              },

              {
                type: 'file',
                data: Buffer.from(fileData, 'base64'),
                mimeType: mimeType,
              },
            ]
          : [
              {
                type: 'text',
                text: prompt,
              },
            ],
      },
    ],
    maxSteps: 3,
    experimental_continueSteps: true,
    onFinish(response) {
      Logger.info(
        `Generating flashcards session ${sessionId} finished successfully [RESPONSE DETAILS] ${JSON.stringify({ usage: response.usage })}`,
        routePath,
      );
    },
    onError: (error) => {
      Logger.error(
        `Generating flashcards session ${sessionId}`,
        routePath,
        JSON.stringify(error),
      );
    },
  });

  return result.toDataStreamResponse();
}
