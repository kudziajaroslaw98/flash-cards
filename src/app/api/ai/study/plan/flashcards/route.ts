import { coverageFocusDictionary } from '#/dictionaries/coverage-focus.dictionary';
import { knowledgeLevelDictionary } from '#/dictionaries/knowledge-level.dictionary';
import { cardLengthSchema } from '#/schemas/card-length.schema';
import { contentEmphasisSchema } from '#/schemas/content-emphasis.schema';
import { coverageFocusSchema } from '#/schemas/coverage-focus.schema';
import { difficultyDistributionSchema } from '#/schemas/difficulty-distribution.schema';
import { knowledgeLevelSchema } from '#/schemas/knowledge-level.schema';
import { learningStyleAdaptationSchema } from '#/schemas/learning-style-adaptation.schema';
import { mnemonicPreferencesSchema } from '#/schemas/mnemonic-preferences.schema';
import { planDurationSchema } from '#/schemas/plan-durations.schema';
import { preferredQuestionFormatsSchema } from '#/schemas/preferred-question-formats.schema';
import { Logger } from '#/shared/helpers/logger/logger';
import { RateLimit } from '#/shared/utils/api-limiter';
import checkValidity from '#/shared/utils/check-validity.util';
import { createClient } from '#/shared/utils/supabase/server';
import uuid from '#/shared/utils/uuid.util';
import type { CardLength } from '#/types/card-length.type';
import type { ContentEmphasis } from '#/types/content-emphasis.type';
import type { CoverageFocus } from '#/types/coverage-focus.type';
import type { DifficultyDistribution } from '#/types/difficulty-distribution.type';
import type { KnowledgeLevel } from '#/types/knowledge-level.type';
import type { LearningStyleAdaptation } from '#/types/learning-style.type';
import type { MnemonicPreferences } from '#/types/mnemonic-preference.type';
import type { PreferredQuestionFormats } from '#/types/preferred-question-formats.type';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

const routePath = 'ai/study/plan/flashcards';

async function validateBody(body: Record<string, unknown>) {
  const validationScheme = z.object({
    focusTags: z
      .array(z.string().min(1, 'tag is required').max(255, 'tag is too long'))
      .min(1, 'Tags are required')
      .max(5, 'Max 5 tags'),
    knowledgeLevel: knowledgeLevelSchema,
    coverageFocus: coverageFocusSchema,
    duration: planDurationSchema,
    flashcardsNeeded: z
      .number()
      .min(1, 'Flashcards Needed is required')
      .max(500, 'Max 500 flashcards'),
    preferredFormat: preferredQuestionFormatsSchema.nullish(),
    contentEmphasis: contentEmphasisSchema.nullish(),
    learningStyle: learningStyleAdaptationSchema.nullish(),
    difficultyDistribution: difficultyDistributionSchema.nullish(),
    cardLength: cardLengthSchema.nullish(),
    mnemonicPreference: mnemonicPreferencesSchema.nullish(),
    blacklist: z.array(z.string()).max(10, 'Too many tags').nullish(),
    userPrompt: z
      .string()
      .max(200, 'Prompt is too long, max 200 characters')
      .nullish(),
  });
  const validityCheck = checkValidity(body, validationScheme);

  if (!validityCheck.valid) {
    return new Error(
      `Error: ${validityCheck.error}, message: ${validityCheck.details}`,
    );
  }
}

