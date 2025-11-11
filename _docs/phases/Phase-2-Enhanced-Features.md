# Phase 2: Enhanced Features

**Project:** NDC Packaging & Quantity Calculator (QuantRx)  
**Phase:** Enhanced Features - P1 Requirements  
**Goal:** Add advanced functionality and improve user experience

---

## Overview

Phase 2 builds on the MVP to add P1 (should-have) features from the PRD, improving usability, expanding calculation capabilities, and adding data persistence features. This phase focuses on handling complex scenarios and providing users with more powerful tools.

### Phase Deliverables

- ✅ CSV and PDF export capabilities
- ✅ Advanced SIG parsing with OpenAI integration
- ✅ Special dosage form handling (liquids, insulin, inhalers)
- ✅ Historical calculation recall
- ✅ Multi-pack handling
- ✅ Enhanced error tracking with Sentry
- ✅ Performance optimizations
- ✅ Improved notifications system

### Success Criteria

- Users can export calculations in CSV and PDF formats
- Complex SIGs parse correctly using AI
- Special dosage forms (liquids, insulin, inhalers) calculate accurately
- Users can recall and reuse previous calculations
- Multi-pack scenarios handled correctly
- Errors tracked and reported via Sentry
- Application performance improved with optimizations
- User experience enhanced with better notifications

---

## Feature 1: CSV Export

**Goal:** Export calculation results in CSV format for spreadsheet analysis.

### Steps

1. **Create CSV export utility**
   - Create `lib/utils/export-csv.js` with CSV generation functions
   - Implement `exportToCSV(calculation)` function
   - Format data as CSV with proper escaping for special characters

2. **Define CSV structure**
   - Headers: Drug Name, NDC, Manufacturer, Package Size, Quantity, Days Supply, Status, Warnings
   - Include one row for primary recommendation
   - Optional: Include alternative options in separate rows

3. **Add CSV export to UI**
   - Add "Download CSV" option to Export menu
   - Generate CSV file and trigger download
   - Use proper filename: `calculation_[timestamp].csv`

4. **Handle multiple calculations export**
   - Create "Export All" feature for batch export
   - Export multiple calculations as single CSV file
   - Include calculation ID and timestamp for each row

5. **Test CSV export**
   - Verify CSV format is correct
   - Test with special characters in drug names
   - Verify opens correctly in Excel/Google Sheets

**Validation:** CSV exports correctly, opens in spreadsheet software without errors

---

## Feature 2: PDF Export

**Goal:** Export calculation results as formatted PDF documents.

### Steps

1. **Install PDF generation library**
   - Install jsPDF or react-pdf: `npm install jspdf` or `npm install @react-pdf/renderer`
   - Choose based on complexity needs (jsPDF for simple, react-pdf for complex layouts)

2. **Create PDF export utility**
   - Create `lib/utils/export-pdf.js` with PDF generation functions
   - Implement `exportToPDF(calculation)` function
   - Design PDF layout with branding, sections, formatting

3. **Design PDF layout**
   - Header: QuantRx logo, calculation date, calculation ID
   - Section 1: Input Summary (drug name, SIG, days supply)
   - Section 2: Calculation Results (quantity, recommended NDC)
   - Section 3: Alternative Options (list with details)
   - Section 4: Warnings (if any)
   - Footer: User info, timestamp, verification status

4. **Add PDF export to UI**
   - Add "Download PDF" option to Export menu
   - Generate PDF and trigger download
   - Use proper filename: `calculation_[timestamp].pdf`

5. **Test PDF export**
   - Verify PDF layout is readable and professional
   - Test with various calculation scenarios
   - Verify opens correctly in PDF readers

**Validation:** PDF exports correctly with professional formatting, all data included

---

## Feature 3: OpenAI SIG Parsing

**Goal:** Use OpenAI API to parse complex and ambiguous SIGs.

### Steps

1. **Create OpenAI API client**
   - Create `lib/api/openai.js` with OpenAI client configuration
   - Use OpenAI Chat Completions API
   - Define system prompt for SIG parsing task

2. **Implement AI SIG parsing**
   - Create `lib/calculations/sig-parsing-ai.js`
   - Send SIG to OpenAI with prompt: "Parse this prescription direction and extract dose, frequency, and unit"
   - Request structured JSON response: `{ dose, frequency, unit, confidence }`
   - Handle OpenAI API errors and rate limits

3. **Create fallback strategy**
   - Try regex-based parsing first (from Phase 1)
   - If regex fails, try OpenAI parsing
   - If OpenAI fails, fall back to manual entry
   - Log parsing method used for analytics

