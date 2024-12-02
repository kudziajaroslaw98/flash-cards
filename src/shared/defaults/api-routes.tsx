export const API_ROUTES = {
  CALLBACK: '/api/auth/callback',
  USER_DELETE: '/api/auth/user/delete',
  SYNC_FLASH_CARDS: '/api/flashcard/sync',
  SYNC_SETS: '/api/set/sync',
  SYNC_METADATA: '/api/metadata/sync',
  THEME: '/api/theme',
  ANSWER_GENERATE: '/api/ai/flashcard/answer/generate',
  SET_DESCRIPTION: '/api/ai/set/description/generate',
  SET_FLASHCARDS: '/api/ai/set/flashcards/generate',
} as const;
