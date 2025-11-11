# Phase 1: MVP (Minimum Viable Product)

**Project:** NDC Packaging & Quantity Calculator (QuantRx)  
**Phase:** MVP - Core Functional Application  
**Goal:** Deliver a fully functional core application that provides essential value to users

---

## Overview

Phase 1 builds on the Phase 0 foundation to create a minimum viable product that pharmacists and technicians can use to calculate NDC matches and dispense quantities. This phase implements all P0 (must-have) requirements from the PRD.

### Phase Deliverables

**Core Infrastructure:**
- ✅ Type definitions (JSDoc) and validation schemas (Zod) for all data structures
- ✅ Observability & logging infrastructure with audit trail
- ✅ Calculation service layer (business logic separated from API routing)
- ✅ Complete database schema with audit logging and RLS policies
- ✅ Mock mode support for offline development (USE_MOCK_APIS)

**API Integrations:**
- ✅ RxNorm API integration for drug normalization with caching
- ✅ FDA NDC Directory API integration for NDC retrieval with caching
- ✅ Extensible SIG parsing (regex-based, prepared for AI in Phase 2)

**Calculation Features:**
- ✅ Quantity calculation engine (dose × frequency × days supply)
- ✅ NDC matching algorithm (optimal package selection with tolerance logic)
- ✅ Complete calculation input form (drug name/NDC toggle, SIG, days supply)
- ✅ Results display with card-based modular design
- ✅ Primary recommendation highlighting (blue accent border, elevation 2)
- ✅ Alternative options display (max 5, with match quality indicators)
- ✅ Warnings section with color-coded alerts

**Export & Workflows:**
- ✅ JSON export with schema validation (download and clipboard)
- ✅ Verification workflow (pharmacist/admin only)
- ✅ Role-based access control (technician/pharmacist/admin)
- ✅ Comprehensive error handling with recovery flows

**UX Enhancements:**
- ✅ Loading skeletons (better than spinners)
- ✅ StatusBadge component (icon + text + color coding)
- ✅ Color-coded legend for instant warning recognition
- ✅ Responsive design (desktop and tablet)
- ✅ WCAG 2.1 AA accessibility compliance

**Optional Enhancements (if time allows):**
- 🔄 Unit tests for core calculation logic (80%+ coverage)
- 🔄 Local storage cache for recent calculations
- 🔄 Keyboard shortcuts for power users
- 🔄 Print stylesheet for pharmacy records

### Success Criteria

**Functionality:**
- ✅ User can enter prescription data and receive NDC recommendations
- ✅ System normalizes drug names via RxNorm API with 24-hour caching
- ✅ System retrieves valid NDCs via FDA API with active/inactive filtering
- ✅ System calculates correct quantities based on SIG and days supply
- ✅ System highlights inactive NDCs and overfill/underfill warnings
- ✅ Pharmacists/admins can verify calculations with audit trail
- ✅ All calculations and actions logged to database

**Performance:**
- ✅ Application meets <2 second response time target
- ✅ Mock mode enables offline development
- ✅ TanStack Query caching reduces API calls

**Architecture:**
- ✅ Business logic separated from API routing (reusable service layer)
- ✅ Type definitions prevent data structure mismatches
- ✅ Extensible SIG parser prepared for AI enhancement in Phase 2
- ✅ Comprehensive observability with logging at each workflow step

**UX & Accessibility:**
- ✅ Core workflows work end-to-end without errors
- ✅ Error messages provide clear recovery options
- ✅ UI follows consistent card-based design with proper hierarchy
- ✅ WCAG 2.1 AA compliance for accessibility

---

## Feature 1: Type Definitions & Schemas

**Goal:** Define shared type definitions and validation schemas for core data structures.

**Why First:** Establishing type definitions early prevents data structure mismatches across layers and provides clear contracts between components.

### Steps

1. **Create core type definitions**
   - Create `lib/types/calculation.js` with JSDoc type definitions
   - Define `@typedef` for: `ParsedSIG`, `NDCRecord`, `CalculationInput`, `CalculationResult`, `Warning`
   - Document all properties with types and descriptions
   - Export types for use across application

2. **Create validation schemas**
   - Create `schemas/calculation.js` with Zod schema for form validation
   - Define fields: drugName (string, optional), ndc (string, optional), sig (string, required), daysSupply (number, optional)
   - Add validation rules: either drugName or ndc required, sig required if calculating quantity
   - Add custom validation for NDC format (11 digits: 12345-678-90)

3. **Create NDC validation schema**
   - Create `schemas/ndc.js` for NDC-specific validation
   - Define NDC format validation (11 digits with hyphens)
   - Create schema for NDC details (manufacturer, package size, status)

4. **Create export format schema**
   - Create `schemas/export.js` with Zod schema for JSON export structure
   - Define canonical structure: timestamp, user, inputs, normalization, results, warnings
   - Ensures consistency across all export formats (JSON, CSV, PDF in future)
   - Document field ordering and nesting

5. **Add JSDoc type imports**
   - Import type definitions in relevant files using JSDoc `@typedef` imports
   - Add type hints to function parameters and return values
   - Provides pseudo-type safety in JavaScript

**Validation:** Type definitions documented, schemas validate correctly, types imported where needed

**Files:**
- `lib/types/calculation.js` (new)
- `schemas/calculation.js` (new)
- `schemas/ndc.js` (new)
- `schemas/export.js` (new)

---

## Feature 2: Calculation Input Form

**Goal:** Create a form for entering prescription data with validation.

### Steps

1. **Create calculation form component**
   - Create `components/forms/CalculationForm/CalculationForm.jsx`
   - Use React Hook Form with Zod resolver from Feature 1 schemas
   - Implement three input sections: Drug Name/NDC, SIG, Days Supply
   - Add radio toggle: "Enter by Drug Name" vs "Enter by NDC"
   - Display inline validation errors

2. **Implement form submission**
   - Handle form submission with validation
   - Call calculation API route on submit
   - Show loading state during API call
   - Handle successful response (display results inline)
   - Handle error response (display error messages)

