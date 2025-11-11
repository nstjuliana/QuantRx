/**
 * Unit tests for Calculation Service Layer
 *
 * Tests the orchestration logic that coordinates all calculation components.
 * Mocks individual services to test integration and error handling.
 */

import {
  runCalculation,
  normalizeDrug,
  parseSIGStep,
  calculateQuantityStep,
  fetchNDCs,
  matchNDCsStep
} from '../calculation-service.js';

// Mock the dependencies
jest.mock('../../api/rxnorm.js');
jest.mock('../../api/fda.js');
jest.mock('../../calculations/sig-parsing.js');
jest.mock('../../calculations/quantity.js');
jest.mock('../../calculations/ndc-matching.js');
jest.mock('../../utils/logger.js');
jest.mock('../../utils/performance.js');

import { searchDrugByName } from '../../api/rxnorm.js';
import { getNDCsByRxCUI } from '../../api/fda.js';
import { parseSIG } from '../../calculations/sig-parsing.js';
import { calculateQuantity } from '../../calculations/quantity.js';
import { selectOptimalNDCs } from '../../calculations/ndc-matching.js';
import { logCalculationStart, logCalculationCompleted } from '../../utils/logger.js';
import { trackCalculation } from '../../utils/performance.js';

// Mock data
const mockDrugData = {
  rxcui: '29046',
  name: 'lisinopril',
  synonym: 'Prinivil'
};

const mockParsedSIG = {
  dose: 1,
  frequency: 2,
  unit: 'tablet',
  parseSuccess: true
};

const mockQuantityResult = {
  quantity: 60,
  unit: 'tablet',
  success: true,
  calculation: '1 × 2 × 30 = 60'
};

const mockNDCData = {
  active: [
    {
      ndc: '0009-0054-30',
      manufacturer: 'Merck',
      packageSize: 30,
      dosageForm: 'tablet',
      status: 'active'
    }
  ],
  inactive: []
};

const mockMatchingResult = {
  success: true,
  recommendations: [{
    ndc: '0009-0054-30',
    packages: 2,
    totalQuantity: 60,
    overfill: 0,
    breakdown: '2 × 30-count packages = 60 units'
  }],
  alternatives: [],
  warnings: []
};

