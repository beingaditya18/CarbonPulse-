import { ONBOARDING_FACTORS } from '@/constants/carbonFactors';

/**
 * Calculates the carbon baseline emissions based on user onboarding questions.
 * @param {object} answers - User answers for different consumption categories.
 * @param {number} answers.energy - Energy consumption points.
 * @param {number} answers.transit - Transportation transit mileage.
 * @param {number} answers.diet - Food diet points.
 * @param {number} answers.shopping - Shopping consumption points.
 * @param {number} answers.waste - Waste disposal points.
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
  return Math.round(Math.max(120, baseline) * 10) / 10;
}

/**
 * Calculates the eco-score grade and visual representation based on emission baseline ratios.
 * @param {number} ratio - The ratio of actual emissions to baseline emissions.
 * @returns {{ grade: string, color: string }} An object containing the grade character and tailwind class color.
 */
export function calculateEcoGrade(ratio: number): { grade: string; color: string } {
  if (ratio < 0.7) {
    return { grade: 'A', color: 'text-emerald-500' };
  } else if (ratio < 0.85) {
    return { grade: 'B', color: 'text-green-500' };
  } else if (ratio < 1.0) {
    return { grade: 'C', color: 'text-yellow-500' };
  }
  return { grade: 'D', color: 'text-red-500' };
}
