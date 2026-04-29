# Skill: Landing & Login Pages

## Landing page (/)
The landing page is shown to unauthenticated users only.
Authenticated users are redirected to /dashboard immediately.

### Sections
1. **Hero** — headline, subheadline, "Get Started Free" CTA → /register
2. **How it works** — 3-step process: Upload → Generate → Download
3. **Themes preview** — 6 theme swatches with names
4. **CTA footer** — "Sign in" link for existing users

### Design rules
- Full-width, bg-pm-app (#F7F8F6)
- Hero: max-w-4xl centered, headline in font-bold text-4xl text-pm-primary
- CTA button: bg-pm-teal hover:bg-pm-teal-hover text-white rounded-xl px-8 py-3
- No navigation bar on landing — just logo top-left

## Login page (/login)
```
Card layout: max-w-sm mx-auto mt-24
  Logo + "Welcome back"
  Email input (type="email", autocomplete="email")
  Password input (type="password", autocomplete="current-password")
  "Sign in" button (full width, bg-pm-teal)
  "Forgot password?" link (placeholder — shows toast "Coming soon")
  "Don't have an account? Register" link → /register
```

### Auth flow
1. POST /api/v1/auth/login with form data (OAuth2PasswordRequestForm)
2. On 200: store access_token in authStore, redirect to /dashboard
3. On 401: show inline error "Invalid email or password"
4. On network error: show toast "Connection error — try again"
5. Loading state: disable button, show spinner

## Register page (/register)
```
Card layout: max-w-sm mx-auto mt-24
  Logo + "Create your account"
  Name input (type="text")
  Email input (type="email")
  Password input (type="password", min 8 chars)
  Confirm password input
  "Create account" button (full width, bg-pm-teal)
  "Already have an account? Sign in" link → /login
```

### Registration flow
1. Client-side validate: email format, password ≥ 8 chars, passwords match
2. POST /api/v1/auth/register
3. On 201: auto-login (POST /api/v1/auth/login), redirect to /dashboard
4. On 409: show "An account with this email already exists"
5. On 422: show field-level validation errors from response body

## Shared design patterns
- All form inputs: border border-pm-border rounded-lg px-4 py-2.5 w-full
  focus:outline-none focus:ring-2 focus:ring-pm-teal
- Error state: border-pm-danger text-pm-danger text-sm mt-1
- Loading button: relative, spinner centered, text opacity-0
- All pages: font-sans from Plus Jakarta Sans
