# Project Rules

**Project:** NDC Packaging & Quantity Calculator (QuantRx)  
**Version:** MVP  
**Last Updated:** 2025-01-27

---

## Overview

This document defines the project structure, file naming conventions, code organization principles, and development rules for the QuantRx application. These rules ensure the codebase is modular, scalable, AI-friendly, and easy to understand and maintain.

### Core Principles

1. **AI-First Architecture:** Code must be easily understood by AI tools and human developers
2. **Modularity:** Each file should have a single, clear responsibility
3. **Scalability:** Structure supports growth without refactoring
4. **Navigability:** File and directory names clearly indicate purpose
5. **Documentation:** All code is self-documenting with clear comments

---

## Directory Structure

### Root Level

```
QuantRx/
├── app/                    # Next.js App Router (pages, layouts, API routes)
├── components/              # Reusable React components
├── lib/                    # Utility functions, helpers, business logic
├── hooks/                   # Custom React hooks
├── contexts/               # React Context providers
├── schemas/                 # Zod validation schemas
├── theme/                  # Material-UI theme configuration
├── public/                  # Static assets
├── _docs/                   # Project documentation
├── .env.local              # Local environment variables (gitignored)
├── .env.example            # Example environment variables
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies and scripts
└── README.md               # Project overview and setup
```

### App Directory (`app/`)

Next.js 14+ App Router structure:

```
app/
├── layout.jsx              # Root layout (providers, theme)
├── page.jsx                 # Home page (main calculation interface)
├── loading.jsx              # Global loading UI
├── error.jsx                # Global error boundary
├── not-found.jsx            # 404 page
├── middleware.js             # Auth middleware, route protection
├── api/                     # API routes
│   ├── calculations/
│   │   └── route.js         # POST /api/calculations
│   ├── rxnorm/
│   │   └── route.js         # GET /api/rxnorm
│   ├── fda/
│   │   └── route.js         # GET /api/fda
│   └── auth/
│       └── route.js         # Auth callbacks
└── (auth)/                  # Route group for auth pages
    ├── login/
    │   └── page.jsx
    └── callback/
        └── page.jsx
```

**Rules:**
- Use `page.jsx` for routes (not `index.jsx`)
- Use `layout.jsx` for shared layouts
- Use `loading.jsx` for route-level loading states
- Use `error.jsx` for route-level error boundaries
- Co-locate route-specific components in route folders
- Use route groups `(groupName)` for organization without affecting URLs

### Components Directory (`components/`)

```
components/
├── ui/                      # Base UI components (buttons, inputs, cards)
│   ├── Button/
│   │   ├── Button.jsx
│   │   ├── Button.test.jsx
│   │   └── index.js
│   ├── Input/
│   └── Card/
├── forms/                   # Form components
│   ├── CalculationForm/
│   │   ├── CalculationForm.jsx
│   │   ├── CalculationForm.test.jsx
│   │   └── index.js
│   └── NDCInput/
├── results/                 # Results display components
│   ├── ResultsDisplay/
│   ├── NDCCard/
│   ├── AlternativeOptions/
│   └── WarningsSection/
├── layout/                  # Layout components
│   ├── Header/
│   ├── Footer/
│   └── Navigation/
└── shared/                  # Shared components
    ├── LoadingSpinner/
    ├── ErrorAlert/
    └── StatusBadge/
```

**Rules:**
- Group components by feature/domain
- Each component gets its own folder
- Include `index.js` for clean imports
- Co-locate tests with components
- Use PascalCase for component folders and files

### Lib Directory (`lib/`)

```
lib/
├── api/                     # API client functions
│   ├── rxnorm.js           # RxNorm API client
│   ├── fda.js              # FDA NDC API client
│   ├── supabase.js         # Supabase client
│   └── auth0.js            # Auth0 client
├── calculations/            # Calculation logic
│   ├── quantity.js         # Quantity calculation
│   ├── ndc-matching.js    # NDC matching algorithm
│   └── sig-parsing.js      # SIG parsing (OpenAI)
├── validations/             # Validation utilities
│   ├── ndc.js              # NDC format validation
│   └── drug-name.js       # Drug name validation
├── utils/                   # General utilities
│   ├── format.js           # Formatting functions
│   ├── date.js             # Date utilities
│   └── errors.js           # Error handling utilities
├── constants/               # Application constants
│   ├── api.js              # API endpoints, rate limits
│   ├── roles.js            # User roles
│   └── status.js           # Status enums
└── queries/                 # TanStack Query hooks and keys
    ├── calculations.js     # Calculation queries
    ├── keys.js             # Query key factories
    └── mutations.js         # Mutation hooks
```

