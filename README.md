# PitchMind Frontend

React 18 + Vite + TypeScript frontend for PitchMind — AI-powered document to presentation.

## Prerequisites

- Node 20+
- Backend running at `http://localhost:8000` (see pitchmind-backend)

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

App runs at http://localhost:5173

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |
| `VITE_APP_ENV` | Environment name | `development` |
| `PLAYWRIGHT_BASE_URL` | E2E test base URL | `http://localhost:5173` |

## Commands

```bash
npm run dev          # Dev server (hot reload)
npm run build        # Production build → dist/
npm run preview      # Preview production build
npm run test         # Vitest unit tests
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright E2E tests
npm run typecheck    # TypeScript check
npm run lint         # ESLint
```

## Project structure

```
src/
  main.tsx          Entry point
  App.tsx           Router + providers
  index.css         Global styles + Tailwind directives
  test-setup.ts     Vitest setup
  types/            Shared TypeScript interfaces
  stores/           Zustand state (auth, editor, ui)
  services/         Axios API client
  hooks/            Custom React hooks (SSE stream, auto-save)
  pages/            Route-level page components
    admin/          Admin-only pages
  components/       Reusable UI components
    editor/         Slide editor components
    upload/         Upload flow components
    generation/     SSE progress components
    export/         Export/download components
    ui/             Generic design system components
tests/
  unit/             Vitest unit tests
  e2e/              Playwright E2E specs
```

## Deployment (Vercel)

1. Connect repo to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add env vars in Vercel dashboard
5. CI deploys automatically from `main`
