# Frontend — Claude Code Intelligence

## Stack
React 18, Vite 5, TypeScript 5, Tailwind CSS (pm-* tokens),
Zustand 4, TanStack Query v5, React Router 6, Axios,
dnd-kit, react-dropzone, Vitest, Playwright

## Design tokens (Tailwind pm-* classes)
```
bg-pm-app       → #F7F8F6  (app background)
bg-pm-surface   → #FFFFFF  (card / panel surface)
text-pm-primary → #1A1A1A  (primary text)
text-pm-muted   → #6B7280  (muted / secondary)
bg-pm-teal      → #0F6E56  (primary action)
bg-pm-teal-hover→ #0A5A45  (hover state)
border-pm-border→ #E5E7EB  (dividers)
bg-pm-danger    → #DC2626  (destructive)
bg-pm-warning   → #D97706  (warning)
bg-pm-success   → #059669  (success)
```
Font: Plus Jakarta Sans (loaded via @fontsource/plus-jakarta-sans)

## Component file conventions
- One component per file, named identically to the file
- All components: functional with TypeScript props interfaces
- Prefer named exports over default exports
- Co-locate unit tests: ComponentName.test.tsx next to ComponentName.tsx
- Use cn() (clsx + tailwind-merge) for conditional class merging

## State management
- Auth state: authStore (Zustand) — user, token, isAuthenticated
- Editor state: editorStore (Zustand) — slides, activeSlide, isDirty
- UI state: uiStore (Zustand) — modals, notifications, sidebarOpen
- Server state: TanStack Query — all API calls via useQuery/useMutation
- Never put server state in Zustand — that's what TanStack Query is for

## Routing (React Router 6)
```
/                   → redirect to /dashboard if auth, else /login
/login              → LoginPage
/register           → RegisterPage
/dashboard          → DashboardPage (protected)
/upload             → UploadPage (protected)
/generating/:id     → GeneratingPage (protected)
/editor/:id         → EditorPage (protected)
/export/:id         → ExportPage (protected)
/settings           → SettingsPage (protected)
/admin              → AdminDashboardPage (admin only)
/admin/users        → AdminUsersPage (admin only)
/admin/audit-log    → AdminAuditLogPage (admin only)
```

## API service pattern
```typescript
// src/services/api.ts
import axios from 'axios'
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

// Auth interceptor: attach Bearer token from authStore
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Refresh interceptor: on 401, POST /auth/refresh then retry
// Redirect to /login on second 401
```

## SSE streaming pattern
```typescript
// src/hooks/useSlideStream.ts
// Uses native EventSource — NO Axios for SSE
// Token passed as query param: ?token=...
// Events: slide_start, slide_done, progress, done, error
// On 'done': invalidate TanStack Query cache for this conversion
// On 'error': set error state, close EventSource
```

## Auto-save pattern
```typescript
// src/hooks/useAutoSave.ts
// 500ms debounce on slide content changes
// Calls PATCH /api/v1/slides/:id
// Shows "Saving..." → "Saved" indicator in toolbar
// On network error: show toast, keep isDirty=true
```

## Key rules
- NEVER store JWT in localStorage — use Zustand (memory only)
- Refresh token handled via httpOnly cookie (browser sends automatically)
- CORS credentials: always include withCredentials: true on Axios
- All dates: display in user's local timezone via Intl.DateTimeFormat
- Drag-and-drop: use @dnd-kit/core + @dnd-kit/sortable for slide reorder
- File upload: react-dropzone → PUT directly to GCS presigned URL
- Export download: open signed URL in new tab (not iframe)
- Admin routes: wrap with <RequireAdmin> which checks user.role === 'admin'

## Theme preview
Themes are visual-only on the frontend — no logic, just display names and
a color swatch. The actual PPTX theme is applied server-side on export.

## Playwright E2E conventions
- Tests live in tests/e2e/
- Use page fixtures from playwright.config.ts baseURL
- Authenticate once per spec file via storageState
- Never hardcode URLs — use env var PLAYWRIGHT_BASE_URL
- Take screenshots on failure: screenshot: 'only-on-failure'

## Vitest unit test conventions
- Tests live in tests/unit/
- Use @testing-library/react for component tests
- Mock Zustand stores directly: vi.mock('../stores/authStore')
- Never test implementation details — test user-visible behavior
- Setup file: src/test-setup.ts (imports @testing-library/jest-dom)

## Build and dev commands
```bash
npm run dev        # Vite dev server on :5173
npm run build      # Production build → dist/
npm run preview    # Preview production build
npm run test       # Vitest unit tests
npm run test:e2e   # Playwright E2E
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
```
