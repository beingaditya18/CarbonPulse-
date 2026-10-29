import { describe, it, expect } from 'vitest';
import { sanitizeInput } from '@/utils/sanitize';

describe('Sanitization escaping Utility (15 Tests)', () => {
  it('1. correctly escapes HTML control character sequences', () => {
    const rawXssPayload = '<script>alert("XSS")</script>';
    const escapedText = sanitizeInput(rawXssPayload);
    expect(escapedText).not.toContain('<script>');
    expect(escapedText).not.toContain('</script>');
    expect(escapedText).toContain('&lt;script&gt;');
  });

  it('2. handles regular text without modifications', () => {
    const safeText = 'Clean normal textual message';
    expect(sanitizeInput(safeText)).toBe(safeText);
  });

  it('3. returns empty string when input is not a string (non-string guard branch)', () => {
    expect(sanitizeInput(null as unknown as string)).toBe('');
    expect(sanitizeInput(42 as unknown as string)).toBe('');
    expect(sanitizeInput(undefined as unknown as string)).toBe('');
  });

  it('4. escapes ampersands correctly', () => {
    expect(sanitizeInput('A & B')).toBe('A &amp; B');
  });

  it('5. escapes double quotes correctly', () => {
    expect(sanitizeInput('He said "hello"')).toBe('He said &quot;hello&quot;');
  });

  it('6. escapes single quotes correctly', () => {
    expect(sanitizeInput("It's a test")).toBe('It&#x27;s a test');
  });

  it('7. escapes forward slashes correctly', () => {
    expect(sanitizeInput('test/path')).toBe('test&#x2F;path');
  });

  it('8. escapes backticks correctly', () => {
    expect(sanitizeInput('`code`')).toBe('&#x60;code&#x60;');
  });

  it('9. escapes equals sign correctly', () => {
    expect(sanitizeInput('x=y')).toBe('x&#x3D;y');
  });

  it('10. handles complex string containing all escape characters', () => {
    const complex = '<script>&"\'/`=</script>';
    const expected = '&lt;script&gt;&amp;&quot;&#x27;&#x2F;&#x60;&#x3D;&lt;&#x2F;script&gt;';
    expect(sanitizeInput(complex)).toBe(expected);
  });

  it('11. handles very long strings', () => {
    const longStr = 'a'.repeat(1000) + '<' + 'b'.repeat(1000);
    const escaped = sanitizeInput(longStr);
    expect(escaped.length).toBe(2004);
    expect(escaped).toContain('&lt;');
  });

  it('12. handles strings with leading and trailing whitespaces', () => {
    expect(sanitizeInput('   <hello>   ')).toBe('   &lt;hello&gt;   ');
  });

  it('13. handles strings with multiple consecutive HTML characters', () => {
    expect(sanitizeInput('<<<<')).toBe('&lt;&lt;&lt;&lt;');
  });

  it('14. handles strings with line breaks and carriage returns', () => {
    expect(sanitizeInput('line1\n<line2>\r\nline3')).toBe('line1\n&lt;line2&gt;\r\nline3');
  });

  it('15. handles unicode emojis and special non-latin scripts', () => {
    const unicodeText = '🌿 Earth Day: 🌍 — भारत, Россия';
    expect(sanitizeInput(unicodeText)).toBe(unicodeText);
  });
});
