/**
 * AlternativeOptions Component
 *
 * Displays alternative NDC options in a section below the primary recommendation.
 * Shows up to 5 alternatives with match quality indicators.
 * Uses NDCCard components for consistent styling.
 *
 * @module components/results/AlternativeOptions
 */

import {
  Typography,
  Box,
  Chip
} from '@mui/material';
import { NDCCard } from '../NDCCard';

/**
 * AlternativeOptions Component
 *
 * @param {Object} props - Component props
 * @param {Array} props.alternatives - Array of alternative NDC options
 * @param {Object} props.alternatives[].ndc - NDC record object
 * @param {Object} props.alternatives[].breakdown - Quantity breakdown info
 * @param {number} props.alternatives[].breakdown.packages - Number of packages
 * @param {number} props.alternatives[].breakdown.totalQuantity - Total quantity
 * @param {number} props.alternatives[].breakdown.overfill - Overfill amount
 * @param {string} props.alternatives[].breakdown.description - Breakdown description
 * @param {Function} [props.onSelectAlternative] - Callback when alternative is selected
 * @returns {JSX.Element|null} Alternative options section or null if no alternatives
 */
export function AlternativeOptions({ alternatives = [], onSelectAlternative }) {
  // Don't render if no alternatives
  if (!alternatives || alternatives.length === 0) {
    return null;
  }

  // Limit to maximum 5 alternatives as specified
  const displayAlternatives = alternatives.slice(0, 5);

  /**
   * Get match quality indicator for an alternative
   * @param {Object} alternative - Alternative NDC option
   * @returns {Object} Quality indicator info
   */
  const getMatchQuality = (alternative) => {
    // Handle both breakdown object and direct properties
    const breakdown = alternative.breakdown || alternative;
    const overfill = breakdown.overfill ?? alternative.overfill ?? 0;
    const totalQuantity = breakdown.totalQuantity ?? alternative.totalQuantity ?? 0;

    if (totalQuantity === 0) {
      return { label: 'Unknown', color: 'default' };
    }

    if (overfill === 0) {
      return { label: 'Exact Match', color: 'success' };
    }

    const overfillPercent = (overfill / totalQuantity) * 100;

    if (overfillPercent <= 10) {
      return { label: 'Slight Overfill', color: 'warning' };
    }

    if (overfillPercent <= 50) {
      return { label: 'Moderate Overfill', color: 'warning' };
    }

    return { label: 'Significant Overfill', color: 'error' };
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Section header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h3"
          sx={{
            fontSize: '20px',
            fontWeight: 600,
            color: 'text.primary',
            lineHeight: 1.4,
            mb: 1
          }}
        >
          Alternative Options
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: '14px',
            color: 'text.secondary',
            lineHeight: 1.43
          }}
        >
          Other NDC packages that can fulfill this prescription
        </Typography>
      </Box>

      {/* Alternative NDC cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {displayAlternatives.map((alternative, index) => {
          const quality = getMatchQuality(alternative);
          
          // Handle both ndc (singular) and ndcs (plural) structures
          const ndcRecord = alternative.ndc || (alternative.ndcs && alternative.ndcs[0]);
          
          // Build breakdown object from alternative data
          // Handle both breakdown object and direct properties
          const breakdown = alternative.breakdown && typeof alternative.breakdown === 'object'
            ? alternative.breakdown
            : {
                packages: Array.isArray(alternative.packages) 
                  ? alternative.packages.reduce((sum, p) => sum + p, 0) 
                  : (alternative.packages || 0),
                totalQuantity: alternative.totalQuantity ?? 0,
                overfill: alternative.overfill ?? 0,
                description: typeof alternative.breakdown === 'string' 
                  ? alternative.breakdown 
                  : alternative.breakdown?.description || alternative.breakdown || ''
              };

          if (!ndcRecord) {
            return null; // Skip if no NDC record
          }

          return (
            <Box key={`${ndcRecord.ndc || ndcRecord}-${index}`} sx={{ position: 'relative' }}>
              {/* Match quality indicator - centered at top to avoid overlap with status badge */}
              <Box sx={{
                position: 'absolute',
                top: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2
              }}>
                <Chip
                  label={quality.label}
                  size="small"
                  color={quality.color}
                  variant="outlined"
                  sx={{
                    fontSize: '11px',
                    height: '20px',
                    '& .MuiChip-label': {
                      px: 1,
                      py: 0.25
                    }
                  }}
                />
              </Box>

              {/* NDC Card */}
              <NDCCard
                ndc={ndcRecord}
                isPrimary={false}
                breakdown={breakdown}
                onSelect={onSelectAlternative}
                showSelectButton={!!onSelectAlternative}
              />
            </Box>
          );
        })}
      </Box>

      {/* Note about limited display */}
      {alternatives.length > 5 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: '12px',
              color: 'text.secondary'
            }}
          >
            Showing top 5 alternatives. {alternatives.length - 5} more options available.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
