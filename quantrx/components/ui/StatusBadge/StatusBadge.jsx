/**
 * StatusBadge Component
 *
 * Reusable status indicator component using Material-UI Chip.
 * Displays status with color, icon, and text for accessibility.
 * Used throughout the application for NDC status, calculation status, etc.
 *
 * @module components/ui/StatusBadge
 */

import {
  Chip,
  useTheme
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * StatusBadge Component
 *
 * @param {Object} props - Component props
 * @param {string} props.variant - Status variant: 'active', 'verified', 'warning', 'error', 'pending', 'info'
 * @param {string} [props.label] - Custom label text (defaults based on variant)
 * @param {boolean} [props.icon] - Whether to show icon (default: true)
 * @param {Object} [props.sx] - Additional MUI sx styles
 * @returns {JSX.Element} Status badge component
 */
export function StatusBadge({
  variant,
  label,
  icon = true,
  sx = {},
  ...chipProps
}) {
  const theme = useTheme();

  // Define status configurations
  const statusConfigs = {
    active: {
      label: label || 'Active',
      color: 'success',
      backgroundColor: theme.palette.success.main,
      textColor: theme.palette.success.contrastText,
      icon: <CheckCircleIcon fontSize="small" />
    },
    verified: {
      label: label || 'Verified',
      color: 'success',
      backgroundColor: theme.palette.success.main,
      textColor: theme.palette.success.contrastText,
      icon: <CheckCircleIcon fontSize="small" />
    },
    warning: {
      label: label || 'Warning',
      color: 'warning',
      backgroundColor: theme.palette.warning.main,
      textColor: theme.palette.warning.contrastText,
      icon: <WarningIcon fontSize="small" />
    },
    error: {
      label: label || 'Error',
      color: 'error',
      backgroundColor: theme.palette.error.main,
      textColor: theme.palette.error.contrastText,
      icon: <ErrorIcon fontSize="small" />
    },
    pending: {
      label: label || 'Pending',
      color: 'default',
      backgroundColor: theme.palette.text.secondary,
      textColor: '#FFFFFF',
      icon: <ScheduleIcon fontSize="small" />
    },
    info: {
      label: label || 'Info',
      color: 'info',
      backgroundColor: theme.palette.info.main,
      textColor: theme.palette.info.contrastText,
      icon: <InfoIcon fontSize="small" />
    }
  };

  const config = statusConfigs[variant];

  if (!config) {
    console.warn(`StatusBadge: Unknown variant "${variant}". Using "info" as fallback.`);
    return StatusBadge({ ...chipProps, variant: 'info', label, icon, sx });
  }

  return (
    <Chip
      label={config.label}
      icon={icon ? config.icon : undefined}
      size="small"
      sx={{
        height: '24px',
        padding: '4px 12px',
        borderRadius: '12px', // Pill shape
        fontSize: '12px',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        backgroundColor: config.backgroundColor,
        color: config.textColor,
        '& .MuiChip-icon': {
          color: config.textColor,
          marginLeft: '4px',
          marginRight: '4px'
        },
        '& .MuiChip-label': {
          padding: 0,
          lineHeight: 1
        },
        // Ensure icon color matches text
        '& .MuiChip-icon svg': {
          fill: 'currentColor'
        },
        ...sx
      }}
      {...chipProps}
    />
  );
}
