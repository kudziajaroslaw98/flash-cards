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
  **Subject-Style Mapping for Adaptive Flashcard Selection:**

  * **Technical/STEM:** Styles: How/Why Questions, Process Flashcards, Diagram Labeling, Formula/Equation, Application Scenarios, Definition (Concise).  Focus: Mechanisms, Problem-Solving, Formulas.
  * **Language Learning:** Styles: Example Sentences, Scenario Dialogues, Fill-in-Blank, Meaning in Context (Idioms), Synonym/Antonym, Grammar Rules. Focus: Usage, Vocabulary, Conversation.
  * **Humanities/Social Sciences:** Styles: Who/What/When/Where Questions, Concept Definitions, Timeline Flashcards, Cause-Effect, Compare-Contrast, Argument/Counter-Argument. Focus: Facts, Concepts, Theories, Arguments.
  * **Arts & Music:** Styles: Image-Based (Art), Audio-Based (Music), Identify Artist/Artwork, Identify Instrument/Sound, Technique/Process, Definition (Art/Music Terms). Focus: Recognition, Techniques, Concepts.
  * **Law & Business:** Styles: Case Studies (Scenario-Based), Definition (Legal/Business Terms), Principle/Rule, Ethical Dilemma (Scenario), Process Flashcards, Compare Concepts/Strategies. Focus: Application, Terminology, Principles.
  * **Medical/Healthcare:** Styles: Diagram Labeling (Anatomy), Process/Mechanism, Medical Terminology, Clinical Scenarios, Drug Mechanism, Disease Pathology, Definition (Medical). Focus: Structures, Processes, Terms, Scenarios.

  Generate ${flashcardCount} unique flashcards.

  **User Preferences**:
    • Learning style: ${learningStyle ?? 'Balanced for all learning styles (visual | auditory | reading-writing | kinesthetic | logical | social | solitary)'}
    • Length: ${cardLength ?? 'Balanced length'}
    • Mnemonics: ${mnemonicPreference ?? 'No specific mnemonic techniques'}
    ${userPrompt ? `• Additional instructions: ${userPrompt}` : ''}
    • Flashcard format and preference: Use allowed styles and formats
    • Knowledge Level: ${pickedKnowledgeLevel}
    • Plan Type: ${pickedCoverageFocus}
    • Focus on Tags: [${focusTags.join(',')}]

  **Knowledge Level Guidance (Interpreted for the specific Subject Area):**

    *   **unfamiliar:** Assume zero prior knowledge *within the topic*. Focus on the absolute most basic elements:
      -   *Examples:* Core definitions (STEM/Law/Business), basic vocabulary/alphabet (Language), key figures/events (Humanities), identifying major styles/instruments (Arts), fundamental structures (Medical). Simple recognition or recall. Use appropriate styles (e.g., Definition, Who/What/When).
    *   **beginner:** Assume familiarity with only the most basic elements. Focus on understanding foundational concepts, simple rules/processes, and common examples.
      -   *Examples:* Simple syntax/conjugation (Language), core functions/components (STEM), basic timelines/definitions (Humanities), recognizing characteristics of a style (Arts), simple legal/business principles (Law/Business), basic anatomical parts/functions (Medical). Use appropriate styles (e.g., Example Sentence, List Parts, Define Concept).
    *   **developing:** Assume understanding of basics. Focus on connecting concepts, understanding common usage/variations, simple application, and basic analysis.
      -   *Examples:* Using different tenses/simple dialogues (Language), explaining how components interact (STEM), identifying cause/effect (Humanities), analyzing basic composition (Arts), applying a simple rule to a scenario (Law/Business), describing a basic physiological process (Medical). Use appropriate styles (e.g., Fill-in-Blank, How/Why, Compare-Contrast, Simple Scenario).
    *   **proficient:** Assume solid grasp of fundamentals and common applications. Focus on applying knowledge in varied contexts, understanding nuances, identifying patterns/best practices, and intermediate analysis/troubleshooting.
      -   *Examples:* Constructing complex sentences/handling common conversational topics (Language), applying concepts to solve standard problems (STEM), analyzing primary sources/comparing interpretations (Humanities), identifying artist techniques/influences (Arts), analyzing a standard case study (Law/Business), interpreting common clinical signs (Medical). Use appropriate styles (e.g., Scenario Dialogue, Application Scenario, Cause-Effect Analysis, Case Study).
    *   **advanced:** Assume deep understanding and practical experience. Focus on complex scenarios, subtle distinctions, evaluating trade-offs, synthesizing information, and addressing non-standard situations.
      -   *Examples:* Nuanced vocabulary/idioms/cultural context (Language), optimizing solutions/debugging complex issues (STEM), evaluating historical arguments/synthesizing theories (Humanities), critiquing complex works/understanding art theory (Arts), navigating complex legal/business strategies (Law/Business), differential diagnosis/complex patient management (Medical). Use appropriate styles (e.g., Meaning in Context (Idioms), Complex Scenarios, Argument/Counter-Argument, Technique Analysis, Ethical Dilemma).
    *   **expert:** Assume mastery and ability to teach. Focus on cutting-edge knowledge, deep theoretical underpinnings, predicting trends, critical evaluation across contexts, and explaining complexity simply.
      -   *Examples:* Linguistic theory/translation nuances (Language), designing novel systems/research-level problems (STEM), contributing original analysis/historiography (Humanities), curating/art criticism/theory (Arts), shaping strategy/policy (Law/Business), understanding rare conditions/research frontiers (Medical). Use appropriate styles (e.g., Explaining complex grammar, Designing a system, Critical Evaluation, Advanced Theory).

  **Constraint Checklist for [Knowledge Level Value] & [Subject Area]:**

    *   **Content Relevance:** Ensure flashcards are strictly relevant to "[Topic Name]" and appropriate for the "[Subject Area]".
    *   **Level Appropriateness:**
      -   **[For Proficient/Advanced/Expert]:** AVOID overly basic concepts, definitions, or tasks typically covered in introductory materials for "[Topic Name]" within "[Subject Area]".
      -   **[For all levels]:** Ensure the cognitive task required (recall, apply, analyze, evaluate, etc.) matches the specified knowledge level description.
    *   **Style Appropriateness:** Select flashcard styles (e.g., definition, scenario, fill-in-the-blank) that are suitable for both the "[Subject Area]" (referencing the examples above) and the complexity required by the "[Knowledge Level Value]".
    *   **Accuracy & Clarity:** Ensure information is accurate and presented clearly. Keep fronts (prompts) and backs (answers) concise but sufficiently detailed for the level.


