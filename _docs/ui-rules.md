# UI Design Rules

**Project:** NDC Packaging & Quantity Calculator (QuantRx)  
**Version:** MVP  
**Last Updated:** 2025-01-27

---

## Overview

This document defines the UI design principles and rules for the QuantRx application. These rules ensure a consistent, accessible, and professional user experience optimized for pharmacy technicians and pharmacists.

---

## Core Design Principles

### 1. Clarity First
**Rule:** Every element must serve a clear purpose. Remove unnecessary decoration.

**Implementation:**
- Use clear, descriptive labels for all inputs and actions
- Display only essential information; hide details behind progressive disclosure
- Use whitespace generously to separate content sections
- Avoid visual clutter that distracts from prescription data

**Why:** Pharmacy technicians need to quickly understand prescription information without cognitive overhead. Errors in prescription calculations have serious consequences.

### 2. Error Prevention & Visibility
**Rule:** Warnings and errors must be impossible to miss. Use multiple visual cues (color, icon, position, text).

**Implementation:**
- Inactive NDC warnings displayed immediately upon detection
- Status indicators use color + icon + text label (never color alone)
- Validation errors appear inline, near the field
- Critical warnings appear at top of results section
- Use consistent warning/error styling throughout

**Why:** Highlighting inactive NDCs and quantity mismatches prevents claim rejections and patient safety issues.

### 3. Information Hierarchy
**Rule:** Most important information must be most prominent. Use size, position, color, and contrast to establish hierarchy.

**Implementation:**
- Primary recommendation (best NDC match) is largest and most prominent
- Alternative options are secondary in size and position
- Warnings section always visible when present, positioned prominently
- Supporting details (metadata, timestamps) are smaller and less prominent
- Use visual weight (bold, size, color) to guide eye flow

**Why:** In busy pharmacy environments, users need to find answers quickly without scanning through irrelevant information.

### 4. Consistency
**Rule:** Similar elements must look and behave the same way throughout the application.

**Implementation:**
- Buttons of the same type (primary, secondary) look identical everywhere
- Form fields use consistent styling and spacing
- Error messages follow the same format and placement
- Status badges use consistent colors and icons
- Navigation patterns remain predictable

**Why:** Consistency reduces learning curve, builds user confidence, and prevents errors from unexpected interface behavior.

### 5. Accessibility (WCAG 2.1 AA Minimum)
**Rule:** All users must be able to access and use the application, regardless of abilities.

**Implementation:**
- Color contrast ratios meet WCAG AA (4.5:1) or AAA (7:1) standards
- Color is never the only indicator (always include icons or text)
- All interactive elements are keyboard accessible
- Focus indicators are clearly visible (2px outline minimum)
- Screen reader support with proper ARIA labels
- Text resizable up to 200% without breaking layout

**Why:** Legal requirement (ADA compliance) and ethical necessity for inclusive healthcare tools. Many pharmacy staff may have visual or motor differences.

### 6. Responsive Design
**Rule:** Application must work effectively on desktop (1024px+) and tablet (768px-1023px) devices.

**Implementation:**
- Desktop: Multi-column layouts, side-by-side forms and results
- Tablet: Optimized single-column or two-column layouts
- Touch targets minimum 44x44px for tablet use
- Text remains readable at all screen sizes (minimum 14px)
- Forms adapt to available width without horizontal scrolling

**Why:** Pharmacy staff use both desktop computers and tablets. The interface must work efficiently on both.

---

## Component Design Rules

### Forms

