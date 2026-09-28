/**
 * Currency formatter helper for Indian Rupees (INR / ₹)
 * Formats numbers into standard Indian numbering format (e.g. ₹18,499)
 */
export function formatINR(amount, includeDecimals = false) {
  const num = Number(amount) || 0;
  if (includeDecimals) {
    return `₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
}

export default formatINR;
