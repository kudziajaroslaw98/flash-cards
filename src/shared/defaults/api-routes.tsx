export const API_ROUTES = {
  CALLBACK: '/api/auth/callback',
  USER_DELETE: '/api/auth/user/delete',
  SYNC_FLASH_CARDS: '/api/flashcard/sync',
  SYNC_SETS: '/api/set/sync',
  SYNC_METADATA: '/api/metadata/sync',
  ANSWER_GENERATE: '/api/ai/flashcard/answer/generate',
  SET_DESCRIPTION: '/api/ai/set/description/generate',
  SET_FLASHCARDS: '/api/ai/set/flashcards/generate',
  GENERATE_SUGGESTED_FLASHCARDS: '/api/ai/study/plan/flashcards',
  GENERATE_PLAN: '/api/ai/study/plan',
  GENERATE_INCORRECT_REVIEW_SUMMARY: '/api/ai/study/plan/incorrect-reviews',
  GENERATE_BRAINSTORM_TAG_IDEAS: '/api/ai/study/plan/brainstorm-tags',
} as const;