**EXCLUDED TOPICS** (DO NOT generate cards related to these):
${blacklist && blacklist.length > 0 ? blacklist.join(', ') : 'None specified'}

  **Existing Cards** (DO NOT DUPLICATE):
${summaries
  .map(
    (summary) =>
      `• ID: ${summary.id}, Topic: ${summary.topic}, Question: ${summary.query}, Context: ${summary.context}`,
  )
  .join('\n')}

  **Critical Requirements**:
1. ANSWER QUALITY:
   • NO terms from questions in answers - avoid hinting solutions
   • NO terms from answers in questions - avoid hinting answers
   • Only answer1 is correct. Answer2, answer3, answer4 are still required in the response but need to be incorrect.
   • Wrong answers: plausible but clearly incorrect to experts
   • Match complexity precisely to knowledge level ${knowledgeLevel} - especially for expert level
   • For vocabulary: semantically related but distinct distractors

  **Clarifications**:
    • Include multiple examples, key points, synonyms, and related facts where relevant.
    • Only include optional fields when they add significant value.
    • Ensure each flashcard is unique and explores distinct concepts.
    • The Focus Tags specify the primary areas of content. Use them to determine the specific [Topic Name] and [Subject Area] context for constraints.

   JSON OUTPUT per card:
{
  "id": "unique_ID",
  "query": "clear_and_concise_question", // The front of the flashcard
  "definition": "answer_explanation", // The back of the flashcard
  "context": "main_subject_or_topic",
  "tags": ["relevant_tags"],
  "answer1": "correct_answer", // The back of the flashcard
  "answer2": "wrong_answer",
  "answer3": "wrong_answer",
  "answer4": "wrong_answer",
  "examples": "optional_usage_example(s)",
  "keyPoints": "optional_key_takeaway(s)",
  "synonyms": "optional_alternative_terms",
  "relatedFacts": "optional_related_concepts_or_facts"
}

You can include multiple examples/keyPoints/synonyms/relatedFacts by separating them with a semicolon.

Only include optional fields when they add significant value.
`;

  return streamText({
    model: gemini('gemini-2.0-flash-thinking-exp-01-21'),
    prompt: prompt(flashcardsNeeded, []).replaceAll('\n', ' ').trim(),
    temperature: getTemperature(knowledgeLevel),
    maxSteps: 5,
    experimental_continueSteps: true,
    stopSequences: ['[FINISH] All FC generated'],
    system: `You are an expert educational content designer specializing in creating high-quality, pedagogically sound flashcards. Your primary responsibilities are:
1. UNIQUENESS: Generate flashcards that explore DISTINCT concepts, avoiding semantic overlap or reformulation of existing content.
2. PEDAGOGICAL VARIETY: Craft questions across multiple cognitive domains (from basic recall to complex evaluation).
3. KNOWLEDGE CALIBRATION: Precisely match content difficulty to the specified knowledge level.
4. ANSWER QUALITY: Create clearly correct answers and plausible but definitively incorrect distractors that don't hint at the correct response.
When you're ready to finish, include the phrase "[FINISH] All FC generated" in your response.`,
    onFinish(response) {
      Logger.info(
        `Session ${sessionId} finished successfully ${JSON.stringify({ steps: response?.steps, finishReason: response?.finishReason, usage: response.usage })}`,
        routePath,
      );
    },
    onError: (error) => {
      Logger.error(`Session ${sessionId}`, routePath, JSON.stringify(error));
    },
  }).toDataStreamResponse();
}