3. **Add form features**
   - Add "Clear Form" button to reset all fields
   - Add "New Calculation" button after results display
   - Preserve form state during calculation
   - Auto-focus first field on page load

4. **Style form with Material-UI**
   - Use MUI TextField, Select, Button components
   - Apply theme colors and spacing
   - Make form responsive (desktop and tablet)
   - Follow ui-rules.md for component styling

5. **Add loading skeletons**
   - Replace spinners with MUI Skeleton components for better UX
   - Show skeleton placeholders for results during calculation
   - Smoother transition between states

**Validation:** Form validates correctly, submits data, displays errors inline

**Files:**
- `components/forms/CalculationForm/CalculationForm.jsx` (new)
- `components/forms/CalculationForm/index.js` (new)

---

## Feature 3: Observability & Logging Infrastructure

**Goal:** Set up lightweight logging and observability hooks for audit trail and debugging.

**Why Before APIs:** Enables tracking of API calls, errors, and workflow steps from the start.

### Steps

1. **Create logging utility**
   - Create `lib/utils/logger.js` with `logEvent(type, payload)` function
   - Log to console in development, prepare for external service in production
   - Define event types: `CALCULATION_STARTED`, `API_CALL`, `API_ERROR`, `CALCULATION_COMPLETED`
   - Include timestamp, user ID, and relevant context

2. **Create audit logging utility**
   - Create `lib/utils/audit.js` with audit logging functions
   - Implement `logAudit(action, resourceType, resourceId, metadata)` function
   - Save audit logs to database `audit_logs` table
   - Include user ID, IP address (optional), user agent

3. **Define audit log actions**
   - Create `lib/constants/audit.js` with action constants
   - Define: `CALCULATION_CREATED`, `CALCULATION_VERIFIED`, `CALCULATION_EXPORTED`
   - Define resource types: `CALCULATION`, `NDC`, `USER`

4. **Integrate logging in workflows**
   - Add log points at key workflow steps (will be used in later features)
   - Log API calls before and after (success/failure)
   - Log calculation start and completion
   - Log errors with stack traces and context

5. **Create observability helpers**
   - Create `lib/utils/performance.js` for performance tracking
   - Implement simple timer utilities for measuring operation duration
   - Prepare hooks for future Sentry integration

**Validation:** Logging works in development, audit logs save to database, performance tracked

**Files:**
- `lib/utils/logger.js` (new)
- `lib/utils/audit.js` (new)
- `lib/constants/audit.js` (new)
- `lib/utils/performance.js` (new)

---

## Feature 4: RxNorm API Integration

**Goal:** Integrate RxNorm API for drug name normalization with mock mode support.

### Steps

1. **Create mock data fixtures**
   - Create `lib/mocks/rxnorm-fixtures.js` with sample RxNorm responses
   - Include common drugs: Lisinopril, Amoxicillin, Tylenol (Acetaminophen)
   - Include edge cases: brand names, generic names, misspellings
   - Format matches real RxNorm API response structure

2. **Create RxNorm API client**
   - Create `lib/api/rxnorm.js` with API client functions
   - Implement `searchDrugByName(drugName)` function
   - Implement `getRxCUI(drugName)` function to get normalized drug identifier
   - Add mock mode check: if `USE_MOCK_APIS=true`, return mock data
   - Handle API errors gracefully (network errors, 404s, rate limits)
   - Add logging with `logEvent()` for all API calls

3. **Implement caching strategy**
   - Use TanStack Query for automatic caching
   - Set stale time to 24 hours (drug data changes infrequently)
   - Implement request deduplication
   - Add cache key factory for consistent keys in `lib/queries/keys.js`

4. **Create API route for RxNorm**
   - Create `app/api/rxnorm/route.js` with GET handler
   - Validate query parameters with Zod schema
   - Call RxNorm API client (respects mock mode)
   - Return normalized drug data (RxCUI, drug name, dosage form, strength)
   - Handle errors and return appropriate status codes
   - Log all API calls for observability

5. **Create React Query hook**
   - Create `hooks/queries/useRxNorm.js` hook
   - Use TanStack Query's `useQuery`
   - Handle loading, error, and success states
   - Implement retry logic for transient failures (3 attempts with exponential backoff)

6. **Add rate limiting**
   - Implement rate limiting to respect 20 req/sec limit
   - Use TanStack Query's request deduplication
   - Add delay/throttling if needed to prevent hitting rate limits
   - Skip rate limiting in mock mode

**Validation:** Drug names normalize correctly, caching works, mock mode enables offline development

**Files:**
- `lib/mocks/rxnorm-fixtures.js` (new)
- `lib/api/rxnorm.js` (new)
- `app/api/rxnorm/route.js` (new)
- `hooks/queries/useRxNorm.js` (new)
- `lib/queries/keys.js` (new)

---

## Feature 5: FDA NDC Directory API Integration

**Goal:** Integrate FDA API for retrieving valid NDCs with mock mode support.

### Steps

1. **Create mock data fixtures**
   - Create `lib/mocks/fda-fixtures.js` with sample FDA NDC responses
   - Include multiple NDCs per drug with varying package sizes
   - Include both active and inactive NDCs for testing warnings
   - Include manufacturer details, package sizes, dosage forms
   - Format matches real FDA API response structure

2. **Create FDA API client**
   - Create `lib/api/fda.js` with API client functions
   - Implement `getNDCsByRxCUI(rxcui)` function
   - Implement `validateNDC(ndc)` function to check if NDC is active
   - Implement `getNDCDetails(ndc)` to get package information
   - Add mock mode check: if `USE_MOCK_APIS=true`, return mock data
   - Handle API errors gracefully
   - Add logging with `logEvent()` for all API calls

3. **Implement NDC filtering**
   - Filter NDCs by active status (check `marketing_end_date`)
   - Extract package size from NDC data
   - Extract manufacturer information
   - Parse dosage form and strength
   - Separate active and inactive NDCs into different arrays

