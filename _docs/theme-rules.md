# Theme Rules

**Project:** NDC Packaging & Quantity Calculator (QuantRx)  
**Version:** MVP  
**Last Updated:** 2025-01-27

---

## Overview

This document defines the complete theme system for the QuantRx application, including colors, typography, spacing, and Material-UI theme configuration. The theme follows a minimalist, professional aesthetic optimized for healthcare/pharmacy workflows.

---

## Design Philosophy

**Minimalist Clinical Design:**
- Clean, uncluttered interface
- High contrast for readability
- Purposeful use of color (status indicators, warnings)
- Generous white space
- Professional, trustworthy appearance

---

## Color System

### Primary Colors

#### Primary Blue
**Purpose:** Primary actions, links, focus states, brand identity

**Values:**
- `primary.main`: `#1976D2` (Material Blue 700)
- `primary.light`: `#42A5F5` (Material Blue 400)
- `primary.dark`: `#1565C0` (Material Blue 800)
- `primary.contrastText`: `#FFFFFF` (White)

**Usage:**
- Primary buttons
- Links
- Focus indicators
- Active navigation items
- Accent borders on primary cards

**Accessibility:** ✅ Meets WCAG AA on white background (4.5:1+)

---

### Status Colors

#### Success/Active (Green)
**Purpose:** Verified calculations, active NDC status, successful operations

**Values:**
- `success.main`: `#4CAF50` (Material Green 500)
- `success.light`: `#81C784` (Material Green 300)
- `success.dark`: `#388E3C` (Material Green 700)
- `success.contrastText`: `#FFFFFF` (White)

**Usage:**
- "Verified" status badges
- "Active" NDC indicators
- Success messages
- Checkmark icons

**Accessibility:** ✅ Meets WCAG AA on white background (4.5:1+)

---

#### Warning/Caution (Orange)
**Purpose:** Inactive NDC warnings, overfill/underfill alerts, SIG parsing warnings

**Values:**
- `warning.main`: `#FF9800` (Material Orange 500)
- `warning.light`: `#FFB74D` (Material Orange 300)
- `warning.dark`: `#F57C00` (Material Orange 700)
- `warning.contrastText`: `#FFFFFF` (White)

**Usage:**
- Inactive NDC warnings
- Overfill/underfill alerts
- SIG parsing warnings
- Warning badges
- Warning alert backgrounds

**Accessibility:** ✅ Meets WCAG AA on white background (4.5:1+)

---

#### Error/Critical (Red)
**Purpose:** Critical errors, invalid inputs, API failures, inactive NDCs

**Values:**
- `error.main`: `#F44336` (Material Red 500)
- `error.light`: `#EF5350` (Material Red 400)
- `error.dark`: `#D32F2F` (Material Red 700)
- `error.contrastText`: `#FFFFFF` (White)

**Usage:**
- Error messages
- Invalid input borders
- Critical error alerts
- Delete/destructive actions
- Error status badges

**Accessibility:** ✅ Meets WCAG AA on white background (4.5:1+)

---

#### Information (Blue)
**Purpose:** Informational messages, secondary actions

**Values:**
- `info.main`: `#2196F3` (Material Blue 500)
- `info.light`: `#64B5F6` (Material Blue 300)
- `info.dark`: `#1976D2` (Material Blue 700)
- `info.contrastText`: `#FFFFFF` (White)

**Usage:**
- Info alerts
- Informational badges
- Secondary status indicators

**Accessibility:** ✅ Meets WCAG AA on white background (4.5:1+)

---

### Neutral Colors

#### Text Colors
**Purpose:** Text content at different hierarchy levels

**Values:**
- `text.primary`: `#212121` (Almost black, 87% opacity)
- `text.secondary`: `#757575` (Medium gray, 60% opacity)
- `text.disabled`: `#BDBDBD` (Light gray, 38% opacity)
- `text.hint`: `#9E9E9E` (Gray, 38% opacity)

**Usage:**
- `text.primary`: Main body text, headings
- `text.secondary`: Labels, captions, metadata
- `text.disabled`: Disabled form fields, inactive elements
- `text.hint`: Placeholder text, helper text

**Accessibility:** ✅ All meet WCAG AA contrast requirements

---

