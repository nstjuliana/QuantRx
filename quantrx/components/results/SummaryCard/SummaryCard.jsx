/**
 * SummaryCard Component
 *
 * Displays calculation overview information in a card format.
 * Shows drug name, RxCUI, calculated quantity, days supply, and overall status.
 * Includes calculation ID and timestamp for reference.
 *
 * @module components/results/SummaryCard
 */

import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { StatusBadge } from '@/components/ui/StatusBadge';

/**
 * SummaryCard Component
 *
 * @param {Object} props - Component props
 * @param {Object} props.result - Calculation result object
 * @param {string} props.result.id - Calculation ID
 * @param {string} props.result.timestamp - Calculation timestamp
 * @param {Object} props.result.normalization - Drug normalization data
 * @param {Object} props.result.calculation - Quantity calculation data
 * @param {string} props.result.status - Overall calculation status
 * @param {Array} [props.result.warnings] - Warnings array
 * @returns {JSX.Element} Summary card component
 */
export function SummaryCard({ result }) {
  if (!result) {
    return null;
  }

  const {
    id,
    timestamp,
    normalization,
    calculation,
    status,
    warnings = []
  } = result;

  // Determine overall status for badge
  const getOverallStatus = () => {
    if (warnings.some(w => w.severity === 'error')) {
      return 'error';
    }
    if (warnings.some(w => w.severity === 'warning')) {
      return 'warning';
    }
    if (status === 'success') {
      return 'active';
    }
    return 'pending';
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return timestamp;
    }
  };

  return (
    <Card
      sx={{
        borderRadius: '4px',
        boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
        border: '1px solid #E0E0E0'
      }}
    >
      <CardContent sx={{ padding: '24px' }}>
        {/* Header with title and status */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2
        }}>
          <Typography
            variant="h3"
            sx={{
              fontSize: '20px',
              fontWeight: 600,
              lineHeight: 1.4,
              color: 'text.primary',
              margin: 0
            }}
          >
            Calculation Summary
          </Typography>
          <StatusBadge variant={getOverallStatus()} />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Main content grid */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3
        }}>
          {/* Left column */}
          <Box>
            {/* Drug Information */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  mb: 0.5
                }}
              >
                Drug
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '16px',
                  fontWeight: 400,
                  color: 'text.primary',
                  lineHeight: 1.5
                }}
              >
                {normalization?.drugName || 'Unknown Drug'}
              </Typography>
            </Box>

            {/* RxCUI */}
            {normalization?.rxcui && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    mb: 0.5
                  }}
                >
                  RxCUI
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    color: 'text.primary',
                    backgroundColor: '#F5F5F5',
                    padding: '2px 6px',
                    borderRadius: '2px',
                    display: 'inline-block'
                  }}
                >
                  {normalization.rxcui}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Right column */}
          <Box>
            {/* Calculated Quantity */}
            {calculation?.calculatedQuantity && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    mb: 0.5
                  }}
                >
                  Calculated Quantity
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color: 'text.primary'
                  }}
                >
                  {calculation.calculatedQuantity.toLocaleString()} {calculation.unit || 'units'}
                </Typography>
              </Box>
            )}

            {/* Days Supply */}
            {result.inputs?.daysSupply && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    mb: 0.5
                  }}
                >
                  Days Supply
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '16px',
                    fontWeight: 400,
                    color: 'text.primary'
                  }}
                >
                  {result.inputs.daysSupply} days
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Footer with metadata */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pt: 1
        }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: '12px',
              color: 'text.secondary'
            }}
          >
            ID: {id?.slice(-8) || 'Unknown'}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: '12px',
              color: 'text.secondary'
            }}
          >
            {formatTimestamp(timestamp)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

