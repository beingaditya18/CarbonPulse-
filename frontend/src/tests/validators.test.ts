import { describe, test, expect } from 'vitest';

import { validateFileUpload } from '@/utils/validators';

describe('File Upload Validator', () => {

  test('rejects file exceeding 5MB', () => {
    const oversizedBuffer = new ArrayBuffer(6 * 1024 * 1024);
    const result = validateFileUpload(
      oversizedBuffer,
      'image/jpeg'
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('FILE_TOO_LARGE');
  });

  test('rejects file with mismatched magic bytes', () => {
    // exe file with jpeg extension
    const fakeBuffer = new ArrayBuffer(4);
    new Uint8Array(fakeBuffer).set([0x4D, 0x5A, 0x00, 0x00]);
    const result = validateFileUpload(fakeBuffer, 'image/jpeg');
    expect(result.valid).toBe(false);
  });

  test('accepts valid JPEG', () => {
    const jpegBuffer = new ArrayBuffer(4);
    new Uint8Array(jpegBuffer).set([0xFF, 0xD8, 0xFF, 0xE0]);
    const result = validateFileUpload(jpegBuffer, 'image/jpeg');
    expect(result.valid).toBe(true);
  });
});
