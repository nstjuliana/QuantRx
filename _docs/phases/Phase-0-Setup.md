# Phase 0: Setup

**Project:** NDC Packaging & Quantity Calculator (QuantRx)  
**Phase:** Setup (Barebones Functional Framework)  
**Goal:** Create a minimal running application with core infrastructure in place

---

## Overview

This phase establishes the foundational structure of the QuantRx application. The goal is to create a barebones but functional framework that can be built upon in subsequent phases. At the end of this phase, the application should run without errors, have basic routing, authentication scaffolding, and database connectivity, but won't have full business logic implemented.

### Phase Deliverables

- ✅ Next.js project initialized with App Router
- ✅ Material-UI theme configured
- ✅ Auth0 authentication scaffolding (login/logout)
- ✅ Supabase database connection established
- ✅ Basic routing structure
- ✅ Development environment configured
- ✅ Deployment to Vercel (preview)

### Success Criteria

- Application runs locally without errors
- User can navigate to login page
- Authentication flow completes (login/logout)
- Database connection verified
- Application deploys to Vercel successfully

---

## Feature 1: Project Initialization

**Goal:** Set up Next.js project with all necessary dependencies.

### Steps

1. **Initialize Next.js project with App Router**
   - Run `npx create-next-app@latest quantrx --use-npm`
   - Select: TypeScript: No, ESLint: Yes, Tailwind: No, src/ directory: No, App Router: Yes, import alias: Yes (@/*)
   - Verify project structure matches Next.js 14+ conventions

2. **Install core dependencies**
   - Install Material-UI: `npm install @mui/material @emotion/react @emotion/styled`
   - Install forms: `npm install react-hook-form @hookform/resolvers zod`
   - Install data fetching: `npm install @tanstack/react-query`
   - Install icons: `npm install @mui/icons-material`

3. **Install authentication dependencies**
   - Install Auth0: `npm install @auth0/nextjs-auth0`

4. **Install database dependencies**
   - Install Supabase: `npm install @supabase/supabase-js`

5. **Configure ESLint and Prettier**
   - Create `.eslintrc.js` with project rules (from project-rules.md)
   - Create `.prettierrc` for code formatting
   - Update `package.json` scripts: `"lint": "eslint .", "format": "prettier --write ."`

**Validation:** Run `npm run dev` and verify application starts on `http://localhost:3000`

---

## Feature 2: Environment Configuration

**Goal:** Set up environment variables and configuration files.

### Steps

1. **Create environment variable templates**
   - Create `.env.local` (gitignored) for local development
   - Create `.env.example` with all required variables documented (see tech-stack.md)
   - Add comments explaining each variable

2. **Configure Auth0 environment variables**
   - Add `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`
   - Add `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`
   - Document where to obtain these values

3. **Configure Supabase environment variables**
   - Add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - Document connection pooling configuration

4. **Configure Next.js**
   - Create `next.config.js` with environment variable validation
   - Configure image domains if needed
   - Set up redirects for authentication

5. **Create `.gitignore` entries**
   - Ensure `.env.local` is gitignored
   - Add IDE-specific files
   - Add build directories (`.next/`, `node_modules/`)

**Validation:** Verify environment variables load correctly with `console.log` in development

---

## Feature 3: Directory Structure Setup

**Goal:** Create the project directory structure following project-rules.md.

### Steps

1. **Create core directories**
   - Create `app/`, `components/`, `lib/`, `hooks/`, `contexts/`, `schemas/`, `theme/`
   - Create subdirectories: `components/ui/`, `components/forms/`, `components/results/`, `components/layout/`
   - Create subdirectories: `lib/api/`, `lib/calculations/`, `lib/utils/`, `lib/constants/`, `lib/queries/`

2. **Create placeholder files**
   - Add `index.js` files in component directories for clean imports
   - Add README.md files in major directories explaining their purpose

3. **Set up absolute imports**
   - Configure `jsconfig.json` or `tsconfig.json` for `@/*` path alias
   - Test absolute imports work correctly

4. **Create API route structure**
   - Create `app/api/` directory structure
   - Add placeholder route files: `app/api/calculations/route.js`, `app/api/rxnorm/route.js`, `app/api/fda/route.js`

5. **Create documentation structure**
   - Ensure `_docs/` directory has proper structure
   - Add README.md explaining documentation organization

**Validation:** Verify all directories are created and imports work correctly

---

## Feature 4: Material-UI Theme Setup

**Goal:** Configure Material-UI theme with project branding.

### Steps

1. **Create theme directory structure**
   - Create `theme/index.js`, `theme/palette.js`, `theme/typography.js`, `theme/components.js`

2. **Define color palette**
   - Define primary, secondary, error, warning, info, success colors
   - Define light/dark mode variants
   - Follow theme-rules.md for color choices

3. **Configure typography**
   - Define font families, sizes, weights
   - Configure heading scales (h1-h6)
   - Define body text styles

4. **Set up theme provider**
   - Create `app/layout.jsx` with ThemeProvider
   - Import and apply theme
   - Set up CssBaseline for consistent styling

5. **Test theme configuration**
   - Create a test page with various MUI components
   - Verify theme is applied correctly
   - Test responsive breakpoints

**Validation:** Verify theme colors and typography are applied throughout the application

---

## Feature 5: Authentication Scaffolding

**Goal:** Set up Auth0 authentication flow (login/logout).

### Steps

1. **Create Auth0 configuration**
   - Set up Auth0 account and application
   - Configure callback URLs, logout URLs
   - Create roles: `technician`, `admin`

2. **Implement Auth0 provider**
   - Wrap application with Auth0 `UserProvider` in `app/layout.jsx`
   - Configure Auth0 middleware for route protection

3. **Create authentication pages**
   - Create `app/(auth)/login/page.jsx` with login button
   - Create `app/(auth)/callback/page.jsx` for Auth0 callback handling
   - Create logout functionality

4. **Create authentication context**
   - Create `contexts/AuthContext/` with `AuthProvider.jsx` and `useAuth.js` hook
   - Provide user information, login/logout functions, role checking

5. **Test authentication flow**
   - Test login redirects to Auth0
   - Test successful callback
   - Test logout clears session
   - Verify user information is accessible via `useAuth()` hook

**Validation:** User can log in, see authenticated state, and log out successfully

---

## Feature 6: Database Connection

**Goal:** Establish Supabase database connection and create initial schema.

### Steps

1. **Set up Supabase project**
   - Create Supabase project
   - Note connection details and API keys

2. **Create Supabase client**
   - Create `lib/api/supabase.js` with Supabase client configuration
   - Export client for use in API routes and server components

3. **Create initial database schema**
   - Create `users` table with columns: id (UUID), auth0_id (string), email (string), role (enum), created_at, updated_at
   - Create `calculations` table with basic structure (full schema in Phase 1)
   - Enable Row-Level Security (RLS) on all tables

4. **Create RLS policies**
   - Create policy: Users can read their own data
   - Create policy: Admins can read all data
   - Test policies work correctly

5. **Test database connection**
   - Create test API route to query database
   - Verify connection works
   - Verify RLS policies are enforced

**Validation:** Database connection successful, basic queries work, RLS policies are enforced

---

## Feature 7: Basic Routing and Layout

**Goal:** Set up application routing and layout structure.

### Steps

1. **Create root layout**
   - Create `app/layout.jsx` with theme provider, Auth0 provider, TanStack Query provider
   - Add metadata for SEO
   - Add global styles

2. **Create main application page**
   - Create `app/page.jsx` as placeholder for main calculation interface
   - Add basic heading and welcome message

3. **Create navigation component**
   - Create `components/layout/Navigation/Navigation.jsx`
   - Add links: Home, Login/Logout
   - Display user information when authenticated

4. **Create protected route middleware**
   - Create `app/middleware.js` to protect authenticated routes
   - Redirect unauthenticated users to login

5. **Test routing**
   - Verify navigation between pages works
   - Verify protected routes require authentication
   - Verify layouts are applied correctly

**Validation:** Routing works, protected routes require authentication, layouts render correctly

---

## Feature 8: Development Tools Configuration

**Goal:** Configure development tools for code quality and debugging.

### Steps

1. **Configure ESLint**
   - Set up ESLint rules based on project standards
   - Add Next.js-specific rules
   - Configure React hooks rules

2. **Configure Prettier**
   - Set up formatting rules (tab width, quotes, semicolons, etc.)
   - Integrate with ESLint

3. **Add npm scripts**
   - Add `"dev"`, `"build"`, `"start"`, `"lint"`, `"format"` scripts
   - Add pre-commit hooks (optional: husky + lint-staged)

4. **Set up TanStack Query DevTools**
   - Add TanStack Query DevTools to development mode
   - Configure in `app/layout.jsx`

5. **Configure Vercel project**
   - Connect Git repository to Vercel
   - Configure environment variables in Vercel dashboard
   - Set up automatic deployments

**Validation:** Linting works, formatting works, DevTools are accessible, Vercel deployment succeeds

---

## Feature 9: Error Handling Infrastructure

**Goal:** Set up global error handling and logging.

### Steps

1. **Create error boundary**
   - Create `app/error.jsx` for global error boundary
   - Display user-friendly error messages
   - Log errors to console (Sentry integration in later phase)

2. **Create 404 page**
   - Create `app/not-found.jsx` for 404 errors
   - Provide navigation back to home

3. **Create API error handler utility**
   - Create `lib/utils/errors.js` with error handling functions
   - Define standard error response format
   - Handle different error types (validation, auth, API, database)

4. **Create loading states**
   - Create `app/loading.jsx` for global loading state
   - Create reusable `LoadingSpinner` component

5. **Test error handling**
   - Trigger errors intentionally to verify error boundaries work
   - Verify 404 page displays correctly
   - Verify API errors return proper status codes

**Validation:** Errors are caught and displayed user-friendly messages, loading states work

---

## Testing Checklist

Before moving to Phase 1, verify:

- [ ] Application runs locally without errors (`npm run dev`)
- [ ] Authentication flow works (login, callback, logout)
- [ ] Database connection established and queries work
- [ ] Environment variables are configured correctly
- [ ] Theme is applied and components render with correct styling
- [ ] Routing works and protected routes require authentication
- [ ] ESLint and Prettier are configured and working
- [ ] Application deploys to Vercel successfully
- [ ] Error boundaries catch and display errors
- [ ] Navigation between pages works smoothly

---

## Known Limitations (Expected at End of Phase 0)

This is a barebones setup. The following are intentionally incomplete:

- ❌ No calculation logic implemented
- ❌ No forms for entering prescription data
- ❌ No API integration with RxNorm or FDA
- ❌ No results display
- ❌ No database schema for calculations (basic structure only)
- ❌ No role-based access control enforcement
- ❌ No comprehensive error handling for business logic

These will be addressed in Phase 1 (MVP).

---

## Next Phase

**Phase 1: MVP** will build on this foundation by implementing:
- Complete calculation form
- RxNorm and FDA API integration
- Quantity calculation and NDC matching logic
- Results display with recommendations
- Complete database schema
- Core user workflows

---

## Estimated Timeline

**Total: 3-5 days** (depending on familiarity with tech stack)

- Feature 1-3: 1 day (project setup, environment, directories)
- Feature 4-5: 1 day (theme, authentication)
- Feature 6-7: 1 day (database, routing)
- Feature 8-9: 1 day (dev tools, error handling)
- Testing and fixes: 0.5-1 day

---

## Dependencies

- Auth0 account and application created
- Supabase project created
- Vercel account connected to Git repository
- Environment variables documented and configured

---

**End of Phase 0 Document**

