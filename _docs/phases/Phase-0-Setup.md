# Phase 0: Setup

**Project:** NDC Packaging & Quantity Calculator (QuantRx)  
**Phase:** Setup (Barebones Functional Framework)  
**Goal:** Create a minimal running application with core infrastructure in place

---

## Overview

This phase establishes the foundational structure of the QuantRx application. The goal is to create a barebones but functional framework that can be built upon in subsequent phases. 

At the end of this phase, the application should:
- Run locally without errors
- Have basic routing and navigation
- Include authentication scaffolding (login/logout)
- Connect to the database successfully

Note: Full business logic, role enforcement, and calculation features will be implemented in Phase 1.

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
   - Create `next.config.js` with basic configuration
   - Configure image domains if needed
   - Set up redirects for authentication

5. **Create environment validation with Zod**
   - Create `lib/env.js` with Zod schema for environment variables
   - **Important:** This file should be imported early (in `next.config.js`) to fail fast before other code runs
   - Validate all required env vars at application startup
   - Example schema:
   ```javascript
   // lib/env.js
   import { z } from 'zod';
   
   const envSchema = z.object({
     AUTH0_SECRET: z.string().min(1),
     AUTH0_BASE_URL: z.string().url(),
     AUTH0_ISSUER_BASE_URL: z.string().url(),
     AUTH0_CLIENT_ID: z.string().min(1),
     AUTH0_CLIENT_SECRET: z.string().min(1),
     SUPABASE_URL: z.string().url(),
     SUPABASE_ANON_KEY: z.string().min(1),
     SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
   });
   
   // Parse and export - will throw error if validation fails
   export const env = envSchema.parse(process.env);
   ```
   - Import in `next.config.js` at the top:
   ```javascript
   // next.config.js
   import './lib/env.js'; // Validates env vars before config runs
   
   const nextConfig = {
     // ... your config
   };
   
   export default nextConfig;
   ```

**Validation:** Run `npm run dev` - should fail immediately with clear Zod error if env vars are missing/invalid

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

**File Extension Convention:**
- **`.jsx`** → React components (any file returning JSX)
- **`.js`** → Utilities, API routes, configs, hooks, schemas, and non-React logic
- This provides clear visual distinction between component files and logic files
- All code examples in this document follow this convention

**Validation:** Verify all directories are created and imports work correctly

**Expected Directory Structure:**
```
QuantRx/
├── app/
│   ├── layout.jsx                 # Root layout with providers
│   ├── page.jsx                   # Home page
│   ├── loading.jsx                # Global loading
│   ├── error.jsx                  # Global error boundary
│   ├── not-found.jsx              # 404 page
│   ├── api/                       # API routes (.js files)
│   └── (auth)/                    # Auth route group
├── components/
│   ├── ui/                        # UI components (.jsx)
│   ├── forms/                     # Form components (.jsx)
│   ├── results/                   # Results components (.jsx)
│   └── layout/                    # Layout components (.jsx)
├── lib/
│   ├── api/                       # API clients (.js)
│   ├── calculations/              # Calculation logic (.js)
│   ├── utils/                     # Utilities (.js)
│   └── constants/                 # Constants (.js)
├── hooks/                         # Custom hooks (.js)
├── contexts/                      # React contexts (.jsx)
├── schemas/                       # Zod schemas (.js)
└── theme/                         # Theme config (.js)
```

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
   - Configure callback URLs: `http://localhost:3000/api/auth/callback`
   - Configure logout URLs: `http://localhost:3000`
   - Create roles in Auth0: `technician`, `admin`
   - **Note:** Role creation is for future use. Role enforcement will be implemented in Phase 1

2. **Implement Auth0 provider**
   - Wrap application with Auth0 `UserProvider` in `app/layout.jsx`
   - Configure Auth0 middleware for route protection

3. **Create authentication pages**
   - Create `app/(auth)/login/page.jsx` with login button
   - Create `app/(auth)/callback/page.jsx` for Auth0 callback handling
   - Create logout functionality

4. **Create authentication context**
   - Create `contexts/AuthContext/` with `AuthProvider.jsx` and `useAuth.js` hook
   - Provide user information, login/logout functions
   - Include role information from Auth0 claims (role checking logic in Phase 1)

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
   - Create `middleware.js` at **root level** (not in `app/`) for Next.js App Router
   - Use Auth0's `withMiddlewareAuthRequired` to protect routes
   - Configure matcher to specify which routes to protect
   - Example structure:
   ```javascript
   // middleware.js (at root level)
   import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
   
   export default withMiddlewareAuthRequired();
   
   export const config = {
     matcher: [
       // Protect all routes except:
       // - /api/* (API routes - handled separately)
       // - /_next/* (Next.js internal routes)
       // - /static, /favicon.ico (static assets)
       // - Auth routes are automatically handled by Auth0
       '/((?!api|_next/static|_next/image|favicon.ico).*)',
     ],
   };
   ```
   
   **What's Protected vs Unprotected:**
   - ✅ **Protected:** `/` (home), any custom pages
   - ❌ **Unprotected:** `/api/*` (all API routes), `/api/auth/*` (Auth0 routes), static assets
   - Auth0 automatically handles redirect to login for protected routes
   - After login, user is redirected back to originally requested page

5. **Test routing**
   - Verify navigation between pages works
   - Verify protected routes require authentication (try accessing home page while logged out)
   - Verify layouts are applied correctly
   - Verify middleware redirects work properly