4. **Create API route for FDA**
   - Create `app/api/fda/route.js` with GET handler
   - Validate query parameters with Zod schema
   - Call FDA API client (respects mock mode)
   - Return active NDCs with package details
   - Include inactive NDCs in separate array for warnings
   - Handle errors and return appropriate status codes
   - Log all API calls for observability

5. **Create React Query hook**
   - Create `hooks/queries/useFDA.js` hook
   - Use TanStack Query with 24-hour stale time
   - Handle loading, error, and success states
   - Implement retry logic for transient failures

6. **Add caching strategy**
   - Cache NDC data for 24 hours
   - Use query key factory from `lib/queries/keys.js`
   - Separate cache keys for active vs all NDCs
   - Implement cache invalidation if needed

**Validation:** NDCs retrieved correctly, inactive NDCs flagged, mock mode works, caching effective

**Files:**
- `lib/mocks/fda-fixtures.js` (new)
- `lib/api/fda.js` (new)
- `app/api/fda/route.js` (new)
- `hooks/queries/useFDA.js` (new)

---

**Goal:** Integrate FDA API for retrieving valid NDCs.

### Steps

1. **Create FDA API client**
   - Create `lib/api/fda.js` with API client functions
   - Implement `getNDCsByRxCUI(rxcui)` function
   - Implement `validateNDC(ndc)` function to check if NDC is active
   - Implement `getNDCDetails(ndc)` to get package information
   - Handle API errors gracefully

2. **Implement NDC filtering**
   - Filter NDCs by active status (check `marketing_end_date`)
   - Extract package size from NDC data
   - Extract manufacturer information
   - Parse dosage form and strength

3. **Create API route for FDA**
   - Create `app/api/fda/route.js` with GET handler
   - Validate query parameters
   - Call FDA API client
   - Return active NDCs with package details
   - Include inactive NDCs in separate array for warnings

4. **Create React Query hook**
   - Create `hooks/queries/useFDA.js` hook
   - Use TanStack Query with 24-hour stale time
   - Handle loading, error, and success states
   - Implement retry logic

5. **Add caching strategy**
   - Cache NDC data for 24 hours
   - Separate cache keys for active vs all NDCs
   - Implement cache invalidation if needed

**Validation:** NDCs retrieved correctly, inactive NDCs flagged, caching works

---

## Feature 4: Quantity Calculation Engine

**Goal:** Calculate total quantity to dispense based on SIG and days supply.

### Steps

1. **Create SIG parsing utility**
   - Create `lib/calculations/sig-parsing.js`
   - Implement regex-based SIG parsing for common patterns
   - Extract: dose (number), frequency (times per day), unit (tablet, ml, etc.)
   - Handle patterns: "Take 1 tablet twice daily", "1 tab PO BID", "2 tablets every 6 hours"
   - Return parsed object: `{ dose, frequency, unit }`

2. **Create quantity calculation function**
   - Create `lib/calculations/quantity.js`
   - Implement `calculateQuantity(parsedSIG, daysSupply)` function
   - Formula: `dose × frequency × daysSupply`
   - Handle unit conversions if needed
   - Return quantity with unit

3. **Add validation and error handling**
   - Validate parsed SIG values (must be positive numbers)
   - Handle unparseable SIG with fallback to manual entry
   - Validate days supply (must be positive number)
   - Return error messages for invalid inputs

4. **Create constants file**
   - Create `lib/constants/dosage.js` with dosage form mappings
   - Define standard units: tablet, capsule, ml, mg, units (for insulin)
   - Define abbreviation mappings: "tab" → "tablet", "PO" → "by mouth"

5. **Test calculation logic**
   - Test with various SIG patterns
   - Verify calculation accuracy
   - Test edge cases (decimal doses, unusual frequencies)

**Validation:** Quantities calculated correctly for various SIG patterns, edge cases handled

---

## Feature 7: NDC Matching Algorithm

**Goal:** Match optimal NDC package(s) to calculated quantity with unit tests.

### Steps

1. **Create NDC matching utility**
   - Create `lib/calculations/ndc-matching.js`
   - Implement `selectOptimalNDCs(quantity, availableNDCs)` function
   - Sort NDCs by package size (prefer larger packages to minimize count)
   - Implement greedy algorithm to find best package combination
   - Add JSDoc type hints referencing `NDCRecord` typedef

2. **Implement tolerance logic**
   - Define acceptable overfill/underfill tolerance (±10%)
   - Calculate exact match, slight overfill, and slight underfill options
   - Rank options by preference: exact match > slight overfill > underfill
   - Export tolerance constants for reuse

3. **Generate alternatives**
   - Return primary recommendation (best match)
   - Return alternative options (other valid combinations, max 5)
   - Include quantity breakdown for each option (e.g., "2 × 30-count bottles = 60 tablets")
   - Calculate overfill/underfill percentage for each option
   - Include cost estimate if data available (Phase 2 feature prep)

4. **Filter inactive NDCs**
   - Exclude inactive NDCs from recommendations
   - Include inactive NDCs in warnings section
   - Highlight if user entered an inactive NDC directly
   - Generate warning objects matching `Warning` typedef

5. **Create unit tests**
   - Create `lib/calculations/__tests__/ndc-matching.test.js`
   - Test with various quantities and package size combinations
   - Verify optimal matches are selected
   - Test edge cases (no exact match available, all packages too small)
   - Test tolerance calculations

**Validation:** Algorithm selects optimal NDCs, alternatives provided, inactive NDCs flagged, tests pass

**Files:**
- `lib/calculations/ndc-matching.js` (new)
- `lib/calculations/__tests__/ndc-matching.test.js` (new)

---

## Feature 8: Calculation Service Layer

**Goal:** Create reusable calculation service that orchestrates the entire workflow.

**Why Separate:** Separating business logic from API routing makes code testable, reusable (admin dashboards, batch processing), and maintainable.

### Steps

