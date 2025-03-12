import { Logger } from '#/shared/helpers/logger/logger';
import { RateLimit } from '#/shared/utils/api-limiter';
import checkValidity from '#/shared/utils/check-validity.util';
import { createClient } from '#/shared/utils/supabase/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamObject } from 'ai';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

export const maxDuration = 30;

async function validateBody(body: Record<string, unknown>) {
  const validationScheme = z.object({
    flashcards: z.array(
      z
        .string()
        .min(1, 'flashcard is required')
        .max(255, 'flashcard is too long'),
    ),
    setName: z.string().min(1),
    setDescription: z.string().min(1),
  });
  const validityCheck = checkValidity(body, validationScheme);

  if (!validityCheck.valid) {
    throw new Error(validityCheck.error);
  }
}

const rateLimit = new RateLimit(1, 10, 'ai/set/flashcards/generate');

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  try {
    if (user === null) {
      Logger.error('User not logged in', 'ai/set/flashcards/generate');
      throw new Error('User not logged in');
    }

    if (user.user_metadata?.stripe_subscription_status !== 'active') {
      Logger.error(
        ` User [${user.id}] is not subscribed to a paid plan`,
        'ai/set/flashcards/generate',
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

  const { flashcards: flashcards, setName, setDescription } = await req.json();

  try {
    validateBody({ flashcards, setName, setDescription });
  } catch {
    Logger.error(
      `Invalid request body from user [${user.id}]`,
      'ai/set/flashcards/generate',
    );

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

  Logger.info(
    `User [ ${user.id} ] is generating flashcards.`,
    'ai/set/flashcards/generate',
  );

  const prompt = `
**Objective**: Generate 10 unique flashcards aligned with flashcards deck [name: ${setName}; description: ${setDescription}], study scope: "Comprehensive coverage". 

**Critical Requirements**:
1. STRICTLY AVOID DUPLICATES: 
   - Never repeat core concepts/words/information from existing flashcards (analyzed below)
   - No conceptual duplicates even with different wording
   - No rephrased versions of same questions / words / information

**Existing Flashcards Analysis** (DO NOT REPEAT THESE CORE CONCEPTS):
[START PREVIOUS]
${flashcardsRecords.length > 0 ? flashcardsRecords.map((s) => `> ${s.frontUuid} - ${s.context}; ${s.query}; ${s.definition}`).join('\n') : 'No previous flashcards'}
[END PREVIOUS]

**Generation Rules**:
- Each flashcard must be aligned with flashcards deck [name: ${setName}; description: ${setDescription}]
- Each flashcard must be non-duplicate
- Detect if knowledge level is specified if yes align generation accordingly.
- Required differentiation methods:
  * Different abstraction levels (macro vs micro)
  * Different relationships (cause-effect vs comparison)
  * Different knowledge types (fact vs application)
  * Different cognitive levels (recall vs analysis)
- Vary Question Types and Learning Objectives:  Don't just ask for definitions.  Vary the type of flashcards you generate to test different learning objectives.  Examples of diverse flashcard types include:
  * Definition/Identification: "Define X", "Identify Y"
  * Explanation/Process: "Explain how Z works", "Describe the process of W"
  * Comparison/Contrast: "Compare A and B", "What are the differences between C and D?"
  * Cause/Effect: "What are the causes of E?", "What are the effects of F?"
  * Examples/Applications: "Give examples of G", "Where is H applied?"
  * Problem Solving/Application: "Solve problem J related to K", "Apply concept L to scenario M"
  * Key Characteristics/Properties: "What are the key properties of N?", "List the characteristics of O"

**Examples** (BAD vs GOOD):
BAD DUPLICATES: "Define X", "What is X?", "Explain X"
GOOD UNIQUE: 
1. "X vs Y comparison" 
2. "Practical application of X"
3. "Components of X"

flashcard structure: 
- A concise and clear question or term for the front of the flashcard (query).
- A brief and accurate definition or explanation for the back of the flashcard (definition).
- A word/term/topic of the flashcard (topic).
- A 1-3 tags related to this flashcard (tags).
- A correct answer to the question (answer1)
- 3 incorrect answers to the question (answer2, answer3, answer4)
- *optional* Examples of use separated by semicolon (;) (examples).
- *optional* A key points of these flashcards separated by semicolon (;) (keyPoints).
- *optional* Synonyms to this flashcard [to context] separated by semicolon (;) (synonyms).
- *optional* Related facts to this flashcard separated by semicolon (;) (relatedFacts).
Decide if optional fields bring value to the overall flashcard. For example, synonyms are required when the flashcard is about definition etc. Keep flashcards consistent with flashcards deck: [name: ${setName}; description: ${setDescription}].
  `;

  const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
  });

  const result = streamObject({
    model: gemini('gemini-2.0-flash-001'),
    output: 'array',
    schema: z.object({
      id: z.string(),
      query: z.string(),
      topic: z.string(),
      definition: z.string(),
      tags: z.array(z.string()),
      examples: z.string(),
      keyPoints: z.string(),
      synonyms: z.string(),
      relatedFacts: z.string(),
      answer1: z.string(),
      answer2: z.string(),
      answer3: z.string(),
      answer4: z.string(),
    }),
    system: `You are an expert flashcard content generator focused on creating UNIQUE and NON-REDUNDANT flashcards. Your primary goal is to expand the user's decks with NEW and DISTINCT concepts/words/information related to the given deck: [name: ${setName}; description: ${setDescription}].  Avoid generating flashcards that are semantically similar to concepts/words/information already covered. Prioritize novelty and comprehensive topic coverage.`,
    prompt: prompt,
  });

  return result.toTextStreamResponse();
}
