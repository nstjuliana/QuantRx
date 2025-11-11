# Phase 1: MVP (Minimum Viable Product)

**Project:** NDC Packaging & Quantity Calculator (QuantRx)  
**Phase:** MVP - Core Functional Application  
**Goal:** Deliver a fully functional core application that provides essential value to users

---

## Overview

Phase 1 builds on the Phase 0 foundation to create a minimum viable product that pharmacists and technicians can use to calculate NDC matches and dispense quantities. This phase implements all P0 (must-have) requirements from the PRD.

### Phase Deliverables

- ✅ Complete calculation input form (drug name, SIG, days supply)
- ✅ RxNorm API integration for drug normalization
- ✅ FDA NDC Directory API integration for NDC retrieval
- ✅ Quantity calculation engine
- ✅ NDC matching algorithm
- ✅ Results display with recommendations, alternatives, and warnings
- ✅ JSON export functionality
- ✅ Complete database schema with audit logging
- ✅ Role-based access control (technician/admin)
- ✅ Basic error handling and recovery flows

### Success Criteria

- User can enter prescription data and receive NDC recommendations
- System normalizes drug names via RxNorm API
- System retrieves valid NDCs via FDA API
- System calculates correct quantities based on SIG and days supply
- System highlights inactive NDCs and overfill/underfill warnings
- Pharmacists can verify calculations
- All calculations are logged to database
- Application meets <2 second response time target
- Core workflows work end-to-end without errors

---

## Feature 1: Calculation Input Form

**Goal:** Create a form for entering prescription data with validation.

### Steps

1. **Create calculation form schema**
   - Create `schemas/calculation.js` with Zod schema
   - Define fields: drugName (string, optional), ndc (string, optional), sig (string, required), daysSupply (number, optional)
   - Add validation rules: either drugName or ndc required, sig required if calculating quantity
   - Add custom validation for NDC format (11 digits: 12345-678-90)

2. **Create calculation form component**
   - Create `components/forms/CalculationForm/CalculationForm.jsx`
   - Use React Hook Form with Zod resolver
   - Implement three input sections: Drug Name/NDC, SIG, Days Supply
   - Add radio toggle: "Enter by Drug Name" vs "Enter by NDC"
   - Display inline validation errors

3. **Implement form submission**
   - Handle form submission with validation
   - Call calculation API route on submit
   - Show loading state during API call
   - Handle successful response (display results inline)
   - Handle error response (display error messages)

4. **Add form features**
   - Add "Clear Form" button to reset all fields
   - Add "New Calculation" button after results display
   - Preserve form state during calculation
   - Auto-focus first field on page load

5. **Style form with Material-UI**
   - Use MUI TextField, Select, Button components
   - Apply theme colors and spacing
   - Make form responsive (desktop and tablet)
   - Follow ui-rules.md for component styling

**Validation:** Form validates correctly, submits data, displays errors inline

---

## Feature 2: RxNorm API Integration

**Goal:** Integrate RxNorm API for drug name normalization.

### Steps

1. **Create RxNorm API client**
   - Create `lib/api/rxnorm.js` with API client functions
   - Implement `searchDrugByName(drugName)` function
   - Implement `getRxCUI(drugName)` function to get normalized drug identifier
   - Handle API errors gracefully (network errors, 404s, rate limits)

2. **Implement caching strategy**
   - Use TanStack Query for automatic caching
   - Set stale time to 24 hours (drug data changes infrequently)
   - Implement request deduplication
   - Add cache key factory for consistent keys

3. **Create API route for RxNorm**
   - Create `app/api/rxnorm/route.js` with GET handler
   - Validate query parameters
   - Call RxNorm API client
   - Return normalized drug data (RxCUI, drug name, dosage form, strength)
   - Handle errors and return appropriate status codes

4. **Create React Query hook**
   - Create `hooks/queries/useRxNorm.js` hook
   - Use TanStack Query's `useQuery`
   - Handle loading, error, and success states
   - Implement retry logic for transient failures

5. **Add rate limiting**
   - Implement rate limiting to respect 20 req/sec limit
   - Use TanStack Query's request deduplication
   - Add delay/throttling if needed to prevent hitting rate limits

**Validation:** Drug names normalize correctly, caching works, rate limiting prevents API abuse

---

## Feature 3: FDA NDC Directory API Integration

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

## Feature 5: NDC Matching Algorithm

**Goal:** Match optimal NDC package(s) to calculated quantity.

### Steps

1. **Create NDC matching utility**
   - Create `lib/calculations/ndc-matching.js`
   - Implement `selectOptimalNDCs(quantity, availableNDCs)` function
   - Sort NDCs by package size (prefer larger packages to minimize count)
   - Implement greedy algorithm to find best package combination

2. **Implement tolerance logic**
   - Define acceptable overfill/underfill tolerance (±10%)
   - Calculate exact match, slight overfill, and slight underfill options
   - Rank options by preference: exact match > slight overfill > underfill