1. **Create calculation service**
   - Create `lib/services/calculation-service.js`
   - Export `CalculationService` class or functions for each step
   - Add JSDoc type hints for all functions

2. **Implement normalization step**
   - Create `normalizeDrug(drugName)` function
   - Call RxNorm API client
   - Return normalized drug data with RxCUI
   - Handle errors gracefully with structured error response
   - Log step using `logEvent()`

3. **Implement NDC fetching step**
   - Create `fetchNDCs(rxcui)` or `fetchNDCsByCode(ndc)` functions
   - Call FDA API client
   - Return active and inactive NDCs separately
   - Handle errors gracefully
   - Log step using `logEvent()`

4. **Implement SIG parsing step**
   - Create `parseSIGStep(sig)` function
   - Call SIG parser from Feature 6
   - Handle parsing failures with fallback structure
   - Return parsed SIG or error
   - Log step using `logEvent()`

5. **Implement quantity calculation step**
   - Create `calculateQuantityStep(parsedSIG, daysSupply)` function
   - Call quantity calculator from Feature 6
   - Handle edge cases
   - Return calculated quantity
   - Log step using `logEvent()`

6. **Implement NDC matching step**
   - Create `matchNDCsStep(quantity, ndcs)` function
   - Call NDC matching algorithm from Feature 7
   - Return recommendations and alternatives
   - Generate warnings for inactive NDCs
   - Log step using `logEvent()`

7. **Create orchestration function**
   - Create `runCalculation(input)` function that orchestrates all steps
   - Takes `CalculationInput` (drugName/ndc, sig, daysSupply)
   - Calls each step in sequence
   - Aggregates results into `CalculationResult`
   - Handles errors at each step with graceful degradation
   - Returns comprehensive result with warnings
   - Uses performance tracking from Feature 3

8. **Create unit tests**
   - Create `lib/services/__tests__/calculation-service.test.js`
   - Test each step independently
   - Test full orchestration with mock APIs
   - Test error handling at each step
   - Verify logging and performance tracking

**Validation:** Service orchestrates workflow correctly, unit tests pass, error handling works

**Files:**
- `lib/services/calculation-service.js` (new)
- `lib/services/__tests__/calculation-service.test.js` (new)

---

## Feature 9: Calculation API Route

**Goal:** Create simple API endpoint that validates input and delegates to calculation service.

**Why Simplified:** API route now focuses on HTTP concerns (validation, auth, response formatting), not business logic.

### Steps

1. **Create calculation API route**
   - Create `app/api/calculations/route.js` with POST handler
   - Accept request body: `{ drugName?, ndc?, sig, daysSupply? }`
   - Validate request body with Zod schema from Feature 1
   - Verify user authentication (check JWT token)
   - Return 401 if not authenticated

2. **Call calculation service**
   - Import `runCalculation` from `calculation-service.js`
   - Call with validated input
   - Handle service errors and convert to HTTP responses
   - Return appropriate HTTP status codes (200, 400, 500)

3. **Save calculation to database**
   - Insert calculation record into `calculations` table
   - Include user ID, inputs, outputs, warnings
   - Call audit logging utility from Feature 3
   - Return calculation ID for future reference

4. **Format response**
   - Transform service result into API response matching `CalculationResult` typedef
   - Include calculation ID, timestamp, user info
   - Return structured JSON response

5. **Implement error handling**
   - Handle RxNorm API failures (provide fallback instructions)
   - Handle FDA API failures (provide error message with retry option)
   - Handle SIG parsing failures (include manual entry suggestion)
   - Handle service errors and database errors
   - Log errors using `logEvent()` from Feature 3

**Validation:** API endpoint works end-to-end, calculations saved to database, errors handled correctly

**Files:**
- `app/api/calculations/route.js` (new)

---

## Feature 10: Results Display Components

**Goal:** Display calculation results with card-based modular design and consistent hierarchy.

**UI Cohesion:** Use color-coded legend from theme-rules.md, maintain consistent card layout, keep all results inline for quick pharmacy lookups.

### Steps

1. **Create summary card component**
   - Create `components/results/SummaryCard/SummaryCard.jsx`
   - Display drug name, RxCUI, calculated quantity, days supply
   - Show overall status with StatusBadge (active, warning, error)
   - Include timestamp and calculation ID
   - Follow theme-rules.md for card styling

2. **Create NDC card component**
   - Create `components/results/NDCCard/NDCCard.jsx`
   - Use consistent card layout with primary recommendation highlighted
   - Display NDC details: NDC number (monospace), manufacturer, package size
   - Show active status badge using StatusBadge from Feature 11
   - Display quantity breakdown (e.g., "1 × 60-count bottle = 60 tablets")
   - Show overfill/underfill percentage with color coding
   - Add "Select This NDC" button (secondary button style)
   - Primary recommendation: blue left accent border (4px) and elevation 2
   - Alternative cards: standard elevation 1

3. **Create alternatives section**
   - Create `components/results/AlternativeOptions/AlternativeOptions.jsx`
   - Display list of alternative NDC options (max 5)
   - Each uses NDCCard component with alternative styling
   - Include match quality indicator (exact, slight overfill, underfill)
   - Show package breakdown for each option
   - Allow user to select alternative (updates form)

