import { knowledgeLevelDictionary } from '#/dictionaries/knowledge-level.dictionary';
import { planTypeDictionary } from '#/dictionaries/plan-type.dictionary';
import { studyScopeDictionary } from '#/dictionaries/study-scope.dictionary';
import { cardLengthSchema } from '#/schemas/card-length.schema';
import { contentEmphasisSchema } from '#/schemas/content-emphasis.schema';
import { difficultyDistributionSchema } from '#/schemas/difficulty-distribution.schema';
import { knowledgeLevelSchema } from '#/schemas/knowledge-level.schema';
import { learningStyleAdaptationSchema } from '#/schemas/learning-style-adaptation.schema';
import { mnemonicPreferencesSchema } from '#/schemas/mnemonic-preferences.schema';
import { planDurationSchema } from '#/schemas/plan-durations.schema';
import { planStudyScopeSchema } from '#/schemas/plan-study-scope.schema';
import { planTypeSchema } from '#/schemas/plan-types.schema';
import { preferredQuestionFormatsSchema } from '#/schemas/preferred-question-formats.schema';
import { Logger } from '#/shared/helpers/logger/logger';
import { RateLimit } from '#/shared/utils/api-limiter';
import checkValidity from '#/shared/utils/check-validity.util';
import { createClient } from '#/shared/utils/supabase/server';
import uuid from '#/shared/utils/uuid.util';
import type { CardLength } from '#/types/card-length.type';
import type { ContentEmphasis } from '#/types/content-emphasis.type';
import type { DifficultyDistribution } from '#/types/difficulty-distribution.type';
import type { KnowledgeLevel } from '#/types/knowledge-level.type';
import type { LearningStyleAdaptation } from '#/types/learning-style.type';
import type { MnemonicPreferences } from '#/types/mnemonic-preference.type';
import type { PlanStudyScope } from '#/types/plan-study-scope.type';
import type { PlanType } from '#/types/plan-types.type';
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
    studyScope: planStudyScopeSchema,
    knowledgeLevel: knowledgeLevelSchema,
    planType: planTypeSchema,
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
    studyScope,
    knowledgeLevel,
    planType,
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
    studyScope: PlanStudyScope;
    knowledgeLevel: KnowledgeLevel;
    planType: PlanType;
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
      studyScope,
      planType,
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
        studyScope,
        planType,
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

  const pickedPlanType = planTypeDictionary.find(
    (plan) => plan.value === planType,
  );
  const pickedStudyScope = studyScopeDictionary.find(
    (scope) => scope.value === studyScope,
  );
  const pickedKnowledgeLevel = knowledgeLevelDictionary.find(
    (level) => level.value === knowledgeLevel,
  );

  const prompt = (
    flashcardCount: number,
    summaries: { id: string; topic: string; query: string; context: string }[],
  ) => `
  Generate ${flashcardCount} unique flashcards covering [${focusTags.join(',')}] for a "${pickedPlanType}" study plan, knowledge level "${pickedKnowledgeLevel}" and study scope: "${pickedStudyScope}".

  **User Preferences**:
    • Question formats: ${preferredFormat ?? 'Balanced mix of all formats (application | compare-contrast | problem-solving | definition | cause-effect | process | analysis | evaluation | recall)'}
    • Emphasize: ${contentEmphasis ?? 'Balanced coverage across subtopics'}
    • Learning style: ${learningStyle ?? 'Balanced for all learning styles (visual | auditory | reading-writing | kinesthetic | logical | social | solitary)'}
    • Difficulty: ${difficultyDistribution ?? 'Balanced difficulty (33% easy, 34% medium, 33% hard)'}
    • Length: ${cardLength ?? 'Balanced length'}
    • Mnemonics: ${mnemonicPreference ?? 'No specific mnemonic techniques'}
    ${userPrompt ? `• Additional instructions: ${userPrompt}` : ''}


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
1. ADAPTIVE QUESTION FORMATS - Select based on subject matter:
   • TECHNICAL: How/why mechanisms, comparisons, applications, consequences, components
   • VOCABULARY: Contextual meaning, word relationships, usage, distinctions, register
   • PROCEDURAL: Sequential steps, preparations, tools, outcomes, troubleshooting
   • FACTUAL: Temporal/spatial knowledge, attributes, classifications, measurements

2. ANSWER QUALITY:
   • NO terms from questions in answers - avoid hint words
   • Application doesn't have implemented multiple answers so only answer one is correct.
   • Wrong answers: plausible but clearly incorrect to experts
   • Match complexity precisely to knowledge level ${knowledgeLevel} - especially for expert level
   • For vocabulary: semantically related but distinct distractors

3. PLAN-SPECIFIC APPROACH:
   For "${planType}":
   • Overview: Broad concept coverage across cognitive levels
   • Deep-Dive: Complex relationships and detailed mechanisms
   • Quick-Revision: Essential definitions and high-yield distinctions
   • Exam-Prep: Application scenarios and analysis questions

   JSON OUTPUT per card:
{
  "id": "unique_ID",
  "query": "clear_and_concise_question",
  "definition": "answer_explanation",
  "context": "main_subject",
  "tags": ["relevant_tags"],
  "answer1": "correct_answer",
  "answer2": "wrong_answer",
  "answer3": "wrong_answer",
  "answer4": "wrong_answer",
  "examples": "optional_usage",
  "keyPoints": "optional_notes",
  "synonyms": "optional_terms",
  "relatedFacts": "optional_connections"
}

You can include multiple examples/keyPoints/synonyms/relatedFacts by separating them with a semicolon.

Only include optional fields when they add significant value.
`;

  const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
  });

  return streamText({
    model: gemini('gemini-2.0-flash-thinking-exp-01-21'),
    prompt: prompt(flashcardsNeeded, []).replaceAll('\n', ' ').trim(),
    temperature: 0.8,
    maxSteps: 5,
    experimental_continueSteps: true,
    stopSequences: ['[FINISH] All FC generated'],
    system: `You are an expert educational content designer specializing in creating high-quality, pedagogically sound flashcards. Your primary responsibilities are:

1. UNIQUENESS: Generate flashcards that explore DISTINCT concepts, avoiding semantic overlap or reformulation of existing content.

2. PEDAGOGICAL VARIETY: Craft questions across multiple cognitive domains (from basic recall to complex evaluation) and diverse formats (definitions, applications, comparisons, problem-solving).

3. KNOWLEDGE CALIBRATION: Precisely match content difficulty to the specified knowledge level - from foundational concepts for beginners to cutting-edge applications for experts.

4. SUBJECT ADAPTABILITY: Tailor your approach based on subject matter (technical concepts, vocabulary, procedures, factual content) and study purpose (comprehensive overview, deep dive, revision, exam prep).

5. ANSWER QUALITY: Create clearly correct answers and plausible but definitively incorrect distractors that don't hint at the correct response.

Your expertise spans disciplines from technical fields to languages, sciences to humanities. For each flashcard set, you analyze existing content to identify knowledge gaps, then strategically fill those gaps with carefully crafted new cards that expand the user's understanding in meaningful ways.
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
