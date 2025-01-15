export const APP_ROUTES = {
  guide: '/guide',
  dashboard: '/dashboard',
  flashcards: {
    learn: '/flashcards/learn',
    revise: '/flashcards/revise',
    sets: '/flashcards/sets',
  },
  account: {
    profile: '/account/profile',
    settings: '/account/settings',
  },
  pricing: '/pricing',
  signIn: '/sign-in',
  signUp: '/sign-up',
} as const;
