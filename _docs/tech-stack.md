# Technology Stack

**Project:** NDC Packaging & Quantity Calculator (QuantRx)  
**Version:** MVP  
**Last Updated:** 2025-01-27

---

## Overview

This document defines the complete technology stack for the QuantRx application, including best practices, limitations, conventions, and common pitfalls for each technology.

---

## Frontend

### Framework
**Next.js 14+ (App Router)**
- React-based full-stack framework
- Built-in routing and API routes
- Server Components for performance
- Optimized for Vercel deployment

#### Next.js Best Practices
- **Server vs Client Components:** Use Server Components by default; add `'use client'` only when needed (interactivity, hooks, browser APIs, event handlers)
- **Data fetching:** Use Server Components for data fetching; fetch at component level, not in `useEffect`
- **Route organization:** Use `app/` directory structure; co-locate components with routes
- **Loading states:** Use `loading.jsx` and `error.jsx` files for route-level loading/error states
- **Metadata:** Use `metadata` export or `generateMetadata` for SEO and social sharing
- **Caching:** Understand Next.js caching (Request Memoization, Data Cache, Full Route Cache, Router Cache)
- **Dynamic routes:** Use `[param]` for dynamic segments, `[...slug]` for catch-all routes
- **API routes:** Use API routes for external API integration, mutations, and server-side logic
- **Middleware:** Use `middleware.js` for authentication, redirects, and request modification
- **Image optimization:** Always use `next/image` component instead of `<img>` for automatic optimization
- **Environment variables:** Use `NEXT_PUBLIC_` prefix for client-side variables; keep secrets server-side only

#### Next.js Limitations
- **Vercel optimization:** Some features optimized for Vercel deployment (can deploy elsewhere but may lose optimizations)
- **Learning curve:** App Router is relatively new; different from Pages Router
- **Server Components:** Cannot use hooks, event handlers, or browser APIs in Server Components
- **Build time:** Large applications can have long build times
- **Hydration:** Client-side hydration can cause layout shifts if not careful
- **File system routing:** Less flexible than programmatic routing for complex cases
- **API route limits:** Vercel has execution time limits (10s on Hobby, 60s on Pro)

#### Next.js Conventions
- **File naming:** Use `page.jsx` for routes, `layout.jsx` for layouts, `loading.jsx` for loading states, `error.jsx` for error boundaries
- **Component structure:** Co-locate components in route folders: `app/calculations/[id]/CalculationDetail.jsx`
- **Exports:** Use named exports for components, default exports for pages/layouts
- **Route groups:** Use `(groupName)` folders for organization without affecting URLs
- **Metadata:** Define metadata in `layout.jsx` or `page.jsx` using `metadata` export
- **API routes:** Place in `app/api/` directory; use `route.js` for route handlers

#### Next.js Common Pitfalls
- **Using `useEffect` for data fetching:** Should use Server Components or Server Actions
- **Not marking Client Components:** Forgetting `'use client'` when using hooks or browser APIs
- **Hydration mismatches:** Server-rendered HTML not matching client-rendered HTML
- **Not using Image component:** Missing automatic image optimization and lazy loading
- **Incorrect caching:** Not understanding when data is cached vs revalidated
- **API route overuse:** Using API routes when Server Actions would be better
- **Large bundle sizes:** Not code-splitting or lazy loading heavy components
- **Missing error boundaries:** Not handling errors at route level with `error.jsx`
- **Environment variable exposure:** Accidentally exposing secrets with `NEXT_PUBLIC_` prefix
- **Blocking in API routes:** Long-running operations exceeding Vercel timeout limits

### UI Library
**Material-UI (MUI)**

#### MUI Best Practices
- **Theme customization:** Use `createTheme()` to customize brand colors, typography, and spacing
- **Component composition:** Compose MUI components rather than overriding styles heavily
- **Accessibility:** Leverage MUI's built-in ARIA attributes; test with screen readers
- **Responsive design:** Use MUI's `useMediaQuery` hook and `sx` prop for responsive styles
- **Performance:** Use `React.memo` for expensive components; lazy load heavy components
- **Styling:** Prefer `sx` prop for one-off styles, `styled()` for reusable styled components
- **Icons:** Use `@mui/icons-material` for consistent iconography
- **Form components:** Use MUI form components (`TextField`, `Select`, etc.) with React Hook Form
- **Dark mode:** Implement dark mode using MUI's theme system