4. **Add confidence scoring**
   - OpenAI returns confidence score (0-1)
   - If confidence < 0.7, flag for manual review
   - Display confidence in results: "Parsed with 85% confidence"

5. **Test AI parsing**
   - Test with complex SIGs: "Take 1-2 tablets every 4-6 hours as needed for pain"
   - Test with abbreviations: "1 tab PO QID PRN"
   - Test with unusual patterns
   - Verify OpenAI parsing improves accuracy over regex

**Validation:** Complex SIGs parse correctly, confidence scoring works, fallback strategy effective

---

## Feature 4: Special Dosage Forms - Liquids

**Goal:** Handle liquid medications with concentration and volume calculations.

### Steps

1. **Create liquid dosage calculation utility**
   - Create `lib/calculations/liquids.js`
   - Implement `calculateLiquidQuantity(concentration, dose, frequency, daysSupply)`
   - Handle concentration units: mg/ml, mg/5ml, etc.
   - Convert between units as needed

2. **Parse liquid SIGs**
   - Extract dose in ml: "Take 5ml twice daily"
   - Extract dose with concentration: "Take 250mg (5ml) twice daily"
   - Handle "teaspoon" and "tablespoon" conversions (1 tsp = 5ml, 1 tbsp = 15ml)

3. **Match liquid NDCs**
   - Filter NDCs to liquid dosage forms
   - Match package sizes by volume (ml)
   - Consider bottle sizes: 100ml, 120ml, 150ml, 240ml, 480ml

4. **Display liquid calculations**
   - Show volume breakdown: "300ml total (2 × 150ml bottles)"
   - Show dose calculations: "5ml × 2 times/day × 30 days = 300ml"
   - Display concentration information

5. **Test liquid calculations**
   - Test with common liquid medications (amoxicillin suspension, cough syrup)
   - Verify volume calculations are accurate
   - Test unit conversions

**Validation:** Liquid medications calculate correctly, volumes accurate, NDCs match properly

---

## Feature 5: Special Dosage Forms - Insulin

**Goal:** Handle insulin with unit-based calculations.

### Steps

1. **Create insulin calculation utility**
   - Create `lib/calculations/insulin.js`
   - Implement `calculateInsulinQuantity(units, frequency, daysSupply)`
   - Handle insulin pens vs vials (different package types)

2. **Parse insulin SIGs**
   - Extract units: "Inject 10 units twice daily"
   - Handle variable dosing: "Inject 5-10 units before meals"
   - Handle sliding scale: "Use per sliding scale"

3. **Match insulin NDCs**
   - Filter to insulin products
   - Differentiate: vials (10ml = 1000 units), pens (3ml × 5 = 1500 units)
   - Calculate number of vials/pens needed

4. **Display insulin calculations**
   - Show unit breakdown: "600 units total (1 vial of 1000 units)"
   - Show dosing schedule
   - Display pen vs vial options

5. **Test insulin calculations**
   - Test with common insulin types (Humalog, Lantus, Novolog)
   - Verify unit calculations
   - Test pen vs vial matching

**Validation:** Insulin calculations correct, pen vs vial options provided accurately

---

## Feature 6: Special Dosage Forms - Inhalers

**Goal:** Handle inhalers with puff-based calculations.

### Steps

1. **Create inhaler calculation utility**
   - Create `lib/calculations/inhalers.js`
   - Implement `calculateInhalerQuantity(puffs, frequency, daysSupply)`
   - Calculate number of inhalers needed based on puffs per inhaler

2. **Parse inhaler SIGs**
   - Extract puffs: "Inhale 2 puffs twice daily"
   - Handle PRN usage: "1-2 puffs every 4-6 hours as needed"
   - Handle both scheduled and rescue inhalers

3. **Match inhaler NDCs**
   - Filter to inhaler products
   - Note standard inhaler sizes: 60 puffs, 120 puffs, 200 puffs
   - Calculate number of inhalers needed

4. **Display inhaler calculations**
   - Show puff breakdown: "120 puffs total (1 inhaler of 200 puffs)"
   - Show dosing schedule
   - Flag if multiple inhalers needed

5. **Test inhaler calculations**
   - Test with common inhalers (albuterol, Advair, Symbicort)
   - Verify puff calculations
   - Test with various inhaler sizes

**Validation:** Inhaler calculations correct, puff counts accurate, NDC matching works

---

## Feature 7: Multi-Pack Handling

**Goal:** Optimize NDC selection when multiple packages are needed.

### Steps

