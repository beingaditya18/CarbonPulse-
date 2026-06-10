/**
 * @fileoverview SHAP (Shapley Additive Explanations) Engine.
 * Implements game-theoretic Shapley values to explain individual carbon footprint deviations from baseline.
 * @module shapEngine
 */

import { z } from 'zod';

import type { CarbonLog, CategoryType } from '@/types/carbon.types';

/**
 * Zod schema defining the output shape of a category's SHAP contribution explanation.
 */
export const SHAPExplanationSchema = z.object({
  feature: z.string(),
  impact: z.number(), // Percentage impact
  shapValue: z.number(), // kg CO2 impact (positive or negative)
  direction: z.enum(['higher', 'lower']),
  description: z.string(),
});

/**
 * TypeScript type representing a SHAP explanation, inferred from SHAPExplanationSchema.
 */
export type SHAPExplanation = z.infer<typeof SHAPExplanationSchema>;

/**
 * Zod schema defining the contribution result for a category.
 */
export const ShapResultSchema = z.object({
  category: z.string(),
  contribution: z.number(),
});

/**
 * TypeScript type representing a Shap contribution result, inferred from ShapResultSchema.
 */
export type ShapResult = z.infer<typeof ShapResultSchema>;

/**
 * Zod schema for input to the base SHAP calculation.
 */
export const UserEmissionInputSchema = z.object({
  category: z.string(),
  value: z.number(),
});

/**
 * TypeScript type representing emission input, inferred from UserEmissionInputSchema.
 */
export type UserEmissionInput = z.infer<typeof UserEmissionInputSchema>;

/**
 * Zod schema defining the full explanation calculation result.
 */
export const ShapExplanationResultSchema = z.object({
  predictedEmissions: z.number(),
  baseValue: z.number(),
  explanations: z.array(SHAPExplanationSchema),
});

/**
 * TypeScript type representing the return value of calculateSHAPExplanations.
 */
export type ShapExplanationResult = z.infer<typeof ShapExplanationResultSchema>;

/**
 * Global average carbon footprint in kilograms of CO2e per year.
 * Source: Our World in Data 2023 (4.7 tonnes = 4700 kg).
 */
export const GLOBAL_AVG_KG: number = 4700;

/**
 * Regional annual carbon baselines in kilograms of CO2e per capita per year.
 * Source: Our World in Data 2023, US EPA, UK DESNZ/DEFRA 2023.
 */
export const REGIONAL_BASELINES: Record<'US' | 'UK' | 'EU' | 'IN' | 'Global', number> = {
  US: 14000,     // United States: 14.0 t CO2e/year
  UK: 5000,      // United Kingdom: 5.0 t CO2e/year
  EU: 6500,      // European Union: 6.5 t CO2e/year
  IN: 1900,      // India: 1.9 t CO2e/year
  Global: 4700,  // Global average: 4.7 t CO2e/year
} as const;

/**
 * Grade thresholds based on the fraction of the baseline.
 * Source: CarbonPulse AI+ grading guidelines.
 */
export const GRADE_THRESHOLDS = {
  A: 0.5, // Excellent: < 50% of baseline
  B: 1.0, // Good: 50% - 100% of baseline
  C: 1.5, // Fair: 100% - 150% of baseline
} as const;

/**
 * Baseline average monthly values representing a typical household footprint (kg CO2 / month).
 * Source: CarbonPulse internal calibration model.
 */
export const BASELINE_DISTRIBUTION: Record<CategoryType, number> = {
  transportation: 80,
  electricity: 70,
  food: 40,
  shopping: 20,
  waste: 10,
} as const;

/**
 * Expected baseline model output at average values (kg CO2 / month).
 * Calculated as: 1.2*T + 0.9*F + 1.5*E + 1.0*S + 1.0*W + 0.01*T*S
 * at T=80, F=40, E=70, S=20, W=10.
 */
export const EXPECTED_BASE_VALUE: number = 283;

// Model coefficients and components for predictions
const COEFF_T: number = 1.2;
const COEFF_F: number = 0.9;
const COEFF_E: number = 1.5;
const COEFF_S: number = 1.0;
const COEFF_W: number = 1.0;
const COEFF_INTERACTION: number = 0.01;

// Calibrated baseline contributions
const SHAP_BASE_T: number = 104; // Baseline transport contribution: 80 * 1.2 + 0.005 * 80 * 20 = 96 + 8 = 104
const SHAP_BASE_E: number = 105; // Baseline electricity contribution: 70 * 1.5 = 105
const SHAP_BASE_F: number = 36;  // Baseline food contribution: 40 * 0.9 = 36
const SHAP_BASE_S: number = 28;  // Baseline shopping contribution: 20 + 0.005 * 80 * 20 = 28
const SHAP_BASE_W: number = 10;  // Baseline waste contribution: 10 * 1.0 = 10

/**
 * Calculates the marginal SHAP contribution of each emission category relative to baseline.
 * 
 * @param userEmissions - User's active emission values per category
 * @param baseline - The category-specific baseline comparison targets
 * @returns Array of SHAP contribution values per category
 * @throws Error if the user emissions list is empty or undefined
 */
