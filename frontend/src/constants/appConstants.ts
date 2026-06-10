/**
 * @fileoverview Application-wide configuration and static values
 */

export const APP_NAME = 'CarbonPulse AI+';
export const SECURE_STORAGE_KEY = 'carbonpulse-store';
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
] as const;