**Validation:** Routing works, protected routes require authentication, layouts render correctly

**Provider Hierarchy in `app/layout.jsx`:**
```
<html>
  <body>
    <UserProvider> {/* Auth0 */}
      <QueryClientProvider> {/* TanStack Query */}
        <ThemeProvider> {/* MUI Theme */}
          <CssBaseline />
          <Navigation />
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </UserProvider>
  </body>
</html>
```

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

### Optional: Testing Infrastructure Setup

> **⚠️ This section is completely optional for Phase 0**  
> You can skip this entirely without blocking progress. Full testing will be addressed in Phase 4.  
> Only set this up now if you want to write tests as you build features.

If you want to prepare testing infrastructure early:

1. **Install testing dependencies**
   - `npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom`

2. **Configure Jest**
   - Create `jest.config.js` for Next.js
   - Create `jest.setup.js` for global test setup
   - Add scripts to `package.json`: `"test": "jest", "test:watch": "jest --watch"`

3. **Create test skeleton**
   - Create `__tests__/` directory at root
   - Add one example test file to verify setup works

**When to skip:** If you want to focus on building features first, skip this entirely.  
**When to do it:** If you prefer test-driven development or want tests from day one.

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

### Manual Testing
- [ ] Application runs locally without errors (`npm run dev`)
- [ ] Environment validation fails gracefully with clear error if vars missing
- [ ] Authentication flow works (login, callback, logout)
- [ ] Protected routes redirect to login when not authenticated
- [ ] Database connection established and queries work
- [ ] Environment variables are configured correctly
- [ ] Theme is applied and components render with correct styling
- [ ] Routing works and protected routes require authentication
- [ ] ESLint and Prettier are configured and working
- [ ] Application deploys to Vercel successfully
- [ ] Error boundaries catch and display errors
- [ ] Navigation between pages works smoothly
- [ ] Provider hierarchy renders correctly (check React DevTools)
- [ ] Middleware protects routes correctly (verify in Network tab)

### Automated Testing (if optional testing setup completed)
- [ ] `npm test` runs without errors
- [ ] Example test passes
- [ ] Test coverage report generates

### Code Quality
- [ ] All files follow naming convention (.jsx for components, .js for logic)
- [ ] No console errors or warnings in browser
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code formatted correctly (`npm run format`)

---

## Known Limitations (Expected at End of Phase 0)

This is a barebones setup. The following are intentionally incomplete:

- ❌ No calculation logic
- ❌ No prescription entry forms
- ❌ No RxNorm or FDA API integration
- ❌ No results display
- ❌ No complete database schema
- ❌ No role-based access control (roles created but not enforced)
- ❌ No business logic error handling

These features will be implemented in Phase 1 (MVP).

---

## Next Phase

**Phase 1: MVP** builds on this foundation by implementing:

**Core Functionality:**
- Complete calculation form for prescription entry
- RxNorm API integration for drug normalization
- FDA API integration for NDC validation
- Quantity calculation engine
- NDC matching algorithm

**User Features:**
- Results display with recommendations and warnings
- Pharmacist verification workflow
- Role-based access control enforcement
- JSON export functionality

**Data & Infrastructure:**
- Complete database schema for calculations
- Audit logging system
- Comprehensive error handling

Phase 1 delivers a working MVP where users can calculate NDC matches and dispense quantities.

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

### Required External Services
- **Auth0:** Account created, application configured with callback URLs
- **Supabase:** Project created, connection details available
- **Vercel:** Account connected to Git repository

### Environment Setup
- Node.js 18+ installed
- npm or yarn package manager
- Git repository initialized
- Code editor (VS Code recommended)

### Configuration Files Needed
- `.env.local` with all required variables
- Auth0 application settings (client ID, secret, domain)
- Supabase project settings (URL, anon key, service role key)

---

## Architecture Overview

### Application Flow
```
User Request
    ↓
middleware.js (Auth0 check)
    ↓
app/layout.jsx (Providers)
    ↓
app/page.jsx (Route)
```

### Data Flow
```
Component → TanStack Query → API Route → Supabase → Database
```

### Authentication Flow
```
Protected Route → Middleware → Auth0 Check → Allow/Redirect
```

---

## Quick Reference

### Key Files and Their Purpose (by Feature)

**Feature 2: Environment Configuration**
- `lib/env.js`: Environment variable validation with Zod schema
- `.env.local`: Local environment variables (gitignored, you create this)
- `.env.example`: Template for required variables (committed to Git)
- `next.config.js`: Next.js config, imports env.js for validation

**Feature 4: Theme Setup**
- `theme/index.js`: MUI theme configuration and export
- `theme/palette.js`: Color definitions
- `theme/typography.js`: Font and text styles

**Feature 5: Authentication**
- `middleware.js` (root level): Route protection, runs before every request
- `contexts/AuthContext/AuthProvider.jsx`: Auth0 context provider
- `hooks/useAuth.js`: Custom hook for accessing auth state

**Feature 6: Database**
- `lib/api/supabase.js`: Supabase client configuration

**Feature 7: Layout & Routing**
- `app/layout.jsx`: Root layout with all providers
- `app/page.jsx`: Home page
- `app/error.jsx`: Global error boundary
- `app/not-found.jsx`: 404 page
- `components/layout/Navigation/Navigation.jsx`: Navigation component

### Common Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm test             # Run tests (if configured)
```

---

**End of Phase 0 Document**

