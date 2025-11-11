/**
 * Material-UI Theme Configuration
 *
 * Main theme export for the QuantRx application.
 * Combines palette, typography, spacing, and component overrides
 * into a complete MUI theme based on theme-rules.md.
 *
 * @module theme
 */

import { createTheme } from '@mui/material/styles';
import { palette } from './palette.js';
import { typography } from './typography.js';
import { components } from './components.js';

// Create and export the complete theme
const theme = createTheme({
  // Color palette
  palette,

  // Typography scale
  typography,

  // Spacing system (8px base unit)
  spacing: 8,

  // Shape (border radius)
  shape: {
    borderRadius: 4, // 4px default border radius
  },

  // Component-specific overrides
  components,
});

export default theme;
