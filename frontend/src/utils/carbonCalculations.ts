import { ONBOARDING_FACTORS } from '@/constants/carbonFactors';
import type { CalculatorAnswers } from '@/types/carbon.types';

// Calendar Constants
export const MONTHS_PER_YEAR = 12;
export const WEEKS_PER_YEAR = 52;

// Regional electricity grid emission factors (kg CO2e / kWh)
export const GRID_COEFFICIENTS: Record<'US' | 'UK' | 'EU' | 'IN' | 'Global', number> = {
  US: 0.37,
  UK: 0.21,
  EU: 0.25,
  IN: 0.71,
  Global: 0.48,
};

// Household heating fuel emission factors (kg CO2e / physical unit)
export const HEATING_COEFFICIENTS = {
  gas: 2.02,
  oil: 2.52,
  lpg: 2.95,
  biomass: 0.40,
  none: 0,
};

// Nutritional annual baseline emissions (kg CO2e / year)
export const DIET_COEFFICIENTS = {
  vegan: 1100,
  vegetarian: 1400,
  pescatarian: 1700,
  'low-meat': 2200,
  'medium-meat': 2800,
  'high-meat': 3600,
};

// Domestic food waste multiplier factor offsets
export const WASTE_MULTIPLIERS = {
  low: 1.0,
  moderate: 1.1,
  high: 1.25,
};

// General consumption shopping patterns baseline emissions (kg CO2e / year)
export const SHOPPING_COEFFICIENTS = {
  minimalist: 600,
  average: 1500,
  frequent: 3000,
};

// Travel emissions coefficients
export const CAR_FUEL_FACTORS = {
  petrol: 0.192,
  diesel: 0.171,
  hybrid: 0.111,
  electric: 0.053,
  none: 0,
};

export const PUBLIC_TRANSIT_FACTOR = 0.06; // kg CO2e / km
export const SHORT_HAUL_FLIGHT_EMISSIONS = 250; // kg CO2e / flight
export const LONG_HAUL_FLIGHT_EMISSIONS = 1100; // kg CO2e / flight

// Recycling waste reduction multipliers
export const RECYCLING_REDUCTION_MULTIPLIER = 0.92;
export const DEFAULT_RECYCLING_MULTIPLIER = 1.0;

// Onboarding and grade limits constants
export const ONBOARDING_MIN_EMISSIONS_LIMIT = 120;
export const ROUNDING_PLACES_FACTOR = 10;

export const GRADE_LIMIT_A = 0.7;
export const GRADE_LIMIT_B = 0.85;
export const GRADE_LIMIT_C = 1.0;

/**
 * Calculates the carbon baseline emissions based on user onboarding questions.
 * @param {object} answers - User answers for different consumption categories.
 * @returns {number} The calculated baseline emissions in kg CO2 per month.
 */
export function calculateOnboardingBaseline(answers: {
  energy: number;
  transit: number;
  diet: number;
  shopping: number;
  waste: number;
}): number {
  const baseline =
    answers.energy * ONBOARDING_FACTORS.energy +
    answers.transit * ONBOARDING_FACTORS.transit +
    answers.diet * ONBOARDING_FACTORS.diet +
    answers.shopping * ONBOARDING_FACTORS.shopping +
    answers.waste * ONBOARDING_FACTORS.waste;
  return Math.round(Math.max(ONBOARDING_MIN_EMISSIONS_LIMIT, baseline) * ROUNDING_PLACES_FACTOR) / ROUNDING_PLACES_FACTOR;
}

/**
 * Calculates baseline emissions from the advanced multi-vector questionnaire.
 * Returns monthly baseline emissions in kg CO₂.
 */
export function calculateMultiVectorBaseline(answers: CalculatorAnswers): number {
  // Transport
  const carEmissions = answers.carWeeklyMileage * WEEKS_PER_YEAR * CAR_FUEL_FACTORS[answers.carFuelType];
  const transitEmissions = answers.publicTransitWeeklyMileage * WEEKS_PER_YEAR * PUBLIC_TRANSIT_FACTOR;
  const flightEmissions =
    answers.shortHaulFlights * SHORT_HAUL_FLIGHT_EMISSIONS +
    answers.longHaulFlights * LONG_HAUL_FLIGHT_EMISSIONS;
  const transportTotal = carEmissions + transitEmissions + flightEmissions;

  // Home Energy
  const gridIntensity = GRID_COEFFICIENTS[answers.region] ?? GRID_COEFFICIENTS.Global;
  const electricityEmissions = (answers.electricityMonthlyKWh * MONTHS_PER_YEAR * gridIntensity * (1 - answers.renewableEnergyPct / 100)) / answers.residents;
  const heatingIntensity = HEATING_COEFFICIENTS[answers.heatingFuelType] ?? 0;
  const heatingEmissions = (answers.heatingMonthlyFuel * MONTHS_PER_YEAR * heatingIntensity) / answers.residents;
  const energyTotal = electricityEmissions + heatingEmissions;

  // Food & Diet
  const dietFactor = DIET_COEFFICIENTS[answers.dietaryPattern] ?? DIET_COEFFICIENTS['medium-meat'];
  const wasteMultiplier = WASTE_MULTIPLIERS[answers.foodWasteHabits] ?? WASTE_MULTIPLIERS.moderate;
  const foodTotal = dietFactor * wasteMultiplier;

  // Consumption
  const shoppingFactor = SHOPPING_COEFFICIENTS[answers.shoppingPatterns] ?? SHOPPING_COEFFICIENTS.average;
  const recyclingMultiplier = answers.recycleConsistently ? RECYCLING_REDUCTION_MULTIPLIER : DEFAULT_RECYCLING_MULTIPLIER;
  const consumptionTotal = shoppingFactor * recyclingMultiplier;

  const totalAnnual = transportTotal + energyTotal + foodTotal + consumptionTotal;
  const monthlyBaseline = totalAnnual / MONTHS_PER_YEAR;

  return Math.round(monthlyBaseline * ROUNDING_PLACES_FACTOR) / ROUNDING_PLACES_FACTOR;
}

/**
 * Calculates the eco-score grade and visual representation based on emission baseline ratios.
 * @param {number} ratio - The ratio of actual emissions to baseline emissions.
 * @returns {{ grade: string, color: string }} An object containing the grade character and tailwind class color.
 */
export function calculateEcoGrade(ratio: number): { grade: string; color: string } {
  if (ratio < GRADE_LIMIT_A) {
    return { grade: 'A', color: 'text-emerald-500' };
  } else if (ratio < GRADE_LIMIT_B) {
    return { grade: 'B', color: 'text-green-500' };
  } else if (ratio < GRADE_LIMIT_C) {
    return { grade: 'C', color: 'text-yellow-500' };
  }
  return { grade: 'D', color: 'text-red-500' };
}

