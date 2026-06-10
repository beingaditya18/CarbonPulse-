/**
 * @fileoverview Comprehensive unit tests for the OLS Digital Carbon Twin Regression Engine.
 */

import { describe, it, expect } from 'vitest';

import {
  fitRegression,
  projectEmissions,
  PROJECTION_WINDOWS,
  simulateTwinEmissions,
  type EmissionDataPoint,
} from '@/lib/twinRegression';
import type { CarbonLog } from '@/types/carbon.types';

/**
 * TSDoc: Factory function to construct strongly typed EmissionDataPoint objects for testing.
 * 
 * @param partial - Optional partial overrides for EmissionDataPoint
 * @returns A complete EmissionDataPoint object
 */
export function makeEmissionDataPoint(partial?: Partial<EmissionDataPoint>): EmissionDataPoint {
  return {
    x: 0,
    y: 0,
    ...partial,
  };
}

/**
 * TSDoc: Factory function to construct strongly typed CarbonLog objects for twin testing.
 * 
 * @param partial - Optional partial overrides for CarbonLog
 * @returns A complete CarbonLog object
 */
export function makeCarbonLog(partial?: Partial<CarbonLog>): CarbonLog {
  return {
    id: `log-${Math.random().toString(36).substring(7)}`,
    category: 'transportation',
    emission_amount: 0,
    source: 'manual',
    description: 'Test logging activity',
    logged_date: '2026-06-10T12:00:00.000Z',
    ...partial,
  };
}

