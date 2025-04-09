import { knowledgeLevelDictionary } from '#/dictionaries/knowledge-level.dictionary';
import { knowledgeLevelSchema } from '#/schemas/knowledge-level.schema';
import { Logger } from '#/shared/helpers/logger/logger';
import { RateLimit } from '#/shared/utils/api-limiter';
import checkValidity from '#/shared/utils/check-validity.util';
import { createClient } from '#/shared/utils/supabase/server';
import uuid from '#/shared/utils/uuid.util';
import type { KnowledgeLevel } from '#/types/knowledge-level.type';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

const routePath = 'ai/study/plan/brainstorm-tags';

async function validateBody(body: Record<string, unknown>) {
  const validationScheme = z.object({
    focusTags: z
      .array(z.string().min(1, 'tag is required').max(255, 'tag is too long'))
      .min(1, 'Tags are required')
      .max(10, 'Max 10 tags'),
    knowledgeLevel: knowledgeLevelSchema,
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
  }: {
    focusTags: string[];
    knowledgeLevel: KnowledgeLevel;
  } = await req.json();

  try {
    const error = await validateBody({
      focusTags,
      knowledgeLevel,
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
    `User [ ${user.id} ] is brainstorming tags. Data: ${JSON.stringify({
      focusTags,
      knowledgeLevel,
    })}`,
    routePath,
  );

  const pickedKnowledgeLevel = knowledgeLevelDictionary.find(
    (level) => level.value === knowledgeLevel,
  );

  const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
  });

  const revisedLevelGoals = {
    unfamiliar:
      'Identify the absolute most essential starting points, core definitions, or key introductory ideas needed for a complete beginner. Focus on the prerequisite basic elements for understanding the subject at all.',
    beginner:
      'Identify core concepts, simple organizational principles or rules, and common examples that illustrate foundational ideas. Focus on understanding the main elements and their basic functions or characteristics within this subject.',
    developing:
      'Identify topics that involve connecting basic concepts, understanding typical uses or common contexts, comparing related basic ideas, or seeing how essential elements interact or relate to each other within this subject.',
    proficient:
      'Identify topics focused on using knowledge in standard situations, understanding important details or variations of common concepts/methods, comparing established approaches, or performing straightforward interpretation or examination relevant to this subject.',
    advanced:
      'Identify topics involving complex situations, evaluating benefits and drawbacks of established methods or theories, combining information from different areas, strategic thinking or refinement within the domain, or subtle distinctions important in this subject.',
    expert:
      'Identify challenging topics related to deep theoretical foundations, cutting-edge research or developments, complex interconnected factors and trade-offs, critique of advanced approaches or schools of thought, or niche specializations demanding critical interpretation or frontier knowledge within this subject.',
  };

  const getLevelPrompts = () => {
    const focusTagsString = focusTags.join(', ');
    // Use the REVISED goals
    const goalDescription = revisedLevelGoals[knowledgeLevel];

    if (!goalDescription) {
      return `Error: Invalid knowledge level provided: ${knowledgeLevel}.`;
    }

    const prompt = `
  Act as a subject matter expert specifically and ONLY within the domain defined by the following Focus Tags: [${focusTagsString}]. Your expertise should be strictly confined to this area.

  My current knowledge level regarding [${focusTagsString}] is: ${pickedKnowledgeLevel} (${knowledgeLevel}).

  Your Task: Generate a list of 10-20 specific topic names suitable for creating flashcards for someone at my knowledge level within this EXACT subject area: [${focusTagsString}]. These topic names should themselves be suitable for becoming new Focus Tags later.

  Topic Requirements:
  1.  **Strict Domain Adherence:** All suggested topic names MUST belong exclusively to the subject area defined by [${focusTagsString}]. Absolutely NO topics from other fields (like unrelated sciences, programming, different arts, etc., unless they are *part* of the focus tags) are allowed. For example, if the tags are about 'Impressionist Painting', do not suggest 'Python Data Types'. Stick ONLY to [${focusTagsString}].
  2.  **Level Appropriateness:** The topics must precisely match the complexity required for the '${knowledgeLevel}' level, focusing on this goal: ${goalDescription}
  3.  **Specificity:** Topics should be distinct and specific enough for focused learning (e.g., prefer 'Verb Conjugation in Past Tense' over just 'Verbs'). Avoid overly broad categories.

  List the 10-20 specific topic names now, adhering strictly to the domain [${focusTagsString}] and the '${knowledgeLevel}' complexity level, using the goal described above.
  `;

    return prompt.trim();
  };

  const prompt = () => {
    return (
      getLevelPrompts() +
      `
    ** RESPONSE **:
    Respond in JSON format, its array of dictionary elements:
      [
        {
          value: 'Topic Name',
          label: 'Topic Name'
        }
      ]
    `
    );
  };

  return streamText({
    model: gemini('gemini-2.0-flash'),
    prompt: prompt(),
    temperature: 1,
    onFinish(response) {
      Logger.info(
        `BrainStorm tags session ${sessionId} finished successfully ${JSON.stringify({ finishReason: response?.finishReason, usage: response.usage })}`,
        routePath,
      );
      Logger.info(
        `BrainStorm tags session ${sessionId} finished successfully [REQUEST]${JSON.stringify({ steps: response?.steps.map((step) => step.request) })}`,
        routePath,
      );
      Logger.info(
        `BrainStorm tags session ${sessionId} finished successfully [REQUEST]${JSON.stringify({ steps: response?.steps.map((step) => step.response) })}`,
        routePath,
      );
    },
    onError: (error) => {
      Logger.error(
        `BrainStorm tags session ${sessionId}`,
        routePath,
        JSON.stringify(error),
      );
    },
  }).toDataStreamResponse();
}
