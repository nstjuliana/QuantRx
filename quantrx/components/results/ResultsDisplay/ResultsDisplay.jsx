/**
 * ResultsDisplay Component
 *
 * Main container for displaying calculation results.
 * Orchestrates all result components in the correct order:
 * Warnings → Summary → Primary Recommendation → Alternatives → Actions
 *
 * @module components/results/ResultsDisplay
 */

'use client';

import {
  Box,
  Button,
  Divider,
  Menu,
  MenuItem,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { useState } from 'react';
import {
  FileDownload as ExportIcon,
  Refresh as NewCalculationIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { SummaryCard } from '../SummaryCard';
import { NDCCard } from '../NDCCard';
import { WarningsSection } from '../WarningsSection';
import { AlternativeOptions } from '../AlternativeOptions';

/**
 * ResultsDisplay Component
 *
 * @param {Object} props - Component props
 * @param {Object} props.result - Calculation result object from API
 * @param {Function} [props.onExport] - Callback for export actions
 * @param {Function} [props.onNewCalculation] - Callback to start new calculation
 * @param {Function} [props.onVerify] - Callback for verification (pharmacists only)
 * @param {Function} [props.onSelectAlternative] - Callback when alternative NDC selected
 * @returns {JSX.Element} Results display container
 */
export function ResultsDisplay({
  result,
  onExport,
  onNewCalculation,
  onVerify,
  onSelectAlternative
}) {
  const { isAdmin } = useAuth();
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Don't render if no result
  if (!result) {
    return null;
  }

  const {
    recommendation,
    alternatives = [],
    warnings = [],
    status
  } = result;

  // Handle export menu
  const handleExportClick = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExportJSON = () => {
    handleExportClose();
    if (onExport) {
      onExport('json');
    }
    showSnackbar('JSON exported successfully', 'success');
  };

  const handleExportClipboard = () => {
    handleExportClose();
    if (onExport) {
      onExport('clipboard');
    }
    showSnackbar('Copied to clipboard', 'success');
  };

  // Handle verification
  const handleVerify = async () => {
    if (onVerify) {
      try {
        await onVerify();
        showSnackbar('Calculation verified successfully', 'success');
      } catch (error) {
        showSnackbar('Failed to verify calculation', 'error');
      }
    }
  };

  // Handle new calculation
  const handleNewCalculation = () => {
    if (onNewCalculation) {
      onNewCalculation();
    }
  };

  // Handle alternative selection
  const handleSelectAlternative = (ndc) => {
    if (onSelectAlternative) {
      onSelectAlternative(ndc);
      showSnackbar('Alternative NDC selected', 'info');
    }
  };

  // Snackbar helper
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      {/* Page title for results section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          sx={{
            fontSize: '24px',
            fontWeight: 600,
            color: 'text.primary',
            lineHeight: 1.33,
            mb: 2
          }}
        >
          Calculation Results
        </Typography>
      </Box>

      {/* Results content in proper order */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* 1. Warnings Section (if any warnings) */}
        <WarningsSection warnings={warnings} />

        {/* 2. Summary Card */}
        <SummaryCard result={result} />

        {/* 3. Primary Recommendation */}
        {recommendation && recommendation.ndcs && recommendation.ndcs.length > 0 && (
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontSize: '20px',
                fontWeight: 600,
                color: 'text.primary',
                lineHeight: 1.4,
                mb: 3
              }}
            >
              Recommended Package
            </Typography>
            <NDCCard
              ndc={recommendation.ndcs[0]} // Use first NDC from the array
              isPrimary={true}
              breakdown={{
                packages: Array.isArray(recommendation.packages) 
                  ? recommendation.packages.reduce((sum, p) => sum + p, 0) 
                  : recommendation.packages || 0,
                totalQuantity: recommendation.totalQuantity,
                overfill: recommendation.overfill,
                description: recommendation.breakdown
              }}
              onSelect={handleSelectAlternative}
              showSelectButton={false} // Primary recommendation doesn't need select button
            />
          </Box>
        )}

        {/* 4. Alternative Options */}
        <AlternativeOptions
          alternatives={alternatives}
          onSelectAlternative={handleSelectAlternative}
        />

        {/* 5. Action Buttons */}
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            {/* Left side: New Calculation */}
            <Button
              variant="outlined"
              startIcon={<NewCalculationIcon />}
              onClick={handleNewCalculation}
              sx={{ minWidth: '160px' }}
            >
              New Calculation
            </Button>

            {/* Right side: Export and Verify */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {/* Export Button with Dropdown */}
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExportClick}
                sx={{ minWidth: '120px' }}
              >
                Export
              </Button>

              {/* Verify Button (Pharmacists/Admins only) */}
              {isAdmin && onVerify && (
                <Button
                  variant="contained"
                  startIcon={<VerifiedIcon />}
                  onClick={handleVerify}
                  color="success"
                  sx={{ minWidth: '140px' }}
                >
                  Mark as Verified
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleExportJSON}>
          <Typography variant="body2">Download JSON</Typography>
        </MenuItem>
        <MenuItem onClick={handleExportClipboard}>
          <Typography variant="body2">Copy to Clipboard</Typography>
        </MenuItem>
      </Menu>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
