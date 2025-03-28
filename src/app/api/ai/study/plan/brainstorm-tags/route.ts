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

  const getLevelPrompts = (knowledgeLevel: KnowledgeLevel) => {
    switch (knowledgeLevel) {
      case 'unfamiliar':
        return `I am completely unfamiliar with: [${focusTags.join(', ')}] and need help identifying starting points. My knowledge level is ${pickedKnowledgeLevel}.

        Suggest 10-20 specific, distinct, foundational terms or core concepts within [${focusTags.join(', ')}] suitable for introductory flashcards. Focus on the absolute most basic building blocks or definitions someone completely new would need to encounter first.

        List *only* the specific topic names, suitable for becoming Focus Tags for flashcard generation. Ensure the topics are truly foundational for this subject.`;
      case 'beginner':
        return `I am a beginner in [${focusTags.join(', ')}], knowing only the most basic definitions. My knowledge level is ${pickedKnowledgeLevel}.

        Suggest 10-20 specific, distinct, core concepts or simple examples within [${focusTags.join(', ')}] suitable for beginner-level flashcards. Focus on understanding foundational ideas, simple structures/rules, or common examples just beyond the initial definition. Assume absolute basic terms are recognizable but not deeply understood.

        List *only* the specific topic names, suitable for becoming Focus Tags for flashcard generation. Ensure the topics represent the next step after basic definitions.`;
      case 'developing':
        return `I have a developing understanding of [${focusTags.join(', ')}], moving beyond the basics. My knowledge level is ${pickedKnowledgeLevel}.

        Suggest 10-20 specific, distinct topics within [${focusTags.join(', ')}] suitable for a developing level. Focus on connecting basic concepts, understanding simple applications or common usage, comparing related basic ideas, or how fundamental components work together within this subject. Assume foundational concepts and definitions are known.

        List *only* the specific topic names, suitable for becoming Focus Tags for flashcard generation. Ensure the topics require connecting ideas or simple application.`;
      case 'proficient':
        return `I am proficient in [${focusTags.join(', ')}], comfortable applying fundamentals. My knowledge level is ${pickedKnowledgeLevel}.

        Suggest 10-20 specific, distinct topics within [${focusTags.join(', ')}] suitable for a proficient level. Focus on applying knowledge in common scenarios, understanding nuances of standard tools/techniques/concepts, comparing standard approaches, or basic analysis relevant to the subject. Assume fundamentals are well understood and don't need defining.

        List *only* the specific topic names, suitable for becoming Focus Tags for flashcard generation. Ensure topics require application, nuance, or comparison.`;
      case 'advanced':
        return `I have an advanced understanding of [${focusTags.join(', ')}] with practical experience. My knowledge level is ${pickedKnowledgeLevel}.

        Suggest 10-20 specific, distinct topics within [${focusTags.join(', ')}] suitable for an advanced level. Focus on complex scenarios, evaluating trade-offs between different established techniques or theories, synthesizing information from multiple areas, optimization/strategy within the domain, or understanding subtle distinctions beyond standard material. Avoid fundamentals.

        List *only* the specific topic names, suitable for becoming Focus Tags for flashcard generation. Ensure topics require analysis, evaluation, or synthesis.`;
      case 'expert':
        return `I am an expert in [${focusTags.join(', ')}], capable of teaching it and understanding deep theory. My knowledge level is ${pickedKnowledgeLevel}.

        Suggest 10-20 specific, distinct, challenging topics within [${focusTags.join(', ')}] suitable for an expert level. Focus on deep theoretical underpinnings, cutting-edge developments or research areas, complex systemic trade-offs, critiquing advanced methodologies or schools of thought, or niche specializations within the field. Ensure topics GO BEYOND standard graduate-level curriculum and would challenge someone with significant experience.

        List *only* the specific topic names, suitable for becoming Focus Tags for flashcard generation. Ensure topics demand critical analysis, evaluation of complex systems/theories, or knowledge of the field's frontiers.`;
    }
  };

  const prompt = () => {
    return (
      getLevelPrompts(knowledgeLevel) +
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
    model: gemini('gemini-2.0-flash-thinking-exp-01-21'),
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
