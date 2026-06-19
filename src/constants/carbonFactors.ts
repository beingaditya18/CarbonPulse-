/**
 * @fileoverview Carbon Factors constants
 * Defines emission factors for onboarding questions and OCR conversions.
 */

export const ONBOARDING_FACTORS = {
  energy: 2.5,
  transit: 1.8,
  diet: 1.2,
  shopping: 1.5,
  waste: 0.8,
} as const;

export const OCR_CARBON_FACTORS: Record<string, number> = {
  transportation: 1.4,
  electricity: 1.8,
  food: 0.6,
  shopping: 0.6,
  waste: 0.6,
} as const;

export const BASELINE_DISTRIBUTION = {
  transportation: 80,
  electricity: 70,
  food: 40,
  shopping: 20,
  waste: 10,
} as const;

export const EXPECTED_BASE_VALUE = 283;
