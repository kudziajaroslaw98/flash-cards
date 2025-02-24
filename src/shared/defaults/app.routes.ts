export const APP_ROUTES = {
  guide: '/guide',
  dashboard: '/dashboard',
  flashcards: {
    learn: '/flashcards/learn',
    revise: '/flashcards/revise',
    sets: '/flashcards/sets',
    reminders: '/flashcards/reminders',
  },
  account: {
    profile: '/account/profile',
    settings: '/account/settings',
  },
  study: {
    plans: '/study/plans',
    newPlan: '/study/plans/new',
    revise: '/study/revise',
  },
  pricing: '/pricing',
  signIn: '/sign-in',
  signUp: '/sign-up',
} as const;
