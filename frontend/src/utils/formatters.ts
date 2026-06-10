/**
 * Formats a carbon amount (in kg) into a user-friendly string.
 * @param {number} amount - Carbon footprint amount in kilograms.
 * @returns {string} Formatted string with kg CO2 unit.
 */
export function formatCarbonAmount(amount: number): string {
  return `${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })} kg CO₂`;
}

/**
 * Formats an ISO date string to a shorter local date format.
 * @param {string} dateStr - ISO date string representation.
 * @returns {string} Formatted localized date string.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
