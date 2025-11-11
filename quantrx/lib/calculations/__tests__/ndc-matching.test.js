/**
 * Unit tests for NDC matching algorithm
 *
 * Tests the core NDC matching logic including tolerance calculations,
 * optimal package selection, and edge cases.
 */

import {
  selectOptimalNDCs,
  findBestSingleNDC,
  calculateOverfillPercentage,
  isWithinTolerance,
  getToleranceConfig,
  TOLERANCE
} from '../ndc-matching.js';

// Mock NDC data for testing
const mockNDCs = [
  {
    ndc: '0009-0054-30',
    manufacturer: 'Merck Sharp & Dohme Corp.',
    packageSize: 30,
    dosageForm: 'tablet',
    strength: '10 mg',
    status: 'active'
  },
  {
    ndc: '0009-0054-90',
    manufacturer: 'Merck Sharp & Dohme Corp.',
    packageSize: 90,
    dosageForm: 'tablet',
    strength: '10 mg',
    status: 'active'
  },
  {
    ndc: '00143-9835-01',
    manufacturer: 'West-Ward Pharmaceuticals Corp.',
    packageSize: 100,
    dosageForm: 'tablet',
    strength: '10 mg',
    status: 'active'
  },
  {
    ndc: '0071-0525-23',
    manufacturer: 'Parke-Davis Div of Pfizer Inc',
    packageSize: 30,
    dosageForm: 'tablet',
    strength: '10 mg',
    status: 'inactive'
  }
];

