import { describe, test, expect } from 'vitest';
import { validateFileUpload } from '@/utils/validators';

describe('File Upload Validator (15 Tests)', () => {
  test('1. rejects file exceeding 5MB', () => {
    const oversizedBuffer = new ArrayBuffer(6 * 1024 * 1024);
    const result = validateFileUpload(oversizedBuffer, 'image/jpeg');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('FILE_TOO_LARGE');
  });

  test('2. rejects file with mismatched magic bytes', () => {
    const fakeBuffer = new ArrayBuffer(4);
    new Uint8Array(fakeBuffer).set([0x4D, 0x5A, 0x00, 0x00]);
    const result = validateFileUpload(fakeBuffer, 'image/jpeg');
    expect(result.valid).toBe(false);
  });

  test('3. accepts valid JPEG', () => {
    const jpegBuffer = new ArrayBuffer(4);
    new Uint8Array(jpegBuffer).set([0xFF, 0xD8, 0xFF, 0xE0]);
    const result = validateFileUpload(jpegBuffer, 'image/jpeg');
    expect(result.valid).toBe(true);
  });

  test('4. accepts valid PNG', () => {
    const pngBuffer = new ArrayBuffer(4);
    new Uint8Array(pngBuffer).set([0x89, 0x50, 0x4E, 0x47]);
    const result = validateFileUpload(pngBuffer, 'image/png');
    expect(result.valid).toBe(true);
  });

  test('5. rejects PDF mime type with valid PNG magic bytes', () => {
    const pngBuffer = new ArrayBuffer(4);
    new Uint8Array(pngBuffer).set([0x89, 0x50, 0x4E, 0x47]);
    const result = validateFileUpload(pngBuffer, 'application/pdf');
    expect(result.valid).toBe(false);
  });

  test('6. rejects PNG mime type with invalid magic bytes', () => {
    const fakeBuffer = new ArrayBuffer(4);
    new Uint8Array(fakeBuffer).set([0xAA, 0xBB, 0xCC, 0xDD]);
    const result = validateFileUpload(fakeBuffer, 'image/png');
    expect(result.valid).toBe(false);
  });

  test('7. accepts valid JPEG E1 variation', () => {
    const jpegBuffer = new ArrayBuffer(4);
    new Uint8Array(jpegBuffer).set([0xFF, 0xD8, 0xFF, 0xE1]);
    const result = validateFileUpload(jpegBuffer, 'image/jpeg');
    expect(result.valid).toBe(true);
  });

  test('8. accepts valid JPEG EE variation', () => {
    const jpegBuffer = new ArrayBuffer(4);
    new Uint8Array(jpegBuffer).set([0xFF, 0xD8, 0xFF, 0xEE]);
    const result = validateFileUpload(jpegBuffer, 'image/jpeg');
    expect(result.valid).toBe(true);
  });

  test('9. accepts valid JPEG DB variation', () => {
    const jpegBuffer = new ArrayBuffer(4);
    new Uint8Array(jpegBuffer).set([0xFF, 0xD8, 0xFF, 0xDB]);
    const result = validateFileUpload(jpegBuffer, 'image/jpeg');
    expect(result.valid).toBe(true);
  });

  test('10. rejects JPEG mime type with PDF magic bytes', () => {
    const pdfBuffer = new ArrayBuffer(4);
    new Uint8Array(pdfBuffer).set([0x25, 0x50, 0x44, 0x46]);
    const result = validateFileUpload(pdfBuffer, 'image/jpeg');
    expect(result.valid).toBe(false);
  });

  test('11. rejects empty ArrayBuffer', () => {
    const emptyBuffer = new ArrayBuffer(0);
    const result = validateFileUpload(emptyBuffer, 'image/jpeg');
    expect(result.valid).toBe(false);
  });

  test('12. rejects files with null mime types', () => {
    const jpegBuffer = new ArrayBuffer(4);
    new Uint8Array(jpegBuffer).set([0xFF, 0xD8, 0xFF, 0xE0]);
    const result = validateFileUpload(jpegBuffer, null as unknown as string);
    expect(result.valid).toBe(false);
  });

  test('13. accepts files exactly at 5MB boundary', () => {
    const boundaryBuffer = new ArrayBuffer(5 * 1024 * 1024);
    // Although the content is empty, size is valid. If magic bytes check fails, it won't be true,
    // so let's set PNG magic bytes at the beginning.
    new Uint8Array(boundaryBuffer).set([0x89, 0x50, 0x4E, 0x47]);
    const res = validateFileUpload(boundaryBuffer, 'image/png');
    expect(res.valid).toBe(true);
  });

  test('14. rejects files slightly exceeding 5MB boundary', () => {
    const overBuffer = new ArrayBuffer(5 * 1024 * 1024 + 1);
    new Uint8Array(overBuffer).set([0x89, 0x50, 0x4E, 0x47]);
    const result = validateFileUpload(overBuffer, 'image/png');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('FILE_TOO_LARGE');
  });

  test('15. rejects non-image mime types entirely', () => {
    const htmlBuffer = new ArrayBuffer(4);
    new Uint8Array(htmlBuffer).set([0x3C, 0x21, 0x44, 0x4F]); // <!DO
    const result = validateFileUpload(htmlBuffer, 'text/html');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('INVALID_FILE_TYPE');
  });
});
