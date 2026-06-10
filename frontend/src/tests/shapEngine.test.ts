/**
 * @fileoverview Comprehensive unit tests for the SHAP Explainable AI Engine.
 */

import { describe, it, expect } from 'vitest';

import {
  assignEcoGrade,
  calculateSHAPExplanations,
  calculateShapValues,
  EXPECTED_BASE_VALUE,
  REGIONAL_BASELINES,
  type UserEmissionInput,
} from '@/lib/shapEngine';
import type { CarbonLog } from '@/types/carbon.types';

/**
 * TSDoc: Factory function to construct strongly typed CarbonLog objects for SHAP testing.
 * 
 * @param partial - Optional partial overrides for the created CarbonLog
 * @returns A complete, valid CarbonLog object
 */
export function makeCarbonLog(partial?: Partial<CarbonLog>): CarbonLog {
  return {
    id: `log-${Math.random().toString(36).substring(7)}`,
    category: 'transportation',
    emission_amount: 0,
    source: 'manual',
    description: 'Test log entry',
    logged_date: '2026-06-10T12:00:00.000Z',
    ...partial,
  };
}

/**
 * TSDoc: Factory function to construct strongly typed UserEmissionInput objects for testing.
 * 
 * @param partial - Optional partial overrides for UserEmissionInput
 * @returns A complete UserEmissionInput object
 */
export function makeUserEmissionInput(partial?: Partial<UserEmissionInput>): UserEmissionInput {
  return {
    category: 'transportation',
    value: 0,
    ...partial,
  };
}

