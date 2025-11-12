/**
 * NDCCard Component
 *
 * Displays NDC package information with quantity breakdown and selection option.
 * Primary cards (recommended) have blue accent border and higher elevation.
 * Alternative cards have standard styling.
 *
 * @module components/results/NDCCard
 */

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Divider
} from '@mui/material';
import { StatusBadge } from '@/components/ui/StatusBadge';

/**
 * NDCCard Component
 *
 * @param {Object} props - Component props
 * @param {Object} props.ndc - NDC record object
 * @param {string} props.ndc.ndc - NDC code
 * @param {string} props.ndc.manufacturer - Manufacturer name
 * @param {number} props.ndc.packageSize - Package size
 * @param {string} props.ndc.status - NDC status (active/inactive)
 * @param {boolean} props.isPrimary - Whether this is the primary/recommended NDC
 * @param {Object} props.breakdown - Quantity breakdown information
 * @param {number} props.breakdown.packages - Number of packages needed
 * @param {number} props.breakdown.totalQuantity - Total quantity from packages
 * @param {number} props.breakdown.overfill - Overfill amount (0 if exact match)
 * @param {string} props.breakdown.description - Quantity breakdown description
 * @param {Function} [props.onSelect] - Callback when NDC is selected
 * @param {boolean} [props.showSelectButton] - Whether to show select button
 * @returns {JSX.Element} NDC card component
 */
export function NDCCard({
  ndc,
  isPrimary = false,
  breakdown,
  onSelect,
  showSelectButton = true
}) {
  if (!ndc) {
    return null;
  }

  const {
    ndc: ndcCode,
    manufacturer,
    packageSize,
    status
  } = ndc;

  // Format NDC for display
  const formatNDC = (ndc) => {
    if (!ndc) return '';
    // Remove existing hyphens and reformat
    const clean = ndc.replace(/-/g, '');
    if (clean.length === 11) {
      return `${clean.slice(0, 5)}-${clean.slice(5, 8)}-${clean.slice(8)}`;
    }
    return ndc;
  };

  // Get status variant for badge
  const getStatusVariant = (status) => {
    return status === 'active' ? 'active' : 'warning';
  };

  // Calculate overfill percentage
  const getOverfillInfo = () => {
    if (!breakdown) {
      return { text: 'Exact match', color: 'success.main' };
    }

    const overfill = breakdown.overfill ?? 0;
    const totalQuantity = breakdown.totalQuantity ?? 0;

    if (overfill === 0 || totalQuantity === 0) {
      return { text: 'Exact match', color: 'success.main' };
    }

    const percentage = ((overfill / totalQuantity) * 100).toFixed(1);
    return {
      text: `${overfill} overfill (${percentage}%)`,
      color: overfill > totalQuantity * 0.1 ? 'warning.main' : 'text.secondary'
    };
  };

  const overfillInfo = getOverfillInfo();

  return (
    <Card
      sx={{
        borderRadius: '4px',
        border: '1px solid #E0E0E0',
        // Primary card styling
        ...(isPrimary && {
          borderLeft: '4px solid #1976D2',
          boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
        }),
        // Alternative card styling
        ...(!isPrimary && {
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
        })
      }}
    >
      <CardContent sx={{ padding: isPrimary ? '32px' : '24px' }}>
        {/* Header with NDC and status */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2
        }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontSize: '18px',
                fontWeight: 500,
                color: 'text.primary',
                lineHeight: 1.33,
                mb: 0.5
              }}
            >
              NDC {formatNDC(ndcCode)}
            </Typography>
            {isPrimary && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: '12px',
                  color: 'primary.main',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Recommended
              </Typography>
            )}
          </Box>
          <StatusBadge variant={getStatusVariant(status)} />
        </Box>

        {/* Manufacturer and package info */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            sx={{
              fontSize: '14px',
              color: 'text.primary',
              mb: 0.5
            }}
          >
            {manufacturer}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: '14px',
              color: 'text.secondary'
            }}
          >
            Package Size: {packageSize} units
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Quantity breakdown */}
        {breakdown && (
          <Box sx={{ mb: showSelectButton ? 2 : 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                mb: 1
              }}
            >
              Quantity Breakdown
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: '16px',
                fontWeight: 400,
                color: 'text.primary',
                mb: 0.5
              }}
            >
              {breakdown.description}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontSize: '14px',
                color: overfillInfo.color,
                fontWeight: 500
              }}
            >
              {overfillInfo.text}
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Action buttons */}
      {showSelectButton && onSelect && (
        <>
          <Divider />
          <CardActions sx={{ padding: '16px 24px', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onSelect(ndc)}
              sx={{
                minWidth: '120px'
              }}
            >
              Select This NDC
            </Button>
          </CardActions>
        </>
      )}
    </Card>
  );
}