1. **Enhance NDC matching algorithm**
   - Update `lib/calculations/ndc-matching.js`
   - Implement multi-pack optimization: find best combination of package sizes
   - Use dynamic programming or greedy algorithm for optimal package selection

2. **Calculate multi-pack scenarios**
   - Example: Need 150 tablets → 1 × 90-count + 1 × 60-count = 150 tablets (exact match)
   - Minimize number of packages while staying within tolerance
   - Prefer fewer larger packages over many small packages

3. **Display multi-pack breakdowns**
   - Show package breakdown clearly: "2 packages: 1 × 90-count, 1 × 60-count"
   - Calculate total quantity: "150 tablets total"
   - Show cost implications if available (future feature)

4. **Handle overfill tolerance**
   - Allow slight overfill if it reduces package count
   - Example: Need 150 → 2 × 90-count = 180 tablets (20% overfill, but only 2 packages)
   - Flag overfill percentage

5. **Test multi-pack scenarios**
   - Test with quantities requiring multiple packages
   - Verify optimal combinations selected
   - Test edge cases (unusual quantities)

**Validation:** Multi-pack calculations optimal, breakdowns clear, overfill tolerance applied correctly

---

## Feature 8: Historical Calculation Recall

**Goal:** Allow users to view and reuse previous calculations.

### Steps

1. **Create calculation history component**
   - Create `components/history/CalculationHistory/CalculationHistory.jsx`
   - Display list of user's previous calculations
   - Show: drug name, NDC, date, status (verified/pending)
   - Add search and filter capabilities (by date, drug name, status)

2. **Create history API route**
   - Create `app/api/calculations/route.js` GET handler
   - Query calculations for current user
   - Filter by query parameters (date range, status)
   - Paginate results (10-20 per page)
   - Return calculations with metadata

