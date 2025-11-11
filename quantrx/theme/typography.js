/**
 * Material-UI Typography Configuration
 *
 * Typography scale for the QuantRx application based on theme-rules.md.
 * Uses Inter font family with a professional, readable scale.
 *
 * @module theme/typography
 */

export const typography = {
  // Font Family Stack
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

  // Monospace Font Stack (for NDC codes, numbers)
  fontFamilyMonospace: [
    '"SF Mono"',
    'Monaco',
    '"Cascadia Code"',
    '"Roboto Mono"',
    '"Courier New"',
    'monospace',
  ].join(','),

  // Headings Scale
  h1: {
    fontSize: '32px',     // 2rem
    fontWeight: 700,      // Bold
    lineHeight: 1.25,     // 40px
    letterSpacing: '-0.5px',
    color: '#212121',     // text.primary
  },

  h2: {
    fontSize: '24px',     // 1.5rem
    fontWeight: 600,      // Semi-bold
    lineHeight: 1.33,     // 32px
    letterSpacing: '0px',
    color: '#212121',     // text.primary
  },

  h3: {
    fontSize: '20px',     // 1.25rem
    fontWeight: 600,      // Semi-bold
    lineHeight: 1.4,      // 28px
    letterSpacing: '0px',
    color: '#212121',     // text.primary
  },

  h4: {
    fontSize: '18px',     // 1.125rem
    fontWeight: 500,      // Medium
    lineHeight: 1.33,     // 24px
    letterSpacing: '0px',
    color: '#212121',     // text.primary
  },

  // Body Text
  body1: {
    fontSize: '16px',     // 1rem
    fontWeight: 400,      // Regular
    lineHeight: 1.5,      // 24px
    color: '#212121',     // text.primary
  },

  body2: {
    fontSize: '14px',     // 0.875rem
    fontWeight: 400,      // Regular
    lineHeight: 1.43,     // 20px
    color: '#212121',     // text.primary
  },

  // Small Text
  caption: {
    fontSize: '12px',     // 0.75rem
    fontWeight: 400,      // Regular
    lineHeight: 1.5,      // 18px
    color: '#757575',     // text.secondary
  },

  // Button Text
  button: {
    fontSize: '14px',
    fontWeight: 500,      // Medium
    lineHeight: 1.4,
    letterSpacing: '0.5px',
    textTransform: 'none', // Don't uppercase buttons
  },

  // Special Typography Variants
  ndc: {
    fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", "Courier New", monospace',
    fontSize: '14px',
    fontWeight: 500,      // Medium
    letterSpacing: '0.5px',
    color: '#212121',     // text.primary
  },

  quantity: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '16px',
    fontWeight: 500,      // Medium
    color: '#212121',     // text.primary
  },

  label: {
    fontSize: '12px',
    fontWeight: 500,      // Medium
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: '#757575',     // text.secondary
  },

  helper: {
    fontSize: '12px',
    fontWeight: 400,      // Regular
    color: '#9E9E9E',      // text.hint
  },

  // Overline (for small caps labels)
  overline: {
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: '#757575',     // text.secondary
  },
};