describe('NDC Matching Algorithm', () => {

  describe('selectOptimalNDCs', () => {
    test('should find exact match when available', () => {
      const result = selectOptimalNDCs(30, mockNDCs);

      expect(result.success).toBe(true);
      expect(result.recommendations).toHaveLength(1);
      expect(result.recommendations[0].totalQuantity).toBe(30);
      expect(result.recommendations[0].overfill).toBe(0);
      expect(result.recommendations[0].matchQuality).toBe('exact');
    });

    test('should find best overfill match when exact not available', () => {
      const result = selectOptimalNDCs(25, mockNDCs);

      expect(result.success).toBe(true);
      expect(result.recommendations).toHaveLength(1);
      expect(result.recommendations[0].totalQuantity).toBe(30);
      expect(result.recommendations[0].overfill).toBeGreaterThan(0);
      expect(result.recommendations[0].matchQuality).toBe('moderate_overfill');
    });

    test('should return multiple alternatives', () => {
      const result = selectOptimalNDCs(60, mockNDCs, { maxAlternatives: 3 });

      expect(result.success).toBe(true);
      expect(result.alternatives.length).toBeGreaterThan(0);
      expect(result.alternatives.length).toBeLessThanOrEqual(3);
    });

    test('should filter out inactive NDCs', () => {
      const result = selectOptimalNDCs(30, mockNDCs);

      // Should find the active 30-count NDC, not the inactive one
      expect(result.success).toBe(true);
      expect(result.recommendations[0].ndcs[0].status).toBe('active');
    });

    test('should generate warnings for inactive NDCs', () => {
      const result = selectOptimalNDCs(30, mockNDCs);

      expect(result.warnings).toBeDefined();
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].type).toBe('inactive_ndc');
    });

    test('should handle invalid quantity input', () => {
      const result = selectOptimalNDCs(-10, mockNDCs);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid quantity');
    });

    test('should handle empty NDC list', () => {
      const result = selectOptimalNDCs(30, []);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No NDCs available');
    });

    test('should handle no active NDCs', () => {
      const inactiveOnly = mockNDCs.filter(ndc => ndc.status === 'inactive');
      const result = selectOptimalNDCs(30, inactiveOnly);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No active NDCs available');
    });
  });

  describe('findBestSingleNDC', () => {
    test('should find exact match', () => {
      const result = findBestSingleNDC(30, mockNDCs);

      expect(result).not.toBeNull();
      expect(result.totalQuantity).toBe(30);
      expect(result.overfill).toBe(0);
      expect(result.packages).toBe(1);
    });

    test('should find best overfill match', () => {
      const result = findBestSingleNDC(25, mockNDCs);

      expect(result).not.toBeNull();
      expect(result.totalQuantity).toBe(30);
      expect(result.overfill).toBeGreaterThan(0);
      expect(result.packages).toBe(1);
    });

    test('should use multiple packages when beneficial', () => {
      const result = findBestSingleNDC(120, mockNDCs);

      expect(result).not.toBeNull();
      expect(result.packages).toBeGreaterThan(1);
      expect(result.totalQuantity).toBeGreaterThanOrEqual(120);
    });

    test('should return null when no suitable match', () => {
      const smallNDCs = mockNDCs.filter(ndc => ndc.packageSize < 10);
      const result = findBestSingleNDC(50, smallNDCs);

      expect(result).toBeNull();
    });
  });

  describe('calculateOverfillPercentage', () => {
    test('should calculate exact match as 0%', () => {
      const result = calculateOverfillPercentage(100, 100);
      expect(result).toBe(0);
    });

    test('should calculate overfill correctly', () => {
      const result = calculateOverfillPercentage(110, 100);
      expect(result).toBe(10);
    });

    test('should calculate underfill as negative', () => {
      const result = calculateOverfillPercentage(90, 100);
      expect(result).toBe(-10);
    });

    test('should handle zero target quantity', () => {
      const result = calculateOverfillPercentage(10, 0);
      expect(result).toBe(0);
    });
  });

  describe('isWithinTolerance', () => {
    test('should accept exact matches', () => {
      expect(isWithinTolerance(0)).toBe(true);
    });

    test('should accept small overfill', () => {
      expect(isWithinTolerance(5)).toBe(true);
      expect(isWithinTolerance(TOLERANCE.MAX_OVERFILL_PERCENTAGE)).toBe(true);
    });

    test('should accept small underfill', () => {
      expect(isWithinTolerance(-2)).toBe(true);
      expect(isWithinTolerance(-TOLERANCE.MAX_UNDERFILL_PERCENTAGE)).toBe(true);
    });

    test('should reject excessive overfill', () => {
      expect(isWithinTolerance(TOLERANCE.MAX_OVERFILL_PERCENTAGE + 1)).toBe(false);
    });

    test('should reject excessive underfill', () => {
      expect(isWithinTolerance(-TOLERANCE.MAX_UNDERFILL_PERCENTAGE - 1)).toBe(false);
    });
  });

  describe('getToleranceConfig', () => {
    test('should return tolerance configuration', () => {
      const config = getToleranceConfig();

      expect(config).toHaveProperty('maxOverfill');
      expect(config).toHaveProperty('maxUnderfill');
      expect(config).toHaveProperty('preferredOverfill');

      expect(config.maxOverfill).toBe(TOLERANCE.MAX_OVERFILL_PERCENTAGE);
      expect(config.maxUnderfill).toBe(TOLERANCE.MAX_UNDERFILL_PERCENTAGE);
      expect(config.preferredOverfill).toBe(TOLERANCE.PREFERRED_OVERFILL_PERCENTAGE);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very small quantities', () => {
      const result = selectOptimalNDCs(1, mockNDCs);

      expect(result.success).toBe(true);
      // Should find some match, even if overfill
    });

    test('should handle very large quantities', () => {
      const result = selectOptimalNDCs(1000, mockNDCs);

      expect(result.success).toBe(true);
      // Should find some combination
    });

    test('should handle fractional quantities', () => {
      const result = selectOptimalNDCs(15.5, mockNDCs);

      expect(result.success).toBe(true);
      // Should round up appropriately
    });

    test('should prefer larger packages for efficiency', () => {
      const result = selectOptimalNDCs(90, mockNDCs);

      expect(result.success).toBe(true);
      // Should prefer the 90-count package over multiple 30-count packages
      expect(result.recommendations[0].totalQuantity).toBe(90);
    });

    test('should handle NDCs with same package size', () => {
      const duplicateNDCs = [
        { ...mockNDCs[0] }, // 30-count
        { ...mockNDCs[0], ndc: 'different-ndc' } // Another 30-count
      ];

      const result = selectOptimalNDCs(30, duplicateNDCs);
      expect(result.success).toBe(true);
    });
  });

  describe('Combination Generation', () => {
    test('should generate single package combinations', () => {
      const result = selectOptimalNDCs(30, [mockNDCs[0]]); // Only 30-count

      expect(result.success).toBe(true);
      expect(result.recommendations[0].packages[0]).toBe(1);
      expect(result.recommendations[0].totalQuantity).toBe(30);
    });

    test('should generate multiple package combinations', () => {
      const result = selectOptimalNDCs(60, [mockNDCs[0]]); // Only 30-count

      expect(result.success).toBe(true);
      expect(result.recommendations[0].packages[0]).toBe(2);
      expect(result.recommendations[0].totalQuantity).toBe(60);
    });

    test('should respect allowMultiplePackages option', () => {
      const result = selectOptimalNDCs(60, mockNDCs, { allowMultiplePackages: false });

      expect(result.success).toBe(true);
      // Should find single larger package instead of multiple smaller ones
    });
  });

  describe('Scoring and Ranking', () => {
    test('should rank exact matches highest', () => {
      const result = selectOptimalNDCs(30, mockNDCs);

      expect(result.recommendations[0].score).toBe(0); // Exact match should have score 0
    });

    test('should prefer smaller overfill percentages', () => {
      const result = selectOptimalNDCs(35, mockNDCs);

      expect(result.success).toBe(true);
      // Should prefer smaller overfill over larger overfill
      expect(result.recommendations[0].overfill).toBeLessThan(50);
    });

    test('should penalize more packages', () => {
      // Test with quantity that requires multiple small packages vs one large
      const result = selectOptimalNDCs(120, mockNDCs);

      expect(result.success).toBe(true);
      // Algorithm should prefer combinations with fewer packages
    });
  });
});
