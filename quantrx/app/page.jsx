/**
 * Home Page
 *
 * Main page of the QuantRx application.
 * Complete calculation workflow: form input → API processing → results display.
 *
 * @module app/page
 */

'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Skeleton
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { CalculationForm } from '@/components/forms';
import { ResultsDisplay } from '@/components/results';

/**
 * Home Page Component
 *
 * @returns {JSX.Element} Main application page with calculation workflow
 */
export default function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [calculationResult, setCalculationResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle calculation form submission
   * @param {Object} formData - Form data from CalculationForm
   */
  const handleCalculationSubmit = async (formData) => {
    setIsCalculating(true);
    setError(null);
    setCalculationResult(null);

    try {
      const response = await fetch('/api/calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response isn't JSON, get text
        const text = await response.text();
        throw new Error(`Server error: ${text || response.statusText}`);
      }

      if (!response.ok) {
        // Provide more detailed error messages
        const errorMessage = data.message || data.error || 'Calculation failed';
        const errorDetails = data.details;
        const errorType = data.errorType;
        
        // Log full error for debugging
        console.error('[Page] API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data,
          errorMessage,
          errorType,
          errorDetails
        });
        
        // Create user-friendly error message
        let userMessage = errorMessage;
        if (errorType) {
          userMessage = `${errorMessage} (${errorType})`;
        }
        if (errorDetails && typeof errorDetails === 'object') {
          // Add context if available
          if (errorDetails.step) {
            userMessage += `\n\nStep: ${errorDetails.step}`;
          }
        }
        
        throw new Error(userMessage);
      }

      // Validate response structure
      if (!data || !data.data) {
        console.error('[Page] Invalid response structure:', data);
        throw new Error('Invalid response from server');
      }

      console.log('[Page] Calculation successful, setting result:', data.data);
      
      // Set the result
      setCalculationResult(data.data);
    } catch (err) {
      // Extract error message, handling both Error objects and strings
      const errorMessage = err.message || err.toString() || 'An unexpected error occurred';
      setError(errorMessage);
      console.error('[Page] Calculation error:', err);
      
      // Log to console for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('[Page] Full error details:', err);
        console.error('[Page] Error stack:', err.stack);
      }
    } finally {
      setIsCalculating(false);
    }
  };

  /**
   * Handle export actions
   * @param {string} format - Export format ('json' or 'clipboard')
   */
  const handleExport = async (format) => {
    if (!calculationResult) return;

    try {
      if (format === 'json') {
        // Create and download JSON file
        const dataStr = JSON.stringify(calculationResult, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `quantrx-calculation-${calculationResult.id || 'export'}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === 'clipboard') {
        // Copy to clipboard
        const dataStr = JSON.stringify(calculationResult, null, 2);
        await navigator.clipboard.writeText(dataStr);
      }
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data');
    }
  };

  /**
   * Handle starting a new calculation
   */
  const handleNewCalculation = () => {
    setCalculationResult(null);
    setError(null);
    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handle verification (pharmacists/admins only)
   */
  const handleVerify = async () => {
    if (!calculationResult || !isAdmin) return;

    try {
      const response = await fetch(`/api/calculations/${calculationResult.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }

      const data = await response.json();

      // Update the result with verification data
      setCalculationResult({
        ...calculationResult,
        status: 'verified',
        verifiedBy: data.data.verifiedBy,
        verifiedAt: data.data.verifiedAt
      });
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify calculation');
    }
  };

  /**
   * Handle alternative NDC selection
   * @param {Object} ndc - Selected NDC object
   */
  const handleSelectAlternative = (ndc) => {
    // For now, just log the selection
    // In Phase 2, this could update the calculation or trigger a new one
    console.log('Alternative NDC selected:', ndc);
  };

  // Show authentication required message if not authenticated
  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h1" sx={{
            fontSize: '32px',
            fontWeight: 700,
            color: 'text.primary',
            mb: 2,
            letterSpacing: '-0.5px',
          }}>
            Welcome to QuantRx
          </Typography>
          <Typography variant="h2" sx={{
            fontSize: '18px',
            color: 'text.secondary',
            mb: 4,
          }}>
            NDC Packaging & Quantity Calculator
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1">
            Please sign in to access the QuantRx calculation features.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h1" sx={{
          fontSize: '32px',
          fontWeight: 700,
          color: 'text.primary',
          mb: 2,
          letterSpacing: '-0.5px',
        }}>
          QuantRx Calculator
        </Typography>
        <Typography variant="h2" sx={{
          fontSize: '18px',
          color: 'text.secondary',
        }}>
          NDC Packaging & Quantity Calculator
        </Typography>
      </Box>

      {/* Calculation Form */}
      <Box sx={{ mb: 6 }}>
        <CalculationForm
          onSubmit={handleCalculationSubmit}
          loading={isCalculating}
        />
      </Box>

      {/* Loading State */}
      {isCalculating && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" sx={{ mb: 3 }}>
            Calculating...
          </Typography>
          {/* Loading skeletons for results */}
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={150} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={100} />
          </Box>
        </Box>
      )}

      {/* Error Display */}
      {error && !isCalculating && (
        <Box sx={{ mb: 6 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            <Typography variant="body1">
              {error}
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Results Display */}
      {calculationResult && !isCalculating && (
        <ResultsDisplay
          result={calculationResult}
          onExport={handleExport}
          onNewCalculation={handleNewCalculation}
          onVerify={isAdmin ? handleVerify : undefined}
          onSelectAlternative={handleSelectAlternative}
        />
      )}
    </Container>
  );
}
