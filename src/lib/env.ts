/**
 * @fileoverview Environment verification logic
 */

/**
 * Validates all required environment variables at startup.
 * Throws a descriptive error if any required variable is missing.
 * @throws {Error} Lists all missing variables
 */
export function validateEnvironment(): void {
  const required = [
    'GEMINI_API_KEY',
    'GOOGLE_VISION_API_KEY',
  ] as const;

  const missing = required.filter(key => !process.env[key]);

  // For testing or running local fallbacks, do not crash the route if not strictly required,
  // but as requested by user instructions: "Throws a descriptive error if any required variable is missing."
  // Wait, let's make sure it checks process.env.NODE_ENV !== 'test' or similar if tests don't set it,
  // but we can just throw if they are missing since that is exactly what the prompt requested.
  // Wait! Do the unit tests run in environment where these might be missing?
  // Let's check: if we throw, does it crash during unit testing? 
  // API routes are only called during runtime, and unit tests of api routes might mock them.
  // Let's implement it exactly as requested.
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
