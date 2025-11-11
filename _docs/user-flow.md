# User Flow Documentation

**Project:** NDC Packaging & Quantity Calculator (QuantRx)  
**Version:** MVP  
**Last Updated:** 2025-01-27

---

## Table of Contents

1. [Overview](#overview)
2. [User Roles & Access](#user-roles--access)
3. [Authentication Flow](#authentication-flow)
4. [Main Application Flow](#main-application-flow)
5. [Input Paths](#input-paths)
6. [Calculation Flow](#calculation-flow)
7. [Results Display & Interaction](#results-display--interaction)
8. [Error Handling Flows](#error-handling-flows)
9. [Export Flow](#export-flow)
10. [Future: Administrator Dashboard Flow](#future-administrator-dashboard-flow)

---

## Overview

This document defines the complete user journey through the NDC Packaging & Quantity Calculator application. The flow is designed for pharmacy technicians and pharmacists to efficiently match prescriptions with valid NDCs and calculate correct dispense quantities.

### Key Principles
- **Single-page workflow**: Results display inline on the same page as inputs
- **Progressive disclosure**: Show information as it becomes available
- **Error recovery**: Always provide clear paths forward when errors occur
- **Role-based access**: Different capabilities for Technicians, Pharmacists, and Administrators

---

## User Roles & Access

### Technician
- **Capabilities:**
  - Enter prescription data
  - Calculate NDC matches and quantities
  - View results and warnings
  - Export results
- **Restrictions:**
  - Cannot override warnings
  - Cannot mark records as verified

### Pharmacist
- **Capabilities:**
  - All Technician capabilities
  - Override warnings
  - Mark records as verified
  - Approve calculations
- **Restrictions:**
  - None (full access to calculation features)

### Administrator
- **Capabilities:**
  - View analytics dashboard (Phase 2)
  - Review accuracy metrics
  - Access user activity logs
  - Export aggregated reports
- **Current Status:**
  - Out of scope for MVP
  - Backend architecture should log data to support future dashboard

---

## Authentication Flow

### Entry Point
User navigates to application URL.

### Flow Steps

```
1. Landing Page / Login Screen
   ↓
2. User enters credentials (username/password)
   ↓
3. System validates credentials
   ↓
4a. [SUCCESS] → Create session (JWT/OAuth2)
      ↓
      Redirect to Main Application
   
4b. [FAILURE] → Display error message
      ↓
      Return to Login Screen
      (Allow retry)
```

### Authentication States
- **Unauthenticated:** Can only access login page
- **Authenticated:** Full access based on role
- **Session Expired:** Redirect to login with message

### Session Management
- JWT or OAuth2 token-based authentication
- Session timeout after inactivity
- Optional SSO integration for enterprise deployments

---

## Main Application Flow

### High-Level Flow

```
Login
  ↓
Main Application Page
  ↓
[Three Input Paths Available]
  ├─→ Path 1: Drug Name Entry
  ├─→ Path 2: Direct NDC Entry
  └─→ Path 3: Historical Recall (Future)
  ↓
Input Validation
  ↓
Calculation Process
  ↓
Results Display (Inline)
  ↓
[User Actions Available]
  ├─→ Edit & Recalculate
  ├─→ Select Alternative NDC
  ├─→ Export Results
  ├─→ Start New Calculation
  └─→ (Pharmacist) Mark as Verified
```

---

## Input Paths

### Path 1: Drug Name Entry (Primary Path)

**Use Case:** User enters drug name, system finds matching NDCs.

```
1. User enters Drug Name
   (e.g., "Lisinopril 10mg" or "Prinivil")
   ↓
2. User enters SIG (required for calculation)
   (e.g., "Take 1 tablet twice daily")
   ↓
3. User enters Days Supply (optional)
   (e.g., "30")
   ↓
4. User clicks "Calculate" button
   ↓
5. System validates inputs
   ↓
6. Proceeds to Calculation Flow
```

**Field Requirements:**
- **Drug Name or NDC:** Required (one or the other)
- **SIG:** Required if quantity calculation is needed
- **Days Supply:** Optional (only needed for quantity calculation)

### Path 2: Direct NDC Entry

**Use Case:** User already knows the NDC, wants to validate or calculate quantity.

```
1. User enters NDC directly
   (e.g., "12345-678-30")
   ↓
2. System auto-fetches NDC data from FDA API
   (Skip RxNorm normalization)
   ↓
3. System displays drug information
   (Drug name, manufacturer, package size, active status)
   ↓
4. User enters SIG (if quantity calculation needed)
   ↓
5. User enters Days Supply (if quantity calculation needed)
   ↓
6. User clicks "Calculate" button
   ↓
7. Proceeds to Calculation Flow
```

**Key Difference:** RxNorm step is skipped; goes directly to FDA NDC validation.

### Path 3: Historical Recall (Future - Phase 2)

**Use Case:** User wants to recall a previous calculation.

```
1. User clicks "Recent Calculations" or "History"
   ↓
2. System displays list of previous calculations
   (Filtered by user, date, status)
   ↓
3. User selects a previous entry
   ↓
4. System populates input fields with saved data
   ↓
5. User can edit and recalculate
   ↓
6. Proceeds to Calculation Flow
```

**Status:** Out of scope for MVP, but architecture should support this.

---

## Calculation Flow

### Detailed Process

```
Step 1: Input Validation
  ↓
  [All required fields present?]
  ├─→ NO → Display validation errors
  └─→ YES → Continue
  ↓
Step 2: Drug Normalization (if Drug Name entered)
  ↓
  [RxNorm API Call]
  ├─→ SUCCESS → Get RxCUI
  │     ↓
  │   Continue to Step 3
  │
  └─→ FAILURE → Error Handling Flow
        (See Error Handling section)
  ↓
Step 3: NDC Retrieval
  ↓
  [FDA NDC Directory API Call]
  ├─→ SUCCESS → Get list of NDCs
  │     ↓
  │   Filter active NDCs
  │     ↓
  │   Check for inactive NDCs
  │     ↓
  │   Display inactive warnings (if any)
  │     ↓
  │   Continue to Step 4
  │
  └─→ FAILURE → Error Handling Flow
        (See Error Handling section)
  ↓
Step 4: Quantity Calculation (if SIG provided)
  ↓
  [SIG Parsing]
  ├─→ SUCCESS → Extract dose, frequency, unit
  │     ↓
  │   Calculate: dose × frequency × days supply
  │     ↓
  │   Continue to Step 5
  │
  └─→ FAILURE → Display warning banner
        "Could not parse directions — calculation unavailable"
        ↓
        Allow manual quantity entry
        ↓
        Continue to Step 5
  ↓
Step 5: NDC Matching Algorithm
  ↓
  [Select Optimal NDC Package(s)]
  ├─→ Filter out inactive NDCs
  ├─→ Sort by package size (prefer larger packages)
  ├─→ Find best combination (greedy/DP algorithm)
  ├─→ Calculate overfill/underfill tolerance (±5-10%)
  └─→ Return optimal NDC(s) with quantity breakdown
  ↓
Step 6: Results Assembly
  ↓
  [Prepare Results Object]
  ├─→ Primary recommendation (best matching NDC)
  ├─→ Alternative options (other valid NDCs)
  ├─→ Warnings (inactive NDCs, overfills, underfills)
  ├─→ Calculated quantity
  └─→ Drug information summary
  ↓
Step 7: Display Results (Inline)
```

### Calculation States

- **Loading:** Show spinner/loading indicator during API calls
- **Success:** Display results with all information
- **Partial Success:** Display results with warnings
- **Error:** Display error message with recovery options

---

## Results Display & Interaction

### Results Layout (Inline on Same Page)

The results appear below the input form, dynamically updating the page.

#### Results Summary Card

```
┌─────────────────────────────────────────┐
│ Results Summary                         │
├─────────────────────────────────────────┤
│ Drug: Lisinopril 10mg oral tablet       │
│ RxCUI: 29046                            │
│                                         │
│ Calculated Quantity: 60 tablets         │
│ Days Supply: 30 days                    │
│                                         │
│ Status: ✅ Valid                         │
└─────────────────────────────────────────┘
```

#### Primary Recommendation Section

```
┌─────────────────────────────────────────┐
│ Recommended NDC Package                 │
├─────────────────────────────────────────┤
│ NDC: 12345-678-60                       │
│ Manufacturer: Manufacturer A            │
│ Package Size: 60 tablets                │
│ Status: ✅ Active                        │
│                                         │
│ Quantity Breakdown:                     │
│ • 1 × 60-count bottle = 60 tablets      │
│ • Exact match (0% overfill)             │
│                                         │
│ [Select This NDC] [View Details]        │
└─────────────────────────────────────────┘
```

#### Alternative Options Section

```
┌─────────────────────────────────────────┐
│ Alternative NDC Options                  │
├─────────────────────────────────────────┤
│ Option 1: NDC 98765-432-90              │
│ • 1 × 90-count bottle = 90 tablets     │
│ • 30 overfill (50% tolerance)          │
│ [Select]                                 │
│                                         │
│ Option 2: NDC 11111-222-30              │
│ • 2 × 30-count bottles = 60 tablets    │
│ • Exact match                           │
│ [Select]                                 │
└─────────────────────────────────────────┘
```

#### Warnings Section (if applicable)

```
┌─────────────────────────────────────────┐
│ ⚠️ Warnings                              │
├─────────────────────────────────────────┤
│ 🟠 Inactive NDC Detected:               │
│    NDC 99999-888-60 is no longer active │
│    (Discontinued: 2024-12-01)            │
│                                         │
│ 🟠 SIG Parsing Warning:                  │
│    Could not fully parse directions     │
│    Manual quantity entry recommended    │
└─────────────────────────────────────────┘
```

### User Actions Available After Results

1. **Edit & Recalculate**
   - User modifies any input field
   - Clicks "Recalculate" button
   - Results update inline

2. **Select Alternative NDC**
   - User clicks "Select" on any alternative option
   - System highlights selected NDC
   - Results update to show selected option

3. **Export Results**
   - User clicks export button
   - Chooses format (JSON, CSV, PDF)
   - Downloads or copies to clipboard

4. **Start New Calculation**
   - User clicks "New Calculation" button
   - Input fields clear
   - Results section hides
   - Returns to initial input state

5. **Mark as Verified** (Pharmacist only)
   - Pharmacist reviews results
   - Clicks "Mark as Verified" button
   - System logs verification with user ID and timestamp
   - Status indicator updates to "Verified"

### Color Coding System

- **🔴 Red:** Critical errors (invalid NDC, missing required field, API failure)
- **🟠 Orange:** Warnings (inactive NDC, SIG unparseable, overfill/underfill)
- **🟢 Green:** Valid/Verified status
- **🔵 Blue:** Informational messages

---

## Error Handling Flows

### Error Type 1: RxNorm Not Found

**Trigger:** Drug name entered, but RxNorm API returns no match.

**Flow:**
```
1. Display error message:
   "No match found for '[drug name]'"
   ↓
2. Show recovery options:
   ├─→ "Retry with different spelling"
   ├─→ "Enter NDC directly instead"
   └─→ "Search FDA database (may include inactive)"
   ↓
3. User selects option
   ↓
4. System executes selected path
```

**UI Display:**
- Red banner at top of input section
- Clear error message
- Action buttons for recovery

### Error Type 2: FDA API Returns No NDCs

**Trigger:** RxNorm found, but FDA API returns no active NDCs.

**Flow:**
```
1. Display warning:
   "No active NDCs found for this product"
   ↓
2. Show options:
   ├─→ "Search all NDCs (including inactive)" [Toggle]
   ├─→ "Check spelling or try alternative drug name"
   └─→ "Enter NDC manually"
   ↓
3. If user toggles "include inactive":
   ↓
4. System re-queries with inactive NDCs
   ↓
5. Display results with clear inactive warnings
```

**UI Display:**
- Orange warning banner
- Toggle for including inactive NDCs
- Results show with prominent inactive status indicators

### Error Type 3: SIG Parsing Fails

**Trigger:** SIG text cannot be parsed by AI/system.

**Flow:**
```
1. Display warning banner:
   "Could not parse directions — calculation unavailable"
   ↓
2. Show manual entry option:
   ├─→ "Enter quantity manually"
   └─→ "Enter frequency manually"
   ↓
3. User enters manual values
   ↓
4. System uses manual values for calculation
   ↓
5. Results display with note: "Manual entry"
```

**UI Display:**
- Yellow/orange banner in results area
- Manual input fields appear
- Calculation proceeds with manual values

### Error Type 4: API Unavailable / Network Error

**Trigger:** RxNorm or FDA API is down or unreachable.

**Flow:**
```
1. Display error:
   "Service temporarily unavailable"
   ↓
2. Show options:
   ├─→ "Retry" button
   ├─→ "Check service status"
   └─→ "Enter NDC manually (skip API lookup)"
   ↓
3. System implements retry logic (3 attempts with backoff)
   ↓
4. If all retries fail, allow manual entry path
```

**UI Display:**
- Red error banner
- Retry button with loading state
- Fallback to manual entry

### Error Type 5: Invalid NDC Format

**Trigger:** User enters NDC in wrong format.

**Flow:**
```
1. Real-time validation as user types
   ↓
2. Display inline error:
   "NDC must be 11 digits (format: 12345-678-90)"
   ↓
3. Highlight input field in red
   ↓
4. Prevent calculation until format is correct
```

**UI Display:**
- Inline validation message below input field
- Red border on input field
- Disabled "Calculate" button until valid

---

## Export Flow

### Export Options

#### Option 1: JSON Export

**Flow:**
```
1. User clicks "Export" button
   ↓
2. Dropdown menu appears:
   ├─→ "Download JSON"
   └─→ "Copy JSON to Clipboard"
   ↓
3a. Download JSON:
    ├─→ System generates JSON file
    ├─→ Includes: inputs, outputs, warnings, metadata
    └─→ Browser downloads file
   
3b. Copy to Clipboard:
    ├─→ System formats JSON
    ├─→ Copies to clipboard
    └─→ Shows confirmation: "Copied to clipboard!"
```

**JSON Structure:**
```json
{
  "timestamp": "2025-01-27T10:30:00Z",
  "user": "technician_123",
  "inputs": {
    "drugName": "Lisinopril 10mg",
    "sig": "Take 1 tablet twice daily",
    "daysSupply": 30
  },
  "normalization": {
    "rxcui": "29046",
    "drugName": "Lisinopril 10mg oral tablet"
  },
  "results": {
    "calculatedQuantity": 60,
    "unit": "tablet",
    "recommendedNDC": {
      "ndc": "12345-678-60",
      "manufacturer": "Manufacturer A",
      "packageSize": 60,
      "status": "active"
    },
    "alternatives": [...],
    "warnings": [...]
  }
}
```

#### Option 2: CSV Export

**Flow:**
```
1. User clicks "Export" → "Download CSV"
   ↓
2. System generates CSV file
   ↓
3. CSV includes:
   ├─→ Drug name, NDC, manufacturer
   ├─→ Calculated quantity, days supply
   ├─→ Status (active/inactive)
   └─→ Warnings (if any)
   ↓
4. Browser downloads file
```

**CSV Format:**
```csv
Drug Name,NDC,Manufacturer,Package Size,Quantity,Days Supply,Status,Warnings
Lisinopril 10mg,12345-678-60,Manufacturer A,60,60,30,Active,
```

#### Option 3: PDF Export (Future - Phase 2)

**Flow:**
```
1. User clicks "Export" → "Download PDF"
   ↓
2. System generates PDF document
   ↓
3. PDF includes:
   ├─→ Formatted results summary
   ├─→ All NDC options
   ├─→ Warnings and notes
   └─→ Timestamp and user information
   ↓
4. Browser downloads file
```

**Status:** Optional for MVP, recommended for Phase 2.

---

## Future: Administrator Dashboard Flow

### Overview
Administrator dashboard is out of scope for MVP, but backend should log data to support it.

### Data to Log (for Future Dashboard)

1. **Calculation Logs:**
   - User ID, timestamp, inputs, outputs
   - Validation status, warnings encountered
   - NDC selections made

2. **Error Logs:**
   - API failures, parsing failures
   - User recovery actions taken

3. **Accuracy Metrics:**
   - NDC mismatch rates
   - Parsing success rates
   - Overfill/underfill frequency

### Future Dashboard Flow (Phase 2)

```
1. Administrator logs in
   ↓
2. Navigate to "Analytics Dashboard"
   ↓
3. View metrics:
   ├─→ Accuracy trends over time
   ├─→ Error sources by category
   ├─→ User activity logs
   └─→ Drug category analysis
   ↓
4. Filter and export reports
   ↓
5. Identify improvement areas
```

---

## State Transitions

### Application States

1. **Initial State**
   - Empty input form
   - No results displayed
   - "Calculate" button enabled (if required fields present)

2. **Loading State**
   - Input form disabled
   - Loading spinner visible
   - "Calculate" button shows "Calculating..."

3. **Results State**
   - Input form enabled (for editing)
   - Results displayed inline
   - Export buttons available
   - "New Calculation" button visible

4. **Error State**
   - Error message displayed
   - Input form enabled (for correction)
   - Recovery options available
   - "Calculate" button enabled (if inputs valid)

5. **Verified State** (Pharmacist only)
   - Results marked as verified
   - Verification timestamp displayed
   - Lock icon or badge on results

---

## User Journey Examples

### Example 1: Successful Calculation (Technician)

```
1. Technician logs in
   ↓
2. Enters "Lisinopril 10mg" in drug name field
   ↓
3. Enters "Take 1 tablet twice daily" in SIG field
   ↓
4. Enters "30" in days supply field
   ↓
5. Clicks "Calculate"
   ↓
6. System shows loading spinner
   ↓
7. Results appear:
   - Drug normalized to RxCUI 29046
   - Recommended NDC: 12345-678-60 (60 tablets, exact match)
   - Status: ✅ Active
   ↓
8. Technician reviews results
   ↓
9. Technician exports JSON for pharmacy system
   ↓
10. Technician starts new calculation
```

### Example 2: Error Recovery (Technician)

```
1. Technician enters "Lisnopril" (typo)
   ↓
2. Clicks "Calculate"
   ↓
3. System calls RxNorm API
   ↓
4. RxNorm returns "No match found"
   ↓
5. System displays error: "No match found for 'Lisnopril'"
   ↓
6. Technician clicks "Retry with different spelling"
   ↓
7. Technician corrects to "Lisinopril"
   ↓
8. Clicks "Calculate" again
   ↓
9. Calculation succeeds
   ↓
10. Results displayed
```

### Example 3: Inactive NDC Warning (Pharmacist)

```
1. Pharmacist enters NDC directly: "99999-888-60"
   ↓
2. System fetches from FDA API
   ↓
3. System detects: NDC is inactive (discontinued)
   ↓
4. System displays warning immediately:
   "🟠 Warning: This NDC is inactive (discontinued 2024-12-01)"
   ↓
5. System shows alternative active NDCs
   ↓
6. Pharmacist selects alternative active NDC
   ↓
7. Pharmacist enters SIG and days supply
   ↓
8. Calculation proceeds with active NDC
   ↓
9. Pharmacist reviews results
   ↓
10. Pharmacist marks as "Verified"
```

---

## Connection Points Between Features

### Feature Dependencies

1. **Input → Calculation**
   - Input validation must pass before calculation starts
   - Different input paths (drug name vs NDC) trigger different calculation flows

2. **Calculation → Results**
   - Calculation success/failure determines results display
   - Warnings from calculation appear in results section

3. **Results → Export**
   - Export requires successful results
   - Export format determines data structure

4. **Results → Edit/Recalculate**
   - Results display includes edit capability
   - Editing triggers new calculation cycle

5. **Authentication → All Features**
   - All features require authenticated session
   - Role determines available actions

### Data Flow

```
User Input
  ↓
Validation Layer
  ↓
API Integration Layer (RxNorm, FDA)
  ↓
Calculation Engine
  ↓
Results Assembly
  ↓
UI Display
  ↓
User Actions (Edit, Export, Verify)
  ↓
[Loop back to Validation or Exit]
```

---

## Notes for Implementation

1. **Performance Targets:**
   - Calculation should complete in <2 seconds
   - Implement API response caching
   - Show loading states for all async operations

2. **Accessibility:**
   - All error messages must be screen-reader accessible
   - Color coding should have text alternatives
   - Keyboard navigation support throughout

3. **Responsive Design:**
   - Optimize for desktop and tablet
   - Results should be readable on smaller screens
   - Export buttons should be easily accessible

4. **Audit Trail:**
   - Log all calculations with user ID and timestamp
   - Log all verification actions
   - Store error events for future analysis

5. **Session Management:**
   - Handle session expiration gracefully
   - Auto-save draft inputs (optional, Phase 2)
   - Clear sensitive data on logout

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-27 | 1.0 | Initial user flow documentation | System |

---

**End of Document**

