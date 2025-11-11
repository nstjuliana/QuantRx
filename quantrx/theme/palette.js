/**
 * Material-UI Palette Configuration
 *
 * Color definitions for the QuantRx application based on theme-rules.md.
 * Implements primary blue, status colors (success/warning/error), and neutral colors.
 *
 * @module theme/palette
 */

export const palette = {
  mode: 'light',

  // Primary Colors - Primary Blue (#1976D2)
  primary: {
    main: '#1976D2',      // Material Blue 700 - primary actions, links, focus
    light: '#42A5F5',     // Material Blue 400 - hover states
    dark: '#1565C0',      // Material Blue 800 - pressed states
    contrastText: '#FFFFFF', // White text on primary
  },

  // Secondary Colors - Gray for secondary actions
  secondary: {
    main: '#757575',      // Medium gray for secondary actions
    light: '#9E9E9E',     // Light gray
    dark: '#424242',      // Dark gray
    contrastText: '#FFFFFF', // White text
  },

  // Status Colors - Success (#4CAF50)
  success: {
    main: '#4CAF50',      // Material Green 500 - verified, active status
    light: '#81C784',     // Material Green 300 - light variant
    dark: '#388E3C',      // Material Green 700 - dark variant
    contrastText: '#FFFFFF', // White text
  },

  // Warning Colors - Orange (#FF9800)
  warning: {
    main: '#FF9800',      // Material Orange 500 - warnings, inactive NDCs
    light: '#FFB74D',     // Material Orange 300 - light variant
    dark: '#F57C00',      // Material Orange 700 - dark variant
    contrastText: '#FFFFFF', // White text
  },

  // Error Colors - Red (#F44336)
  error: {
    main: '#F44336',      // Material Red 500 - errors, critical issues
    light: '#EF5350',     // Material Red 400 - light variant
    dark: '#D32F2F',      // Material Red 700 - dark variant
    contrastText: '#FFFFFF', // White text
  },

  // Information Colors - Blue (#2196F3)
  info: {
    main: '#2196F3',      // Material Blue 500 - informational messages
    light: '#64B5F6',     // Material Blue 300 - light variant
    dark: '#1976D2',      // Material Blue 700 - dark variant
    contrastText: '#FFFFFF', // White text
  },

  // Text Colors
  text: {
    primary: '#212121',   // Almost black (87% opacity) - main text
    secondary: '#757575', // Medium gray (60% opacity) - labels, metadata
    disabled: '#BDBDBD',  // Light gray (38% opacity) - disabled elements
    hint: '#9E9E9E',      // Gray (38% opacity) - placeholder, helper text
  },

  // Background Colors
  background: {
    default: '#FAFAFA',   // Very light gray - main page background
    paper: '#FFFFFF',     // White - cards, forms, elevated surfaces
  },

  // Divider Color
  divider: '#E0E0E0',     // Light gray - borders, dividers

  // Action Colors (for interactive elements)
  action: {
    active: '#1976D2',    // Primary color for active states
    hover: 'rgba(25, 118, 210, 0.04)', // Light primary tint for hover
    selected: 'rgba(25, 118, 210, 0.08)', // Medium primary tint for selected
    disabled: 'rgba(0, 0, 0, 0.26)', // Standard disabled opacity
    disabledBackground: 'rgba(0, 0, 0, 0.12)', // Disabled background
    focus: 'rgba(25, 118, 210, 0.12)', // Focus ring color
  },
};
