/**
 * Sanitizes input strings by escaping standard HTML tag and script control entities.
 * Prevents stored and DOM-based Cross-Site Scripting (XSS) injections.
 * 
 * @param {string} text - Raw input string to clean.
 * @returns {string} Clean, safe escaped string.
 */
export function sanitizeInput(text: string): string {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