**Rules:**
- Group by domain/feature
- Keep functions pure when possible
- Export from `index.js` for clean imports
- One main responsibility per file

### Hooks Directory (`hooks/`)

```
hooks/
├── queries/                 # TanStack Query hooks
│   ├── useCalculations.js
│   ├── useCalculation.js
│   └── useCreateCalculation.js
├── useAuth.js               # Authentication hook
├── useFormValidation.js     # Form validation hook
└── useDebounce.js           # Debounce utility hook
```

**Rules:**
- Use `use` prefix for all hooks
- Group query hooks in `queries/` subdirectory
- One hook per file
- Export custom hooks from `index.js` if needed

### Contexts Directory (`contexts/`)

```
contexts/
├── AuthContext/
│   ├── AuthContext.jsx
│   ├── AuthProvider.jsx
│   └── index.js
├── ThemeContext/
└── UIContext/
```

**Rules:**
- One context per folder
- Include Provider component
- Export context and provider from `index.js`
- Use PascalCase for context names

### Schemas Directory (`schemas/`)

```
schemas/
├── calculation.js           # Calculation form schema
├── ndc.js                   # NDC validation schema
└── user.js                  # User-related schemas
```

**Rules:**
- One schema per file
- Export schema for use with React Hook Form
- Use PascalCase with "Schema" suffix: `CalculationFormSchema`
- Document schema structure with JSDoc comments

### Theme Directory (`theme/`)

```
theme/
├── index.js                 # Main theme export
├── palette.js               # Color definitions
├── typography.js            # Typography scale
├── spacing.js               # Spacing system
├── components.js            # Component overrides
└── breakpoints.js           # Responsive breakpoints
```

**Rules:**
- Split theme into logical modules
- Export complete theme from `index.js`
- Follow Material-UI theme structure

---

## File Naming Conventions

### General Rules

1. **Use descriptive names:** File names should clearly indicate purpose
2. **Match export names:** File name should match primary export (for components)
3. **Use consistent casing:**
   - **PascalCase:** React components, types, contexts
   - **camelCase:** Utilities, hooks, functions
   - **kebab-case:** Configuration files, scripts
   - **UPPER_SNAKE_CASE:** Constants, environment variables

### Specific Conventions

#### React Components
- **Format:** `ComponentName.jsx`
- **Example:** `CalculationForm.jsx`, `NDCCard.jsx`
- **Folder:** `ComponentName/` with `ComponentName.jsx` and `index.js`

#### Pages (Next.js)
- **Format:** `page.jsx`, `layout.jsx`, `loading.jsx`, `error.jsx`
- **Location:** In route folders under `app/`

#### API Routes
- **Format:** `route.js`
- **Location:** `app/api/[route]/route.js`
- **Export:** Named exports: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`

#### Utilities and Helpers
- **Format:** `functionName.js` or `domain.js`
- **Example:** `formatNDC.js`, `calculateQuantity.js`, `api.js`
- **Location:** `lib/utils/` or `lib/[domain]/`

#### Hooks
- **Format:** `useHookName.js`
- **Example:** `useAuth.js`, `useDebounce.js`
- **Location:** `hooks/` or `hooks/[category]/`

#### Schemas
- **Format:** `DomainSchema.js` or `domain.js`
- **Example:** `CalculationFormSchema.js`, `ndc.js`
- **Location:** `schemas/`

#### Tests
- **Format:** `ComponentName.test.jsx` or `functionName.test.js`
- **Location:** Co-located with source files
- **Alternative:** `__tests__/` folder in component directory

#### Configuration Files
- **Format:** `configName.config.js` or `.configName`
- **Example:** `next.config.js`, `.eslintrc.js`, `.prettierrc`

---

## Code Organization Rules

### File Size Limit

**Maximum 500 lines per file**

**Rationale:** 
- Easier for AI tools to process and understand
- Better code navigation and readability
- Encourages modular design
- Reduces cognitive load

**When approaching limit:**
1. Extract utility functions to separate files
2. Split large components into smaller sub-components
3. Move types to separate type files
4. Extract business logic to separate modules
5. Consider if file has multiple responsibilities

### File Header Documentation

**Every file must start with a header comment explaining its purpose:**

```javascript
/**
 * CalculationForm Component
 * 
 * Main form component for entering prescription data (drug name/NDC, SIG, days supply).
 * Handles form validation, submission, and displays inline validation errors.
 * 
 * @module components/forms/CalculationForm
 */