3. **Generate alternatives**
   - Return primary recommendation (best match)
   - Return alternative options (other valid combinations)
   - Include quantity breakdown for each option (e.g., "2 × 30-count bottles")
   - Calculate overfill/underfill percentage for each option

4. **Filter inactive NDCs**
   - Exclude inactive NDCs from recommendations
   - Include inactive NDCs in warnings section
   - Highlight if user entered an inactive NDC directly

5. **Test matching algorithm**
   - Test with various quantities and package size combinations
   - Verify optimal matches are selected
   - Test edge cases (no exact match available)

**Validation:** Algorithm selects optimal NDCs, alternatives provided, inactive NDCs flagged

---

## Feature 6: Calculation API Route

**Goal:** Create API endpoint that orchestrates the entire calculation flow.

### Steps

1. **Create calculation API route**
   - Create `app/api/calculations/route.js` with POST handler
   - Accept request body: `{ drugName?, ndc?, sig, daysSupply? }`
   - Validate request body with Zod schema

2. **Implement calculation workflow**
   - Step 1: If drugName provided, normalize via RxNorm API
   - Step 2: Retrieve NDCs via FDA API (using RxCUI or direct NDC)
   - Step 3: Parse SIG and calculate quantity
   - Step 4: Match optimal NDC package(s)
   - Step 5: Generate warnings (inactive NDCs, overfills, parsing failures)
   - Step 6: Assemble response object

3. **Save calculation to database**
   - Insert calculation record into `calculations` table
   - Include user ID, inputs, outputs, warnings
   - Log to `audit_logs` table
   - Return calculation ID for future reference

4. **Implement error handling**
   - Handle RxNorm API failures (provide fallback or manual entry)
   - Handle FDA API failures (provide error message)
   - Handle SIG parsing failures (allow manual quantity entry)
   - Return appropriate HTTP status codes (200, 400, 500)

5. **Add authentication check**
   - Verify user is authenticated (check JWT token)
   - Include user ID in calculation record
   - Return 401 if not authenticated

**Validation:** API endpoint works end-to-end, calculations saved to database, errors handled

---

## Feature 7: Results Display

**Goal:** Display calculation results with recommendations, alternatives, and warnings.

### Steps

1. **Create results display component**
   - Create `components/results/ResultsDisplay/ResultsDisplay.jsx`
   - Display inline below calculation form (not separate page)
   - Show results summary card with drug name, RxCUI, calculated quantity, status

2. **Create NDC card component**
   - Create `components/results/NDCCard/NDCCard.jsx`
   - Display NDC details: NDC number, manufacturer, package size, active status
   - Display quantity breakdown (e.g., "1 × 60-count bottle = 60 tablets")
   - Show overfill/underfill percentage if applicable
   - Add "Select This NDC" button

3. **Create alternatives section**
   - Create `components/results/AlternativeOptions/AlternativeOptions.jsx`
   - Display list of alternative NDC options
   - Each option shows package breakdown and match quality
   - Allow user to select alternative

4. **Create warnings section**
   - Create `components/results/WarningsSection/WarningsSection.jsx`
   - Display warnings: inactive NDCs, overfill/underfill, SIG parsing failures
   - Use color coding: red for errors, orange for warnings, green for success
   - Show warning icons and clear messages

5. **Add user actions**
   - Add "Export" button for JSON export
   - Add "New Calculation" button to clear form and results
   - Add "Edit" functionality to modify inputs and recalculate
   - Add "Verify" button for pharmacists (marks calculation as verified)

**Validation:** Results display correctly, alternatives shown, warnings displayed, actions work

---

## Feature 8: JSON Export

**Goal:** Export calculation results as JSON.

### Steps

1. **Create export utility**
   - Create `lib/utils/export.js` with export functions
   - Implement `exportToJSON(calculation)` function
   - Structure JSON output with inputs, normalization data, results, warnings

2. **Create export button component**
   - Add "Export" button to results display
   - Implement two options: "Download JSON" and "Copy to Clipboard"
   - Use MUI Menu for dropdown

3. **Implement download functionality**
   - Generate JSON file from calculation data
   - Trigger browser download with proper filename (e.g., `calculation_[timestamp].json`)
   - Include metadata: timestamp, user ID, calculation ID

4. **Implement copy to clipboard**
   - Format JSON for readability
   - Copy to clipboard using Clipboard API
   - Show confirmation toast: "Copied to clipboard!"

5. **Define JSON structure**
   - Follow structure defined in user-flow.md
   - Include: timestamp, user, inputs, normalization, results (recommended NDC, alternatives, warnings)

**Validation:** JSON export works, download and copy to clipboard function correctly

---

## Feature 9: Database Schema and Audit Logging

**Goal:** Complete database schema for calculations and audit logs.

### Steps

