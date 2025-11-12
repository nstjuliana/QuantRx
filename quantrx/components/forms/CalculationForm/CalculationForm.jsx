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

import { useState } from 'react';
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
      ...initialValues
    }
  });

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
    
    // Ensure we only send the relevant field based on inputMode
    if (inputMode === 'drugName') {
      submitData.ndc = undefined;
    } else {
      submitData.drugName = undefined;
    }
    
    onSubmit(submitData);
  };

  const handleClearForm = () => {
    reset({
      inputMode: 'drugName',
      drugName: '',
      ndc: '',
      sig: '',
      daysSupply: ''
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
        maxWidth: '600px',
        width: '100%'
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

      {/* SIG Input */}
      <Controller
        name="sig"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Prescription Directions (SIG)"
            placeholder="Take 1 tablet twice daily"
            fullWidth
            required
            multiline
            rows={2}
            error={!!errors.sig}
            helperText={errors.sig?.message || 'Example: Take 1 tablet twice daily'}
            sx={{ mb: 3 }}
            disabled={loading}
          />
        )}
      />

      {/* Days Supply Input */}
      <Controller
        name="daysSupply"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Days Supply"
            type="number"
            placeholder="30"
            fullWidth
            error={!!errors.daysSupply}
            helperText={errors.daysSupply?.message || 'Optional - leave blank if not calculating quantity'}
            sx={{ mb: 3 }}
            disabled={loading}
            inputProps={{
              min: 1,
              max: 365
            }}
            onChange={(e) => {
              const value = e.target.value;
              field.onChange(value === '' ? '' : parseInt(value, 10));
            }}
          />
        )}
      />

      {/* Submit and Clear Buttons */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading || isSubmitting || !isValid}
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
      {Object.keys(errors).length > 0 && !loading && !isSubmitting && (
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
          {errors.sig && (
            <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
              • {errors.sig.message}
            </Typography>
          )}
          {errors.daysSupply && (
            <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
              • {errors.daysSupply.message}
            </Typography>
          )}
        </Alert>
      )}
    </Box>
  );
}