describe('Twin Regression Engine - Comprehensive Test Suite (15 Tests)', () => {

  // Test 1: Perfect linear data returns exact slope & intercept
  it('1. perfect linear data (y = 2x + 1) returns slope ≈ 2 and intercept ≈ 1', () => {
    const data: EmissionDataPoint[] = [
      makeEmissionDataPoint({ x: 0, y: 1 }),
      makeEmissionDataPoint({ x: 1, y: 3 }),
      makeEmissionDataPoint({ x: 2, y: 5 }),
      makeEmissionDataPoint({ x: 3, y: 7 }),
    ];
    const model = fitRegression(data);
    expect(model.slope).toBeCloseTo(2, 4);
    expect(model.intercept).toBeCloseTo(1, 4);
    expect(model.rSquared).toBeCloseTo(1, 4);
  });

  // Test 2: Constant data returns slope ≈ 0
  it('2. constant data (all same values) returns slope ≈ 0 and correct intercept', () => {
    const data: EmissionDataPoint[] = [
      makeEmissionDataPoint({ x: 0, y: 10 }),
      makeEmissionDataPoint({ x: 1, y: 10 }),
      makeEmissionDataPoint({ x: 2, y: 10 }),
    ];
    const model = fitRegression(data);
    expect(model.slope).toBeCloseTo(0, 4);
    expect(model.intercept).toBeCloseTo(10, 4);
  });

  // Test 3: 30-day projection extends from last data point correctly
  it('3. 30-day projection extends from last data point correctly', () => {
    const data: EmissionDataPoint[] = [
      makeEmissionDataPoint({ x: 0, y: 10 }),
      makeEmissionDataPoint({ x: 1, y: 12 }),
    ];
    const model = fitRegression(data);
    const projection = projectEmissions(model, PROJECTION_WINDOWS.short);
    expect(projection.baseline).toHaveLength(PROJECTION_WINDOWS.short);
    // x = 1 (last point value 12) -> projection first point is i = 1 -> y = 2*1 + 10 = 12
    expect(projection.baseline[0]).toBeCloseTo(12, 1);
  });

  // Test 4: 60-day projection is longer than 30-day
  it('4. 60-day projection is longer than 30-day projection', () => {
    const data: EmissionDataPoint[] = [
      makeEmissionDataPoint({ x: 0, y: 10 }),
      makeEmissionDataPoint({ x: 1, y: 12 }),
    ];
    const model = fitRegression(data);
    const p30 = projectEmissions(model, PROJECTION_WINDOWS.short);
    const p60 = projectEmissions(model, PROJECTION_WINDOWS.medium);
    expect(p60.baseline.length).toBeGreaterThan(p30.baseline.length);
    expect(p60.baseline).toHaveLength(60);
  });

  // Test 5: 90-day projection is longer than 60-day
  it('5. 90-day projection is longer than 60-day projection', () => {
    const data: EmissionDataPoint[] = [
      makeEmissionDataPoint({ x: 0, y: 10 }),
      makeEmissionDataPoint({ x: 1, y: 12 }),
    ];
    const model = fitRegression(data);
    const p60 = projectEmissions(model, PROJECTION_WINDOWS.medium);
    const p90 = projectEmissions(model, PROJECTION_WINDOWS.long);
    expect(p90.baseline.length).toBeGreaterThan(p60.baseline.length);
    expect(p90.baseline).toHaveLength(90);
  });

  // Test 6: Projection values are finite numbers
  it('6. projection values are all finite numbers (no NaN or Infinity)', () => {
    const data: EmissionDataPoint[] = [
      makeEmissionDataPoint({ x: 0, y: 10 }),
      makeEmissionDataPoint({ x: 1, y: 12 }),
    ];
    const model = fitRegression(data);
    const projection = projectEmissions(model, PROJECTION_WINDOWS.short);
    projection.baseline.forEach(val => {
      expect(isFinite(val)).toBe(true);
      expect(val).not.toBeNaN();
    });
    projection.simulated.forEach(val => {
      expect(isFinite(val)).toBe(true);
      expect(val).not.toBeNaN();
    });
  });

  // Test 7: Reducing a category by 20% lowers simulated total
  it('7. reducing a category by 20% in simulation lowers projected total vs baseline', () => {
    const logs = [
      makeCarbonLog({ category: 'transportation', emission_amount: 100, logged_date: '2026-06-01T00:00:00.000Z' }),
      makeCarbonLog({ category: 'transportation', emission_amount: 110, logged_date: '2026-06-02T00:00:00.000Z' }),
      makeCarbonLog({ category: 'transportation', emission_amount: 120, logged_date: '2026-06-03T00:00:00.000Z' }),
    ];
    const result = simulateTwinEmissions(logs, 'transportation', 20, 30);
    expect(result.simulatedProjected).toBeLessThan(result.baselineProjected);
    expect(result.carbonSaved).toBeGreaterThan(0);
  });

  // Test 8: All-zero reduction parameter matches baseline trajectory
  it('8. all-zero reduction parameters matches baseline trajectory exactly', () => {
    const model = fitRegression([
      makeEmissionDataPoint({ x: 0, y: 10 }),
      makeEmissionDataPoint({ x: 1, y: 20 }),
    ]);
    const projection = projectEmissions(model, 30, { transportation: 0 });
    expect(projection.simulated).toEqual(projection.baseline);
  });

  // Test 9: Result is deterministic
  it('9. regression model fitting is perfectly deterministic', () => {
    const data = [
      makeEmissionDataPoint({ x: 0, y: 10 }),
      makeEmissionDataPoint({ x: 1, y: 15 }),
      makeEmissionDataPoint({ x: 2, y: 14 }),
    ];
    const m1 = fitRegression(data);
    const m2 = fitRegression(data);
    expect(m1).toEqual(m2);
  });

  // Test 10: Handles minimum viable dataset (2 data points)
  it('10. handles minimum viable dataset of exactly 2 data points without throwing', () => {
    const data = [
      makeEmissionDataPoint({ x: 0, y: 10 }),
      makeEmissionDataPoint({ x: 1, y: 20 }),
    ];
    expect(() => fitRegression(data)).not.toThrow();
    const model = fitRegression(data);
    expect(model.slope).toBe(10);
    expect(model.intercept).toBe(10);
  });

  // Test 11: Negative slope data projects declining emissions
  it('11. negative slope data projects declining emissions', () => {
    const data = [
      makeEmissionDataPoint({ x: 0, y: 100 }),
      makeEmissionDataPoint({ x: 1, y: 80 }),
      makeEmissionDataPoint({ x: 2, y: 60 }),
    ];
    const model = fitRegression(data);
    expect(model.slope).toBeLessThan(0);
    const projection = projectEmissions(model, 10);
    // Verify that future projected values are decreasing
    expect(projection.baseline[4]).toBeLessThan(projection.baseline[0]);
  });

  // Test 12: Simulation trajectory is always lower than or equal to baseline when reduction params are positive
  it('12. simulation trajectory is always lower than or equal to baseline for positive reduction parameters', () => {
    const model = fitRegression([
      makeEmissionDataPoint({ x: 0, y: 50 }),
      makeEmissionDataPoint({ x: 1, y: 60 }),
    ]);
    const projection = projectEmissions(model, 30, { transportation: 0.15 });
    for (let i = 0; i < projection.baseline.length; i++) {
      expect(projection.simulated[i]).toBeLessThanOrEqual(projection.baseline[i]);
    }
  });

  // Test 13: Fitting regression throws if fewer than MIN_DATA_POINTS (2)
  it('13. throws an error when dataset has fewer than 2 data points', () => {
    const data = [makeEmissionDataPoint({ x: 0, y: 10 })];
    expect(() => fitRegression(data)).toThrow(`Insufficient data points to fit regression`);
  });

  // Test 14: Output contains baseline and simulated arrays
  it('14. projectEmissions output contains both baseline and simulated properties as arrays', () => {
    const model = fitRegression([
      makeEmissionDataPoint({ x: 0, y: 10 }),
      makeEmissionDataPoint({ x: 1, y: 20 }),
    ]);
    const projection = projectEmissions(model, 15);
    expect(projection).toHaveProperty('baseline');
    expect(projection).toHaveProperty('simulated');
    expect(Array.isArray(projection.baseline)).toBe(true);
    expect(Array.isArray(projection.simulated)).toBe(true);
    expect(projection.baseline).toHaveLength(15);
    expect(projection.simulated).toHaveLength(15);
  });

  // Test 15: Large dataset performance check (under 50ms)
  it('15. large input dataset (365 points) completes fitRegression in under 50ms', () => {
    const data: EmissionDataPoint[] = [];
    for (let i = 0; i < 365; i++) {
      data.push(makeEmissionDataPoint({ x: i, y: 50 + Math.sin(i) * 10 }));
    }
    const start = performance.now();
    const model = fitRegression(data);
    const duration = performance.now() - start;
    expect(model.slope).toBeDefined();
    expect(duration).toBeLessThan(50);
  });
});