1. **Create complete `calculations` table schema**
   - Columns: id (UUID), user_id (UUID FK), drug_name (string), ndc (string), sig (text), days_supply (int)
   - Columns: calculated_quantity (int), recommended_ndc (jsonb), alternatives (jsonb), warnings (jsonb)
   - Columns: status (enum: pending, verified), verified_by (UUID FK), verified_at (timestamp)
   - Columns: created_at (timestamp), updated_at (timestamp)
   - Add indexes: user_id, created_at, status

2. **Create `audit_logs` table**
   - Columns: id (UUID), user_id (UUID FK), action (string), resource_type (string), resource_id (UUID)
   - Columns: metadata (jsonb), created_at (timestamp)
   - Add index: user_id, created_at

3. **Implement audit logging**
   - Create `lib/utils/audit.js` with audit logging functions
   - Log all calculations (action: "calculation_created")
   - Log verifications (action: "calculation_verified")
   - Log exports (action: "calculation_exported")
   - Include metadata: inputs, results, user agent, IP address (optional)

4. **Create database migration**
   - Use Supabase migrations to create tables
   - Enable RLS on all tables
   - Create RLS policies: users can read their own data, admins can read all data

5. **Test database operations**
   - Test INSERT operations for calculations and audit logs
   - Test SELECT operations with RLS enforcement
   - Test UPDATE operations for verification

**Validation:** Database schema complete, audit logging works, RLS policies enforced

---

## Feature 10: Role-Based Access Control

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

## Feature 11: Error Handling and Recovery Flows

**Goal:** Implement comprehensive error handling for all failure scenarios.

### Steps

1. **Handle RxNorm API failures**
   - Display error: "No match found for '[drug name]'"
   - Provide recovery options: retry with different spelling, enter NDC directly
   - Allow user to proceed with direct NDC entry

2. **Handle FDA API failures**
   - Display error: "Unable to retrieve NDCs"
   - Provide recovery options: retry, enter NDC manually
   - Allow user to search all NDCs (including inactive) with toggle

3. **Handle SIG parsing failures**
   - Display warning: "Could not parse directions — calculation unavailable"
   - Show manual entry fields: quantity, unit
   - Calculate using manual values if provided

4. **Handle API unavailability**
   - Display error: "Service temporarily unavailable"
   - Implement retry logic (3 attempts with exponential backoff)
   - Provide "Retry" button
   - Log API failures for monitoring

5. **Implement loading states**
   - Show loading spinner during API calls
   - Disable form during calculation
   - Show progress indicator for multi-step process

**Validation:** All error scenarios display appropriate messages and recovery options

---

## Feature 12: Verification Workflow

**Goal:** Allow pharmacists to verify calculations.

### Steps

1. **Add verification button**
   - Add "Mark as Verified" button to results display (pharmacists only)
   - Show verification status badge on results

2. **Create verification API route**
   - Create `app/api/calculations/[id]/verify/route.js` with POST handler
   - Check user role (must be pharmacist or admin)
   - Update calculation record: set status to "verified", verified_by to user ID, verified_at to current timestamp
   - Log verification to audit_logs

3. **Update UI after verification**
   - Show "Verified" badge with checkmark icon
   - Display verifier name and timestamp
   - Disable "Verify" button after verification
   - Lock calculation (cannot be edited after verification)

4. **Create React Query mutation**
   - Create `hooks/queries/useVerifyCalculation.js` mutation hook
   - Invalidate calculation queries after successful verification
   - Show success toast on verification

5. **Test verification workflow**
   - Test pharmacist can verify calculation
   - Test technician cannot verify (button hidden, API returns 403)
   - Test verification persists in database

**Validation:** Pharmacists can verify calculations, status updates, audit logged

---

## Testing Checklist

Before moving to Phase 2, verify:

- [ ] User can enter prescription data and submit form
- [ ] Drug names normalize via RxNorm API
- [ ] NDCs retrieve via FDA API
- [ ] Quantities calculate correctly from SIG and days supply
- [ ] Optimal NDCs selected and alternatives provided
- [ ] Inactive NDCs flagged in warnings
- [ ] Results display inline with recommendations and warnings
- [ ] JSON export works (download and copy to clipboard)
- [ ] Calculations save to database with audit log
- [ ] Pharmacists can verify calculations
- [ ] Roles enforced (technicians cannot verify)
- [ ] All error scenarios handled gracefully
- [ ] Response time <2 seconds for typical calculation
- [ ] Application works on desktop and tablet

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

**Total: 7-10 days** (depending on familiarity with tech stack and APIs)

- Features 1-2: 2 days (form, RxNorm integration)
- Features 3-4: 2 days (FDA integration, quantity calculation)
- Feature 5-6: 2 days (NDC matching, API orchestration)
- Features 7-8: 2 days (results display, export)
- Features 9-12: 2 days (database, RBAC, error handling, verification)
- Testing and fixes: 1-2 days

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