describe('Calculation Service', () => {

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    logCalculationStart.mockReturnValue('test-request-id');
    trackCalculation.mockReturnValue(jest.fn());
    searchDrugByName.mockResolvedValue(mockDrugData);
    parseSIG.mockReturnValue(mockParsedSIG);
    calculateQuantity.mockReturnValue(mockQuantityResult);
    getNDCsByRxCUI.mockResolvedValue(mockNDCData);
    selectOptimalNDCs.mockReturnValue(mockMatchingResult);
  });

  describe('runCalculation', () => {
    const validInput = {
      drugName: 'lisinopril',
      sig: 'Take 1 tablet twice daily',
      daysSupply: 30
    };

    test('should orchestrate complete calculation workflow', async () => {
      const result = await runCalculation(validInput);

      expect(result.success).toBe(true);
      expect(result.status).toBe('success');
      expect(result.normalization.rxcui).toBe('29046');
      expect(result.calculation.calculatedQuantity).toBe(60);
      expect(result.recommendation).toBeDefined();
      expect(result.warnings).toEqual([]);

      expect(searchDrugByName).toHaveBeenCalledWith('lisinopril', { userId: null });
      expect(parseSIG).toHaveBeenCalledWith('Take 1 tablet twice daily');
      expect(calculateQuantity).toHaveBeenCalledWith(mockParsedSIG, 30);
      expect(getNDCsByRxCUI).toHaveBeenCalledWith('29046', { userId: null });
      expect(selectOptimalNDCs).toHaveBeenCalledWith(60, expect.any(Array), { maxAlternatives: 5 });

      expect(logCalculationStart).toHaveBeenCalledWith(validInput, null);
      expect(logCalculationCompleted).toHaveBeenCalled();
    });

    test('should handle direct NDC input', async () => {
      const ndcInput = {
        ndc: '0009-0054-30',
        sig: 'Take 1 tablet twice daily',
        daysSupply: 30
      };

      const result = await runCalculation(ndcInput);

      expect(result.success).toBe(true);
      expect(result.normalization.source).toBe('direct_ndc');
      expect(searchDrugByName).not.toHaveBeenCalled();
    });

    test('should handle calculation without days supply', async () => {
      const noDaysInput = {
        drugName: 'lisinopril',
        sig: 'Take 1 tablet twice daily'
      };

      calculateQuantity.mockReturnValue({ success: true, data: null });

      const result = await runCalculation(noDaysInput);

      expect(result.success).toBe(true);
      expect(result.calculation).toBeNull();
    });

    test('should handle drug normalization failure', async () => {
      searchDrugByName.mockResolvedValue(null);

      const result = await runCalculation(validInput);

      expect(result.success).toBe(false);
      expect(result.status).toBe('error');
      expect(result.error.type).toBe('normalization_failed');
    });

    test('should handle SIG parsing failure', async () => {
      parseSIG.mockReturnValue({
        parseSuccess: false,
        parseError: 'Unable to parse'
      });

      const result = await runCalculation(validInput);

      expect(result.success).toBe(false);
      expect(result.status).toBe('error');
      expect(result.error.type).toBe('sig_parsing_failed');
    });

    test('should handle quantity calculation failure', async () => {
      calculateQuantity.mockReturnValue({
        success: false,
        error: 'Invalid quantity'
      });

      const result = await runCalculation(validInput);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('quantity_calculation_failed');
    });

    test('should handle NDC fetch failure', async () => {
      getNDCsByRxCUI.mockRejectedValue(new Error('API Error'));

      const result = await runCalculation(validInput);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('ndc_fetch_failed');
    });

    test('should handle NDC matching failure', async () => {
      selectOptimalNDCs.mockReturnValue({
        success: false,
        error: 'No matches found'
      });

      const result = await runCalculation(validInput);

      expect(result.success).toBe(true); // Still successful but with warnings
      expect(result.warnings).toBeDefined();
    });

    test('should pass userId to all components', async () => {
      const userId = 'user123';

      await runCalculation(validInput, { userId });

      expect(searchDrugByName).toHaveBeenCalledWith('lisinopril', { userId });
      expect(getNDCsByRxCUI).toHaveBeenCalledWith('29046', { userId });
    });

    test('should handle unexpected errors', async () => {
      searchDrugByName.mockRejectedValue(new Error('Unexpected error'));

      const result = await runCalculation(validInput);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('unexpected_error');
    });
  });

  describe('normalizeDrug', () => {
    test('should normalize drug name via RxNorm', async () => {
      const result = await normalizeDrug({ drugName: 'lisinopril' });

      expect(result.success).toBe(true);
      expect(result.data.rxcui).toBe('29046');
      expect(result.data.source).toBe('rxnorm');
    });

    test('should handle direct NDC entry', async () => {
      const result = await normalizeDrug({ ndc: '0009-0054-30' });

      expect(result.success).toBe(true);
      expect(result.data.source).toBe('direct_ndc');
      expect(result.data.ndc).toBe('0009-0054-30');
    });

    test('should require either drug name or NDC', async () => {
      const result = await normalizeDrug({ sig: 'test' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('must be provided');
    });

    test('should handle RxNorm API errors', async () => {
      searchDrugByName.mockRejectedValue(new Error('API timeout'));

      const result = await normalizeDrug({ drugName: 'lisinopril' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Drug lookup failed');
    });

    test('should handle drug not found', async () => {
      searchDrugByName.mockResolvedValue(null);

      const result = await normalizeDrug({ drugName: 'nonexistent' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('parseSIGStep', () => {
    test('should parse valid SIG', async () => {
      const result = await parseSIGStep('Take 1 tablet twice daily');

      expect(result.success).toBe(true);
      expect(result.data.dose).toBe(1);
      expect(result.data.frequency).toBe(2);
      expect(result.data.unit).toBe('tablet');
    });

    test('should handle parsing failure', async () => {
      parseSIG.mockReturnValue({
        parseSuccess: false,
        parseError: 'Unable to parse'
      });

      const result = await parseSIGStep('invalid sig');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to parse');
      expect(result.warnings).toHaveLength(1);
    });

    test('should handle parsing errors', async () => {
      parseSIG.mockImplementation(() => {
        throw new Error('Parse exception');
      });

      const result = await parseSIGStep('test sig');

      expect(result.success).toBe(false);
      expect(result.error).toContain('SIG parsing failed');
    });
  });

  describe('calculateQuantityStep', () => {
    test('should calculate quantity with days supply', async () => {
      const result = await calculateQuantityStep(mockParsedSIG, 30);

      expect(result.success).toBe(true);
      expect(result.data.quantity).toBe(60);
      expect(result.data.unit).toBe('tablet');
    });

    test('should skip calculation without days supply', async () => {
      const result = await calculateQuantityStep(mockParsedSIG, null);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    test('should handle calculation errors', async () => {
      calculateQuantity.mockReturnValue({
        success: false,
        error: 'Invalid calculation'
      });

      const result = await calculateQuantityStep(mockParsedSIG, 30);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid calculation');
    });
  });

  describe('fetchNDCs', () => {
    test('should fetch NDCs by RxCUI', async () => {
      const result = await fetchNDCs('29046');

      expect(result.success).toBe(true);
      expect(result.data.active).toHaveLength(1);
      expect(result.data.inactive).toHaveLength(0);
    });

    test('should handle NDC fetch errors', async () => {
      getNDCsByRxCUI.mockRejectedValue(new Error('API error'));

      const result = await fetchNDCs('29046');

      expect(result.success).toBe(false);
      expect(result.error).toContain('NDC lookup failed');
    });

    test('should handle no NDCs found', async () => {
      getNDCsByRxCUI.mockResolvedValue({ active: [], inactive: [] });

      const result = await fetchNDCs('99999');

      expect(result.success).toBe(true);
      expect(result.data.active).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
    });
  });

  describe('matchNDCsStep', () => {
    test('should match optimal NDCs', async () => {
      const result = await matchNDCsStep(60, mockNDCData);

      expect(result.success).toBe(true);
      expect(result.recommendations).toHaveLength(1);
      expect(result.alternatives).toHaveLength(0);
    });

    test('should handle zero quantity', async () => {
      const result = await matchNDCsStep(0, mockNDCData);

      expect(result.success).toBe(true);
      expect(result.recommendations).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
    });

    test('should handle no available NDCs', async () => {
      const result = await matchNDCsStep(60, { active: [], inactive: [] });

      expect(result.success).toBe(true);
      expect(result.recommendations).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
    });

    test('should handle matching errors', async () => {
      selectOptimalNDCs.mockReturnValue({
        success: false,
        error: 'Matching failed'
      });

      const result = await matchNDCsStep(60, mockNDCData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Matching failed');
    });
  });

  describe('Error Handling', () => {
    test('should create proper error results', async () => {
      searchDrugByName.mockRejectedValue(new Error('Network error'));

      const result = await runCalculation(validInput);

      expect(result.success).toBe(false);
      expect(result.id).toMatch(/^calc_/);
      expect(result.timestamp).toBeDefined();
      expect(result.status).toBe('error');
      expect(result.error.message).toContain('Network error');
    });

    test('should include context in error results', async () => {
      searchDrugByName.mockResolvedValue(null);

      const result = await runCalculation(validInput);

      expect(result.error.context.input).toEqual(validInput);
      expect(result.error.context.step).toBe('normalization');
    });
  });

  describe('Result Assembly', () => {
    test('should assemble successful results', async () => {
      const result = await runCalculation(validInput);

      expect(result.id).toMatch(/^calc_/);
      expect(result.timestamp).toBeDefined();
      expect(result.status).toBe('success');
      expect(result.inputs).toEqual(validInput);
      expect(result.normalization).toBeDefined();
      expect(result.calculation).toBeDefined();
      expect(result.recommendation).toBeDefined();
    });

    test('should determine correct status based on warnings', async () => {
      // Add a warning to the mock
      selectOptimalNDCs.mockReturnValue({
        ...mockMatchingResult,
        warnings: [{
          id: 'test_warning',
          type: 'warning',
          severity: 'warning',
          message: 'Test warning'
        }]
      });

      const result = await runCalculation(validInput);

      expect(result.status).toBe('partial'); // Has warnings but still successful
      expect(result.warnings).toHaveLength(1);
    });
  });
});