4. **Create warnings section**
   - Create `components/results/WarningsSection/WarningsSection.jsx`
   - Always visible when warnings present, positioned prominently
   - Use MUI Alert component with color coding:
     - Red background tint (#FFEBEE) for errors
     - Orange background tint (#FFF3E0) for warnings
     - Blue background tint (#E3F2FD) for info
   - Left accent border (4px) matching alert color
   - Include icons from @mui/icons-material (Error, Warning, Info)
   - Display clear, actionable messages
   - Group warnings by type (inactive NDCs, parsing failures, overfills)

5. **Create main results display container**
   - Create `components/results/ResultsDisplay/ResultsDisplay.jsx`
   - Orchestrates layout of all result components
   - Display inline below calculation form
   - Layout order: Warnings → Summary → Primary Recommendation → Alternatives
   - 32px spacing between sections
   - Include user action buttons at bottom (Export, New Calculation, Verify)
   - Show loading skeletons while calculating

6. **Add color-coded legend**
   - Create small legend component showing status meanings
   - Active (green), Warning (orange), Error (red), Pending (gray)
   - Display at top of results or as tooltip
   - Ensures instant recognizability of warning levels

**Validation:** Results display correctly with consistent styling, modular components, clear hierarchy

**Files:**
- `components/results/SummaryCard/SummaryCard.jsx` (new)
- `components/results/SummaryCard/index.js` (new)
- `components/results/NDCCard/NDCCard.jsx` (new)
- `components/results/NDCCard/index.js` (new)
- `components/results/AlternativeOptions/AlternativeOptions.jsx` (new)
- `components/results/AlternativeOptions/index.js` (new)
- `components/results/WarningsSection/WarningsSection.jsx` (new)
- `components/results/WarningsSection/index.js` (new)
- `components/results/ResultsDisplay/ResultsDisplay.jsx` (new)
- `components/results/ResultsDisplay/index.js` (new)
- Update `components/results/index.js`

---

## Feature 11: Status Badge & UI Components

**Goal:** Create reusable StatusBadge component and supporting UI elements.

### Steps

1. **Create StatusBadge component**
   - Create `components/ui/StatusBadge/StatusBadge.jsx`
   - Implement variants: active, verified, warning, error, pending, info
   - Include icon + text + color coding (never color alone for accessibility)
   - Pill-shaped design (12px border radius, 24px height)
   - Use colors from theme-rules.md
   - Follow ui-rules.md badge specifications
   - Export from `components/ui/index.js`

2. **Create ErrorAlert component**
   - Create `components/shared/ErrorAlert/ErrorAlert.jsx`
   - Reusable error message component
   - Uses MUI Alert with error styling
   - Include error icon and clear message
   - Export from `components/shared/index.js`

3. **Update LoadingSpinner**
   - Enhance existing `LoadingSpinner.jsx` to support different sizes
   - Add text label option
   - Ensure accessibility (aria-label, role)

**Validation:** StatusBadge displays correctly for all variants, reusable across application

**Files:**
- `components/ui/StatusBadge/StatusBadge.jsx` (new)
- `components/ui/StatusBadge/index.js` (new)
- Update `components/ui/index.js`
- `components/shared/ErrorAlert/ErrorAlert.jsx` (new)
- `components/shared/ErrorAlert/index.js` (new)
- Update existing `components/shared/LoadingSpinner/LoadingSpinner.jsx`

---

## Feature 12: JSON Export with Schema Validation

**Goal:** Export calculation results as JSON with standardized format.

### Steps

1. **Create export utility**
   - Create `lib/utils/export.js` with export functions
   - Implement `exportToJSON(calculation)` function
   - Use export schema from Feature 1 (`schemas/export.js`) to validate structure
   - Ensure JSON matches `CalculationResult` typedef
   - Include metadata: timestamp, user ID, calculation ID, version

2. **Format JSON output**
   - Follow structure from `schemas/export.js`:
     - `timestamp`: ISO 8601 format
     - `user`: { id, name, role }
     - `inputs`: { drugName, ndc, sig, daysSupply }
     - `normalization`: { rxcui, drugName, dosageForm, strength }
     - `results`: { calculatedQuantity, unit, recommendedNDC, alternatives }
     - `warnings`: array of warning objects
   - Pretty-print with 2-space indentation
   - Sort keys for consistency

3. **Create export button component**
   - Add "Export" button to ResultsDisplay
   - Implement two options: "Download JSON" and "Copy to Clipboard"
   - Use MUI Menu for dropdown
   - Include export icon from @mui/icons-material

4. **Implement download functionality**
   - Generate JSON file from calculation data
   - Validate against export schema before download
   - Trigger browser download with filename: `quantrx-calculation-[id]-[timestamp].json`
   - Log export action using audit logging from Feature 3

5. **Implement copy to clipboard**
   - Format JSON for readability
   - Copy to clipboard using Clipboard API
   - Show confirmation toast using MUI Snackbar: "Copied to clipboard!"
   - Handle clipboard API errors gracefully
   - Log copy action for audit trail

**Validation:** JSON export works, matches schema, download and clipboard functions correctly

**Files:**
- `lib/utils/export.js` (new)
- Update `ResultsDisplay.jsx` to include export button

---

## Feature 13: Database Schema and Audit Logging

**Goal:** Complete database schema for calculations and audit logs with proper RLS policies.

### Steps

1. **Update `calculations` table schema**
   - Update existing `database-schema.sql` file
   - Add JSONB columns: `recommended_ndc` (jsonb), `alternatives` (jsonb), `warnings` (jsonb)
   - Add `rxcui` (text) for normalization tracking
   - Add verification columns: `verified_by` (UUID FK to users), `verified_at` (timestamp)
   - Keep existing: id, user_id, drug_name, ndc, sig, days_supply, calculated_quantity, status
   - Add indexes: `idx_calculations_rxcui`, `idx_calculations_verified_by`
   - Update RLS policies for verification (only pharmacists/admins can verify)

2. **Create `audit_logs` table**
   - Add to `database-schema.sql`
   - Columns: id (UUID), user_id (UUID FK), action (text), resource_type (text), resource_id (UUID)
   - Columns: metadata (jsonb), ip_address (text, optional), user_agent (text, optional)
   - Columns: created_at (timestamp)
   - Add indexes: `idx_audit_logs_user_id`, `idx_audit_logs_created_at`, `idx_audit_logs_action`
   - Enable RLS: users can view their own logs, admins can view all logs

3. **Create RLS policy helper**
   - Create `lib/utils/rls.js` with RLS policy helpers
   - Implement `getCurrentUserId()` function to extract user from JWT
   - Implement `isAdmin()` function for admin checks
   - Use in RLS policy definitions

4. **Create database migration script**
   - Document SQL migration commands in `database-schema.sql`
   - Include instructions for running migration in Supabase SQL Editor
   - Test migration on development Supabase instance
   - Verify all indexes created correctly

5. **Test database operations**
   - Create test API route `app/api/test/database/route.js`
   - Test INSERT operations for calculations and audit logs
   - Test SELECT operations with RLS enforcement
   - Test UPDATE operations for verification
   - Test that technicians can't verify, pharmacists can
   - Remove test route after validation

**Validation:** Database schema complete, audit logging works, RLS policies enforced correctly

**Files:**
- Update `lib/database-schema.sql`
- `lib/utils/rls.js` (new)
- `app/api/test/database/route.js` (temporary, for testing)

---

## Feature 14: Role-Based Access Control

**Goal:** Enforce role-based permissions for technicians and pharmacists.

### Steps

1. **Create role constants**
   - Create `lib/constants/roles.js` with role definitions
   - Define roles: `TECHNICIAN`, `ADMIN`
   - Define permissions per role

2. **Implement role checking utility**
   - Create `lib/utils/permissions.js` with permission checking functions
   - Implement `hasRole(user, role)` function
   - Implement `canVerify(user)` function (pharmacists/admins only)
   - Implement `canViewAllCalculations(user)` (admins only)

3. **Enforce permissions in API routes**
   - Check user role before allowing verification
   - Return 403 Forbidden if user lacks permission
   - Log permission denials to audit log

4. **Enforce permissions in UI**
   - Hide "Verify" button for technicians
   - Show verification status to all users
   - Conditionally render admin-only features (dashboard - Phase 2)

5. **Test role enforcement**
   - Test technician can create calculations but not verify
   - Test pharmacist/admin can verify calculations
   - Test admin can view all calculations
   - Verify UI hides features based on role

**Validation:** Roles enforced in API and UI, permissions checked before actions

---

## Feature 14: Role-Based Access Control

**Goal:** Enforce role-based permissions with proper utility functions.

### Steps

1. **Create role and permission constants**
   - Create `lib/constants/roles.js` with role definitions
   - Define roles: `TECHNICIAN`, `PHARMACIST`, `ADMIN`
   - Define permissions per role using object map
   - Document permission structure with JSDoc
   - Note: Pharmacist and Admin can verify calculations

2. **Implement role checking utilities**
   - Create `lib/utils/permissions.js` with permission checking functions
   - Implement `hasRole(user, role)` function
   - Implement `canVerify(user)` function (pharmacists/admins only)
   - Implement `canViewAllCalculations(user)` (admins only)
   - Implement `getPermissions(user)` function to list all user permissions
   - Add JSDoc type hints

3. **Enforce permissions in API routes**
   - Check user role before allowing verification in verify route
   - Return 403 Forbidden with clear message if user lacks permission
   - Log permission denials to audit log using Feature 3 utilities
   - Add permission checks in future admin routes

4. **Enforce permissions in UI**
   - Use `useAuth()` hook to get current user role
   - Conditionally render "Verify" button based on `canVerify()`
   - Show verification status to all users (read-only for technicians)
   - Hide/disable actions based on permissions
   - Provide helpful tooltips when features are disabled

5. **Test role enforcement**
   - Test technician can create calculations but cannot verify
   - Test pharmacist can create and verify calculations
   - Test admin can verify and has additional permissions
   - Verify UI correctly hides/shows features based on role
   - Test API returns 403 for unauthorized actions
   - Verify audit logs record permission denials

**Validation:** Roles enforced in both API and UI, permissions checked correctly, audit trail maintained

**Files:**
- `lib/constants/roles.js` (new)
- `lib/utils/permissions.js` (new)

---

## Feature 15: Error Handling and Recovery Flows

**Goal:** Implement comprehensive error handling with clear recovery paths for all failure scenarios.

### Steps

1. **Create error handling utilities**
   - Update `lib/utils/errors.js` with error classification functions
   - Implement `classifyError(error)` to categorize errors (network, validation, API, auth)
   - Implement `getRecoveryOptions(error)` to suggest recovery actions
   - Add error formatting functions for user-friendly messages

2. **Handle RxNorm API failures**
   - Display error using ErrorAlert component: "No match found for '[drug name]'"
   - Provide recovery options: "Try different spelling", "Enter NDC directly", "Search similar drugs"
   - Allow user to switch to direct NDC entry mode
   - Log error using Feature 3 logging

3. **Handle FDA API failures**
   - Display error: "Unable to retrieve NDC information"
   - Provide recovery options: "Retry", "Enter NDC manually", "Use offline mode"
   - Add toggle: "Show inactive NDCs" (when appropriate)
   - Implement exponential backoff retry (3 attempts: 1s, 2s, 4s)

4. **Handle SIG parsing failures**
   - Display warning in WarningsSection: "Could not automatically parse directions"
   - Show manual entry fields: quantity (number), unit (dropdown)
   - Auto-fill with partial parse results if available
   - Include examples of supported SIG formats
   - Allow calculation to proceed with manual values

5. **Handle API unavailability**
   - Display error: "Service temporarily unavailable"
   - Implement retry logic with exponential backoff
   - Provide prominent "Retry" button
   - Show estimated retry time
   - Suggest checking mock mode: "Try USE_MOCK_APIS=true for development"
   - Log API failures for monitoring

6. **Implement loading states**
   - Show loading skeletons (MUI Skeleton) during API calls
   - Disable form inputs during calculation
   - Show progress indicator for multi-step process (e.g., "Normalizing drug name...")
   - Add cancel button for long-running operations (future enhancement)

7. **Add error boundary**
   - Ensure `app/error.jsx` catches all React errors
   - Display user-friendly error page with recovery options
   - Log errors to console and audit trail
   - Provide "Return to Home" button

**Validation:** All error scenarios display clear messages, provide recovery options, log appropriately

**Files:**
- Update `lib/utils/errors.js`
- Update `app/error.jsx` (exists from Phase 0)

---

## Feature 16: Verification Workflow

**Goal:** Allow pharmacists/admins to verify calculations with proper audit trail.

### Steps

1. **Add verification button to ResultsDisplay**
   - Add "Mark as Verified" button (only visible to pharmacists/admins)
   - Use permission check from Feature 14: `canVerify(user)`
   - Show verification status badge for all users (read-only view)
   - Display verifier information if already verified

2. **Create verification API route**
   - Create `app/api/calculations/[id]/verify/route.js` with POST handler
   - Extract calculation ID from route params
   - Verify user authentication
   - Check user role using Feature 14 permissions: must be pharmacist or admin
   - Return 403 Forbidden if user lacks permission
   - Update calculation record: set `status = 'verified'`, `verified_by = user_id`, `verified_at = NOW()`
   - Log verification to audit_logs using Feature 3 utilities
   - Return updated calculation with 200 status

3. **Create React Query mutation hook**
   - Create `hooks/queries/useVerifyCalculation.js` mutation hook
   - Use TanStack Query's `useMutation`
   - On success: invalidate calculation queries, show success toast
   - On error: show error toast with reason
   - Handle optimistic updates for better UX

4. **Update UI after verification**
   - Show "Verified" badge with green checkmark icon (StatusBadge component)
   - Display verifier name and formatted timestamp ("Verified by Dr. Smith on Jan 27, 2025 at 2:30 PM")
   - Disable "Verify" button after verification (change to "Verified" label)
   - Lock calculation (gray out edit functionality, show tooltip: "Verified calculations cannot be edited")
   - Use MUI Snackbar for success message

5. **Test verification workflow**
   - Test pharmacist can verify calculation (button visible, API succeeds)
   - Test admin can verify calculation
   - Test technician cannot verify (button hidden, API returns 403 if somehow called)
   - Test verification persists in database with correct timestamps
   - Test verification shows in UI correctly
   - Test audit log records verification action
   - Test verified calculations cannot be modified

**Validation:** Pharmacists/admins can verify, status persists, audit logged, UI updates correctly

**Files:**
- `app/api/calculations/[id]/verify/route.js` (new)
- `hooks/queries/useVerifyCalculation.js` (new)
- Update `ResultsDisplay.jsx` to include verification UI

---

## Feature 17: Main Page Integration

**Goal:** Integrate all components in main page with complete user workflow.

### Steps

1. **Update app/page.jsx**
   - Remove Phase 0 status content
   - Import CalculationForm from Feature 2
   - Import ResultsDisplay from Feature 10
   - Import necessary hooks and state management

2. **Implement form submission handler**
   - Connect form to calculation API using Feature 9 API route
   - Handle loading state with loading skeletons
   - Handle error state with ErrorAlert
   - Handle success state by displaying ResultsDisplay

3. **Implement "New Calculation" flow**
   - Add handler to clear form and hide results
   - Reset all state (form values, results, errors)
   - Auto-focus first input field
   - Log action for analytics

4. **Add page layout and styling**
   - Use proper spacing (32px between major sections)
   - Make responsive for desktop and tablet
   - Follow ui-rules.md layout specifications
   - Ensure proper accessibility (landmarks, headings)

5. **Test complete user workflow**
   - Test entire flow: form fill → calculate → view results → export → new calculation
   - Test with various drug inputs (brand names, generic names)
   - Test error scenarios and recovery
   - Test verification workflow
   - Verify responsive design

**Validation:** Complete workflow works end-to-end, responsive design functions correctly

**Files:**
- Update `quantrx/app/page.jsx`

---

## Optional Enhancements

**These enhancements are optional for Phase 1 but provide significant value. Implement if time allows or prioritize for Phase 2.**

### Enhancement 1: Unit Tests for Core Logic

**Why:** Ensures calculation accuracy and prevents regressions.

**Implementation:**
- Already included in Features 6 and 7 (SIG parsing, quantity calculation, NDC matching)
- Add additional tests for edge cases
- Use Jest and @testing-library for testing
- Target: 80%+ code coverage for calculation logic
- Run tests in CI/CD pipeline

**Time:** +2 days

### Enhancement 2: Loading Skeletons

**Why:** Better UX than spinners, provides visual continuity.

**Implementation:**
- Already included in Feature 2 (form) and Feature 10 (results)
- Use MUI Skeleton component
- Match skeleton shapes to actual content
- Smooth transition when data loads

**Time:** Included in existing features

### Enhancement 3: Local Cache Layer (localStorage)

**Why:** Allows users to recall previous calculations without database queries, works offline.

**Implementation:**
- Create `lib/utils/local-storage.js` with storage utilities
- Implement `saveCalculationToLocalStorage(calculation)` function
- Implement `getRecentCalculationsFromLocalStorage()` function (returns last 10)
- Add "Recent Calculations" dropdown to form
- Auto-populate form when user selects recent calculation
- Clear local storage on logout for security
- Limit storage to non-sensitive data only

**Time:** +1 day

**Files:**
- `lib/utils/local-storage.js` (new)
- Update `CalculationForm.jsx` to add recent calculations dropdown

### Enhancement 4: Keyboard Shortcuts

**Why:** Faster workflow for power users.

**Implementation:**
- Add keyboard shortcut library or implement custom
- Shortcuts: 
  - `Ctrl/Cmd + Enter` to submit form
  - `Ctrl/Cmd + K` to clear form
  - `Ctrl/Cmd + E` to export results
  - `Escape` to close modals/dropdowns
- Display shortcuts in tooltips
- Add "Keyboard Shortcuts" help modal

**Time:** +0.5 days

### Enhancement 5: Print Stylesheet

**Why:** Pharmacists may need to print results for records.

**Implementation:**
- Create `app/globals.css` print media queries
- Hide navigation, buttons, and interactive elements
- Optimize layout for printing (remove colors, adjust spacing)
- Add print button to ResultsDisplay

**Time:** +0.5 days

### Enhancement 6: Environment Variable Validation at Runtime

**Why:** Catches configuration issues early in development.

**Implementation:**
- Already included in Phase 0 (`lib/env.js`)
- Ensure mock mode environment variables validated
- Add helpful error messages for common misconfigurations

**Time:** Included in existing features

---

## Testing Checklist

Before moving to Phase 2, verify:

### Core Functionality
- [ ] Type definitions and schemas validate correctly (Feature 1)
- [ ] User can enter prescription data and submit form (Feature 2)
- [ ] Logging and observability track all actions (Feature 3)
- [ ] Drug names normalize via RxNorm API (Feature 4)
- [ ] Mock mode works for offline development (Features 4-5)
- [ ] NDCs retrieve via FDA API (Feature 5)
- [ ] SIG parsing works for common patterns (Feature 6)
- [ ] Extensible SIG parser supports future AI integration (Feature 6)
- [ ] Quantities calculate correctly from SIG and days supply (Feature 6)
- [ ] NDC matching algorithm selects optimal packages (Feature 7)
- [ ] Calculation service orchestrates workflow correctly (Feature 8)
- [ ] API route validates input and saves to database (Feature 9)

### UI & UX
- [ ] Results display inline with consistent card-based design (Feature 10)
- [ ] StatusBadge displays correctly for all variants (Feature 11)
- [ ] Optimal NDCs highlighted with blue accent border (Feature 10)
- [ ] Alternatives shown with max 5 options (Feature 10)
- [ ] Inactive NDCs flagged prominently in warnings (Feature 10)
- [ ] Color-coded warnings instantly recognizable (Feature 10)
- [ ] Loading skeletons display during calculation (Features 2, 10)
- [ ] JSON export works (download and copy to clipboard) (Feature 12)
- [ ] Export matches standardized schema (Feature 12)

### Database & Security
- [ ] Calculations save to database with complete data (Feature 13)
- [ ] Audit logs record all actions (Feature 13)
- [ ] RLS policies enforce data access correctly (Feature 13)
- [ ] Role-based permissions enforced in API (Feature 14)
- [ ] Pharmacists/admins can verify calculations (Feature 16)
- [ ] Technicians cannot verify (button hidden, API returns 403) (Feature 14, 16)
- [ ] Verification persists with timestamp and verifier (Feature 16)

### Error Handling
- [ ] All error scenarios display clear messages (Feature 15)
- [ ] Recovery options provided for every error (Feature 15)
- [ ] RxNorm failures handled with fallback to direct NDC (Feature 15)
- [ ] FDA API failures include retry with exponential backoff (Feature 15)
- [ ] SIG parsing failures show manual entry fields (Feature 15)
- [ ] API unavailability shows retry button (Feature 15)
- [ ] Error boundary catches React errors (Feature 15)

### Performance & Integration
- [ ] Response time <2 seconds for typical calculation
- [ ] Caching works (24-hour stale time for API responses) (Features 4-5)
- [ ] Application works on desktop and tablet
- [ ] Complete workflow: form → calculate → results → export → new calculation (Feature 17)
- [ ] Unit tests pass for core calculation logic (Features 6-7, Optional)
- [ ] Accessibility: WCAG 2.1 AA compliance (all features)

---

## Known Limitations (Expected at End of Phase 1)

Phase 1 delivers core functionality but intentionally excludes:

- ❌ CSV/PDF export (JSON only)
- ❌ Advanced SIG parsing (uses OpenAI for complex cases - Phase 2)
- ❌ Special dosage forms (liquids, insulin, inhalers - Phase 2)
- ❌ Historical recall (previous calculations - Phase 2)
- ❌ Analytics dashboard (admin feature - Phase 2)
- ❌ Performance monitoring (Sentry integration - Phase 2)
- ❌ Advanced caching (Redis - Phase 2 if needed)

---

## Next Phase

**Phase 2: Enhanced Features** will add:
- CSV and PDF export
- Advanced SIG parsing with OpenAI
- Special dosage form handling
- Historical calculation recall
- Performance optimizations
- Enhanced error tracking (Sentry)

---

## Estimated Timeline

**Total: 12-14 days** (depending on familiarity with tech stack and APIs)

### Day-by-Day Breakdown

**Days 1-2: Foundation & Infrastructure**
- Feature 1: Type definitions and schemas (0.5 days)
- Feature 3: Observability & logging infrastructure (0.5 days)
- Feature 13: Database schema and audit logging (1 day)

**Days 3-4: API Integrations**
- Feature 4: RxNorm API integration with mock mode (1 day)
- Feature 5: FDA NDC API integration with mock mode (1 day)

**Days 5-7: Calculation Engine**
- Feature 6: SIG parsing & quantity calculation (extensible design) (1.5 days)
- Feature 7: NDC matching algorithm (1 day)
- Feature 8: Calculation service layer (0.5 days)

**Days 8-9: API Routes & Basic UI**
- Feature 9: Calculation API route (0.5 days)
- Feature 2: Calculation form component (1 day)
- Feature 11: StatusBadge & UI components (0.5 days)

**Days 10-11: Results Display & Export**
- Feature 10: Results display components (card-based design) (1.5 days)
- Feature 12: JSON export with schema validation (0.5 days)

**Days 12-13: Security & Workflows**
- Feature 14: Role-based access control (0.5 days)
- Feature 15: Error handling & recovery flows (1 day)
- Feature 16: Verification workflow (0.5 days)

**Day 14: Integration & Testing**
- Feature 17: Main page integration (0.5 days)
- Comprehensive testing (0.5 days)
- Bug fixes and polish

**Optional Enhancements: +1-3 days** (if time allows)
- Unit tests for core logic: +2 days
- Local storage cache: +1 day
- Keyboard shortcuts: +0.5 days
- Print stylesheet: +0.5 days

---

## Dependencies

- Phase 0 completed successfully
- RxNorm API accessible (no API key required)
- FDA NDC Directory API accessible
- Supabase database configured with RLS
- Auth0 roles configured (technician, admin)
- Environment variables set in Vercel

---

**End of Phase 1 (MVP) Document**

