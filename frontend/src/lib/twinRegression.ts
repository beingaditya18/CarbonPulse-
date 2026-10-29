/**
 * @fileoverview Digital Carbon Twin — OLS Regression Engine.
 * Fits Ordinary Least Squares linear regression over the user's emission history to project future trajectories.
 * @module twinRegression
 */

import { z } from 'zod';

import type { CarbonLog, CategoryType } from '@/types/carbon.types';

/**
 * Zod schema defining a single coordinate data point for regression fitting.
 */
export const EmissionDataPointSchema = z.object({
  x: z.number(), // Independent variable (e.g. Day index)
  y: z.number(), // Dependent variable (e.g. Carbon emissions in kg CO2)
});

/**
 * TypeScript type representing a coordinate data point, inferred from EmissionDataPointSchema.
 */
export type EmissionDataPoint = z.infer<typeof EmissionDataPointSchema>;

/**
 * Zod schema defining a fitted OLS linear regression model.
 */
export const RegressionModelSchema = z.object({
  slope: z.number(), // Model slope (m)
  intercept: z.number(), // Model intercept (c)
  rSquared: z.number(), // R-squared score (goodness-of-fit)
});

/**
 * TypeScript type representing a regression model, inferred from RegressionModelSchema.
 */
export type RegressionModel = z.infer<typeof RegressionModelSchema>;

/**
 * Zod schema defining the output of a twin projection simulation.
 */
export const SimulationResultSchema = z.object({
  baselineProjected: z.number(), // Projected emissions without scenario changes
  simulatedProjected: z.number(), // Projected emissions with lifestyle scenario updates
  carbonSaved: z.number(), // Projected carbon saved
  scenarioDescription: z.string(), // Description text summarizing parameters
});

/**
 * TypeScript type representing a simulation result, inferred from SimulationResultSchema.
 */
export type SimulationResult = z.infer<typeof SimulationResultSchema>;

/**
 * Zod schema defining raw array projections.
 */
export const ProjectionResultSchema = z.object({
  baseline: z.array(z.number()),
  simulated: z.array(z.number()),
});

/**
 * TypeScript type representing projection arrays, inferred from ProjectionResultSchema.
 */
export type ProjectionResult = z.infer<typeof ProjectionResultSchema>;

/**
 * Global configurations and limits for the Digital Carbon Twin.
 */
export const PROJECTION_WINDOWS = {
  short: 30,
  medium: 60,
  long: 90,
} as const;

/**
 * Minimum number of data points required to fit an OLS regression model.
 */
export const MIN_DATA_POINTS: number = 2;

// Calculation constants
const MS_IN_DAY: number = 86400000; // 1000 * 60 * 60 * 24
const DENOMINATOR_EPSILON: number = 1e-9;
const FALLBACK_DEVIATION_LIMIT: number = 3;
const DECIMAL_PLACES_FACTOR: number = 10;

/**
 * Fits an Ordinary Least Squares (OLS) linear regression model (y = mx + c) on history data.
 * Computes slope, intercept, and R-squared coefficient.
 * 
 * Fits slope (m) and intercept (c) using the equations:
 * m = (N * Sum(XY) - Sum(X)*Sum(Y)) / (N * Sum(X^2) - Sum(X)^2)
 * c = (Sum(Y) - m * Sum(X)) / N
 * 
 * @param history - Time-series coordinate points representing emissions per day index
 * @returns RegressionModel containing slope, intercept, and rSquared coefficient
 * @throws Error if history has fewer than MIN_DATA_POINTS (2) entries
 */
export function fitRegression(history: EmissionDataPoint[]): RegressionModel {
  if (!history || history.length < MIN_DATA_POINTS) {
    throw new Error(`Insufficient data points to fit regression. At least ${MIN_DATA_POINTS} points are required.`);
  }

  const n = history.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const pt of history) {
    sumX += pt.x;
    sumY += pt.y;
    sumXY += pt.x * pt.y;
    sumXX += pt.x * pt.x;
  }

  const denominator = n * sumXX - sumX * sumX;
  let slope = 0;
  let intercept = 0;

  if (Math.abs(denominator) > DENOMINATOR_EPSILON) {
    slope = (n * sumXY - sumX * sumY) / denominator;
    intercept = (sumY - slope * sumX) / n;
  } else {
    slope = 0;
    intercept = sumY / n;
  }

  // Calculate R² (R-squared) goodness-of-fit score
  const meanY = sumY / n;
  let ssTot = 0;
  let ssRes = 0;
  for (const pt of history) {
    const predicted = slope * pt.x + intercept;
    ssTot += Math.pow(pt.y - meanY, 2);
    ssRes += Math.pow(pt.y - predicted, 2);
  }

  let rSquared = 1;
  if (ssTot > DENOMINATOR_EPSILON) {
    rSquared = 1 - ssRes / ssTot;
  }
  // Clamp R² score to [0, 1] bounds
  rSquared = Math.max(0, Math.min(1, rSquared));

  return { slope, intercept, rSquared };
}

/**
 * Projects emissions for a future time horizon based on a fitted regression model.
 * 
 * @param model - The fitted linear regression model parameters
 * @param days - The forecast window duration (in days)
 * @param scenario - Optional category-specific reduction target percentages (range 0.0 - 1.0)
 * @returns ProjectionResult containing the baseline and simulated trajectory values per day
 */
export function projectEmissions(
  model: RegressionModel,
  days: number,
  scenario?: Record<string, number>
): ProjectionResult {
  const baseline: number[] = [];
  const simulated: number[] = [];

  let reductionFactor = 0;
  if (scenario) {
    for (const val of Object.values(scenario)) {
      reductionFactor += val;
    }
  }

  for (let i = 1; i <= days; i++) {
    const dayVal = Math.max(0, model.slope * i + model.intercept);
    baseline.push(dayVal);
    simulated.push(dayVal * (1 - reductionFactor));
  }

  return { baseline, simulated };
}