describe('simulateTwinEmissions — branch coverage', () => {

  it('returns zero result for empty logs (empty branch)', () => {
    const result = simulateTwinEmissions([], 'transportation', 20, 30);
    expect(result.baselineProjected).toBe(0);
    expect(result.simulatedProjected).toBe(0);
    expect(result.carbonSaved).toBe(0);
    expect(result.scenarioDescription).toMatch(/No historical/);
  });

  it('uses proportional fallback model when fewer than 3 unique logging days', () => {
    // Only 2 unique days → triggers the fallback branch
    const logs = [
      makeCarbonLog({ category: 'transportation', emission_amount: 50, logged_date: '2026-06-01T00:00:00.000Z' }),
      makeCarbonLog({ category: 'food', emission_amount: 30, logged_date: '2026-06-02T00:00:00.000Z' }),
    ];
    const result = simulateTwinEmissions(logs, 'transportation', 10, 30);
    expect(result.baselineProjected).toBeGreaterThan(0);
    expect(result.simulatedProjected).toBeLessThan(result.baselineProjected);
    expect(result.scenarioDescription).toMatch(/Proportional Model/);
  });

  it('fallback model handles overallTotal = 0 by using default categoryRatio 0.2', () => {
    // Single day, all zeros in emission_amount → overallTotal = 0
    const logs = [
      makeCarbonLog({ category: 'transportation', emission_amount: 0, logged_date: '2026-06-01T00:00:00.000Z' }),
    ];
    const result = simulateTwinEmissions(logs, 'transportation', 50, 30);
    // With dailyAvg = 0, baselineProjected = 0 → all zeros
    expect(result.baselineProjected).toBe(0);
    expect(result.carbonSaved).toBe(0);
  });
});

