/**
 * Material-UI Component Overrides
 *
 * Component-specific styling overrides for consistent design
 * across the QuantRx application based on theme-rules.md.
 *
 * @module theme/components
 */

export const components = {
  // Button Overrides
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 4,     // 4px border radius
        padding: '12px 24px', // Comfortable touch targets
        fontSize: '14px',
        fontWeight: 500,
        textTransform: 'none', // Don't uppercase
        boxShadow: 'none',    // Flat design
        '&:hover': {
          boxShadow: 'none',  // No shadow on hover
        },
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
      },
      outlined: {
        borderWidth: '1px',
        '&:hover': {
          borderWidth: '1px',
        },
      },
    },
  },

  // TextField/Input Overrides
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 4,     // 4px border radius
          '& fieldset': {
            borderColor: '#E0E0E0', // Light gray default border
          },
          '&:hover fieldset': {
            borderColor: '#BDBDBD', // Medium gray on hover
          },
          '&.Mui-focused fieldset': {
            borderColor: '#1976D2', // Primary blue on focus
            borderWidth: '2px',     // Thicker focus border
          },
          '&.Mui-error fieldset': {
            borderColor: '#F44336', // Error red
          },
        },
      },
    },
  },

  // Card Overrides
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 4,     // 4px border radius
        boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)', // Elevation 1
        border: '1px solid #E0E0E0', // Subtle border
      },
    },
  },

  // Chip/Badge Overrides
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 12,    // Pill-shaped (rounded)
        height: 24,          // Compact height
        fontSize: '12px',
        fontWeight: 500,
        '& .MuiChip-label': {
          padding: '0 8px',  // Horizontal padding for text
        },
      },
    },
  },

  // Alert Overrides
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 4,     // 4px border radius
        border: '1px solid',  // Border for definition
        '&.MuiAlert-standardSuccess': {
          backgroundColor: '#E8F5E9', // Light green background
          borderColor: '#4CAF50',     // Success green border
          color: '#2E7D32',           // Dark green text
        },
        '&.MuiAlert-standardWarning': {
          backgroundColor: '#FFF3E0', // Light orange background
          borderColor: '#FF9800',     // Warning orange border
          color: '#E65100',           // Dark orange text
        },
        '&.MuiAlert-standardError': {
          backgroundColor: '#FFEBEE', // Light red background
          borderColor: '#F44336',     // Error red border
          color: '#C62828',           // Dark red text
        },
        '&.MuiAlert-standardInfo': {
          backgroundColor: '#E3F2FD', // Light blue background
          borderColor: '#2196F3',     // Info blue border
          color: '#1565C0',           // Dark blue text
        },
      },
    },
  },

  // Paper (used for surfaces)
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 4,     // 4px border radius
      },
      elevation1: {
        boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
      },
      elevation2: {
        boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
      },
    },
  },

  // Dialog/Modal Overrides
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 8,     // Slightly more rounded for modals
      },
    },
  },

  // Menu Overrides
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 4,
        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)', // Elevation 4
      },
    },
  },

  // Tab Overrides
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none', // Don't uppercase tab labels
        fontWeight: 500,
        fontSize: '14px',
        minHeight: 48,       // Comfortable touch target
        '&.Mui-selected': {
          fontWeight: 600,   // Slightly bolder when selected
        },
      },
    },
  },

  // Table Overrides
  MuiTableHead: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-head': {
          backgroundColor: '#F5F5F5', // Light gray background
          fontWeight: 600,           // Semi-bold
          fontSize: '14px',
          color: '#424242',          // Dark gray text
          borderBottom: '1px solid #E0E0E0',
        },
      },
    },
  },

  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:nth-of-type(odd)': {
          backgroundColor: '#FAFAFA', // Alternating row colors
        },
        '&:hover': {
          backgroundColor: 'rgba(25, 118, 210, 0.04)', // Light primary hover
        },
      },
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: '1px solid #E0E0E0',
        padding: '16px',     // Comfortable cell padding
      },
    },
  },
};
