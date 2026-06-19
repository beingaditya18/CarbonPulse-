/**
 * @fileoverview Safe storage validation utilities for client-side Zustand state persistence.
 * Enforces a fail-closed trust model to reject tampered or invalid persisted state.
 */

import { PersistedStoreStateSchema } from '@/types/store.types';

/**
 * Validates local storage state using Zod schemas.
 * Returns the raw JSON string if validation is successful, otherwise returns null to trigger safe fallback initialization.
 * 
 * @param {string | null} raw - The raw JSON string loaded from localStorage
 * @returns {string | null} The raw string if verified, or null on validation failure
 */
export function validateStorageState(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'state' in parsed) {
      const validationResult = PersistedStoreStateSchema.safeParse(parsed.state);
      if (validationResult.success) {
        return raw;
      }
      console.warn('Persisted state verification failed, resetting to defaults.', validationResult.error);
    }
    return null;
  } catch (error) {
    console.error('Failed to parse persisted state:', error);
    return null;
  }
}
