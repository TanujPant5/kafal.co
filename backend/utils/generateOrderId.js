/**
 * Generate a short, human-readable order ID.
 * Format: KFL-XXXXXX (uppercase alphanumeric)
 */
const generateOrderId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'KFL-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = generateOrderId;