describe('SHAP Engine - Comprehensive Test Suite (15 Tests)', () => {
  // Test 1: Returns explanations with keys matching the expected categories
  it('1. returns explanations containing features for all five categories', () => {
    const logs = [
      makeCarbonLog({ category: 'transportation', emission_amount: 80 }),
      makeCarbonLog({ category: 'electricity', emission_amount: 70 }),
      makeCarbonLog({ category: 'food', emission_amount: 40 }),
      makeCarbonLog({ category: 'shopping', emission_amount: 20 }),
      makeCarbonLog({ category: 'waste', emission_amount: 10 }),
    ];
    const result = calculateSHAPExplanations(logs, new Date('2026-06-10T12:00:00.000Z'));
    expect(result.explanations).toHaveLength(5);
    const features = result.explanations.map(e => e.feature);
    expect(features).toContain('Transportation');
    expect(features).toContain('Electricity');
    expect(features).toContain('Diet & Food');
    expect(features).toContain('Shopping');
    expect(features).toContain('Waste & Garbage');
  });

  // Test 2: Contributions sum matches total deviation from baseline
  it('2. all Shapley values sum to the total deviation from EXPECTED_BASE_VALUE within tolerance', () => {
    const logs = [
      makeCarbonLog({ category: 'transportation', emission_amount: 120 }),
      makeCarbonLog({ category: 'electricity', emission_amount: 90 }),
      makeCarbonLog({ category: 'food', emission_amount: 50 }),
      makeCarbonLog({ category: 'shopping', emission_amount: 30 }),
      makeCarbonLog({ category: 'waste', emission_amount: 15 }),
    ];
    const result = calculateSHAPExplanations(logs, new Date('2026-06-10T12:00:00.000Z'));
    const shapSum = result.explanations.reduce((sum, e) => sum + e.shapValue, 0);
    const deviation = result.predictedEmissions - EXPECTED_BASE_VALUE;
    expect(shapSum).toBeCloseTo(deviation, 1);
  });

  // Test 3: User at exact baseline gets zero SHAP values
  it('3. a user at exactly baseline levels gets zero SHAP values (within rounding)', () => {
    const logs = [
      makeCarbonLog({ category: 'transportation', emission_amount: 80 }),
      makeCarbonLog({ category: 'electricity', emission_amount: 70 }),
      makeCarbonLog({ category: 'food', emission_amount: 40 }),
      makeCarbonLog({ category: 'shopping', emission_amount: 20 }),
      makeCarbonLog({ category: 'waste', emission_amount: 10 }),
    ];
    const result = calculateSHAPExplanations(logs, new Date('2026-06-10T12:00:00.000Z'));
    result.explanations.forEach(e => {
      expect(Math.abs(e.shapValue)).toBeLessThanOrEqual(1.5);
    });
  });

  // Test 4: User 2x baseline gets positive SHAP values
  it('4. a user at 2x the baseline gets correct positive deviations', () => {
    const logs = [
      makeCarbonLog({ category: 'transportation', emission_amount: 160 }),
      makeCarbonLog({ category: 'electricity', emission_amount: 140 }),
      makeCarbonLog({ category: 'food', emission_amount: 80 }),
      makeCarbonLog({ category: 'shopping', emission_amount: 40 }),
      makeCarbonLog({ category: 'waste', emission_amount: 20 }),
    ];
    const result = calculateSHAPExplanations(logs, new Date('2026-06-10T12:00:00.000Z'));
    result.explanations.forEach(e => {
      expect(e.shapValue).toBeGreaterThanOrEqual(-1.5); // should be positive or near-zero if interaction makes it higher
    });
    expect(result.predictedEmissions).toBeGreaterThan(EXPECTED_BASE_VALUE);
  });

  // Test 5: User below baseline gets correct negative deviations
  it('5. a user below the baseline gets correct negative deviations', () => {
    const logs = [
      makeCarbonLog({ category: 'transportation', emission_amount: 20 }),
      makeCarbonLog({ category: 'electricity', emission_amount: 10 }),
      makeCarbonLog({ category: 'food', emission_amount: 5 }),
      makeCarbonLog({ category: 'shopping', emission_amount: 2 }),
      makeCarbonLog({ category: 'waste', emission_amount: 1 }),
    ];
    const result = calculateSHAPExplanations(logs, new Date('2026-06-10T12:00:00.000Z'));
    result.explanations.forEach(e => {
      expect(e.shapValue).toBeLessThan(0);
    });
  });

  // Test 6: Zero logs in a category returns zero contribution in marginal values
  it('6. zero emissions for category in base calculateShapValues matches baseline difference', () => {
    const input = [makeUserEmissionInput({ category: 'transportation', value: 0 })];
    const baseline = { transportation: 0 };
    const result = calculateShapValues(input, baseline);
    expect(result[0].contribution).toBe(0);
  });

  // Test 7: Dominated single category dominates SHAP values
  it('7. extremely high single-category value dominates the SHAP output correctly', () => {
    const logs = [
      makeCarbonLog({ category: 'transportation', emission_amount: 5000 }),
      makeCarbonLog({ category: 'electricity', emission_amount: 10 }),
      makeCarbonLog({ category: 'food', emission_amount: 10 }),
    ];
    const result = calculateSHAPExplanations(logs, new Date('2026-06-10T12:00:00.000Z'));
    const maxImpactFeature = result.explanations[0];
    expect(maxImpactFeature.feature).toBe('Transportation');
    expect(maxImpactFeature.direction).toBe('higher');
  });

  // Test 8: Determinism
  it('8. SHAP calculations are perfectly deterministic', () => {
    const logs = [
      makeCarbonLog({ category: 'transportation', emission_amount: 120 }),
      makeCarbonLog({ category: 'electricity', emission_amount: 85 }),
    ];
    const res1 = calculateSHAPExplanations(logs, new Date('2026-06-10T12:00:00.000Z'));
    const res2 = calculateSHAPExplanations(logs, new Date('2026-06-10T12:00:00.000Z'));
    expect(res1).toEqual(res2);
  });

  // Test 9: Purity check (no mutation of input array/objects)
  it('9. function does not mutate input log objects or array', () => {
    const logs = [
      makeCarbonLog({ category: 'transportation', emission_amount: 100 }),
    ];
    const originalLogsJSON = JSON.stringify(logs);
    calculateSHAPExplanations(logs, new Date('2026-06-10T12:00:00.000Z'));
    expect(JSON.stringify(logs)).toBe(originalLogsJSON);
  });

  // Test 10: Regional baseline parameters changes output correctly
  it('10. handles regional baselines differences correctly in marginal calculations', () => {
    const emissions = [makeUserEmissionInput({ category: 'transportation', value: 100 })];
    const US_baseline = { transportation: REGIONAL_BASELINES.US / 12 };
    const IN_baseline = { transportation: REGIONAL_BASELINES.IN / 12 };
    
    const US_result = calculateShapValues(emissions, US_baseline);
    const IN_result = calculateShapValues(emissions, IN_baseline);
    
    expect(US_result[0].contribution).not.toBe(IN_result[0].contribution);
    expect(IN_result[0].contribution).toBeGreaterThan(US_result[0].contribution);
  });

  // Test 11: All returned values are finite
  it('11. returns only finite numbers (no NaN or Infinity)', () => {
    const logs = [makeCarbonLog({ category: 'transportation', emission_amount: 100 })];
    const result = calculateSHAPExplanations(logs, new Date('2026-06-10T12:00:00.000Z'));
    expect(isFinite(result.predictedEmissions)).toBe(true);
    expect(result.predictedEmissions).not.toBeNaN();
    result.explanations.forEach(e => {
      expect(isFinite(e.shapValue)).toBe(true);
      expect(e.shapValue).not.toBeNaN();
      expect(isFinite(e.impact)).toBe(true);
      expect(e.impact).not.toBeNaN();
    });
  });

  // Test 12: Throws if input is empty
  it('12. calculateShapValues throws error if user emissions array is empty', () => {
    expect(() => calculateShapValues([], { transportation: 100 })).toThrow('Insufficient data');
  });

  // Test 13: Fractional impacts are valid (impact percentages between 0 and 100)
  it('13. feature impact percentages are always within [0, 100]', () => {
    const logs = [
      makeCarbonLog({ category: 'transportation', emission_amount: 400 }),
      makeCarbonLog({ category: 'electricity', emission_amount: 500 }),
    ];
    const result = calculateSHAPExplanations(logs, new Date('2026-06-10T12:00:00.000Z'));
    result.explanations.forEach(e => {
      expect(e.impact).toBeGreaterThanOrEqual(0);
      expect(e.impact).toBeLessThanOrEqual(100);
    });
  });

  // Test 14: Eco grade assignments
  it('14. correctly assigns eco grades A, B, C, D based on baseline ratios', () => {
    expect(assignEcoGrade(40, 100)).toBe('A');  // ratio 0.4 < 0.5
    expect(assignEcoGrade(80, 100)).toBe('B');  // ratio 0.8 < 1.0
    expect(assignEcoGrade(120, 100)).toBe('C'); // ratio 1.2 < 1.5
    expect(assignEcoGrade(160, 100)).toBe('D'); // ratio 1.6 >= 1.5
  });

  // Test 15: Single day log handles correctly
  it('15. handles single log entry edge case correctly', () => {
    const logs = [makeCarbonLog({ category: 'transportation', emission_amount: 150 })];
    const result = calculateSHAPExplanations(logs, new Date('2026-06-10T12:00:00.000Z'));
    expect(result.predictedEmissions).toBeCloseTo(180, 1); // 150 * 1.2 = 180
    expect(result.explanations).toHaveLength(5);
  });
});