const rateLimit = new RateLimit(1, 10, `${routePath}`);

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
        `User [${user.id}] is not subscribed to a paid plan`,
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
    focusTags,
    knowledgeLevel,
    coverageFocus,
    duration,
    flashcardsNeeded,
    preferredFormat,
    contentEmphasis,
    learningStyle,
    difficultyDistribution,
    cardLength,
    mnemonicPreference,
    userPrompt,
    blacklist,
  }: {
    focusTags: string[];
    knowledgeLevel: KnowledgeLevel;
    coverageFocus: CoverageFocus;
    duration: string;
    flashcardsNeeded: number;
    preferredFormat?: PreferredQuestionFormats;
    contentEmphasis?: ContentEmphasis;
    learningStyle?: LearningStyleAdaptation;
    difficultyDistribution?: DifficultyDistribution;
    cardLength?: CardLength;
    mnemonicPreference?: MnemonicPreferences;
    userPrompt?: string;
    blacklist?: string[];
  } = await req.json();

  try {
    const error = await validateBody({
      focusTags,
      coverageFocus,
      knowledgeLevel,
      duration,
      flashcardsNeeded,
      preferredFormat,
      contentEmphasis,
      learningStyle,
      difficultyDistribution,
      cardLength,
      mnemonicPreference,
      userPrompt,
      blacklist,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    Logger.error(
      `Invalid request body from user [ ${user.id} ]`,
      routePath,
      JSON.stringify(error),
    );

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid request body',
      }),
    );
  }

  Logger.info(
    `User [ ${user.id} ] is generating plan flashcards suggestions. Data: ${JSON.stringify(
      {
        focusTags,
        coverageFocus,
        knowledgeLevel,
        duration,
        flashcardsNeeded,
        preferredFormat,
        contentEmphasis,
        learningStyle,
        difficultyDistribution,
        cardLength,
        mnemonicPreference,
        userPrompt,
        blacklist,
      },
    )}`,
    routePath,
  );

  const pickedCoverageFocus = coverageFocusDictionary.find(
    (plan) => plan.value === coverageFocus,
  );
  const pickedKnowledgeLevel = knowledgeLevelDictionary.find(
    (level) => level.value === knowledgeLevel,
  );

  const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
  });

  // const {response} = await generateText({
  //   model: gemini('gemini-2.0-flash-thinking-exp-01-21'),
  //   prompt: `
  //   **Subject-Style Mapping for Adaptive Flashcard Selection:**

  //   * **Technical/STEM:** Styles: How/Why Questions, Process Flashcards, Diagram Labeling, Formula/Equation, Application Scenarios, Definition (Concise).  Focus: Mechanisms, Problem-Solving, Formulas.
  //   * **Language Learning:** Styles: Example Sentences, Scenario Dialogues, Fill-in-Blank, Meaning in Context (Idioms), Synonym/Antonym, Grammar Rules. Focus: Usage, Vocabulary, Conversation.
  //   * **Humanities/Social Sciences:** Styles: Who/What/When/Where Questions, Concept Definitions, Timeline Flashcards, Cause-Effect, Compare-Contrast, Argument/Counter-Argument. Focus: Facts, Concepts, Theories, Arguments.
  //   * **Arts & Music:** Styles: Image-Based (Art), Audio-Based (Music), Identify Artist/Artwork, Identify Instrument/Sound, Technique/Process, Definition (Art/Music Terms). Focus: Recognition, Techniques, Concepts.
  //   * **Law & Business:** Styles: Case Studies (Scenario-Based), Definition (Legal/Business Terms), Principle/Rule, Ethical Dilemma (Scenario), Process Flashcards, Compare Concepts/Strategies. Focus: Application, Terminology, Principles.
  //   * **Medical/Healthcare:** Styles: Diagram Labeling (Anatomy), Process/Mechanism, Medical Terminology, Clinical Scenarios, Drug Mechanism, Disease Pathology, Definition (Medical). Focus: Structures, Processes, Terms, Scenarios.

  //   **Response**:
  //   Respond in JSON format. Array of a`,
  //   temperature: 0.8,
  //   system: `You are an expert educational content designer specializing in creating high-quality, pedagogically sound flashcards. Your primary responsibilities are:
  // })

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

  const prompt = (
    flashcardCount: number,
    summaries: { id: string; topic: string; query: string; context: string }[],
  ) => `
  # ROLE: You are an expert educational content designer specializing in creating high-quality, pedagogically sound flashcards tailored to user specifications.

  # GOAL: Generate ${flashcardCount} unique flashcards based on the provided inputs, strictly adhering to the specified knowledge level and content focus.

  # INPUTS:
  *   **Knowledge Level:** ${pickedKnowledgeLevel} (This is the PRIMARY determinant of difficulty for ALL cards)
  *   **Focus Tags:** [${focusTags.join(', ')}] (These define the specific topics/concepts to cover)
  *   **Coverage Focus:** ${pickedCoverageFocus} (Defines breadth/depth across Focus Tags: 'core' = essentials only; 'broad' = wider variety; 'deep' = intense focus on specifics)
  *   **Subject Area & Topic:** (Infer the general Subject Area [e.g., Technical/STEM, Language Learning] and specific Topic Name from the Focus Tags. Use this context for applying style and knowledge level guidance.)
  *   **Excluded Topics (Blacklist):** ${blacklist && blacklist.length > 0 ? `[${blacklist.join(', ')}]` : 'None specified'} (Strictly AVOID generating cards primarily about these concepts.)
  *   **Existing Cards (Avoid Duplication):**
      ${summaries && summaries.length > 0 ? summaries.map((summary) => `• ID: ${summary.id}, Topic: ${summary.topic}, Question: ${summary.query}, Context: ${summary.context}`).join('\n') : '  None provided.'}
  *   **Optional User Preferences:**
      *   Learning style preference: ${learningStyle ?? 'Balanced'}
      *   Card length preference: ${cardLength ?? 'Balanced'}
      *   Mnemonic preference: ${mnemonicPreference ?? 'None'}
      *   Additional instructions: ${userPrompt ?? 'None'}
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
          *(Apply ONE level consistently to ALL generated cards based on the 'Knowledge Level' input. Interpret these general guidelines within the context of the inferred Subject Area and Focus Tags.)*

          *   **unfamiliar:** Assume zero prior knowledge within the Focus Tags. Focus on the absolute most basic elements: Core definitions (STEM/Law), basic vocabulary (Language), key figures/events (Humanities), major styles/instruments (Arts), fundamental structures (Medical). Simple recognition or recall. Use basic styles (Definition, Who/What).
          *   **beginner:** Assume familiarity with only the most basic elements. Focus on understanding foundational concepts, simple rules/processes, and common examples: Simple syntax/conjugation (Language), core functions/components (STEM), basic timelines/concepts (Humanities), characteristics of a style (Arts), simple principles (Law/Business), basic anatomy/functions (Medical). Use foundational styles (Example Sentence, List Parts, Define Concept).
          *   **developing:** Assume understanding of basics. Focus on connecting concepts, understanding common usage/variations, simple application, and basic analysis: Using different tenses/dialogues (Language), explaining component interaction (STEM), identifying cause/effect (Humanities), analyzing basic composition (Arts), applying simple rules (Law/Business), describing basic processes (Medical). Use connecting styles (Fill-in-Blank, How/Why, Compare-Contrast, Simple Scenario).
          *   **proficient:** Assume solid grasp of fundamentals and common applications. Focus on applying knowledge in varied contexts, understanding nuances, identifying patterns/best practices, and intermediate analysis/troubleshooting: Complex sentences/conversations (Language), solving standard problems (STEM), analyzing sources/interpretations (Humanities), artist techniques/influences (Arts), standard case studies (Law/Business), interpreting common clinical signs (Medical). Use application styles (Scenario Dialogue, Application Scenario, Cause-Effect Analysis, Case Study).
          *   **advanced:** Assume deep understanding and practical experience. Focus on complex scenarios, subtle distinctions, evaluating trade-offs, synthesizing information, and addressing non-standard situations: Nuanced vocabulary/idioms/context (Language), optimizing/debugging complex issues (STEM), evaluating arguments/theories (Humanities), critiquing complex works/theory (Arts), complex legal/business strategy (Law/Business), differential diagnosis/complex management (Medical). Use analytical styles (Meaning in Context (Idioms), Complex Scenarios, Argument/Counter-Argument, Technique Analysis, Ethical Dilemma).
          *   **expert:** (Apply with EXTREME rigor for technical fields) Assume mastery and ability to teach the concepts within the Focus Tags.
              *   **Focus Areas:** MUST GO BEYOND standard definitions and undergraduate material. Target complex system design trade-offs (e.g., scalability patterns, distributed systems consistency models, CAP theorem nuances), advanced algorithms/data structures (e.g., probabilistic, advanced graph theory), performance optimization internals (e.g., kernel tuning, JIT behavior, query optimization), deep language internals (e.g., memory models, GC strategies, type theory), complex concurrency/parallelism (e.g., lock-free structures, race condition diagnosis), cutting-edge fields (e.g., specific ML architectures, quantum algorithm impacts, formal verification), theoretical limits/proofs, or comparing/contrasting advanced architectural patterns in specific production scenarios.
              *   **Question Types:** MUST REQUIRE significant analysis, synthesis, evaluation, design trade-off justification, or complex troubleshooting/diagnosis. Ask "why" advanced techniques are used, evaluate *implications* or *limitations*, propose architectural solutions, critique designs based on NFRs, or explain nuanced concepts/edge cases as if teaching a proficient learner. Use expert terminology *correctly and meaningfully*.
              *   **ABSOLUTELY DO NOT (Especially for STEM/CS):**
                  *   Ask for simple definitions or basic "what is" / "what is the purpose of" for foundational concepts like core data structures (stack, queue, etc. - unless asking about *advanced implementations* or *complex trade-offs*), core OOP principles (unless comparing *implementation strategies* or *design pattern implications*), fundamental algorithms, common protocols (HTTP, SQL), basic concepts (recursion, APIs, version control, OS roles, Big O notation - unless asking about *complex analysis*, *edge cases*, or *comparing notations*).
                  *   Simply rephrase a basic question with formal wording. The *underlying concept* and *required cognitive task* must be genuinely advanced.
              *   **Examples (Reflecting desired complexity for CS/STEM):**
                  *   "Critically evaluate trade-offs between strong consistency and high availability in distributed databases, referencing CAP theorem and consensus algorithms like Paxos/Raft."
                  *   "Design a system architecture for a real-time notification service handling 1M concurrent users, justifying choices for load balancing, queuing, and storage considering latency/fault tolerance."
                  *   "Explain challenges and solutions for avoiding false sharing in multi-threaded applications on modern multi-core architectures."
                  *   "Compare use cases and performance characteristics of B-trees vs. Log-Structured Merge-Trees (LSM-trees) for disk-based database indexing."
                  *   "How would you diagnose intermittent, high-latency requests in a complex microservices architecture?"

      **3. Content Selection (Applying Focus & Coverage):**
          *   **Prioritize Focus Tags:** Generate content *primarily* related to the concepts specified in the ''Focus Tags''.
          *   **Apply Coverage Focus:**
              *   If ''core'': Focus strictly on the most essential information within the ''Focus Tags'' at the target ''Knowledge Level''.
              *   If ''broad'': Aim for variety across the different ''Focus Tags'' (if multiple) or cover a wider range of concepts within a single tag/topic, all at the target ''Knowledge Level''.
              *   If ''deep'': Prioritize depth within fewer areas defined by the ''Focus Tags''. Explore nuances, specific mechanisms, or complex examples related to the tags, at the target ''Knowledge Level''.

      **4. Constraint Checklist & Quality Control:**
          *   **Knowledge Level Consistency:** ALL cards MUST strictly match the single ''Knowledge Level'' specified. NO mixing of difficulties.
          *   **Focus Tag Relevance:** Content MUST be directly relevant to the provided ''Focus Tags''.
          *   **Coverage Focus Alignment:** The *selection* and *depth* of topics MUST reflect the specified ''Coverage Focus''.
          *   **Blacklist Adherence:** Verify NO card's primary subject is from the ''Excluded Topics (Blacklist)''.
          *   **Uniqueness:** Avoid semantic overlap or simple reformulations of ''Existing Cards'' or other generated cards in this batch.
          *   **Style Appropriateness:** Chosen flashcard style MUST fit the Subject Area, Focus Tag content, and the complexity required by the Knowledge Level.
          *   **Accuracy & Clarity: Information must be accurate. Questions (''query''), concise answers (''answer''), and explanations (''definition'') must be clear and sufficiently detailed for the level.
          *  **Answer & Explanation Quality:**
              *   The ''answer'' MUST be the direct, concise, and correct response to the ''query''.
              *   The ''definition'' MUST clearly elaborate on *why* the ''answer'' is correct, provide necessary context, or break down the concept further, appropriate to the ''Knowledge Level''.
              *   Avoid including keywords from the ''query'' directly in the ''answer'' or ''definition'' where possible if it would make the answer too obvious (no trivial hints).

      # OUTPUT FORMAT:
      Generate the response as a JSON array, where each object represents a single flashcard conforming to this structure:
[
  {
    "id": "unique_string_ID_for_this_card",
    "query": "The clear and concise question or prompt forming the front of the flashcard.",, // The front of the flashcard
    "definition": "The detailed explanation elaborating on WHY the 'answer' is correct, providing context, or further defining the concept.", // The back of the flashcard
    "context": "The main subject or topic inferred from the Focus Tags (e.g., 'Computer Science', 'English Grammar').",
    "tags": ["list", "of", "relevant", "tags", "derived", "from", "FocusTags", "and", "specific", "card", "content"],
    "answer1": "The correct, comprehensive answer or explanation forming the back of the flashcard.", // The back of the flashcard
    "answer2": "wrong_answer",
    "answer3": "wrong_answer",
    "answer4": "wrong_answer",
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

  return streamText({
    model: gemini('gemini-2.0-flash-thinking-exp-01-21'),
    prompt: prompt(flashcardsNeeded, []).replaceAll('\n', ' ').trim(),
    temperature: getTemperature(knowledgeLevel),
    maxSteps: 5,
    experimental_continueSteps: true,
    stopSequences: ['[FINISH] All FC generated'],
    system: `You are an expert educational content designer specializing in creating high-quality, pedagogically sound flashcards based on detailed user specifications. Your primary responsibilities, guided by the main prompt, are:

    1.  **UNIQUENESS & RELEVANCE:** Generate flashcards exploring DISTINCT concepts relevant to the specified ''Focus Tags'', strictly avoiding semantic overlap or reformulation of ''Existing Cards'' or other generated content in the current batch.
    2.  **PEDAGOGICAL APPROPRIATENESS:** Employ varied question styles and cognitive tasks (e.g., application, analysis, evaluation) that are *strictly appropriate for the single Knowledge Level specified in the main prompt*. Do NOT mix difficulty levels across cards in one request.
    3.  **KNOWLEDGE CALIBRATION (Primary Directive):** Precisely match the complexity, depth, and scope of ALL generated content (''query'', ''answer'', ''definition'', optional fields) to the *single* ''Knowledge Level'' provided in the main prompt. Adhere meticulously to the detailed guidance for that specific level.
    4.  **ANSWER & EXPLANATION QUALITY:** Create a clearly correct, concise ''answer'' and a detailed, accurate ''definition'' that effectively clarifies *why* the answer is correct, provides necessary context, and aligns with the required ''Knowledge Level'', following the JSON structure defined in the main prompt.
    5.  **CONSTRAINT ADHERENCE:** Strictly follow all constraints specified in the main prompt, including ''Coverage Focus'', ''Excluded Topics (Blacklist)'', ''Subject-Specific Styles'', and the required ''OUTPUT FORMAT''. *The main prompt's detailed instructions always take precedence.*

    When you have generated the requested number of high-quality, compliant flashcards, include the phrase "[FINISH] All FC generated" in your response.`,
    onFinish(response) {
      Logger.info(
        `Session ${sessionId} finished successfully ${JSON.stringify({ finishReason: response?.finishReason, usage: response.usage })}`,
        routePath,
      );
      Logger.info(
        `Session ${sessionId} finished successfully [REQUEST]${JSON.stringify({ steps: response?.steps.map((step) => step.request) })}`,
        routePath,
      );
      Logger.info(
        `Session ${sessionId} finished successfully [REQUEST]${JSON.stringify({ steps: response?.steps.map((step) => step.response) })}`,
        routePath,
      );
    },
    onError: (error) => {
      Logger.error(`Session ${sessionId}`, routePath, JSON.stringify(error));
    },
  }).toDataStreamResponse();
}
