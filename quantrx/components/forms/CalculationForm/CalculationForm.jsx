/**
 * CalculationForm Component
 *
 * Main form component for entering prescription data (drug name/NDC, SIG, days supply).
 * Handles form validation, submission, and displays inline validation errors.
 * Uses React Hook Form with Zod validation and Material-UI components.
 *
 * @module components/forms/CalculationForm
 */

'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { CalculationFormSchema } from '@/schemas/calculation';

/**
 * CalculationForm Component
 *
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Callback function when form is submitted
 * @param {boolean} props.loading - Show loading state during submission
 * @param {Object} [props.initialValues] - Pre-populate form values
 * @returns {JSX.Element} Calculation form component
 */
export function CalculationForm({ onSubmit, loading = false, initialValues = {} }) {
  const [inputMode, setInputMode] = useState('drugName');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isSubmitting }
  } = useForm({
    mode: 'onChange', // Validate on change for better UX
    resolver: zodResolver(CalculationFormSchema),
    defaultValues: {
      inputMode: 'drugName',
      drugName: '',
      ndc: '',
      sig: '',
      daysSupply: '',
      quantity: '',
      ...initialValues
    }
  });

  // Watch form values to compute custom validation
  const formValues = watch();
  
  // Custom validation check: form is valid if either quantity OR (SIG + daysSupply) is provided
  const isFormValid = useMemo(() => {
    // Check drug name or NDC requirement
    const hasDrugOrNDC = (inputMode === 'drugName' && formValues.drugName?.trim()) ||
                         (inputMode === 'ndc' && formValues.ndc?.trim());
    
    if (!hasDrugOrNDC) return false;
    
    // Check quantity OR (SIG + daysSupply)
    // Handle both string and number types for quantity/daysSupply
    const quantityValue = typeof formValues.quantity === 'string' 
      ? (formValues.quantity === '' ? 0 : parseInt(formValues.quantity, 10))
      : (formValues.quantity || 0);
    const hasQuantity = quantityValue > 0;
    
    const daysSupplyValue = typeof formValues.daysSupply === 'string'
      ? (formValues.daysSupply === '' ? 0 : parseInt(formValues.daysSupply, 10))
      : (formValues.daysSupply || 0);
    const hasSigAndDays = formValues.sig?.trim() && daysSupplyValue > 0;
    
    return hasQuantity || hasSigAndDays;
  }, [formValues, inputMode]);

  // Watch inputMode to clear fields when switching
  const watchedInputMode = watch('inputMode');

  // Clear opposite field when input mode changes
  const handleInputModeChange = (event) => {
    const newMode = event.target.value;
    setInputMode(newMode);

    if (newMode === 'drugName') {
      reset({
        ...watch(),
        inputMode: newMode,
        ndc: '' // Clear NDC when switching to drug name mode
      });
    } else {
      reset({
        ...watch(),
        inputMode: newMode,
        drugName: '' // Clear drug name when switching to NDC mode
      });
    }
  };

  const handleFormSubmit = (data) => {
    // Validate that either drugName or ndc is provided based on inputMode
    if (inputMode === 'drugName' && !data.drugName?.trim()) {
      return; // Don't submit if drug name is empty
    }
    if (inputMode === 'ndc' && !data.ndc?.trim()) {
      return; // Don't submit if NDC is empty
    }

    // Remove inputMode from submission data
    const { inputMode: _, ...submitData } = data;
    
    // Normalize empty strings to undefined for API
    if (submitData.sig === '' || !submitData.sig?.trim()) {
      submitData.sig = undefined;
    }
    if (submitData.daysSupply === '' || submitData.daysSupply === null || submitData.daysSupply === undefined) {
      submitData.daysSupply = undefined;
    } else if (typeof submitData.daysSupply === 'string') {
      submitData.daysSupply = parseInt(submitData.daysSupply, 10) || undefined;
    }
    if (submitData.quantity === '' || submitData.quantity === null || submitData.quantity === undefined) {
      submitData.quantity = undefined;
    } else if (typeof submitData.quantity === 'string') {
      submitData.quantity = parseInt(submitData.quantity, 10) || undefined;
    }
    
    // Ensure we only send the relevant field based on inputMode
    if (inputMode === 'drugName') {
      submitData.ndc = undefined;
    } else {
      submitData.drugName = undefined;
    }
    
    // If quantity is provided, clear SIG and daysSupply (they're not needed)
    if (submitData.quantity && submitData.quantity > 0) {
      submitData.sig = undefined;
      submitData.daysSupply = undefined;
    } else {
      // If using calculated mode, ensure we have both SIG and daysSupply
      submitData.quantity = undefined;
    }
    
    onSubmit(submitData);
  };

  const handleClearForm = () => {
    reset({
      inputMode: 'drugName',
      drugName: '',
      ndc: '',
      sig: '',
      daysSupply: '',
      quantity: ''
    });
    setInputMode('drugName');
  };

  const onSubmitWithValidation = handleSubmit(
    handleFormSubmit,
    (errors) => {
      // Handle validation errors
      console.log('Form validation errors:', errors);
    }
  );

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitWithValidation(e);
      }}
      sx={{
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto' // Center the form
      }}
    >
      {/* Input Mode Selection */}
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend" sx={{ mb: 2, fontWeight: 500 }}>
          Search Method
        </FormLabel>
        <Controller
          name="inputMode"
          control={control}
          render={({ field }) => (
            <RadioGroup
              {...field}
              row
              value={inputMode}
              onChange={(event) => {
                field.onChange(event);
                handleInputModeChange(event);
              }}
            >
              <FormControlLabel
                value="drugName"
                control={<Radio />}
                label="Search by Drug Name"
              />
              <FormControlLabel
                value="ndc"
                control={<Radio />}
                label="Enter NDC Directly"
              />
            </RadioGroup>
          )}
        />
      </FormControl>

      {/* Conditional Input Fields */}
      {inputMode === 'drugName' ? (
        <Controller
          name="drugName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Drug Name"
              placeholder="e.g., Lisinopril 10mg, Amoxicillin 500mg"
              fullWidth
              required
              error={!!errors.drugName}
              helperText={errors.drugName?.message || 'Enter drug name or brand name'}
              sx={{ mb: 3 }}
              disabled={loading}
            />
          )}
        />
      ) : (
        <Controller
          name="ndc"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="NDC"
              placeholder="12345-678-90"
              fullWidth
              required
              error={!!errors.ndc}
              helperText={errors.ndc?.message || 'Format: 12345-6789-0, 12345-678-90, 1234-5678-90, or 123456-789-0'}
              sx={{ mb: 3 }}
              disabled={loading}
              inputProps={{
                maxLength: 13, // Allow for hyphens in longest format
                pattern: '[0-9]{4,6}-?[0-9]{3,4}-?[0-9]{1,2}'
              }}
            />
          )}
        />
      )}

      {/* SIG, Days Supply, and Quantity Section with OR divider */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr auto 1fr' },
          gap: 2,
          alignItems: 'flex-start'
        }}>
          {/* Left side: SIG and Days Supply */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="sig"
              control={control}
              render={({ field }) => {
                const quantity = watch('quantity');
                // Handle both string and number types
                const quantityValue = typeof quantity === 'string' 
                  ? (quantity === '' ? 0 : parseInt(quantity, 10))
                  : (quantity || 0);
                const hasQuantity = quantityValue > 0;
                
                // Don't show errors for SIG when quantity is provided
                const showError = hasQuantity ? false : !!errors.sig;
                
                return (
                  <TextField
                    {...field}
                    label="Prescription Directions (SIG)"
                    placeholder="Take 1 tablet twice daily"
                    fullWidth
                    required={!hasQuantity}
                    multiline
                    rows={2}
                    error={showError}
                    helperText={showError ? errors.sig?.message : (hasQuantity ? 'Optional when quantity is provided directly' : 'Required to calculate quantity')}
                    disabled={loading || hasQuantity}
                  />
                );
              }}
            />

            <Controller
              name="daysSupply"
              control={control}
              render={({ field }) => {
                const quantity = watch('quantity');
                // Handle both string and number types
                const quantityValue = typeof quantity === 'string' 
                  ? (quantity === '' ? 0 : parseInt(quantity, 10))
                  : (quantity || 0);
                const hasQuantity = quantityValue > 0;
                
                // Don't show errors for daysSupply when quantity is provided
                const showError = hasQuantity ? false : !!errors.daysSupply;
                
                return (
                  <TextField
                    {...field}
                    label="Days Supply"
                    type="number"
                    placeholder="30"
                    fullWidth
                    value={field.value ?? ''}
                    error={showError}
                    helperText={showError ? errors.daysSupply?.message : (hasQuantity ? 'Optional when quantity is provided directly' : 'Required to calculate quantity from SIG')}
                    disabled={loading || hasQuantity}
                    inputProps={{
                      min: 1,
                      max: 365
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? '' : parseInt(value, 10));
                    }}
                  />
                );
              }}
            />
          </Box>

          {/* Middle: OR divider */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            pt: { xs: 0, md: 2 }
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              OR
            </Typography>
          </Box>

          {/* Right side: Quantity (Direct Entry) */}
          <Box>
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => {
                const sig = watch('sig');
                const daysSupply = watch('daysSupply');
                const hasSigAndDays = sig && sig.trim().length > 0 && daysSupply && daysSupply > 0;
                
                return (
                  <TextField
                    {...field}
                    label="Quantity (Direct Entry)"
                    type="number"
                    placeholder="60"
                    fullWidth
                    value={field.value ?? ''}
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message || (hasSigAndDays ? 'Optional - leave blank to calculate from SIG and days supply' : 'Enter quantity directly, or provide SIG and days supply to calculate')}
                    disabled={loading}
                    inputProps={{
                      min: 1,
                      max: 100000
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? '' : parseInt(value, 10));
                    }}
                  />
                );
              }}
            />
          </Box>
        </Box>

        {/* Mobile: Show OR below on small screens */}
        <Box sx={{ 
          display: { xs: 'flex', md: 'none' },
          alignItems: 'center',
          justifyContent: 'center',
          my: 2
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            OR
          </Typography>
        </Box>
      </Box>

      {/* Submit and Clear Buttons */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading || isSubmitting || !isFormValid}
          sx={{ flex: 1 }}
          startIcon={loading || isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading || isSubmitting ? 'Calculating...' : 'Calculate'}
        </Button>

        <Button
          type="button"
          variant="outlined"
          onClick={handleClearForm}
          disabled={loading}
          sx={{ flex: 1 }}
        >
          Clear Form
        </Button>
      </Box>

      {/* Form-level error display */}
      {(() => {
        const quantity = watch('quantity');
        const quantityValue = typeof quantity === 'string' 
          ? (quantity === '' ? 0 : parseInt(quantity, 10))
          : (quantity || 0);
        const hasQuantity = quantityValue > 0;
        
        // Filter out errors for fields that are optional when quantity is provided
        const relevantErrors = Object.keys(errors).filter(key => {
          if (hasQuantity && (key === 'sig' || key === 'daysSupply')) {
            return false; // Don't show errors for these when quantity is provided
          }
          return true;
        });
        
        return relevantErrors.length > 0 && !loading && !isSubmitting ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Please correct the errors above and try again.
            </Typography>
            {errors.drugName && (
              <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
                • {errors.drugName.message}
              </Typography>
            )}
            {errors.ndc && (
              <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
                • {errors.ndc.message}
              </Typography>
            )}
            {errors.sig && !hasQuantity && (
              <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
                • {errors.sig.message}
              </Typography>
            )}
            {errors.daysSupply && !hasQuantity && (
              <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
                • {errors.daysSupply.message}
              </Typography>
            )}
            {errors.quantity && (
              <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
                • {errors.quantity.message}
              </Typography>
            )}
          </Alert>
        ) : null;
      })()}
    </Box>
  );
}