export function calculateShapValues(
  userEmissions: UserEmissionInput[],
  baseline: Record<string, number>
): ShapResult[] {
  if (!userEmissions || userEmissions.length === 0) {
    throw new Error('Insufficient data');
  }

  return userEmissions.map((item: UserEmissionInput): ShapResult => {
    const baseVal = baseline[item.category] ?? 0;
    return {
      category: item.category,
      contribution: item.value - baseVal,
    };
  });
}

/**
 * Calculates real-time SHAP values for a user's monthly emissions.
 * Sum(SHAP values) = Predicted Footprint - Expected Baseline (283 kg CO2).
 * 
 * @param logs - User's carbon footprint activity logs
 * @param referenceDate - Optional reference date to query 30-day window (enables purity)
 * @returns Object containing predicted emissions, base value, and explanations list
 */
export function calculateSHAPExplanations(
  logs: CarbonLog[],
  referenceDate?: Date
): ShapExplanationResult {
  const userTotals: Record<CategoryType, number> = {
    transportation: 0,
    electricity: 0,
    food: 0,
    shopping: 0,
    waste: 0,
  };

  const now = referenceDate ? new Date(referenceDate.getTime()) : new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Filter logs for the last 30 days without mutating the logs parameter
  const recentLogs = logs.filter((log: CarbonLog): boolean => {
    const logDate = new Date(log.logged_date);
    return logDate >= thirtyDaysAgo && logDate <= now;
  });

  recentLogs.forEach((log: CarbonLog): void => {
    if (userTotals[log.category] !== undefined) {
      userTotals[log.category] += log.emission_amount;
    }
  });

  const T = userTotals.transportation;
  const E = userTotals.electricity;
  const F = userTotals.food;
  const S = userTotals.shopping;
  const W = userTotals.waste;

  // Calculate predicted total emissions using non-linear interaction model
  const predictedEmissions = Math.round((T * COEFF_T + F * COEFF_F + E * COEFF_E + S * COEFF_S + W * COEFF_W + (T * S) * COEFF_INTERACTION) * 10) / 10;

  // Compute SHAP values relative to standard baselines
  const T_shap = T * COEFF_T + 0.5 * COEFF_INTERACTION * T * S - SHAP_BASE_T;
  const E_shap = E * COEFF_E - SHAP_BASE_E;
  const F_shap = F * COEFF_F - SHAP_BASE_F;
  const S_shap = S * COEFF_S + 0.5 * COEFF_INTERACTION * T * S - SHAP_BASE_S;
  const W_shap = W * COEFF_W - SHAP_BASE_W;

  const shapRaw: Record<CategoryType, number> = {
    transportation: T_shap,
    electricity: E_shap,
    food: F_shap,
    shopping: S_shap,
    waste: W_shap,
  };

  const totalAbsShap = Math.max(
    0.1,
    Object.values(shapRaw).reduce((sum: number, v: number): number => sum + Math.abs(v), 0)
  );

  const explanations: SHAPExplanation[] = [];

  const categoryLabels: Record<CategoryType, string> = {
    transportation: 'Transportation',
    electricity: 'Electricity',
    food: 'Diet & Food',
    shopping: 'Shopping',
    waste: 'Waste & Garbage',
  };

  Object.entries(shapRaw).forEach(([catKey, value]): void => {
    const category = catKey as CategoryType;
    const impactPercent = Math.round((Math.abs(value) / totalAbsShap) * 100);
    const direction = value > 0 ? ('higher' as const) : ('lower' as const);
    const absVal = Math.round(Math.abs(value) * 10) / 10;

    let desc = '';
    if (direction === 'higher') {
      desc = `${categoryLabels[category]} consumption is driving your footprint higher than average, adding ${absVal} kg CO₂. Consider lowering your reliance in this area.`;
    } else {
      desc = `${categoryLabels[category]} practices are keeping your emissions lower than average, saving you ${absVal} kg CO₂. Outstanding work!`;
    }

    explanations.push({
      feature: categoryLabels[category],
      impact: impactPercent,
      shapValue: Math.round(value * 10) / 10,
      direction,
      description: desc,
    });
  });

  // Sort by highest absolute SHAP impact
  explanations.sort((a, b): number => Math.abs(b.shapValue) - Math.abs(a.shapValue));

  return {
    predictedEmissions,
    baseValue: EXPECTED_BASE_VALUE,
    explanations,
  };
}

/**
 * Assigns an eco-grade based on baseline fractions.
 * - A: < 50% of baseline
 * - B: 50% - 100% of baseline
 * - C: 100% - 150% of baseline
 * - D: > 150% of baseline
 * 
 * @param emissions - Actual emissions
 * @param baseline - Comparison baseline
 * @returns Grade character ('A', 'B', 'C', or 'D')
 */
export function assignEcoGrade(emissions: number, baseline: number): 'A' | 'B' | 'C' | 'D' {
  const ratio = baseline > 0 ? emissions / baseline : 0;
  if (ratio < GRADE_THRESHOLDS.A) return 'A';
  if (ratio < GRADE_THRESHOLDS.B) return 'B';
  if (ratio < GRADE_THRESHOLDS.C) return 'C';
  return 'D';
}