#### MUI Limitations
- **Bundle size:** Large bundle size (~200KB+ gzipped for full library)
- **Styling approach:** Opinionated styling system; may conflict with custom designs
- **Learning curve:** Understanding theme system and `sx` prop takes time
- **Customization complexity:** Deep customization can be complex
- **Version updates:** Breaking changes between major versions require migration

#### MUI Conventions
- **Import paths:** Use specific imports: `import Button from '@mui/material/Button'` (better tree-shaking)
- **Theme structure:** Organize theme in `theme/` directory; separate light/dark themes
- **Component naming:** Use MUI component names as-is; create wrapper components for customizations
- **Styling:** Use `sx` prop for component-level styles, theme for global styles
- **Breakpoints:** Use MUI breakpoints: `xs`, `sm`, `md`, `lg`, `xl`

#### MUI Common Pitfalls
- **Importing entire library:** Using `import * from '@mui/material'` increases bundle size
- **Overriding styles:** Heavy style overrides instead of using theme customization
- **Accessibility:** Not testing with screen readers or keyboard navigation
- **Performance:** Not memoizing expensive components or lists
- **Responsive design:** Not using MUI's responsive utilities correctly
- **Form integration:** Not properly integrating MUI components with React Hook Form

### Forms & Validation
**React Hook Form + Zod**

#### React Hook Form Best Practices
- **Controller component:** Use `Controller` or `useController` for MUI components
- **Default values:** Provide default values via `defaultValues` prop
- **Validation mode:** Use `mode: 'onBlur'` or `mode: 'onChange'` based on UX needs
- **Re-render optimization:** Leverage uncontrolled components for minimal re-renders
- **Form state:** Use `formState` for accessing errors, touched fields, and validation state
- **Reset form:** Use `reset()` method to reset form to default values
- **Watch values:** Use `watch()` sparingly; prefer `useController` for controlled components
- **Nested forms:** Use `useFieldArray` for dynamic form fields
- **Error handling:** Display errors using `formState.errors` object
- **Performance:** Use `shouldUnregister: false` for better performance with complex forms

#### React Hook Form Limitations
- **Learning curve:** Understanding uncontrolled vs controlled components
- **Complex validation:** Complex cross-field validation can be challenging
- **File uploads:** Requires additional setup for file upload handling
- **Dynamic fields:** `useFieldArray` can be complex for deeply nested structures

#### React Hook Form Conventions
- **Hook naming:** Use `useForm` hook; destructure methods: `const { register, handleSubmit, formState: { errors } } = useForm()`
- **Form structure:** Wrap form in `<form>` element; use `onSubmit={handleSubmit(onSubmit)}`
- **Error display:** Display errors near form fields: `{errors.fieldName && <span>{errors.fieldName.message}</span>}`
- **Validation:** Define validation rules in `register()` or use Zod resolver

#### React Hook Form Common Pitfalls
- **Not using Controller:** Trying to use `register()` directly with MUI components
- **Too many re-renders:** Using `watch()` for many fields causing performance issues
- **Missing error handling:** Not displaying validation errors to users
- **Form submission:** Not preventing default form submission
- **Default values:** Not providing default values causing uncontrolled component warnings
- **Validation timing:** Not setting appropriate `mode` for validation
- **Nested objects:** Not properly handling nested form data structures

#### Zod Best Practices
- **Schema definition:** Define schemas separately from components for reusability
- **Validation messages:** Provide clear, user-friendly error messages
- **Composition:** Use `.extend()`, `.merge()`, `.pick()`, `.omit()` for schema composition
- **Custom validation:** Use `.refine()` or `.superRefine()` for complex validation logic
- **Optional fields:** Use `.optional()` or `.nullable()` appropriately
- **Transformations:** Use `.transform()` for data transformation during validation
- **Error formatting:** Use `.errorMap()` for custom error message formatting
- **Async validation:** Use `.refine()` with async functions for server-side validation
- **Schema reuse:** Extract common patterns into reusable schema fragments

#### Zod Limitations
- **Runtime only:** Types are generated at runtime; compile-time type checking still needed
- **Bundle size:** Adds ~13KB to bundle (gzipped)
- **Complex schemas:** Very complex schemas can be hard to read and maintain
- **Performance:** Deeply nested schemas can impact validation performance

#### Zod Conventions
- **Schema naming:** Use PascalCase with "Schema" suffix: `CalculationFormSchema`
- **File organization:** Place schemas in `schemas/` or `lib/validations/` directory
- **Validation:** Use with React Hook Form via `@hookform/resolvers/zod`

