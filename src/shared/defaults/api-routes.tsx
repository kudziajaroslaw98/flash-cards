export const API_ROUTES = {
  SIGN_IN: '/api/auth/sign-in',
  SIGN_UP: '/api/auth/sign-up',
  CALLBACK: '/api/auth/callback',
  USER_DELETE: '/api/auth/user/delete',
  SYNC: '/api/sync',
  THEME: '/api/theme',
  ANSWER_GENERATE: '/api/ai/flashcard/answer/generate',
  SET_DESCRIPTION: '/api/ai/set/description/generate',
  SET_FLASHCARDS: '/api/ai/set/flashcards/generate',
} as const;
