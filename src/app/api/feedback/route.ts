import { feedbackTypeSchema } from '#/schemas/feedback-type.schema';
import { Logger } from '#/shared/helpers/logger/logger';
import { RateLimit } from '#/shared/utils/api-limiter';
import checkValidity from '#/shared/utils/check-validity.util';
import { createClient } from '#/shared/utils/supabase/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

const routePath = '/api/feedback';
const rateLimit = new RateLimit(1, 5, routePath); // Limit to 5 requests per minute per user

const feedbackValidationSchema = z.object({
  feedbackType: feedbackTypeSchema,
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(100, 'Subject cannot exceed 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
});

async function validateBody(body: Record<string, unknown>) {
  const validityCheck = checkValidity(body, feedbackValidationSchema);
  if (!validityCheck.valid) {
    return new Error(
      `Error: ${validityCheck.error}, message: ${validityCheck.details}`,
    );
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  let userId: string | null = null;
  const ip = req.headers.get('x-forwarded-for');

  console.log(ip);

  // Check if user is logged in (optional, feedback can be anonymous)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  userId = user?.id ?? null;

  // Apply rate limiting based on user ID if logged in, otherwise use IP (less reliable but fallback)
  const limiterId = userId ?? ip ?? 'unknown_ip';

  try {
    rateLimit.checkRateLimit(limiterId);
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Rate limit exceeded',
      }),
      { status: 429 },
    );
  }

  let requestBody: unknown;
  try {
    requestBody = await req.json();
  } catch (jsonError) {
    Logger.error(
      `Invalid JSON body from user [${userId ?? 'anonymous'}]`,
      routePath,
      JSON.stringify(jsonError),
    );
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON body' }),
      { status: 400 },
    );
  }

  try {
    const validationError = await validateBody(
      requestBody as Record<string, unknown>,
    );
    if (validationError) {
      throw validationError;
    }
  } catch (error) {
    Logger.error(
      `Invalid request body from user [${userId ?? 'anonymous'}]`,
      routePath,
      JSON.stringify(error instanceof Error ? error.message : error),
    );
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request body',
      }),
      { status: 400 },
    );
  }

  const { feedbackType, subject, description } = requestBody as z.infer<
    typeof feedbackValidationSchema
  >;

  Logger.info(
    `User [${userId ?? 'anonymous'}] submitting feedback: Type=${feedbackType}, Subject=${subject}`,
    routePath,
  );

  const { error: insertError } = await supabase.from('feedback').insert({
    user_uuid: userId, // Can be null for anonymous feedback
    feedbackType,
    subject,
    description,
  });

  if (insertError) {
    Logger.error(
      `Failed to insert feedback for user [${userId ?? 'anonymous'}]`,
      routePath,
      JSON.stringify(insertError),
    );
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to submit feedback.' }),
      { status: 500 },
    );
  }

  return new Response(JSON.stringify({ success: true }), { status: 201 });
}
