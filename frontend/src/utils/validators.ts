import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '@/constants/appConstants';
import type { ValidationResult } from '@/types/store';

/**
 * Validates uploaded file type and size server-side.
 * Checks actual file signature (magic bytes), not just
 * the Content-Type header or file extension.
 * @param {ArrayBuffer} buffer - Raw file bytes
 * @param {string} declaredMime - Client-declared MIME type
 * @returns {ValidationResult} Pass/fail with reason
 */
export function validateFileUpload(
  buffer: ArrayBuffer,
  declaredMime: string
): ValidationResult {
  // Check file size
  if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    return { valid: false, reason: 'FILE_TOO_LARGE' };
  }

  if (!declaredMime) {
    return { valid: false, reason: 'INVALID_FILE_TYPE' };
  }

  // Check magic bytes (real MIME, not extension)
  const bytes = new Uint8Array(buffer.slice(0, 4));
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const magicBytes: Record<string, string> = {
    'ffd8ffe0': 'image/jpeg',
    'ffd8ffe1': 'image/jpeg',
    'ffd8ffee': 'image/jpeg',
    'ffd8ffdb': 'image/jpeg',
    '89504e47': 'image/png',
    '52494646': 'image/webp',
    '25504446': 'application/pdf',
  };

  const actualMime = magicBytes[hex.slice(0, 8)];

  if (!actualMime) {
    return { valid: false, reason: 'INVALID_FILE_TYPE' };
  }

  if (actualMime !== declaredMime) {
    return { valid: false, reason: 'INVALID_FILE_TYPE' };
  }

  if (!ALLOWED_MIME_TYPES.includes(
    actualMime as typeof ALLOWED_MIME_TYPES[number]
  )) {
    return { valid: false, reason: 'UNSUPPORTED_FILE_TYPE' };
  }

  return { valid: true, reason: null };
}
