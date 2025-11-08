/**
 * Utility functions for receipt-related navigation
 */

/**
 * Navigate to the receipt page for a specific sale
 * @param {object} params Navigation parameters
 * @param {function} params.navigate React Router navigate function
 * @param {string} params.saleId ID of the sale
 * @param {boolean} params.replace Whether to replace current history entry
 */
export const navigateToReceipt = ({ navigate, saleId, replace = false }) => {
  if (!saleId) {
    console.error('[Receipt Navigation] No sale ID provided');
    return;
  }

  navigate(`/receipt?id=${saleId}`, { replace });
};

/**
 * Generate a receipt URL for a specific sale
 * @param {string} saleId ID of the sale
 * @returns {string} Full URL to the receipt
 */
export const getReceiptUrl = (saleId) => {
  if (!saleId) return null;
  const baseUrl = window.location.origin;
  return `${baseUrl}/receipt?id=${saleId}`;
};