/**
 * Fits a simple linear regression trendline on the user's daily emission totals
 * and forecasts the carbon trajectory over the next N days.
 * 
 * Applies a scenario reduction factor:
 * reduction_factor = (category_total / overall_total) * (reduction_percentage / 100)
 * 
 * @param logs - User's historical activity logs
 * @param categoryToReduce - Target category selected for simulated reduction
 * @param reductionPercentage - The percentage reduction target (0-100)
 * @param daysToSimulate - Time scope to model (e.g. 30, 60, 90 days)
 * @returns SimulationResult containing baseline totals, simulated totals, savings, and description
 */
export function simulateTwinEmissions(
  logs: CarbonLog[],
  categoryToReduce: CategoryType,
  reductionPercentage: number,
  daysToSimulate: number
): SimulationResult {
  if (logs.length === 0) {
    return {
      baselineProjected: 0,
      simulatedProjected: 0,
      carbonSaved: 0,
      scenarioDescription: 'No historical carbon logs found to model.',
    };
  }

  // Aggregate category totals and daily emissions without mutating logs parameter
  const dailyMap: Map<string, number> = new Map();
  const categoryTotalMap: Record<CategoryType, number> = {
    transportation: 0,
    electricity: 0,
    food: 0,
    shopping: 0,
    waste: 0,
  };
  let overallTotal = 0;

  logs.forEach((log: CarbonLog): void => {
    categoryTotalMap[log.category] += log.emission_amount;
    overallTotal += log.emission_amount;

    const dateStr = log.logged_date.split('T')[0];
    const dailySum = dailyMap.get(dateStr) ?? 0;
    dailyMap.set(dateStr, dailySum + log.emission_amount);
  });

  const uniqueDays = Array.from(dailyMap.keys()).sort();

  // Fallback if we have fewer than 3 unique days of tracking
  if (uniqueDays.length < FALLBACK_DEVIATION_LIMIT) {
    const daysTracked = Math.max(1, uniqueDays.length);
    const dailyAvg = overallTotal / daysTracked;
    const baselineProjected = Math.round((dailyAvg * daysToSimulate) * DECIMAL_PLACES_FACTOR) / DECIMAL_PLACES_FACTOR;

    const categoryRatio = overallTotal > 0 ? categoryTotalMap[categoryToReduce] / overallTotal : 0.2;
    const reductionFactor = categoryRatio * (reductionPercentage / 100);
    const simulatedProjected = Math.round((baselineProjected * (1.0 - reductionFactor)) * DECIMAL_PLACES_FACTOR) / DECIMAL_PLACES_FACTOR;
    const carbonSaved = Math.round((baselineProjected - simulatedProjected) * DECIMAL_PLACES_FACTOR) / DECIMAL_PLACES_FACTOR;

    return {
      baselineProjected,
      simulatedProjected,
      carbonSaved,
      scenarioDescription: `Proportional Model (Seed): Reduced ${categoryToReduce} by ${reductionPercentage}% over ${daysToSimulate} days.`,
    };
  }

  // Calculate day indices from the earliest log
  const startMs = new Date(uniqueDays[0]).getTime();
  const dataPoints: EmissionDataPoint[] = uniqueDays.map((dateStr: string): EmissionDataPoint => {
    const dayIndex = Math.round((new Date(dateStr).getTime() - startMs) / MS_IN_DAY);
    return {
      x: dayIndex,
      y: dailyMap.get(dateStr) ?? 0,
    };
  });

  // Fit linear regression y = mx + c using Least Squares
  const N = dataPoints.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  dataPoints.forEach((pt: EmissionDataPoint): void => {
    sumX += pt.x;
    sumY += pt.y;
    sumXY += pt.x * pt.y;
    sumXX += pt.x * pt.x;
  });

  const denominator = N * sumXX - sumX * sumX;
  let slope = 0;
  let intercept = sumY / N;

  if (Math.abs(denominator) > 0.0001) {
    slope = (N * sumXY - sumX * sumY) / denominator;
    intercept = (sumY - slope * sumX) / N;
  }

  // Extrapolate baseline totals for the forecast horizon
  const lastDayIndex = dataPoints[dataPoints.length - 1].x;
  let baselineProjected = 0;

  for (let i = 1; i <= daysToSimulate; i++) {
    const futureDay = lastDayIndex + i;
    const dayEmission = Math.max(0, slope * futureDay + intercept);
    baselineProjected += dayEmission;
  }

  baselineProjected = Math.round(baselineProjected * DECIMAL_PLACES_FACTOR) / DECIMAL_PLACES_FACTOR;

  // Apply scenario reduction factor
  const catShare = overallTotal > 0 ? categoryTotalMap[categoryToReduce] / overallTotal : 0;
  const reductionFactor = catShare * (reductionPercentage / 100);
  const simulatedProjected = Math.round((baselineProjected * (1.0 - reductionFactor)) * DECIMAL_PLACES_FACTOR) / DECIMAL_PLACES_FACTOR;
  const carbonSaved = Math.round((baselineProjected - simulatedProjected) * DECIMAL_PLACES_FACTOR) / DECIMAL_PLACES_FACTOR;

  return {
    baselineProjected,
    simulatedProjected,
    carbonSaved,
    scenarioDescription: `Trend Forecasting: Fitted slope of ${slope.toFixed(2)} kg/day. Simulated ${reductionPercentage}% cut in ${categoryToReduce}.`,
  };
}
