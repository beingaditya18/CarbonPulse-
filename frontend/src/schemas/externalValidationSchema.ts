/**
 * @fileoverview External Benchmark Validation Schema
 * Implements strict Zod validation schemas for cross-jurisdictional building emissions data
 * (e.g., NYC LL84, Boston BERDO, Chicago Energy Benchmarking).
 * Enforces structural typing and thermodynamic physical bounds for Next.js 15 client/server ingestion.
 */

import { z } from 'zod';

/**
 * Bounds constants based on commercial building thermodynamics and municipal benchmarking rules.
 */
export const EXTERNAL_VALIDATION_BOUNDS = {
  MIN_GFA: 500, // Minimum viable commercial building conditioned area (sq ft)
  MAX_GFA: 25_000_000, // Maximum single facility floor area (e.g. World Trade Center complex)
  MIN_YEAR_BUILT: 1800,
  MAX_YEAR_BUILT: new Date().getFullYear() + 2,
  MIN_FLOORS: 1,
  MAX_FLOORS: 160,
  MIN_EMISSIONS: 0.001, // Non-zero positive emissions (MT CO2e / yr)
  MAX_EMISSIONS: 150_000, // Plausible upper boundary for major urban hospital or campus
  MIN_LATITUDE: -90.0,
  MAX_LATITUDE: 90.0,
  MIN_LONGITUDE: -180.0,
  MAX_LONGITUDE: 180.0,
} as const;

/**
 * Standard property primary use taxonomy aligned with EPA ENERGY STAR Portfolio Manager.
 */
export const CanonicalPropertyTypes = [
  'Multifamily Housing',
  'Office',
  'Non-Refrigerated Warehouse',
  'K-12 School',
  'Retail Store',
  'Hotel',
  'Medical Office',
  'Senior Living Community',
  'Hospital (General Medical & Surgical)',
  'College/University',
  'Distribution Center',
  'Supermarket/Grocery Store',
  'Worship Facility',
  'Mixed Use Property',
  'Other',
] as const;

/**
 * Zod schema for individual external building benchmarking records.
 */
export const ExternalBuildingRecordSchema = z.object({
  // Unique external facility identifier (e.g. NYC BBL, Chicago Building ID)
  externalFacilityId: z.string().min(1, 'Facility identifier is required'),

  // Statutory Reporting Year
  reportingYear: z
    .number()
    .int()
    .min(2010, 'Reporting year must be >= 2010')
    .max(new Date().getFullYear() + 1, 'Reporting year cannot be in the distant future'),

  // Gross Floor Area attributes
  propertyGfaTotal: z
    .number()
    .min(
      EXTERNAL_VALIDATION_BOUNDS.MIN_GFA,
      `Property GFA must be at least ${EXTERNAL_VALIDATION_BOUNDS.MIN_GFA} sq ft`
    )
    .max(
      EXTERNAL_VALIDATION_BOUNDS.MAX_GFA,
      `Property GFA cannot exceed ${EXTERNAL_VALIDATION_BOUNDS.MAX_GFA.toLocaleString()} sq ft`
    ),

  propertyGfaBuildings: z.number().nonnegative().optional(),
  propertyGfaParking: z.number().nonnegative().default(0),

  // Architectural Vintage & Verticality
  yearBuilt: z
    .number()
    .int()
    .min(EXTERNAL_VALIDATION_BOUNDS.MIN_YEAR_BUILT, 'Year built must be >= 1800')
    .max(EXTERNAL_VALIDATION_BOUNDS.MAX_YEAR_BUILT, 'Year built cannot exceed current planning horizon'),

  numberOfFloors: z
    .number()
    .int()
    .min(EXTERNAL_VALIDATION_BOUNDS.MIN_FLOORS, 'Number of floors must be >= 1')
    .max(EXTERNAL_VALIDATION_BOUNDS.MAX_FLOORS, 'Number of floors exceeds thermodynamic limit'),

  numberOfBuildings: z.number().int().min(1).default(1),

  // Property Categorization
  primaryPropertyType: z.string().default('Other'),
  canonicalPropertyUse: z.enum(CanonicalPropertyTypes).default('Other'),

  // Geographic Coordinates (Optional but validated for geospatial clustering)
  latitude: z
    .number()
    .min(EXTERNAL_VALIDATION_BOUNDS.MIN_LATITUDE)
    .max(EXTERNAL_VALIDATION_BOUNDS.MAX_LATITUDE)
    .optional(),

  longitude: z
    .number()
    .min(EXTERNAL_VALIDATION_BOUNDS.MIN_LONGITUDE)
    .max(EXTERNAL_VALIDATION_BOUNDS.MAX_LONGITUDE)
    .optional(),

  // Target Variable (Metric Tons CO2e / yr)
  totalGhgEmissions: z
    .number()
    .min(
      EXTERNAL_VALIDATION_BOUNDS.MIN_EMISSIONS,
      'Total GHG Emissions must be strictly positive (> 0)'
    )
    .max(
      EXTERNAL_VALIDATION_BOUNDS.MAX_EMISSIONS,
      `Total GHG Emissions exceeds plausible thermodynamic maximum of ${EXTERNAL_VALIDATION_BOUNDS.MAX_EMISSIONS} MT`
    ),

  // Activity Energy Meters (Optional - for accounting baseline comparison)
  electricityKwh: z.number().nonnegative().optional(),
  naturalGasTherms: z.number().nonnegative().optional(),
  steamKbtu: z.number().nonnegative().optional(),
});

export type ExternalBuildingRecord = z.infer<typeof ExternalBuildingRecordSchema>;

/**
 * Zod schema for batch external dataset uploads (array of building records).
 */
export const ExternalBenchmarkingBatchSchema = z.object({
  jurisdiction: z.string().min(2, 'Jurisdiction identifier required (e.g., NYC_LL84, BOSTON_BERDO)'),
  ingestionTimestamp: z.string().datetime().default(() => new Date().toISOString()),
  records: z
    .array(ExternalBuildingRecordSchema)
    .min(1, 'External benchmarking batch must contain at least 1 valid building record')
    .max(50_000, 'Batch size exceeds single ingestion payload limit (50,000 records)'),
});

export type ExternalBenchmarkingBatch = z.infer<typeof ExternalBenchmarkingBatchSchema>;

/**
 * Result of client-side schema verification.
 */
export interface ExternalValidationResult {
  success: boolean;
  validCount: number;
  invalidCount: number;
  errors: Array<{ index: number; field: string; message: string }>;
  sanitizedRecords: ExternalBuildingRecord[];
}

/**
 * Validates and sanitizes an untrusted array of external building records.
 */
export function validateExternalBenchmarkingData(rawRecords: unknown[]): ExternalValidationResult {
  const sanitizedRecords: ExternalBuildingRecord[] = [];
  const errors: Array<{ index: number; field: string; message: string }> = [];

  rawRecords.forEach((item, idx) => {
    const parseResult = ExternalBuildingRecordSchema.safeParse(item);
    if (parseResult.success) {
      sanitizedRecords.push(parseResult.data);
    } else {
      parseResult.error.issues.forEach((issue) => {
        errors.push({
          index: idx,
          field: issue.path.join('.'),
          message: issue.message,
        });
      });
    }
  });

  return {
    success: errors.length === 0,
    validCount: sanitizedRecords.length,
    invalidCount: errors.length,
    errors,
    sanitizedRecords,
  };
}

