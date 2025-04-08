import { feedbackTypeSchema } from '#/schemas/feedback-type.schema';
import { z } from 'zod';

export type FeedbackType = z.infer<typeof feedbackTypeSchema>;

export type Feedback = {
  feedbackType: FeedbackType;
  subject: string;
  description: string;
};
