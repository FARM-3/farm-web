import React from 'react';

const Receipt = () => {
  // Sample data updated to better reflect the image structure
  const receiptData = {
    farmName: 'Rugyeyo Farm',
    title: 'Sales Receipt',
    customerName: 'John Katerega', // Updated to match image
    paymentDate: '16/10/2025',
    status: 'paid',
    paymentMethod: 'cash',
    batchId: 'BATCH-001', // Added
    items: [ // Changed to an array for table structure
      {
        product: 'coffee',
        item: 'Arabica',
        quantityKg: 100,
        ratePerKg: 5000,
      },
    ],
  };

  // Calculate totals
  const totalAmount = receiptData.items.reduce((sum, item) => 
    sum + item.quantityKg * item.ratePerKg, 0
  );
  const balance = 0; // Assuming balance is 0 for a 'Paid' status

  // Helper function to format currency
  const formatUGX = (amount) => `UGX ${amount.toLocaleString()}`;

  return (
    <div style={styles.container}>
      <h2 style={styles.mainTitle}>{receiptData.title}</h2>
      <p style={styles.farmName}>{receiptData.farmName}</p>
      
      {/* Customer and Payment Details Section */}
      <div style={styles.headerDetails}>
        <div style={styles.detailRow}>
          <p style={styles.detailLabel}>Customer:</p>
          <p style={styles.detailValue}>{receiptData.customerName}</p>
        </div>
        <div style={styles.detailRow}>
          <p style={styles.detailLabel}>Payment Date:</p>
          <p style={styles.detailValue}>{receiptData.paymentDate}</p>
        </div>
        <div style={styles.detailRow}>
          <p style={styles.detailLabel}>Status:</p>
          <p style={styles.detailValue}>{receiptData.status}</p>
        </div>
        <div style={styles.detailRow}>
          <p style={styles.detailLabel}>Payment Method:</p>
          <p style={styles.detailValue}>{receiptData.paymentMethod}</p>
        </div>
        <div style={styles.detailRow}>
          <p style={styles.detailLabel}>Batch ID:</p>
          <p style={styles.detailValue}>{receiptData.batchId}</p>
        </div>
      </div>
      
      <hr style={styles.divider} />
      
      {/* Itemized List Table */}
      <table style={styles.itemTable}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th>Product</th>
            <th>Item</th>
            <th>Qty (kg)</th>
            <th>Rate (UGX)</th>
            <th>Total (UGX)</th>
          </tr>
        </thead>
        <tbody>
          {receiptData.items.map((item, index) => (
            <tr key={index}>
              <td style={styles.tableCell}>{item.product}</td>
              <td style={styles.tableCell}>{item.item}</td>
              <td style={styles.tableCell}>{item.quantityKg}</td>
              <td style={styles.tableCell}>{item.ratePerKg.toLocaleString()}</td>
              <td style={styles.tableCellRight}>
                {(item.quantityKg * item.ratePerKg).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={styles.divider} />

      {/* Totals Section */}
      <div style={styles.totalsSection}>
        <div style={styles.totalRow}>
          <p style={styles.totalLabel}>Total Amount:</p>
          <p style={styles.totalValue}>{formatUGX(totalAmount)}</p>
        </div>
        <div style={styles.totalRow}>
          <p style={styles.totalLabel}>Balance:</p>
          <p style={styles.totalValue}>{formatUGX(balance)}</p>
        </div>
      </div>
      
      <p style={styles.footer}>Thank you for your business!</p>
    </div>
  );
};

// Styles object for visual presentation
const styles = {
  container: {
    maxWidth: '500px', // Increased width for better table view
    margin: '30px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#fff', // Changed background to white for standard receipt look
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    color: '#333',
  },
  mainTitle: {
    textAlign: 'center',
    fontSize: '24px',
    margin: '0 0 5px 0',
    fontWeight: 'bold',
  },
  farmName: {
    textAlign: 'center',
    fontSize: '14px',
    margin: '0 0 20px 0',
  },
  headerDetails: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '10px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '2px 0',
    fontSize: '14px',
  },
  detailLabel: {
    margin: 0,
    fontWeight: 'normal', // Let the bolding happen in the JSX for specific words
  },
  detailValue: {
    margin: 0,
    fontWeight: 'bold', // Values on the right are generally bolded in the image
  },
  divider: {
    border: '0',
    borderTop: '1px solid #eee',
    margin: '15px 0',
  },
  itemTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px',
  },
  tableHeaderRow: {
    borderBottom: '1px solid #ccc',
    paddingBottom: '5px',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: '8px 5px',
  },
  tableCellRight: {
    padding: '8px 5px',
    textAlign: 'right', // Align total column to the right
  },
  totalsSection: {
    paddingTop: '10px',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '2px 0',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  totalLabel: {
    margin: 0,
  },
  totalValue: {
    margin: 0,
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#555',
    fontSize: '14px',
  },
};

export default Receipt;