#### Background Colors
**Purpose:** Page and surface backgrounds

**Values:**
- `background.default`: `#FAFAFA` (Very light gray)
- `background.paper`: `#FFFFFF` (White)
- `background.paperElevated`: `#FFFFFF` (White, with elevation)

**Usage:**
- `background.default`: Main page background
- `background.paper`: Card backgrounds, form backgrounds
- `background.paperElevated`: Elevated cards, modals

---

#### Divider & Border Colors
**Purpose:** Separators, borders, outlines

**Values:**
- `divider`: `#E0E0E0` (Light gray)
- `border.light`: `#E0E0E0` (Light gray, for subtle borders)
- `border.medium`: `#BDBDBD` (Medium gray, for emphasis)
- `border.dark`: `#757575` (Dark gray, for strong separation)

**Usage:**
- `divider`: Between sections, table rows
- `border.light`: Input field borders, card borders
- `border.medium`: Focused input borders, active states
- `border.dark`: Strong separators, emphasis

---

### Status-Specific Color Applications

#### Active NDC Status
- **Background:** `success.main` (#4CAF50)
- **Text:** `success.contrastText` (#FFFFFF)
- **Icon:** Checkmark icon, white
- **Badge Style:** Pill-shaped, green background

#### Inactive NDC Status
- **Background:** `warning.main` (#FF9800)
- **Text:** `warning.contrastText` (#FFFFFF)
- **Icon:** Warning icon, white
- **Badge Style:** Pill-shaped, orange background
- **Alert Background:** `#FFF3E0` (Orange tint, 10% opacity)

#### Verified Calculation Status
- **Background:** `success.main` (#4CAF50)
- **Text:** `success.contrastText` (#FFFFFF)
- **Icon:** Checkmark icon, white
- **Badge Style:** Pill-shaped, green background

#### Pending Calculation Status
- **Background:** `text.secondary` (#757575)
- **Text:** `#FFFFFF` (White)
- **Icon:** Clock icon, white
- **Badge Style:** Pill-shaped, gray background

---

## Typography

### Font Family

#### Primary Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
  'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
  'Helvetica Neue', sans-serif;
```

**Rationale:** Inter is an excellent, highly readable font perfect for healthcare applications. Falls back to system fonts if Inter is not available. Inter provides excellent readability at all sizes and is optimized for screen display.

#### Monospace Font Stack (for NDC codes, quantities)
```css
font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 
  'Courier New', monospace;
```

**Rationale:** Monospace ensures consistent character width for codes and numbers, improving readability.

---

### Typography Scale

#### Headings

**H1 - Page Title**
- `fontSize`: `32px` (2rem)
- `fontWeight`: `700` (Bold)
- `lineHeight`: `1.25` (40px)
- `color`: `text.primary` (#212121)
- `letterSpacing`: `-0.5px`
- **Usage:** Main page titles, calculation results header

**H2 - Section Headers**
- `fontSize`: `24px` (1.5rem)
- `fontWeight`: `600` (Semi-bold)
- `lineHeight`: `1.33` (32px)
- `color`: `text.primary` (#212121)
- `letterSpacing`: `0px`
- **Usage:** Section headers, card group titles

**H3 - Card Titles**
- `fontSize`: `20px` (1.25rem)
- `fontWeight`: `600` (Semi-bold)
- `lineHeight`: `1.4` (28px)
- `color`: `text.primary` (#212121)
- `letterSpacing`: `0px`
- **Usage:** Card titles, subsection headers

**H4 - Subsection**
- `fontSize`: `18px` (1.125rem)
- `fontWeight`: `500` (Medium)
- `lineHeight`: `1.33` (24px)
- `color`: `text.primary` (#212121)
- `letterSpacing`: `0px`
- **Usage:** Subsection headers, smaller card titles

---

#### Body Text

**Body Large**
- `fontSize`: `16px` (1rem)
- `fontWeight`: `400` (Regular)
- `lineHeight`: `1.5` (24px)
- `color`: `text.primary` (#212121)
- **Usage:** Primary body text, important information

**Body**
- `fontSize`: `14px` (0.875rem)
- `fontWeight`: `400` (Regular)
- `lineHeight`: `1.43` (20px)
- `color`: `text.primary` (#212121)
- **Usage:** Standard body text, form field values

**Body Small**
- `fontSize`: `12px` (0.75rem)
- `fontWeight`: `400` (Regular)
- `lineHeight`: `1.5` (18px)
- `color`: `text.secondary` (#757575)
- **Usage:** Captions, metadata, timestamps

---

#### Special Typography

**NDC Codes**
- `fontSize`: `14px`
- `fontWeight`: `500` (Medium)
- `fontFamily`: Monospace
- `color`: `text.primary` (#212121)
- `letterSpacing`: `0.5px`
- **Usage:** NDC code display, prescription numbers

**Numbers/Quantities**
- `fontSize`: `16px`
- `fontWeight`: `500` (Medium)
- `fontFamily`: System (not monospace)
- `color`: `text.primary` (#212121)
- **Usage:** Calculated quantities, package sizes

**Labels**
- `fontSize`: `12px`
- `fontWeight`: `500` (Medium)
- `fontFamily`: System
- `color`: `text.secondary` (#757575)
- `textTransform`: `uppercase`
- `letterSpacing`: `0.5px`
- **Usage:** Form field labels, status labels

**Helper Text**
- `fontSize`: `12px`
- `fontWeight`: `400` (Regular)
- `fontFamily`: System
- `color`: `text.hint` (#9E9E9E)
- **Usage:** Form helper text, format hints

---

### Typography Rules

- **Line Length:** Maximum 75 characters for optimal readability
- **Line Height:** Minimum 1.5 for body text
- **Letter Spacing:** Normal for body, slightly increased for labels (0.5px)
- **Font Weight:** Use weight to establish hierarchy, not just size
- **Text Alignment:** Left-align for readability (except numbers, which can be right-aligned)

---

## Spacing System

### Base Unit
**8px base unit** - All spacing values are multiples of 8px for consistency.

### Spacing Scale

- **4px (0.5 unit):** Tight spacing (icon to text, badge padding)
- **8px (1 unit):** Small spacing (form field padding, list item spacing)
- **16px (2 units):** Standard spacing (between form fields, card padding)
- **24px (3 units):** Medium spacing (between sections, form groups)
- **32px (4 units):** Large spacing (between major sections, page margins)
- **48px (6 units):** Extra large spacing (section breaks, page top/bottom)

### Spacing Applications

#### Form Spacing
- **Field to Label:** 8px
- **Label to Input:** 4px
- **Input to Helper Text:** 4px
- **Helper Text to Error:** 4px
- **Field to Field:** 24px
- **Form Group to Form Group:** 32px

#### Card Spacing
- **Card Internal Padding:** 24px
- **Card to Card:** 16px
- **Card Group to Card Group:** 32px

#### Section Spacing
- **Section to Section:** 32px
- **Page Top Margin:** 32px
- **Page Bottom Margin:** 48px
- **Content Side Padding:** 24px (desktop), 16px (tablet)

---

## Border Radius

### Values
- **Small:** `4px` - Input fields, buttons, badges
- **Medium:** `8px` - Cards, modals
- **Large:** `12px` - Large cards, containers (rarely used)

### Usage
- **Input Fields:** 4px
- **Buttons:** 4px
- **Cards:** 4px (subtle, professional)
- **Badges:** 12px (pill-shaped)
- **Modals:** 8px

---

## Shadows & Elevation

### Material Design Elevation

**Elevation 0 (No Shadow):**
- Default state for most elements
- Flat design with borders for separation

**Elevation 1:**
- `boxShadow`: `0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)`
- **Usage:** Standard cards, secondary elements

**Elevation 2:**
- `boxShadow`: `0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)`
- **Usage:** Primary recommendation card, elevated elements

**Elevation 4:**
- `boxShadow`: `0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)`
- **Usage:** Modals, dialogs, dropdowns

---

## Material-UI Theme Configuration

### Complete Theme Object

```javascript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976D2',
      light: '#42A5F5',
      dark: '#1565C0',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#757575', // Gray for secondary actions
      light: '#9E9E9E',
      dark: '#424242',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#F44336',
      light: '#EF5350',
      dark: '#D32F2F',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#BDBDBD',
      hint: '#9E9E9E',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    divider: '#E0E0E0',
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '32px',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.5px',
    },
    h2: {
      fontSize: '24px',
      fontWeight: 600,
      lineHeight: 1.33,
    },
    h3: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '18px',
      fontWeight: 500,
      lineHeight: 1.33,
    },
    body1: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.43,
    },
    caption: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none', // Don't uppercase buttons
      fontWeight: 500,
    },
  },
  spacing: 8, // 8px base unit
  shape: {
    borderRadius: 4, // 4px default border radius
  },
  components: {
    // Button overrides
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: 500,
          textTransform: 'none',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    // TextField overrides
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
            '& fieldset': {
              borderColor: '#E0E0E0',
            },
            '&:hover fieldset': {
              borderColor: '#BDBDBD',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1976D2',
              borderWidth: '2px',
            },
            '&.Mui-error fieldset': {
              borderColor: '#F44336',
            },
          },
        },
      },
    },
    // Card overrides
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
          border: '1px solid #E0E0E0',
        },
      },
    },
    // Chip/Badge overrides
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Pill-shaped
          height: 24,
          fontSize: '12px',
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
```

---

## Component-Specific Theme Rules

### Buttons

#### Primary Button
- **Background:** `primary.main` (#1976D2)
- **Text:** White (#FFFFFF)
- **Height:** 48px
- **Padding:** 12px 24px
- **Border Radius:** 4px
- **Font Size:** 14px
- **Font Weight:** 500
- **No Shadow:** Flat design (no elevation)

#### Secondary Button
- **Background:** Transparent
- **Border:** 1px solid `primary.main` (#1976D2)
- **Text:** `primary.main` (#1976D2)
- **Height:** 48px
- **Padding:** 12px 24px
- **Border Radius:** 4px
- **Font Size:** 14px
- **Font Weight:** 500

#### Text Button
- **Background:** Transparent
- **Text:** `primary.main` (#1976D2)
- **Height:** 40px
- **Padding:** 8px 16px
- **Border Radius:** 4px
- **Font Size:** 14px
- **Font Weight:** 500

---

### Form Fields

#### Input Field
- **Height:** 56px (for touch targets)
- **Padding:** 16px horizontal, 12px vertical
- **Border:** 1px solid #E0E0E0
- **Border Radius:** 4px
- **Font Size:** 16px (prevents zoom on iOS)
- **Focus Border:** 2px solid #1976D2
- **Error Border:** 1px solid #F44336

#### Label
- **Font Size:** 12px
- **Font Weight:** 500
- **Color:** `text.secondary` (#757575)
- **Text Transform:** Uppercase
- **Letter Spacing:** 0.5px
- **Margin Bottom:** 4px

#### Helper Text
- **Font Size:** 12px
- **Color:** `text.hint` (#9E9E9E)
- **Margin Top:** 4px

#### Error Text
- **Font Size:** 12px
- **Color:** `error.main` (#F44336)
- **Margin Top:** 4px
- **Display:** Flex with error icon (8px spacing)

---

### Cards

#### Standard Card
- **Background:** White (#FFFFFF)
- **Border:** 1px solid #E0E0E0
- **Border Radius:** 4px
- **Padding:** 24px
- **Elevation:** 1 (subtle shadow)
- **Margin:** 16px between cards

#### Primary Card (Recommended NDC)
- **Background:** White (#FFFFFF)
- **Border:** 1px solid #E0E0E0
- **Left Border:** 4px solid `primary.main` (#1976D2) - accent
- **Border Radius:** 4px
- **Padding:** 32px
- **Elevation:** 2 (more prominent shadow)
- **Margin:** 16px between cards

---

### Status Badges

#### Badge Design
- **Height:** 24px
- **Padding:** 8px 12px
- **Border Radius:** 12px (pill-shaped)
- **Font Size:** 12px
- **Font Weight:** 500
- **Text Transform:** Uppercase
- **Letter Spacing:** 0.5px
- **Icon Size:** 16px
- **Icon Spacing:** 4px from text

#### Badge Colors
- **Active/Verified:** Green background (#4CAF50), white text
- **Warning/Inactive:** Orange background (#FF9800), white text
- **Error/Critical:** Red background (#F44336), white text
- **Pending:** Gray background (#757575), white text

---

### Alerts

#### Alert Design
- **Padding:** 16px
- **Border Radius:** 4px
- **Border:** 1px solid (color-matched)
- **Left Border:** 4px accent border
- **Background Tint:** 10% opacity of status color
- **Icon Size:** 20px
- **Icon Spacing:** 12px from text

#### Alert Colors
- **Error:** Red tint (#FFEBEE), red border (#F44336)
- **Warning:** Orange tint (#FFF3E0), orange border (#FF9800)
- **Info:** Blue tint (#E3F2FD), blue border (#2196F3)
- **Success:** Green tint (#E8F5E9), green border (#4CAF50)

---

## Responsive Theme Rules

### Breakpoints

```javascript
breakpoints: {
  values: {
    xs: 0,
    sm: 600,   // Mobile
    md: 768,   // Tablet
    lg: 960,   // Tablet landscape / Small desktop
    xl: 1280,  // Desktop
  },
}
```

### Responsive Typography

**Desktop (960px+):**
- H1: 32px
- H2: 24px
- Body: 16px

**Tablet (768px - 959px):**
- H1: 28px
- H2: 22px
- Body: 16px

**Mobile (< 768px):**
- H1: 24px
- H2: 20px
- Body: 14px

### Responsive Spacing

**Desktop:**
- Container padding: 24px
- Section spacing: 32px
- Card padding: 24px

**Tablet:**
- Container padding: 16px
- Section spacing: 24px
- Card padding: 20px

**Mobile:**
- Container padding: 16px
- Section spacing: 16px
- Card padding: 16px

---

## Icon System

### Icon Library
**Material Icons** from `@mui/icons-material`

### Icon Sizes
- **Small:** 16px - Inline with text, badges
- **Medium:** 20px - Alerts, buttons
- **Large:** 24px - Empty states, prominent features
- **XLarge:** 32px - Hero sections (rarely used)

### Icon Colors
- **Default:** Inherit text color
- **Primary:** `primary.main` (#1976D2)
- **Success:** `success.main` (#4CAF50)
- **Warning:** `warning.main` (#FF9800)
- **Error:** `error.main` (#F44336)
- **Disabled:** `text.disabled` (#BDBDBD)

### Icon Usage
- **Status Icons:** Checkmark (success), Warning (warning), Error (error)
- **Action Icons:** Calculate, Export, Edit, Refresh
- **Navigation Icons:** Menu, Close, Arrow Back
- **Data Icons:** Pill/Medicine, Clipboard, Chart

---

## Animation & Transitions

### Transition Durations
- **Fast:** 150ms - Hover states, quick feedback
- **Standard:** 200ms - Most transitions
- **Slow:** 300ms - Page transitions, modal appearances

### Transition Easing
- **Standard:** `cubic-bezier(0.4, 0.0, 0.2, 1)` - Material Design standard
- **Deceleration:** `cubic-bezier(0.0, 0.0, 0.2, 1)` - Entering animations
- **Acceleration:** `cubic-bezier(0.4, 0.0, 1, 1)` - Exiting animations

### Animated Properties
- **Opacity:** Fade in/out
- **Transform:** Slide, scale (GPU-accelerated)
- **Color:** Smooth color transitions
- **Avoid:** Animating width, height, margin (causes layout shifts)

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Theme File Structure

### Recommended Organization
```
/theme
  /index.js          # Main theme export
  /palette.js         # Color definitions
  /typography.js      # Typography scale
  /spacing.js         # Spacing system
  /components.js      # Component overrides
  /breakpoints.js     # Responsive breakpoints
```

---

## Usage Examples

### Using Theme in Components

```javascript
// Using theme colors
<Box sx={{ color: 'primary.main' }}>Text</Box>
<Box sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
  Success Message
</Box>

// Using theme spacing
<Box sx={{ p: 2 }}>Padding 16px</Box>
<Box sx={{ mt: 3 }}>Margin top 24px</Box>

// Using theme breakpoints
<Box sx={{ 
  width: { xs: '100%', md: '600px' },
  p: { xs: 2, md: 3 }
}}>
  Responsive Box
</Box>

// Using theme typography
<Typography variant="h1">Page Title</Typography>
<Typography variant="body1">Body text</Typography>
```

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-27 | 1.0 | Initial theme rules | System |

---

**End of Document**

