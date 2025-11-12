/**
 * WarningsSection Component
 *
 * Displays warnings and alerts in a section at the top of results.
 * Uses MUI Alert components with color-coded severity levels.
 * Groups warnings by type and shows appropriate icons.
 *
 * @module components/results/WarningsSection
 */

import {
  Alert,
  AlertTitle,
  Typography,
  Box,
  Collapse
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  WarningAmber as WarningIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';

/**
 * WarningsSection Component
 *
 * @param {Object} props - Component props
 * @param {Array} props.warnings - Array of warning objects
 * @param {string} props.warnings[].id - Warning ID
 * @param {string} props.warnings[].type - Warning type
 * @param {string} props.warnings[].severity - Severity level (info/warning/error)
 * @param {string} props.warnings[].message - Warning message
 * @param {Object} [props.warnings[].data] - Additional warning data
 * @returns {JSX.Element|null} Warnings section or null if no warnings
 */
export function WarningsSection({ warnings = [] }) {
  // Don't render if no warnings
  if (!warnings || warnings.length === 0) {
    return null;
  }

  // Group warnings by severity for better organization
  const groupedWarnings = warnings.reduce((acc, warning) => {
    const severity = warning.severity || 'warning';
    if (!acc[severity]) {
      acc[severity] = [];
    }
    acc[severity].push(warning);
    return acc;
  }, {});

  // Define alert configurations for each severity
  const alertConfigs = {
    error: {
      severity: 'error',
      icon: <ErrorIcon fontSize="inherit" />,
      title: 'Critical Issues',
      backgroundColor: '#FFEBEE', // Light red
      borderColor: '#F44336' // Red
    },
    warning: {
      severity: 'warning',
      icon: <WarningIcon fontSize="inherit" />,
      title: 'Warnings',
      backgroundColor: '#FFF3E0', // Light orange
      borderColor: '#FF9800' // Orange
    },
    info: {
      severity: 'info',
      icon: <InfoIcon fontSize="inherit" />,
      title: 'Information',
      backgroundColor: '#E3F2FD', // Light blue
      borderColor: '#2196F3' // Blue
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Render alerts grouped by severity */}
      {Object.entries(groupedWarnings).map(([severity, severityWarnings]) => {
        const config = alertConfigs[severity] || alertConfigs.warning;

        return (
          <Alert
            key={severity}
            severity={config.severity}
            icon={config.icon}
            sx={{
              mb: 2,
              backgroundColor: config.backgroundColor,
              border: `1px solid ${config.borderColor}`,
              borderLeft: `4px solid ${config.borderColor}`,
              borderRadius: '4px',
              '& .MuiAlert-icon': {
                color: config.borderColor,
                alignSelf: 'flex-start',
                mt: 0.5
              },
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <AlertTitle sx={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'text.primary',
              mb: 1,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {config.title}
            </AlertTitle>

            {/* Individual warning messages */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {severityWarnings.map((warning) => (
                <Typography
                  key={warning.id}
                  variant="body2"
                  sx={{
                    fontSize: '14px',
                    color: 'text.primary',
                    lineHeight: 1.43
                  }}
                >
                  {warning.message}
                </Typography>
              ))}
            </Box>

            {/* Additional details for certain warning types */}
            {severityWarnings.some(w => w.type === 'inactive_ndc') && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.12)' }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '12px',
                    color: 'text.secondary',
                    display: 'block'
                  }}
                >
                  💡 Tip: Inactive NDCs cannot be used for new prescriptions. Consider selecting an active alternative.
                </Typography>
              </Box>
            )}

            {severityWarnings.some(w => w.type === 'sig_parse_error') && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.12)' }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '12px',
                    color: 'text.secondary',
                    display: 'block'
                  }}
                >
                  💡 Tip: Manual quantity entry is available below. For complex directions, consider using standardized SIG formats.
                </Typography>
              </Box>
            )}
          </Alert>
        );
      })}
    </Box>
  );
}