3. **Implement recall functionality**
   - Add "Recall" button to each history item
   - Populate form with previous calculation data
   - Allow user to edit and recalculate
   - Preserve original calculation (don't overwrite)

4. **Add history UI to main page**
   - Add "Recent Calculations" section or sidebar
   - Show last 5 calculations
   - Add "View All" link to full history page
   - Include quick action buttons: Recall, Export, View Details

5. **Test history functionality**
   - Verify calculations appear in history
   - Test recall populates form correctly
   - Test filters and search work
   - Test pagination

**Validation:** History displays correctly, recall works, filters functional, pagination works

---

## Feature 9: Enhanced Notifications System

**Goal:** Implement comprehensive notifications for user actions and events.

### Steps

1. **Install notification library**
   - Install notistack: `npm install notistack`
   - Wrap app with `SnackbarProvider` in `app/layout.jsx`

2. **Create notification utility**
   - Create `lib/utils/notifications.js`
   - Implement helper functions: `showSuccess()`, `showError()`, `showWarning()`, `showInfo()`
   - Configure default options: position, duration, variants

3. **Add notifications to user actions**
   - Calculation submitted: "Calculation in progress..."
   - Calculation completed: "Calculation completed successfully"
   - Verification: "Calculation verified"
   - Export: "Exported to [format]"
   - Error: "Error: [message]"
   - Copy to clipboard: "Copied to clipboard!"

4. **Add warning notifications**
   - Inactive NDC: "Warning: NDC is inactive"
   - Overfill: "Warning: 20% overfill detected"
   - Parsing failure: "Warning: Could not parse SIG"
   - API rate limit: "Rate limit approaching, please wait"

5. **Test notifications**
   - Verify notifications appear for all actions
   - Test different variants (success, error, warning, info)
   - Verify auto-dismiss after appropriate duration
   - Test notifications don't overlap or obscure content

**Validation:** Notifications display correctly for all actions, variants styled appropriately

---

## Feature 10: Sentry Error Tracking

**Goal:** Integrate Sentry for comprehensive error tracking and monitoring.

### Steps

1. **Install Sentry**
   - Install Sentry SDK: `npm install @sentry/nextjs`
   - Run Sentry wizard: `npx @sentry/wizard -i nextjs`
   - Configure Sentry in `sentry.client.config.js` and `sentry.server.config.js`

2. **Configure Sentry**
   - Add `SENTRY_DSN` to environment variables
   - Configure error sampling rate
   - Configure tracing sample rate for performance monitoring
   - Set up source maps for readable stack traces

3. **Add error context**
   - Attach user information to errors (user ID, role)
   - Add breadcrumbs for user actions
   - Tag errors by type (api_error, calculation_error, auth_error)
   - Set environment (development, production)

4. **Integrate with error boundaries**
   - Update `app/error.jsx` to send errors to Sentry
   - Log API errors to Sentry
   - Log calculation failures to Sentry
   - Capture unhandled promise rejections

5. **Test Sentry integration**
   - Trigger test error to verify Sentry captures it
   - Verify stack traces are readable
   - Verify user context is attached
   - Check Sentry dashboard for errors

**Validation:** Errors tracked in Sentry, stack traces readable, context attached

---

## Feature 11: Performance Optimizations

**Goal:** Optimize application performance to improve load times and responsiveness.

### Steps

1. **Implement code splitting**
   - Use dynamic imports for heavy components: `const Component = dynamic(() => import('./Component'))`
   - Lazy load PDF export functionality (only when needed)
   - Split vendor bundles to reduce initial load

2. **Optimize API caching**
   - Increase TanStack Query stale time to 24 hours for drug data
   - Implement persistent caching (optional: use localStorage or IndexedDB)
   - Prefetch common drugs or frequently used calculations

3. **Optimize images and assets**
   - Use Next.js Image component for logo and images
   - Compress images
   - Use appropriate image formats (WebP with fallback)

4. **Add loading skeletons**
   - Create skeleton components for loading states
   - Show skeleton while fetching calculation results
   - Show skeleton in history list while loading

5. **Measure and monitor performance**
   - Use Vercel Analytics to track performance metrics
   - Monitor API response times
   - Monitor bundle sizes
   - Use Lighthouse to audit performance

**Validation:** Performance improved, load times faster, metrics tracked

---

## Feature 12: Enhanced Input Validation

**Goal:** Improve form validation with better error messages and suggestions.

### Steps

1. **Add real-time validation**
   - Validate NDC format as user types (show green checkmark or red X)
   - Validate days supply is positive number
   - Suggest corrections for common drug name typos

2. **Add input suggestions**
   - Implement autocomplete for drug names (using RxNorm API)
   - Show recently used drugs in dropdown
   - Suggest corrections for misspelled drugs

3. **Improve error messages**
   - Make validation errors more descriptive and actionable
   - Example: "NDC must be 11 digits in format 12345-678-90" instead of "Invalid NDC"
   - Provide examples for correct formats

4. **Add input masking**
   - Add input mask for NDC field (auto-format with dashes)
   - Add input restrictions: days supply must be number
   - Prevent invalid characters in numeric fields

5. **Test validation improvements**
   - Test real-time validation
   - Test autocomplete suggestions
   - Test input masking and restrictions
   - Verify error messages are clear

**Validation:** Validation more helpful, suggestions improve UX, error messages clear

---

## Testing Checklist

Before moving to Phase 3, verify:

- [ ] CSV export works correctly
- [ ] PDF export generates professional documents
- [ ] OpenAI SIG parsing improves accuracy for complex SIGs
- [ ] Liquid medications calculate correctly
- [ ] Insulin calculations accurate for vials and pens
- [ ] Inhaler puff counts calculated correctly
- [ ] Multi-pack scenarios optimized
- [ ] Historical calculations recall correctly
- [ ] Notifications display for all actions
- [ ] Sentry captures and reports errors
- [ ] Performance improved (faster load times)
- [ ] Enhanced validation improves user experience

---

## Known Limitations (Expected at End of Phase 2)

Phase 2 delivers enhanced functionality but intentionally excludes:

- ❌ Analytics dashboard for administrators (Phase 3)
- ❌ Advanced reporting and metrics (Phase 3)
- ❌ Bulk calculation processing (Phase 3)
- ❌ Integration with pharmacy management systems (Phase 3)
- ❌ Mobile app (Phase 4 - future)
- ❌ Offline mode (Phase 4 - future)

---

## Next Phase

**Phase 3: Analytics & Administration** will add:
- Administrator dashboard
- Analytics and reporting
- User management
- Advanced metrics and insights
- Bulk operations

---

## Estimated Timeline

**Total: 7-10 days**

- Features 1-2: 2 days (CSV/PDF export)
- Feature 3: 1 day (OpenAI integration)
- Features 4-6: 2 days (special dosage forms)
- Feature 7: 1 day (multi-pack handling)
- Feature 8: 1.5 days (historical recall)
- Features 9-10: 1.5 days (notifications, Sentry)
- Features 11-12: 1 day (performance, validation)
- Testing and fixes: 1-2 days

---

## Dependencies

- Phase 1 (MVP) completed successfully
- OpenAI API key obtained and configured
- Sentry account created and DSN configured
- Additional environment variables set

---

**End of Phase 2 (Enhanced Features) Document**