import { ... } from '...';
```

**Header should include:**
- Brief description of file purpose
- Key responsibilities (if component/logic file)
- Module path (for reference)
- Additional context if needed

### Function Documentation

**All functions must have JSDoc comments:**

```javascript
/**
 * Calculates the total quantity to dispense based on SIG and days supply.
 * 
 * @param {Object} sig - Parsed SIG object containing dose, frequency, and unit
 * @param {number} sig.dose - Number of units per dose (e.g., 1 tablet)
 * @param {number} sig.frequency - Number of times per day (e.g., 2 for "twice daily")
 * @param {string} sig.unit - Unit of measurement (e.g., "tablet", "ml", "mg")
 * @param {number} daysSupply - Number of days the prescription should last
 * @returns {number} Total quantity to dispense in the specified unit
 * 
 * @example
 * ```js
 * const quantity = calculateQuantity(
 *   { dose: 1, frequency: 2, unit: 'tablet' },
 *   30
 * );
 * // Returns: 60
 * ```
 */
export function calculateQuantity(sig, daysSupply) {
  // Implementation
}
```

**Documentation should include:**
- Clear description of function purpose
- `@param` for each parameter with type and description
- `@returns` with return type and description
- `@throws` if function can throw errors
- `@example` for complex functions
- `@see` for related functions/types

### Component Documentation

**All React components must have documentation:**

```javascript
/**
 * CalculationForm Component
 * 
 * Main form for entering prescription calculation inputs. Handles:
 * - Drug name or NDC entry
 * - SIG (directions) input
 * - Days supply input
 * - Form validation and submission
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Callback function when form is submitted
 * @param {Object} props.initialValues - Initial form values
 * @example
 * ```jsx
 * <CalculationForm
 *   onSubmit={handleSubmit}
 *   initialValues={defaultValues}
 * />
 * ```
 */
export function CalculationForm({ onSubmit, initialValues }) {
  // Implementation
}
```

### JSDoc Type Definitions

**Use JSDoc to document object shapes and types:**

```javascript
/**
 * @typedef {Object} ParsedSIG
 * @property {number} dose - Number of units per dose (e.g., 1 tablet)
 * @property {number} frequency - Number of times per day (e.g., 2 for "twice daily")
 * @property {string} unit - Unit of measurement (e.g., "tablet", "ml", "mg")
 */

/**
 * Represents a parsed SIG (prescription directions) with extracted dose information.
 * 
 * @type {ParsedSIG}
 */
const exampleSIG = {
  dose: 1,
  frequency: 2,
  unit: 'tablet'
};
```

### Import Organization

**Organize imports in this order:**

```javascript
// 1. React and Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// 3. Internal modules (absolute imports)
import { calculateQuantity } from '@/lib/calculations/quantity';
import { useAuth } from '@/hooks/useAuth';
import { CalculationFormSchema } from '@/schemas/calculation';

// 4. Relative imports
import { NDCCard } from '../NDCCard';
import { formatNDC } from './utils';
```

**Rules:**
- Group imports by category
- Separate third-party from internal
- Use absolute imports (`@/`) for internal modules
- Sort alphabetically within groups

### Export Conventions

**Prefer named exports for utilities and functions:**

```javascript
// ✅ Good
export function calculateQuantity() { }
export const API_BASE_URL = 'https://api.example.com';

