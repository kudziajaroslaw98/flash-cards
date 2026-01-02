# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run dev-turbo        # Start with Turbo mode (faster, no PWA)
npm run dev-scan         # Start with React Scan for performance debugging

# Build & Production
npm run build            # Production build
npm run start            # Start production server (port 3001)
npm run analyze          # Build with bundle analyzer

# Code Quality
npm run lint             # Run ESLint
```

## Architecture Overview

### Tech Stack
- **Next.js 15** with App Router and React 19
- **Supabase** for auth, Postgres database, and realtime sync
- **Dexie (IndexedDB)** for offline-first local storage
- **Gemini AI** via `@ai-sdk/google` for flashcard generation
- **Stripe** for payments and subscriptions
- **PWA** via `@ducanh2912/next-pwa` for offline support

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (pages)/           # Route group with shared layout (header/sidebar)
│   │   ├── flashcards/    # Core flashcard routes (learn, revise, sets)
│   │   ├── study/         # Study planning features
│   │   └── dashboard/     # User dashboard
│   └── api/               # API routes (AI, sync, webhooks)
├── components/
│   ├── _ui/               # Base UI components (button, card, modal, input)
│   └── _shared/           # Cross-cutting shared components
├── providers/             # React Context providers
│   ├── app-context.tsx    # Main app state (flashcards, sets, metadata)
│   └── session-provider/  # Auth state and user session
├── hooks/                 # Custom React hooks (20+)
├── types/                 # TypeScript type definitions (40+)
├── schemas/               # Zod validation schemas
├── shared/
│   ├── utils/             # Utility functions (Supabase clients)
│   └── helpers/           # Domain logic (sync, merge)
└── db/                    # Dexie IndexedDB setup and schema
```

### State Management Pattern

1. **AppContext** (`src/providers/app-context.tsx`): Central state for flashcards, sets, reminders, metadata
2. **SessionContext** (`src/providers/session-provider/`): User auth state, subscription status
3. **Dexie IndexedDB** (`src/db/`): Local database with automatic sync to Supabase

### Data Sync Architecture

The app uses bidirectional sync between local IndexedDB (Dexie) and remote Supabase:

- Local changes marked with `synced: false` flag
- Sync flows in `src/shared/helpers/`:
  - `local-to-remote/`: Push local changes to Supabase
  - `remote-to-local/`: Pull remote changes to IndexedDB
- Dexie hooks automatically trigger sync on data mutations

### Key Supabase Tables

`flashcards`, `sets`, `metadata`, `focus_sessions`, `daily_stats`, `review_logs`, `reminders`, `study_plans`

### AI Integration

AI features use Gemini via `@ai-sdk/google` with streaming responses:
- `/api/ai/set/flashcards/generate` - Generate flashcards from text/images
- `/api/ai/study/plan/` - Create study plans with spaced repetition
- Rate limited: 1 request per 10 seconds, requires active subscription

### Key Hooks

- `useSpacedRepetition`: SRS algorithm with weighted card selection
- `useFlashcardSession`: Active learning session state
- `useAnswerHandler`: Process answers and update SRS data

## Code Style

- Prettier with single quotes, single attribute per line
- Tailwind classes auto-sorted via `prettier-plugin-tailwindcss`
- Imports auto-organized via `prettier-plugin-organize-imports`
- Unused variables allowed if prefixed with `_`

## Environment Variables

Copy `.env.template` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_JWT_SECRET`
- `NEXT_PUBLIC_APP_LOCAL_HREF`