#### Input Fields
- **Label Position:** Always above input field (not inline)
- **Label Style:** 14px, medium weight, dark gray (#424242)
- **Input Height:** Minimum 56px for touch targets on tablet
- **Input Padding:** 16px horizontal, 12px vertical
- **Border:** 1px solid #E0E0E0 (light gray) when default
- **Border Radius:** 4px (subtle rounding)
- **Focus State:** 2px solid #1976D2 (primary blue), clear outline
- **Error State:** Red border (#F44336), error icon, error message below
- **Helper Text:** 12px, gray (#757575), below input
- **Required Indicator:** Asterisk (*) in red, after label text

#### Form Layout
- **Field Spacing:** 24px vertical spacing between fields
- **Grouping:** Related fields grouped with 16px spacing, separated by 32px from other groups
- **Form Width:** Maximum 600px on desktop, full width on tablet
- **Alignment:** Left-align labels and inputs (not centered)

#### Validation
- **Real-time Validation:** Validate on blur (not on every keystroke)
- **Error Display:** Show errors immediately after field loses focus
- **Error Message:** Clear, actionable message (e.g., "NDC must be 11 digits")
- **Success State:** Optional green checkmark for successfully validated fields

### Buttons

#### Button Types
- **Primary Button:** Solid background, primary color (#1976D2), white text
  - Use for: "Calculate", "Export", "Mark as Verified"
  - Height: 48px minimum
  - Padding: 16px 24px
- **Secondary Button:** Outlined style, primary color border, transparent background
  - Use for: "Cancel", "Clear", "Start New Calculation"
  - Height: 48px minimum
  - Padding: 16px 24px
- **Text Button:** Text only, no border or background
  - Use for: "Edit", "Select Alternative", tertiary actions
  - Height: 40px minimum
  - Padding: 8px 16px

#### Button States
- **Default:** Normal appearance
- **Hover:** Slightly darker/lighter shade, cursor pointer
- **Active/Pressed:** Further shade change, visual feedback
- **Disabled:** 38% opacity, not clickable, cursor not-allowed
- **Loading:** Spinner icon replaces text, button disabled

#### Button Placement
- **Primary Action:** Right-aligned or centered, most prominent position
- **Secondary Actions:** Left of primary, or below primary on mobile
- **Destructive Actions:** Red color, require confirmation
- **Spacing:** 16px between buttons

### Cards & Containers

#### Card Design
- **Background:** White (#FFFFFF)
- **Border:** 1px solid #E0E0E0 (subtle border)
- **Border Radius:** 4px
- **Padding:** 24px internal padding
- **Shadow:** Subtle elevation (MUI elevation 1-2)
- **Spacing:** 16px margin between cards

#### Card Hierarchy
- **Primary Card (Recommended NDC):** 
  - Slightly larger padding (32px)
  - Blue accent border (left border, 4px)
  - More prominent shadow (elevation 2)
- **Secondary Cards (Alternatives):**
  - Standard card styling
  - Standard padding (24px)
  - Standard shadow (elevation 1)

### Status Indicators

#### Status Badges
- **Active/Verified:** Green background (#4CAF50), white text, checkmark icon
- **Warning/Inactive:** Orange background (#FF9800), white text, warning icon
- **Error/Critical:** Red background (#F44336), white text, error icon
- **Pending:** Gray background (#757575), white text, clock icon

#### Badge Design
- **Shape:** Pill-shaped (rounded corners)
- **Size:** Height 24px, padding 8px 12px
- **Typography:** 12px, medium weight, uppercase
- **Icon:** 16px icon, 4px spacing from text

### Alerts & Warnings

#### Alert Types
- **Error Alert:** Red background tint (#FFEBEE), red border, red icon, dark text
- **Warning Alert:** Orange background tint (#FFF3E0), orange border, orange icon, dark text
- **Info Alert:** Blue background tint (#E3F2FD), blue border, blue icon, dark text
- **Success Alert:** Green background tint (#E8F5E9), green border, green icon, dark text

#### Alert Design
- **Layout:** Icon (left) + Message (center) + Dismiss (right, optional)
- **Padding:** 16px
- **Border:** 1px solid, left border accent (4px width)
- **Spacing:** 16px margin between alerts
- **Position:** Top of results section, always visible when present

### Data Display

#### Tables
- **Header:** Dark background (#F5F5F5), bold text, 14px
- **Rows:** Alternating row colors (white and #FAFAFA)
- **Cell Padding:** 16px horizontal, 12px vertical
- **Borders:** 1px solid #E0E0E0 between rows
- **Text Alignment:** Left-align text, right-align numbers
- **Hover State:** Light background tint on row hover

#### Lists
- **Spacing:** 8px between list items
- **Bullets/Icons:** 16px icon, 8px spacing from text
- **Nested Lists:** 16px left indent, smaller font size

### Typography Hierarchy

#### Headings
- **H1 (Page Title):** 32px, bold, dark gray (#212121), 40px line height
- **H2 (Section Headers):** 24px, semi-bold, dark gray (#212121), 32px line height
- **H3 (Card Titles):** 20px, semi-bold, dark gray (#212121), 28px line height
- **H4 (Subsection):** 18px, medium, dark gray (#424242), 24px line height

#### Body Text
- **Body Large:** 16px, regular, dark gray (#424242), 24px line height
- **Body:** 14px, regular, dark gray (#424242), 20px line height
- **Body Small:** 12px, regular, medium gray (#757575), 18px line height

#### Special Text
- **NDC Codes:** 14px, monospace font, medium weight
- **Numbers/Quantities:** 16px, regular, dark gray
- **Labels:** 12px, medium weight, medium gray (#757575)
- **Helper Text:** 12px, regular, light gray (#9E9E9E)

---

## Layout Rules

### Page Structure
- **Container Width:** Maximum 1200px on desktop, centered
- **Content Padding:** 24px on desktop, 16px on tablet
- **Section Spacing:** 32px between major sections
- **Card Spacing:** 16px between cards

### Grid System
- **Desktop:** 12-column grid, 24px gutters
- **Tablet:** 8-column grid, 16px gutters
- **Mobile:** 4-column grid, 16px gutters

### Responsive Breakpoints
- **Mobile:** < 600px (single column, stacked)
- **Tablet:** 600px - 960px (two columns where appropriate)
- **Desktop:** > 960px (full multi-column layout)

### Single-Page Workflow
- **Input Section:** Top of page, always visible
- **Results Section:** Below input, appears after calculation
- **No Page Navigation:** All content on one page, scroll to view
- **Sticky Elements:** Optional sticky header with user info/logout

---

## Interaction Rules

### Loading States
- **Spinner:** Circular progress indicator, primary color
- **Skeleton Screens:** Gray placeholder boxes matching content layout
- **Button Loading:** Spinner replaces button text, button disabled
- **Duration:** Show loading immediately, hide when complete

### Feedback
- **Success:** Green checkmark icon, brief message (3-5 seconds)
- **Error:** Red error icon, persistent until user dismisses or fixes
- **Warning:** Orange warning icon, persistent until addressed
- **Info:** Blue info icon, dismissible

### Transitions
- **Duration:** 200-300ms for all transitions
- **Easing:** Ease-in-out for smooth feel
- **Properties:** Use transform and opacity (GPU-accelerated)
- **Respect Preferences:** Honor `prefers-reduced-motion` media query

### Hover States
- **Buttons:** Slightly darker/lighter shade
- **Links:** Underline on hover, color change
- **Cards:** Subtle elevation increase (shadow)
- **Table Rows:** Light background tint

### Focus States
- **Outline:** 2px solid primary blue (#1976D2)
- **Offset:** 2px offset from element
- **Always Visible:** Never remove focus indicators
- **Keyboard Only:** Show focus on keyboard navigation, hide on mouse (optional enhancement)

---

## Accessibility Rules

### Color Contrast
- **Normal Text:** Minimum 4.5:1 contrast ratio (WCAG AA)
- **Large Text (18px+):** Minimum 3:1 contrast ratio (WCAG AA)
- **UI Components:** Minimum 3:1 contrast ratio (WCAG AA)
- **Target:** 7:1 contrast ratio for body text (WCAG AAA)

### Color Usage
- **Never Color Alone:** Always combine color with icon or text label
- **Status Indicators:** Use color + icon + text (e.g., "Active" badge with green + checkmark + "ACTIVE" text)
- **Error States:** Red border + error icon + error message text

### Keyboard Navigation
- **Tab Order:** Logical, sequential order through all interactive elements
- **Skip Links:** Skip to main content link at top of page
- **Focus Indicators:** Always visible, 2px outline minimum
- **Keyboard Shortcuts:** 
  - Enter: Submit form
  - Escape: Close modals, clear selections
  - Tab: Navigate forward
  - Shift+Tab: Navigate backward

### Screen Reader Support
- **ARIA Labels:** All interactive elements have descriptive labels
- **Form Labels:** Properly associated with inputs using `htmlFor`/`id`
- **Error Announcements:** Error messages announced when they appear
- **Status Updates:** Status changes announced (e.g., "Calculation complete")
- **Landmarks:** Use semantic HTML and ARIA landmarks (header, main, nav, footer)

### Touch Targets
- **Minimum Size:** 44x44px for all interactive elements
- **Spacing:** 8px minimum spacing between touch targets
- **Tablet Optimization:** Larger touch targets on tablet (48x48px preferred)

### Text Resizing
- **Responsive:** Layout adapts to text size up to 200%
- **No Horizontal Scroll:** Content reflows, no horizontal scrolling
- **Readable:** Text remains readable at all sizes

---

## Responsive Design Rules

### Desktop (1024px+)
- **Layout:** Multi-column, side-by-side where appropriate
- **Forms:** Maximum 600px width, centered or left-aligned
- **Results:** Can display alongside form or below
- **Navigation:** Horizontal top navigation
- **Touch Targets:** 44x44px minimum (mouse precision allows smaller)

### Tablet (768px - 1023px)
- **Layout:** Two-column where helpful, single-column for forms
- **Forms:** Full width or maximum 500px
- **Results:** Stacked below form
- **Navigation:** Horizontal top navigation or hamburger menu
- **Touch Targets:** 48x48px minimum (larger for easier touch)

### Tablet Portrait (600px - 767px)
- **Layout:** Primarily single-column
- **Forms:** Full width with 16px padding
- **Results:** Full width cards, stacked
- **Navigation:** Hamburger menu or bottom navigation
- **Touch Targets:** 48x48px minimum

### Mobile (< 600px)
- **Layout:** Single-column, stacked
- **Forms:** Full width, larger input fields
- **Results:** Full width cards
- **Navigation:** Bottom navigation or hamburger menu
- **Touch Targets:** 48x48px minimum

---

## Error Handling Rules

### Error Display
- **Inline Errors:** Display below input field, red text, error icon
- **Form-Level Errors:** Display at top of form, alert style
- **API Errors:** Display in alert at top of results section
- **Recovery Options:** Always provide clear path to fix error

### Error Messages
- **Clear Language:** Use plain language, avoid technical jargon
- **Actionable:** Tell user what to do to fix the error
- **Specific:** Identify the exact problem (e.g., "NDC must be 11 digits" not "Invalid format")
- **Helpful:** Provide examples or suggestions when helpful

### Error Prevention
- **Real-time Validation:** Validate as user types (on blur, not every keystroke)
- **Format Hints:** Show format examples (e.g., "Format: 12345-678-90")
- **Required Indicators:** Clearly mark required fields with asterisk
- **Disabled States:** Disable submit button until form is valid

---

## Performance Rules

### Loading Performance
- **Initial Load:** < 3 seconds on 3G connection
- **Interaction Response:** < 100ms for UI interactions
- **API Calls:** Show loading state immediately, complete within 2 seconds
- **Progressive Loading:** Load critical content first, non-critical content after

### Visual Performance
- **Image Optimization:** Use Next.js Image component, optimize all images
- **Lazy Loading:** Lazy load below-the-fold content
- **Code Splitting:** Split code by route, load only what's needed
- **Animation Performance:** Use CSS transforms, avoid layout-triggering properties

---

## Content Rules

### Language & Tone
- **Professional:** Use professional, clinical language
- **Clear:** Avoid jargon, use plain language when possible
- **Concise:** Be brief but complete
- **Action-Oriented:** Use action verbs for buttons ("Calculate", "Export", "Verify")

### Labels & Instructions
- **Descriptive:** Labels clearly describe what the field is for
- **Contextual Help:** Provide helper text for complex fields
- **Examples:** Show format examples for structured inputs (NDC, dates)
- **Consistent:** Use same terminology throughout (e.g., always "NDC" not "NDC code")

### Empty States
- **Helpful:** Explain what the user should do
- **Actionable:** Provide clear call-to-action
- **Friendly:** Professional but approachable tone

---

## Component-Specific Rules

### Calculation Form
- **Field Order:** Drug Name/NDC → SIG → Days Supply → Calculate button
- **Field Width:** Full width on mobile/tablet, maximum 600px on desktop
- **Button Placement:** Calculate button below all fields, full width on mobile
- **Validation:** Real-time validation, errors below each field

### Results Display
- **Primary Recommendation:** Most prominent card, blue accent border
- **Alternatives:** Secondary cards, less prominent
- **Warnings:** Alert section at top of results, always visible
- **Actions:** Export and action buttons at bottom of results section

### Status Badges
- **Position:** Top-right of card or inline with label
- **Size:** 24px height, appropriate width for text
- **Icon + Text:** Always include both icon and text label

### Export Buttons
- **Position:** Top-right of results section or bottom of results card
- **Style:** Secondary button (outlined) with icon
- **Dropdown:** Use Menu component for format selection (JSON, CSV, PDF)

---

## Testing Rules

### Visual Testing
- **Browser Testing:** Test in Chrome, Firefox, Safari, Edge
- **Device Testing:** Test on actual desktop and tablet devices
- **Resolution Testing:** Test at common resolutions (1920x1080, 1366x768, 1024x768)

### Accessibility Testing
- **Screen Reader:** Test with NVDA (Windows) and VoiceOver (Mac)
- **Keyboard Navigation:** Test complete keyboard navigation flow
- **Color Contrast:** Verify all text meets contrast requirements
- **Focus Indicators:** Verify all interactive elements have visible focus

### Responsive Testing
- **Breakpoints:** Test at each breakpoint (600px, 768px, 960px, 1024px)
- **Orientation:** Test tablet in portrait and landscape
- **Touch Targets:** Verify all interactive elements meet size requirements

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-27 | 1.0 | Initial UI design rules | System |

---

**End of Document**