// ❌ Avoid (unless default export is required by framework)
export default function calculateQuantity() { }
```

**Use default exports only for:**
- Next.js pages (`page.jsx`, `layout.jsx`)
- React components that are primary export of file
- When framework requires it

**Create `index.js` files for clean imports:**

```javascript
// components/ui/Button/index.js
export { Button } from './Button';
```

---

## JavaScript Rules

### Code Quality

1. **ESLint:** Use ESLint for code quality and consistency
2. **Prettier:** Use Prettier for code formatting
3. **JSDoc:** Document all exported functions with JSDoc comments
4. **Strict equality:** Always use `===` and `!==` instead of `==` and `!=`

### Type Documentation with JSDoc

1. **Use JSDoc for type hints:** Document parameter and return types
2. **Use `@typedef` for complex objects:** Define reusable type definitions
3. **Document function parameters:** Use `@param {type} name - description`
4. **Document return values:** Use `@returns {type} description`

### Example

```javascript
// lib/calculations/quantity.js

/**
 * @typedef {Object} ParsedSIG
 * @property {number} dose - Number of units per dose
 * @property {number} frequency - Number of times per day
 * @property {string} unit - Unit of measurement
 */

/**
 * Status of a calculation record
 * @typedef {'pending' | 'verified'} CalculationStatus
 */

/**
 * Core calculation data structure
 * @typedef {Object} Calculation
 * @property {string} id - Unique identifier
 * @property {string} userId - User who created the calculation
 * @property {string} drugName - Name of the drug
 * @property {string} ndc - National Drug Code
 * @property {string} sig - Prescription directions
 * @property {number} daysSupply - Number of days supply
 * @property {number} calculatedQuantity - Calculated quantity to dispense
 * @property {CalculationStatus} status - Status of the calculation
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
```

---

## Component Structure

### Component File Template

```javascript
/**
 * ComponentName Component
 * 
 * Brief description of component purpose and responsibilities.
 * 
 * @component
 */

'use client'; // Only if needed (interactivity, hooks, browser APIs)

import { ... } from '...';

/**
 * ComponentName Component
 * 
 * More detailed description if needed.
 * 
 * @param {Object} props - Component props
 * @param {string} props.propName - Description of prop
 * @param {number} [props.optionalProp] - Optional prop description
 */
export function ComponentName({ propName, optionalProp }) {
  // Hooks
  const [state, setState] = useState();
  
  // Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // Render
  return (
    // JSX
  );
}
```

### Component Organization

1. **Imports** (organized as per import rules)
2. **JSDoc type definitions** (if needed)
3. **Component function**
4. **Hooks** (useState, useEffect, etc.)
5. **Event handlers**
6. **Computed values** (useMemo, derived state)
7. **Effects** (useEffect)
8. **Render** (return JSX)

---

## API Route Structure

### API Route Template

```javascript
/**
 * API Route: /api/calculations
 * 
 * Handles calculation creation and retrieval.
 * POST: Create new calculation
 * GET: Retrieve calculations (with query params for filtering)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * POST /api/calculations
 * Creates a new calculation record
 * 
 * @param {NextRequest} request - Next.js request object
 * @returns {Promise<NextResponse>} Response with calculation data or error
 */
export async function POST(request) {
  try {
    // 1. Validate request
    const body = await request.json();
    const validated = CalculationSchema.parse(body);
    
    // 2. Authenticate (middleware or inline)
    const user = await authenticateRequest(request);
    
    // 3. Business logic
    const calculation = await createCalculation(validated, user.id);
    
    // 4. Return response
    return NextResponse.json(calculation, { status: 201 });
  } catch (error) {
    // Error handling
    return handleApiError(error);
  }
}

/**
 * GET /api/calculations
 * Retrieves calculations with optional filtering
 * 
 * @param {NextRequest} request - Next.js request object
 * @returns {Promise<NextResponse>} Response with calculations array or error
 */
