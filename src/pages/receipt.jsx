import React from 'react';

const Receipt = () => {
  // Sample data
  const receiptData = {
    farmName: 'Rugyeyo Farm',
    customerName: 'John Katerega',
    item: 'Coffee',
    quantityKg: 100,
    ratePerKg: 5000,
    paymentDate: '16/10/2025',
    paymentMethod: 'Cash',
    status: 'Paid',
  };

  const totalAmount = receiptData.quantityKg * receiptData.ratePerKg;

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>{receiptData.farmName}</h1>
      <div style={styles.section}>
        <p><strong>Customer:</strong> {receiptData.customerName}</p>
        <p><strong>Item Bought:</strong> {receiptData.item}</p>
        <p><strong>Quantity (kg):</strong> {receiptData.quantityKg}</p>
        <p><strong>Rate (UGX/kg):</strong> UGX {receiptData.ratePerKg.toLocaleString()}</p>
        <p><strong>Amount Paid:</strong> UGX {totalAmount.toLocaleString()}</p>
        <p><strong>Payment Date:</strong> {receiptData.paymentDate}</p>
        <p><strong>Payment Method:</strong> {receiptData.paymentMethod}</p>
        <p><strong>Status:</strong> {receiptData.status}</p>
      </div>
      <p style={styles.footer}>Thank you for your business!</p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: 'auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
  },
  heading: {
    textAlign: 'center',
    color: '#2c3e50',
  },
  section: {
    marginTop: '20px',
    lineHeight: '1.6',
  },
  footer: {
    marginTop: '30px',
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#555',
  },
};

export default Receipt;