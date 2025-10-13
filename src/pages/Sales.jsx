import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

// --- Coffee Theme Colors ---
const CoffeeColors = {
  SCREEN_BG: '#FFF8F6',
  LIGHT_BG: '#FEEFEA',
  DARK_BROWN: '#4A3423',
  BUTTON_BROWN: '#8B4513',
  MEDIUM_BROWN: '#795548',
  LIGHT_BROWN: '#BCAAA4',
  WHITE: '#FFFFFF',
  GRAY_TEXT: '#8D8D8D',
  ERROR_RED: '#D32F2F',
  SUCCESS_GREEN: '#4CAF50',
};

function SalesList() {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Sample sales data with new fields
  const [salesData, setSalesData] = useState([
    {
      id: 1,
      customerName: "John Doe",
      batchId: "BATCH-001",
      product: "Coffee",
      item: "Dried",
      quantity: 100,
      rate: 5000,
      amount: 500000,
      dateOfPayment: "2025-01-15",
      status: "Paid",
      balance: 0,
      methodOfPayment: "Mobile Money"
    },
    {
      id: 2,
      customerName: "Jane Smith",
      batchId: "BATCH-002",
      product: "Coffee",
      item: "Hulled",
      quantity: 50,
      rate: 6000,
      amount: 300000,
      dateOfPayment: "2025-01-14",
      status: "Partial",
      balance: 100000,
      methodOfPayment: "Cash"
    },
    {
      id: 3,
      customerName: "Peter Okello",
      batchId: "BATCH-003",
      product: "Rice",
      item: "Dried",
      quantity: 75,
      rate: 3500,
      amount: 262500,
      dateOfPayment: "2025-01-13",
      status: "Pending",
      balance: 262500,
      methodOfPayment: "Bank Transfer"
    },
  ]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('UGX', 'UGX ');
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Paid':
        return { bg: '#E6FFE6', color: CoffeeColors.SUCCESS_GREEN };
      case 'Pending':
        return { bg: '#FFE5E5', color: CoffeeColors.ERROR_RED };
      case 'Partial':
        return { bg: '#FFF4E5', color: '#FF9800' };
      default:
        return { bg: '#F5F5F5', color: CoffeeColors.GRAY_TEXT };
    }
  };

  const handleEdit = (id) => {
    console.log('Edit sale:', id);
    navigate(`/sales-entry?edit=${id}`);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setSalesData(salesData.filter(sale => sale.id !== deleteId));
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: CoffeeColors.SCREEN_BG }}>
      {/* Main Content */}
      <div className="p-10">
        <div className="max-w-full mx-auto">
          {/* Header with Back and Add Button */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:opacity-80 transition-opacity border"
                style={{ 
                  borderColor: CoffeeColors.LIGHT_BROWN,
                  color: CoffeeColors.DARK_BROWN,
                  backgroundColor: CoffeeColors.WHITE
                }}
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold" style={{ color: CoffeeColors.DARK_BROWN }}>
                Sales Records
              </h1>
            </div>
            <button
              onClick={() => navigate('/sales-entry')}
              className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ 
                backgroundColor: CoffeeColors.BUTTON_BROWN,
                color: CoffeeColors.WHITE 
              }}
            >
              <span className="text-xl">+</span>
              Add Sale
            </button>
          </div>

          {/* Table */}
          <div className="rounded-lg shadow-lg overflow-x-auto" style={{ backgroundColor: CoffeeColors.WHITE }}>
            <table className="w-full">
              <thead style={{ backgroundColor: CoffeeColors.LIGHT_BG }}>
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Customer Name
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Batch ID
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Product
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Item
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Quantity (kg)
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Rate
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Amount
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Date
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Balance
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Payment Method
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((sale) => {
                  const statusStyle = getStatusColor(sale.status);
                  return (
                    <tr 
                      key={sale.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                      style={{ borderColor: CoffeeColors.LIGHT_BROWN }}
                    >
                      <td className="px-4 py-4 whitespace-nowrap" style={{ color: CoffeeColors.DARK_BROWN }}>
                        {sale.customerName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-mono text-sm" style={{ color: CoffeeColors.GRAY_TEXT }}>
                        {sale.batchId}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap" style={{ color: CoffeeColors.DARK_BROWN }}>
                        {sale.product}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap" style={{ color: CoffeeColors.GRAY_TEXT }}>
                        {sale.item}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap" style={{ color: CoffeeColors.GRAY_TEXT }}>
                        {sale.quantity} kg
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap" style={{ color: CoffeeColors.GRAY_TEXT }}>
                        {formatCurrency(sale.rate)}
                      </td>
                      <td className="px-4 py-4 font-semibold whitespace-nowrap" style={{ color: CoffeeColors.DARK_BROWN }}>
                        {formatCurrency(sale.amount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap" style={{ color: CoffeeColors.GRAY_TEXT }}>
                        {new Date(sale.dateOfPayment).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ 
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color
                          }}
                        >
                          {sale.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap" style={{ 
                        color: sale.balance > 0 ? CoffeeColors.ERROR_RED : CoffeeColors.SUCCESS_GREEN,
                        fontWeight: '600'
                      }}>
                        {formatCurrency(sale.balance)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap" style={{ color: CoffeeColors.GRAY_TEXT }}>
                        {sale.methodOfPayment}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex justify-center gap-2">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEdit(sale.id)}
                            className="px-3 py-1 rounded text-sm hover:opacity-80 transition-opacity"
                            style={{ 
                              backgroundColor: CoffeeColors.MEDIUM_BROWN,
                              color: CoffeeColors.WHITE 
                            }}
                          >
                            ✏️ Edit
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteClick(sale.id)}
                            className="px-3 py-1 rounded text-sm hover:opacity-80 transition-opacity"
                            style={{ 
                              backgroundColor: CoffeeColors.ERROR_RED,
                              color: CoffeeColors.WHITE 
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Empty State */}
            {salesData.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl" style={{ color: CoffeeColors.GRAY_TEXT }}>
                  No sales records found
                </p>
                <button
                  onClick={() => navigate('/sales-entry')}
                  className="mt-4 px-6 py-2 rounded font-semibold"
                  style={{ 
                    backgroundColor: CoffeeColors.BUTTON_BROWN,
                    color: CoffeeColors.WHITE 
                  }}
                >
                  Add Your First Sale
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg p-8 max-w-md w-full mx-4" style={{ backgroundColor: CoffeeColors.WHITE }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: CoffeeColors.DARK_BROWN }}>
              Confirm Delete
            </h2>
            <p className="mb-6" style={{ color: CoffeeColors.GRAY_TEXT }}>
              Are you sure you want to delete this sale record? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 rounded border hover:bg-gray-50 transition-colors"
                style={{ 
                  borderColor: CoffeeColors.LIGHT_BROWN,
                  color: CoffeeColors.DARK_BROWN 
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 rounded hover:opacity-90 transition-opacity"
                style={{ 
                  backgroundColor: CoffeeColors.ERROR_RED,
                  color: CoffeeColors.WHITE 
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesList;