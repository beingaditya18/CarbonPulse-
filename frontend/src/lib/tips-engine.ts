import { z } from 'zod';
import { GRID_COEFFICIENTS, HEATING_COEFFICIENTS, DIET_COEFFICIENTS } from '@/utils/carbonCalculations';

// Rules Engine Calculation Constants
export const WEEKS_PER_YEAR = 52;
export const MONTHS_PER_YEAR = 12;

export const EV_PETROL_FACTOR = 0.192;
export const EV_DIESEL_FACTOR = 0.171;
export const EV_HYBRID_FACTOR = 0.111;
export const EV_ELECTRIC_FACTOR = 0.053;

export const FUEL_FACTORS = {
  petrol: EV_PETROL_FACTOR,
  diesel: EV_DIESEL_FACTOR,
  hybrid: EV_HYBRID_FACTOR,
  electric: EV_ELECTRIC_FACTOR,
  none: 0,
};

export const MIN_ANNUAL_SAVINGS_THRESHOLD = 10; // kg CO2e

export const FULL_RENEWABLE_PERCENT = 100;
export const RENEWABLE_PERCENT_DIVISOR = 100;

export const HEATING_UPGRADE_REDUCTION_FACTOR = 0.5; // 50% emissions cut
export const HEATING_FUEL_NAMES = {
  gas: 'Natural Gas',
  oil: 'Heating Oil',
  lpg: 'LPG',
  biomass: 'Biomass',
  none: 'None',
};

export const DEFAULT_DIET_EMISSION_FACTOR = 2800;

export const WASTE_HIGH_MULTIPLIER = 1.25;
export const WASTE_MODERATE_MULTIPLIER = 1.1;

export const SHOPPING_FACTORS = {
  minimalist: 600,
  average: 1500,
  frequent: 3000,
};
export const DEFAULT_SHOPPING_FACTOR = 1500;
export const RECYCLING_SAVINGS_PERCENTAGE = 0.08; // 8% savings

export const SHORT_HAUL_FLIGHT_EMISSIONS = 250; // kg CO2e / flight
export const LONG_HAUL_FLIGHT_EMISSIONS = 1100; // kg CO2e / flight
export const AVIATION_SUBSTITUTION_SAVINGS_FACTOR = 0.3; // 30% substitution

/**
 * Zod schema for a single dynamic recommendation tip.
 */
export const RecommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  annualSavings: z.number(), // kg CO2e / year
  category: z.enum(['transportation', 'food', 'electricity', 'shopping', 'waste']),
});

/**
 * TypeScript type representing a recommendation, inferred from RecommendationSchema.
 */
export type Recommendation = z.infer<typeof RecommendationSchema>;

export interface CalculatorAnswers {
  region: 'US' | 'UK' | 'EU' | 'IN' | 'Global';
  carFuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'none';
  carWeeklyMileage: number;
  publicTransitWeeklyMileage: number;
  shortHaulFlights: number;
  longHaulFlights: number;
  electricityMonthlyKWh: number;
  renewableEnergyPct: number;
  heatingFuelType: 'gas' | 'oil' | 'lpg' | 'biomass' | 'none';
  heatingMonthlyFuel: number;
  residents: number;
  dietaryPattern: 'vegan' | 'vegetarian' | 'pescatarian' | 'low-meat' | 'medium-meat' | 'high-meat';
  foodWasteHabits: 'low' | 'moderate' | 'high';
  shoppingPatterns: 'minimalist' | 'average' | 'frequent';
  recycleConsistently: boolean;
}

/**
 * Evaluates the user's questionnaire inputs and generates a list of custom reduction recommendations
 * sorted in descending order of annual carbon savings.
 * 
 * @param answers - The user's detailed multi-vector questionnaire answers.
 * @returns Array of sorted recommendations.
 */
export function getRecommendations(answers: CalculatorAnswers): Recommendation[] {
  const tips: Recommendation[] = [];

  // Rule 1: Transition to an Electric Vehicle
  if (
    answers.carFuelType !== 'none' &&
    answers.carFuelType !== 'electric' &&
    answers.carWeeklyMileage > 0
  ) {
    const currentFactor = FUEL_FACTORS[answers.carFuelType];
    const evFactor = FUEL_FACTORS.electric;
    
    // Savings = weekly_mileage * 52 weeks * (current_factor - ev_factor)
    const annualSavings = answers.carWeeklyMileage * WEEKS_PER_YEAR * (currentFactor - evFactor);
    
    if (annualSavings > MIN_ANNUAL_SAVINGS_THRESHOLD) {
      tips.push({
        id: 'tip-ev',
        title: 'Transition to an Electric Vehicle',
        description: `Based on your weekly driving of ${answers.carWeeklyMileage} km in a ${answers.carFuelType} car, switching to an electric vehicle would prevent combustion emissions and save you ${Math.round(annualSavings)} kg CO₂e/year.`,
        annualSavings: Math.round(annualSavings * 10) / 10,
        category: 'transportation',
      });
    }
  }

  // Rule 2: Switch to 100% Renewable Electricity
  if (answers.electricityMonthlyKWh > 0 && answers.renewableEnergyPct < FULL_RENEWABLE_PERCENT) {
    const gridIntensity = GRID_COEFFICIENTS[answers.region] ?? GRID_COEFFICIENTS.Global;
    const currentRenewableMultiplier = 1 - answers.renewableEnergyPct / RENEWABLE_PERCENT_DIVISOR;
    
    // Savings = (Monthly_kWh * 12 months * GridIntensity * currentRenewableMultiplier) / residents
    const annualSavings = (answers.electricityMonthlyKWh * MONTHS_PER_YEAR * gridIntensity * currentRenewableMultiplier) / answers.residents;

    if (annualSavings > MIN_ANNUAL_SAVINGS_THRESHOLD) {
      tips.push({
        id: 'tip-renewable',
        title: 'Transition to 100% Green Power',
        description: `By purchasing certified clean energy certificates or switching to a 100% renewable electricity supplier, you would eliminate your household grid carbon footprint and save ${Math.round(annualSavings)} kg CO₂e/year.`,
        annualSavings: Math.round(annualSavings * 10) / 10,
        category: 'electricity',
      });
    }
  }

  // Rule 3: Upgrade to High-Efficiency Home Heating (Heat Pump)
  if (
    answers.heatingFuelType !== 'none' &&
    answers.heatingFuelType !== 'biomass' &&
    answers.heatingMonthlyFuel > 0
  ) {
    const fuelFactor = HEATING_COEFFICIENTS[answers.heatingFuelType] ?? 0;
    const currentHeatingEmissions = (answers.heatingMonthlyFuel * MONTHS_PER_YEAR * fuelFactor) / answers.residents;
    
    // Upgrading to a heat pump or improving insulation typically reduces heating footprint by 50%
    const annualSavings = currentHeatingEmissions * HEATING_UPGRADE_REDUCTION_FACTOR;

    if (annualSavings > MIN_ANNUAL_SAVINGS_THRESHOLD) {
      tips.push({
        id: 'tip-heating',
        title: 'Optimize Home Heating & Insulation',
        description: `Upgrading your old ${HEATING_FUEL_NAMES[answers.heatingFuelType]} heating system to a modern electric heat pump or improving wall insulation could cut your heating emissions by half, saving you ${Math.round(annualSavings)} kg CO₂e/year.`,
        annualSavings: Math.round(annualSavings * 10) / 10,
        category: 'electricity',
      });
    }
  }

  // Rule 4: Adopt a Plant-Based Diet (Veggie Shift)
  if (answers.dietaryPattern !== 'vegan') {
    const veganFactor = DIET_COEFFICIENTS.vegan;
    const vegetarianFactor = DIET_COEFFICIENTS.vegetarian;
    const currentFactor = DIET_COEFFICIENTS[answers.dietaryPattern] ?? DEFAULT_DIET_EMISSION_FACTOR;

    let targetName = 'Vegetarian';
    let targetFactor = vegetarianFactor;
    if (answers.dietaryPattern === 'vegetarian' || answers.dietaryPattern === 'pescatarian') {
      targetFactor = veganFactor;
      targetName = 'fully Plant-based (Vegan)';
    }

    const annualSavings = currentFactor - targetFactor;

    if (annualSavings > MIN_ANNUAL_SAVINGS_THRESHOLD) {
      tips.push({
        id: 'tip-diet',
        title: `Transition to a ${targetName} Diet`,
        description: `Shifting your food choices towards plant foods would lower your nutritional footprint by replacing carbon-intensive meat with grains and vegetables, saving ${Math.round(annualSavings)} kg CO₂e/year.`,
        annualSavings: Math.round(annualSavings * 10) / 10,
        category: 'food',
      });
    }
  }

  // Rule 5: Minimize Food Waste
  if (answers.foodWasteHabits !== 'low') {
    const dietFactor = DIET_COEFFICIENTS[answers.dietaryPattern] ?? DEFAULT_DIET_EMISSION_FACTOR;
    const currentWasteMultiplier = answers.foodWasteHabits === 'high' ? WASTE_HIGH_MULTIPLIER : WASTE_MODERATE_MULTIPLIER;
    
    // Savings = DietFactor * (currentMultiplier - 1.0)
    const annualSavings = dietFactor * (currentWasteMultiplier - 1.0);

    if (annualSavings > MIN_ANNUAL_SAVINGS_THRESHOLD) {
      tips.push({
        id: 'tip-foodwaste',
        title: 'Mitigate Domestic Food Waste',
        description: `By practicing meal planning and composting organic scraps, you can eliminate excess waste multipliers, saving about ${Math.round(annualSavings)} kg CO₂e/year.`,
        annualSavings: Math.round(annualSavings * 10) / 10,
        category: 'food',
      });
    }
  }

  // Rule 6: Consistent Household Recycling
  if (!answers.recycleConsistently) {
    const shoppingFactor = SHOPPING_FACTORS[answers.shoppingPatterns] ?? DEFAULT_SHOPPING_FACTOR;
    
    // Savings = ShoppingFactor * 0.08 (8% reduction)
    const annualSavings = shoppingFactor * RECYCLING_SAVINGS_PERCENTAGE;

    if (annualSavings > 0) {
      tips.push({
        id: 'tip-recycling',
        title: 'Establish Consistent Recycling Habits',
        description: `Consistent recycling and reuse of household paper, glass, and plastic packages reduces lifecycle packaging manufacturing demands, saving ${Math.round(annualSavings)} kg CO₂e/year.`,
        annualSavings: Math.round(annualSavings * 10) / 10,
        category: 'shopping',
      });
    }
  }

  // Rule 7: Substitute Flights with Virtual Meetings or Train
  const flightEmissions = answers.shortHaulFlights * SHORT_HAUL_FLIGHT_EMISSIONS + answers.longHaulFlights * LONG_HAUL_FLIGHT_EMISSIONS;
  if (flightEmissions > 0) {
    // Substituting 30% of aviation travel saves 30% of aviation emissions
    const annualSavings = flightEmissions * AVIATION_SUBSTITUTION_SAVINGS_FACTOR;

    if (annualSavings > MIN_ANNUAL_SAVINGS_THRESHOLD) {
      tips.push({
        id: 'tip-aviation',
        title: 'Optimize Air Travel and Flights',
        description: `Replacing 30% of your short-haul or long-haul flights with rail commutes or virtual meetings would cut high-altitude radiative forcing emissions, saving ${Math.round(annualSavings)} kg CO₂e/year.`,
        annualSavings: Math.round(annualSavings * 10) / 10,
        category: 'transportation',
      });
    }
  }

  // Sort recommendations by annualSavings descending
  return tips.sort((a, b) => b.annualSavings - a.annualSavings);
}