#### Zod Common Pitfalls
- **Vague error messages:** Not providing clear error messages for users
- **Over-complex schemas:** Creating overly complex schemas that are hard to maintain
- **Not reusing:** Duplicating schema definitions instead of composing
- **Missing transformations:** Not using transformations when data needs to be modified
- **Async validation:** Not handling async validation correctly
- **Schema mismatches:** Schema validation not matching actual data structures

### State Management & Data Fetching
**Context API + TanStack Query**

#### Context API Best Practices
- **Context splitting:** Create separate contexts for different concerns (auth, theme, UI state)
- **Provider composition:** Compose multiple providers at app root
- **Value memoization:** Memoize context values with `useMemo` to prevent unnecessary re-renders
- **Custom hooks:** Create custom hooks for context consumption: `useAuth()`, `useTheme()`
- **Default values:** Provide meaningful default values for context
- **Performance:** Split contexts to prevent unnecessary re-renders of unrelated components

#### Context API Limitations
- **Re-render issues:** All consumers re-render when context value changes
- **No built-in selectors:** Cannot subscribe to specific parts of context value
- **Propagation:** Context updates propagate to all consumers (can't selectively update)
- **Complex state:** Not ideal for complex state management (use Zustand or Redux)

#### Context API Conventions
- **Context naming:** Use PascalCase with "Context" suffix: `AuthContext`, `ThemeContext`
- **Provider naming:** Use "Provider" suffix: `AuthProvider`, `ThemeProvider`
- **Hook naming:** Use "use" prefix: `useAuth`, `useTheme`
- **File structure:** Place contexts in `contexts/` directory

#### Context API Common Pitfalls
- **Single large context:** Creating one context for all state causing performance issues
- **Not memoizing values:** Context value object recreated on every render
- **Unnecessary re-renders:** All consumers re-render even when their specific data hasn't changed
- **Missing default values:** Not providing default values causing runtime errors
- **Over-using context:** Using context for state that should be local or props

#### TanStack Query Best Practices
- **Query keys:** Use consistent, hierarchical query keys: `['calculations'], ['calculations', id], ['calculations', { filter: 'verified' }]`
- **Stale time:** Set appropriate `staleTime` based on data freshness requirements (24 hours for RxNorm/FDA APIs)
- **Cache time:** Use `gcTime` (formerly `cacheTime`) to control how long unused data stays in cache
- **Error handling:** Use `onError` in query options or global error handler
- **Loading states:** Use `isLoading`, `isFetching`, `isPending` appropriately for different UI states
- **Optimistic updates:** Use `useMutation` with `onMutate` for optimistic UI updates
- **Parallel queries:** Use `useQueries` or `Promise.all` for parallel data fetching
- **Dependent queries:** Use `enabled` option for queries that depend on other data
- **Refetching:** Configure `refetchOnWindowFocus`, `refetchOnReconnect` based on requirements
- **Query invalidation:** Invalidate related queries after mutations: `queryClient.invalidateQueries(['calculations'])`

#### TanStack Query Limitations
- **Learning curve:** Understanding cache behavior and refetch strategies takes time
- **Bundle size:** Adds ~13KB to bundle (gzipped)
- **Server state only:** Not for client-only state (use Context API or Zustand)
- **No built-in persistence:** Need to use plugins or manual implementation for persistence
- **Complex invalidation:** Managing query invalidation can be complex in large apps

#### TanStack Query Conventions
- **Hook naming:** Use descriptive names: `useCalculations`, `useCalculation(id)`, `useCreateCalculation`
- **Query key factories:** Create query key factories for consistent keys: `calculationKeys.all, calculationKeys.detail(id)`
- **Mutation naming:** Use verb pattern: `useCreateCalculation`, `useUpdateCalculation`, `useDeleteCalculation`
- **Error handling:** Define consistent error handling patterns
- **Query client:** Create single `QueryClient` instance and provide via `QueryClientProvider`
- **File organization:** Place query hooks in `hooks/queries/` or `lib/queries/`

#### TanStack Query Common Pitfalls
- **Incorrect query keys:** Changing query keys unintentionally causes cache misses
- **Not invalidating:** Forgetting to invalidate queries after mutations
- **Over-fetching:** Fetching data that's already in cache
- **Stale closures:** Using stale data in callbacks; use `queryClient.setQueryData` instead
- **Not handling errors:** Not providing error UI or error handling
- **Race conditions:** Multiple mutations updating same resource without proper sequencing
- **Cache pollution:** Not cleaning up unused query data
- **Infinite loops:** Circular dependencies in query invalidation
- **Wrong loading state:** Using `isLoading` when `isFetching` is more appropriate

---

## Backend

### API Layer
**Next.js API Routes**

#### Next.js API Routes Best Practices
- **Route handlers:** Use `route.js` files in `app/api/` directory
- **HTTP methods:** Export named functions: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`
- **Error handling:** Return proper HTTP status codes and error responses
- **Request validation:** Validate request body and query parameters
- **Authentication:** Verify Auth0 JWT tokens in middleware or route handlers
- **Response types:** Set proper `Content-Type` headers for JSON responses
- **CORS:** Configure CORS headers if needed for cross-origin requests
- **Rate limiting:** Implement rate limiting for external API calls (RxNorm: 20 req/sec)
- **Error responses:** Return consistent error response format
- **Logging:** Log errors and important events for debugging

#### Next.js API Routes Limitations
- **Execution time:** Vercel limits: 10s (Hobby), 60s (Pro), 300s (Enterprise)
- **Cold starts:** Serverless functions have cold start latency
- **Memory limits:** Limited memory (1024MB default on Vercel Pro)
- **No persistent connections:** Cannot maintain long-lived connections
- **File system:** Read-only filesystem (except `/tmp`)

#### Next.js API Routes Conventions
- **File structure:** Place in `app/api/[route]/route.js`
- **Export naming:** Export `GET`, `POST`, etc. as named exports
- **Error handling:** Use try-catch blocks; return `NextResponse` for errors
- **Status codes:** Use appropriate HTTP status codes (200, 201, 400, 401, 404, 500)

#### Next.js API Routes Common Pitfalls
- **Exceeding timeout:** Long-running operations exceeding Vercel limits
- **Not handling errors:** Unhandled errors causing 500 responses
- **Missing validation:** Not validating request data before processing
- **CORS issues:** Not configuring CORS for cross-origin requests
- **Memory leaks:** Not cleaning up resources in long-running operations
- **Not using NextResponse:** Returning plain objects instead of `NextResponse`
- **Synchronous operations:** Blocking event loop with synchronous operations
- **Not logging:** Missing error logging for debugging

### Database
**Supabase (PostgreSQL)**

#### Supabase Best Practices
- **Row-Level Security (RLS):** Enable RLS on all tables for HIPAA compliance
- **RLS Policies:** Create policies for each role (technician, admin)
- **Connection pooling:** Use Supabase connection pooler for serverless functions
- **Indexes:** Create indexes on frequently queried columns (user_id, created_at)
- **Migrations:** Use Supabase migrations for schema changes
- **Client usage:** Use Supabase client in API routes; don't expose service role key to client
- **Error handling:** Handle Supabase errors gracefully
- **Transactions:** Use transactions for multi-step operations
- **JSONB columns:** Use JSONB for flexible schema (recommended_ndc, alternatives, warnings)

#### Supabase Limitations
- **Connection limits:** Free tier: 60 connections; Pro: 200 connections
- **Query timeout:** 2 minutes for queries
- **Database size:** Free tier: 500MB; Pro: 8GB
- **Backup retention:** Free tier: 7 days; Pro: 7 days
- **No direct SQL access:** Must use Supabase client or REST API
- **Rate limiting:** API rate limits on free tier

#### Supabase Conventions
- **Table naming:** Use snake_case: `users`, `calculations`, `audit_logs`
- **Column naming:** Use snake_case: `user_id`, `created_at`, `updated_at`
- **Primary keys:** Use UUID for primary keys
- **Foreign keys:** Use UUID for foreign key references
- **Timestamps:** Use `timestamptz` for timezone-aware timestamps
- **Enums:** Use PostgreSQL enums for status fields: `status enum('pending', 'verified')`

#### Supabase Common Pitfalls
- **RLS not enabled:** Forgetting to enable RLS on tables
- **Weak RLS policies:** Policies too permissive or too restrictive
- **Service role key exposure:** Accidentally exposing service role key in client code
- **Not using connection pooling:** Exhausting database connections
- **Missing indexes:** Slow queries due to missing indexes
- **Not handling errors:** Not catching and handling Supabase errors
- **N+1 queries:** Fetching related data in loops instead of using joins
- **Not using transactions:** Race conditions in multi-step operations

---

## Authentication & Authorization

### Authentication Provider
**Auth0**

#### Auth0 Best Practices
- **JWT validation:** Validate JWT tokens on every API request
- **Token storage:** Store tokens securely (httpOnly cookies preferred, or secure storage)
- **Token expiration:** Use short-lived access tokens (15-60 minutes)
- **Refresh tokens:** Implement refresh token rotation for security
- **Role management:** Use Auth0 roles and include in JWT claims
- **User metadata:** Store user roles and permissions in Auth0 user metadata
- **Error handling:** Handle token expiration and refresh gracefully
- **Middleware:** Use Next.js middleware for route protection
- **API authentication:** Verify tokens in API routes using Auth0 SDK
- **HIPAA compliance:** Use Auth0 HIPAA-compliant plan for healthcare data

#### Auth0 Limitations
- **Cost:** HIPAA-compliant plan required for healthcare (additional cost)
- **Vendor lock-in:** Auth0-specific implementation; migration can be complex
- **Rate limits:** API rate limits on free/developer tiers
- **Customization:** Limited customization of login UI without custom domain
- **Learning curve:** Understanding Auth0 concepts (tenants, applications, APIs)

#### Auth0 Conventions
- **Environment variables:** Use `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`
- **Middleware:** Use `middleware.js` for route protection
- **Token claims:** Include user ID and roles in JWT claims
- **Error handling:** Redirect to login on authentication failure
- **Session management:** Use Auth0 session management APIs

#### Auth0 Common Pitfalls
- **Not validating tokens:** Trusting client-provided tokens without validation
- **Token exposure:** Logging or exposing tokens in error messages
- **Missing role checks:** Not checking user roles before allowing actions
- **Token refresh:** Not implementing token refresh causing user logout
- **CORS issues:** Not configuring Auth0 CORS settings correctly
- **Callback URLs:** Not configuring callback URLs correctly
- **Environment variables:** Missing or incorrect Auth0 environment variables
- **Role synchronization:** Not syncing Auth0 roles with database

### User Roles
- **technician**: Can enter and calculate prescriptions
- **admin**: Can review analytics and manage system

---

## External APIs

### Drug Normalization
**RxNorm API**

#### RxNorm API Best Practices
- **Rate limiting:** Respect 20 requests/second per IP limit
- **Caching:** Cache responses for 24 hours (drug data changes infrequently)
- **Error handling:** Handle API errors gracefully with retry logic
- **Request optimization:** Batch requests when possible
- **Fallback:** Provide fallback to manual NDC entry if API fails
- **Monitoring:** Monitor API response times and error rates
- **Request deduplication:** Use TanStack Query to deduplicate identical requests

#### RxNorm API Limitations
- **Rate limits:** 20 requests/second per IP (may need rate limiting)
- **No API key:** Free but no authentication (rate limiting by IP only)
- **Response time:** Variable response times (may impact <2s target)
- **Data freshness:** Updates periodically, not real-time
- **No batch API:** Must make individual requests for each drug

#### RxNorm API Conventions
- **Endpoint:** Use RxNorm REST API endpoints
- **Error handling:** Return user-friendly error messages
- **Caching:** Cache successful responses; don't cache errors
- **Logging:** Log API calls for debugging and monitoring

#### RxNorm API Common Pitfalls
- **Rate limit exceeded:** Not implementing rate limiting causing 429 errors
- **No caching:** Making redundant API calls for same drug
- **Error handling:** Not handling API failures gracefully
- **Timeout:** Not setting appropriate timeout values
- **No retry:** Not implementing retry logic for transient failures

### NDC Validation
**FDA NDC Directory API**

#### FDA NDC API Best Practices
- **Caching:** Cache NDC data for 24 hours (updates daily)
- **Active status:** Always check marketing end date for inactive NDCs
- **Error handling:** Handle API errors with clear user messages
- **Filtering:** Filter inactive NDCs before displaying to users
- **Batch requests:** Request multiple NDCs in single query when possible
- **Monitoring:** Monitor API availability and response times

#### FDA NDC API Limitations
- **Update frequency:** Updates daily, not real-time
- **Rate limits:** May have rate limits (check documentation)
- **Response size:** Large responses for queries with many results
- **No batch validation:** Must validate NDCs individually or in small batches

#### FDA NDC API Conventions
- **Endpoint:** Use open.fda.gov NDC API endpoints
- **Status checking:** Always check `marketing_end_date` field for active status
- **Error handling:** Return clear messages for invalid or inactive NDCs
- **Caching:** Cache active NDC lists; refresh daily

#### FDA NDC API Common Pitfalls
- **Not checking status:** Displaying inactive NDCs as valid
- **No caching:** Making redundant API calls
- **Error handling:** Not handling API failures
- **Rate limiting:** Exceeding rate limits
- **Data freshness:** Not refreshing cached data regularly

---

## Caching

### Frontend Caching
- **TanStack Query**
  - Automatic caching of API responses
  - Stale-while-revalidate pattern
  - Request deduplication
  - Perfect for RxNorm/FDA API responses

### Backend Caching (Optional)
- **Redis**
  - Server-side API response caching
  - Can be added later if needed
  - Vercel KV or Upstash for serverless Redis

---

## Deployment & Infrastructure

### Hosting Platform
**Vercel**

#### Vercel Best Practices
- **Automatic deployments:** Connect Git repository for automatic deployments on push
- **Preview deployments:** Use preview deployments for pull requests
- **Environment variables:** Set environment variables per environment (development, preview, production)
- **Build settings:** Configure build command and output directory in `vercel.json` or project settings
- **Function regions:** Configure function regions for optimal latency
- **Edge functions:** Use Edge Functions for low-latency, globally distributed logic
- **Analytics:** Enable Vercel Analytics for performance monitoring
- **Error tracking:** Integrate Sentry for error tracking
- **Custom domains:** Configure custom domains with SSL certificates
- **Team collaboration:** Use Vercel teams for collaboration and access control

#### Vercel Limitations
- **Vendor lock-in:** Optimized for Next.js; deploying elsewhere may lose optimizations
- **Function limits:** Execution time limits (10s Hobby, 60s Pro, 300s Enterprise)
- **Memory limits:** Limited memory per function (1024MB default on Pro)
- **Cold starts:** Serverless functions have cold start latency
- **Build time:** Builds can take time for large applications
- **Cost:** Can become expensive at scale (pay per function execution)

#### Vercel Conventions
- **Project structure:** Follow Next.js conventions; Vercel auto-detects
- **Configuration:** Use `vercel.json` for advanced configuration
- **Environment variables:** Prefix with `NEXT_PUBLIC_` for client-side variables
- **Deployment:** Use Git integration; avoid manual deployments
- **Branch strategy:** Use main branch for production, other branches for previews

#### Vercel Common Pitfalls
- **Exceeding function timeout:** Long-running operations exceeding limits
- **Environment variables:** Not setting environment variables correctly
- **Build failures:** Not checking build logs for errors
- **Caching issues:** Not understanding Vercel's caching behavior
- **Function size:** Large function bundles causing cold start delays
- **Not using previews:** Not testing in preview deployments before production
- **Missing error handling:** Not handling errors in serverless functions
- **Cost overruns:** Not monitoring function execution costs

### Secrets & Configuration
**Vercel Environment Variables**

#### Vercel Environment Variables Best Practices
- **Separate environments:** Use different values for development, preview, and production
- **Secret management:** Never commit secrets to Git; use Vercel dashboard
- **Naming:** Use consistent naming convention: `DATABASE_URL`, `API_KEY`, etc.
- **Rotation:** Rotate secrets regularly for security
- **Client vs Server:** Use `NEXT_PUBLIC_` prefix only for client-side variables
- **Validation:** Validate environment variables at application startup
- **Documentation:** Document required environment variables in README

#### Vercel Environment Variables Limitations
- **No versioning:** Environment variables not versioned in Git
- **Manual updates:** Must update in Vercel dashboard (no API for bulk updates)
- **Limited encryption:** Encrypted at rest but visible in dashboard
- **No secrets rotation:** Manual rotation required

#### Vercel Environment Variables Conventions
- **Naming:** Use UPPER_SNAKE_CASE: `DATABASE_URL`, `AUTH0_CLIENT_ID`
- **Prefixes:** Use `NEXT_PUBLIC_` for client-side variables
- **Grouping:** Group related variables with common prefix: `AUTH0_*`, `SUPABASE_*`
- **Documentation:** List all required variables in `.env.example` file

#### Vercel Environment Variables Common Pitfalls
- **Committing secrets:** Accidentally committing `.env.local` to Git
- **Wrong environment:** Using production secrets in development
- **Missing variables:** Not setting all required variables causing runtime errors
- **Client exposure:** Exposing secrets with `NEXT_PUBLIC_` prefix
- **Not validating:** Not validating environment variables at startup

---

## Monitoring & Logging

### Logging
**Vercel Logs**

#### Vercel Logs Best Practices
- **Structured logging:** Use structured JSON logs for better searchability
- **Log levels:** Use appropriate log levels (debug, info, warn, error)
- **Context:** Include request IDs and user context in logs
- **Error logging:** Log errors with stack traces and context
- **Performance logging:** Log slow operations and API response times
- **Search queries:** Use Vercel's log search to find specific errors or patterns
- **Retention:** Understand log retention limits (7 days on Pro plan)

#### Vercel Logs Limitations
- **Retention:** Limited retention period (7 days on Pro, longer on Enterprise)
- **Search:** Basic search functionality; not as powerful as dedicated logging services
- **No alerts:** No built-in alerting for errors or patterns
- **Cost:** Log storage can add to costs at scale

#### Vercel Logs Conventions
- **Log format:** Use consistent log format: `{ level, message, timestamp, context }`
- **Error logging:** Always include error stack traces and relevant context
- **Request IDs:** Include request IDs for tracing requests across logs

#### Vercel Logs Common Pitfalls
- **Not logging errors:** Missing error logging making debugging difficult
- **Too much logging:** Logging too much data causing performance issues
- **Unstructured logs:** Not using structured logging making search difficult
- **Missing context:** Not including enough context in logs

### Error Tracking (Optional)
**Sentry**

#### Sentry Best Practices
- **Error boundaries:** Use React Error Boundaries to catch component errors
- **Source maps:** Upload source maps for readable stack traces
- **User context:** Include user ID and other context in error reports
- **Breadcrumbs:** Use breadcrumbs to track user actions before errors
- **Release tracking:** Track releases to identify when errors were introduced
- **Error grouping:** Use fingerprinting to group similar errors
- **Performance monitoring:** Enable performance monitoring for slow operations
- **HIPAA compliance:** Use Sentry's HIPAA-compliant plan for healthcare data

#### Sentry Limitations
- **Cost:** Can be expensive at scale (pay per event)
- **Setup complexity:** Requires configuration for source maps and releases
- **Privacy:** Error data may contain sensitive information (need HIPAA plan)
- **Rate limiting:** Free tier has rate limits

#### Sentry Conventions
- **Error handling:** Wrap API routes and components with error boundaries
- **Context:** Always include user context and request IDs
- **Releases:** Tag releases with version numbers or Git commits
- **Environments:** Separate errors by environment (development, production)

#### Sentry Common Pitfalls
- **Not uploading source maps:** Unreadable stack traces in production
- **Too many events:** Not filtering or sampling causing cost overruns
- **Missing context:** Not including enough context for debugging
- **Privacy violations:** Logging sensitive data without HIPAA compliance
- **Not using error boundaries:** Missing React component errors

---

## Development Tools

### Language
**JavaScript (ES6+)**

#### JavaScript Best Practices
- **Modern syntax:** Use ES6+ features: arrow functions, destructuring, template literals, async/await
- **Code style:** Follow consistent code style (enforced by ESLint and Prettier)
- **JSDoc comments:** Use JSDoc for function documentation and parameter descriptions
- **Error handling:** Always handle errors with try-catch blocks; use proper error objects
- **Null/undefined checks:** Always check for null/undefined before accessing properties
- **Immutability:** Prefer immutable patterns; use spread operator, Object.assign, etc.
- **Async/await:** Use async/await instead of promise chains for better readability
- **Destructuring:** Use destructuring for cleaner code when accessing object properties
- **Template literals:** Use template literals instead of string concatenation
- **Const/let:** Use `const` by default; use `let` only when reassignment is needed

#### JavaScript Limitations
- **No compile-time type checking:** Runtime errors possible; use JSDoc and validation
- **Dynamic typing:** Variables can change types; requires careful validation
- **No interfaces:** Cannot define interfaces; use JSDoc and runtime validation
- **Prototype-based:** Different from class-based languages; requires understanding of prototypes
- **Hoisting:** Variable and function hoisting can cause unexpected behavior
- **Truthy/falsy:** Implicit type coercion can cause bugs; use strict equality (`===`)

#### JavaScript Conventions
- **Naming:** Use camelCase for variables/functions, PascalCase for components/classes
- **File organization:** Group related functions in same file; use modules for organization
- **JSDoc:** Document all exported functions with JSDoc comments
- **Imports:** Use ES6 import/export syntax; prefer named exports
- **Constants:** Use UPPER_SNAKE_CASE for constants; group in constants files
- **Config:** Use `.eslintrc.js` and `.prettierrc` for code quality

#### JavaScript Common Pitfalls
- **Not using strict equality:** Using `==` instead of `===` causing type coercion bugs
- **Missing null checks:** Accessing properties on potentially null/undefined objects
- **Not handling async errors:** Forgetting to catch errors in async functions
- **Mutating state:** Directly mutating objects/arrays instead of creating new ones
- **Hoisting issues:** Using variables before declaration causing undefined errors
- **Scope issues:** Not understanding `var` vs `let`/`const` scope differences
- **Callback hell:** Not using async/await or promise chains properly
- **Memory leaks:** Not cleaning up event listeners, timers, or subscriptions

### Build Tool
**Next.js Built-in (Turbopack)**
- Next.js includes its own build tooling
- Fast development server
- Optimized production builds

### Code Quality
- **ESLint**: Linting and code quality
- **Prettier**: Code formatting
- **JSDoc**: Documentation and type hints

---

## Stack Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  Next.js (React) + MUI + React Hook Form + Zod   │
│  Context API + TanStack Query                   │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│              Next.js API Routes                  │
│  (Serverless Functions on Vercel)              │
└─────────────────────────────────────────────────┘
         ↓                    ↓              ↓
┌──────────────┐   ┌──────────────┐  ┌──────────────┐
│   Auth0      │   │   Supabase   │  │  External    │
│              │   │ (PostgreSQL) │  │    APIs      │
│  Auth & RBAC │   │              │  │              │
│              │   │  Database    │  │ RxNorm + FDA │
└──────────────┘   └──────────────┘  └──────────────┘
```

---

## Key Integration Points

### 1. Authentication Flow
```
User → Auth0 Login → JWT Token → Next.js API Routes → Supabase (with RLS)
```

### 2. Data Flow
```
User Input → React Hook Form → Zod Validation → Next.js API Route → 
External APIs (RxNorm/FDA) → TanStack Query Cache → Supabase (audit log) → 
Results Display
```

### 3. Role-Based Access
```
Auth0 JWT → Next.js Middleware → Role Check → 
Allow/Deny Access to Features
```

---

## Environment Variables

### Required Variables

```env
# Auth0
AUTH0_SECRET=
AUTH0_BASE_URL=
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# External APIs
RXNORM_API_KEY= (if required)
FDA_API_KEY= (if required)

# OpenAI (for SIG parsing)
OPENAI_API_KEY=

# Sentry (optional)
SENTRY_DSN=
```

---

## Database Schema

### Core Tables (Supabase/PostgreSQL)

**users**
- id (UUID, primary key)
- auth0_id (string, unique)
- email (string)
- role (enum: 'technician', 'admin')
- created_at (timestamp)
- updated_at (timestamp)

**calculations**
- id (UUID, primary key)
- user_id (UUID, foreign key → users)
- drug_name (string)
- ndc (string)
- sig (text)
- days_supply (integer)
- calculated_quantity (integer)
- recommended_ndc (jsonb)
- alternatives (jsonb)
- warnings (jsonb)
- status (enum: 'pending', 'verified')
- verified_by (UUID, foreign key → users, nullable)
- verified_at (timestamp, nullable)
- created_at (timestamp)
- updated_at (timestamp)

**audit_logs**
- id (UUID, primary key)
- user_id (UUID, foreign key → users)
- action (string)
- resource_type (string)
- resource_id (UUID)
- metadata (jsonb)
- created_at (timestamp)

---

## Security Considerations

### HIPAA Compliance
- **Auth0**: HIPAA-compliant plan available
- **Supabase**: Row-level security for data isolation
- **Vercel**: SOC 2 Type II compliant
- **Data Encryption**: In transit (HTTPS) and at rest
- **Audit Logging**: All calculations and verifications logged

### Row-Level Security (RLS) Policies
- Users can only see their own calculations
- Admins can see all calculations
- Technicians cannot modify verified calculations
- All actions logged in audit_logs

---

## Performance Targets

- **API Response Time**: <2 seconds per calculation (as per PRD)
- **Caching Strategy**: 
  - TanStack Query: Cache RxNorm/FDA responses for 24 hours
  - Optional Redis: Cache frequently accessed NDCs
- **Database**: 
  - Index on user_id, created_at for calculations
  - Index on auth0_id for users

---

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies: `npm install`
3. Set up environment variables (`.env.local`)
4. Run development server: `npm run dev`
5. Access at `http://localhost:3000`

### Deployment
1. Push to Git repository
2. Vercel automatically deploys
3. Environment variables configured in Vercel dashboard
4. Preview deployments for pull requests

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-27 | 1.0 | Initial tech stack decisions | System |
| 2025-01-27 | 2.0 | Added comprehensive best practices, limitations, conventions, and common pitfalls for all technologies | System |

---

**End of Document**