export async function GET(request) {
  // Implementation
}
```

---

## Testing Structure

### Test File Organization

```
ComponentName/
├── ComponentName.jsx
├── ComponentName.test.jsx
└── index.js
```

### Test Naming

- **Format:** `ComponentName.test.jsx` or `functionName.test.js`
- **Location:** Co-located with source files
- **Describe blocks:** Match file/component structure

### Example Test Structure

```javascript
/**
 * Tests for CalculationForm component
 */

import { render, screen } from '@testing-library/react';
import { CalculationForm } from './CalculationForm';

describe('CalculationForm', () => {
  describe('Validation', () => {
    it('should display error when drug name is empty', () => {
      // Test implementation
    });
  });
  
  describe('Submission', () => {
    it('should call onSubmit with form data', () => {
      // Test implementation
    });
  });
});
```

---

## Environment Variables

### Naming Convention

- **Format:** `UPPER_SNAKE_CASE`
- **Grouping:** Use prefixes: `AUTH0_*`, `SUPABASE_*`, `NEXT_PUBLIC_*`
- **Client-side:** Must have `NEXT_PUBLIC_` prefix
- **Server-side:** No prefix (never exposed to client)

### Documentation

**All environment variables must be documented in `.env.example`:**

```env
# Auth0 Configuration
AUTH0_SECRET=                    # Secret for Auth0 session encryption
AUTH0_BASE_URL=                  # Base URL of application
AUTH0_ISSUER_BASE_URL=           # Auth0 issuer base URL
AUTH0_CLIENT_ID=                 # Auth0 application client ID
AUTH0_CLIENT_SECRET=             # Auth0 application client secret

# Supabase Configuration
SUPABASE_URL=                    # Supabase project URL
SUPABASE_ANON_KEY=               # Supabase anonymous key (client-side)
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key (server-side only)

# External APIs
OPENAI_API_KEY=                  # OpenAI API key for SIG parsing
```

---

## Git and Version Control

### Branch Naming

- **Format:** `type/description` or `type/issue-number-description`
- **Types:** `feature/`, `fix/`, `refactor/`, `docs/`, `test/`
- **Examples:** 
  - `feature/calculation-form`
  - `fix/ndc-validation-bug`
  - `refactor/api-client-structure`

### Commit Messages

- **Format:** `type: description`
- **Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`
- **Examples:**
  - `feat: add calculation form validation`
  - `fix: correct NDC format validation`
  - `docs: update API documentation`

### File Organization in Git

- **Never commit:**
  - `.env.local` (secrets)
  - `node_modules/`
  - `.next/` (build output)
  - IDE-specific files (unless team standard)

---

## Code Review Checklist

Before submitting code for review, ensure:

- [ ] File size under 500 lines
- [ ] File header documentation present
- [ ] All functions have JSDoc comments
- [ ] JSDoc types are properly documented
- [ ] Imports are organized correctly
- [ ] Error handling implemented
- [ ] Tests written (if applicable)
- [ ] No console.logs or debug code
- [ ] Follows naming conventions
- [ ] Follows project structure
- [ ] Uses strict equality (`===` and `!==`)

---

## AI Tool Compatibility

### Best Practices for AI Tools

1. **Clear file names:** Descriptive names help AI understand purpose
2. **Modular code:** Small, focused files are easier to analyze
3. **Documentation:** Comments help AI understand context
4. **Type safety:** Types provide structure for AI understanding
5. **Consistent patterns:** Predictable structure aids AI comprehension
6. **Single responsibility:** Each file/function does one thing

### What AI Tools Need

- **Context:** File headers and function docs provide context
- **Structure:** Clear directory structure shows relationships
- **JSDoc Types:** JSDoc type definitions document data structures
- **Examples:** Code examples in docs help understanding
- **Patterns:** Consistent patterns enable better suggestions

---

## Performance Considerations

### Code Splitting

- Use dynamic imports for heavy components
- Lazy load routes when possible
- Split vendor bundles appropriately

### File Organization for Performance

- Keep frequently imported utilities small
- Avoid circular dependencies
- Use barrel exports (`index.js`) judiciously (can hurt tree-shaking)

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-27 | 1.0 | Initial project rules document | System |

---

**End of Document**

