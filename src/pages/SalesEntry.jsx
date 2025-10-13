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

function SalesEntry() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    customerName: "",
    batchId: "",
    product: "",
    item: "",
    quantity: "",
    rate: "",
    amount: "",
    dateOfPayment: "",
    status: "",
    balance: "",
    methodOfPayment: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const products = ["Coffee", "Banana", "Rice", "Wheat", "Cassava"];
  const items = ["Dried", "Hulled"];
  const statuses = ["Paid", "Pending", "Partial"];
  const paymentMethods = ["Cash", "Mobile Money", "Bank Transfer", "Cheque"];

  // Format number as currency (UGX)
  const formatCurrency = (value) => {
    if (!value) return "";
    const number = parseFloat(value);
    if (isNaN(number)) return "";
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number).replace('UGX', 'UGX ');
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    if (!formData.batchId.trim()) {
      newErrors.batchId = "Batch ID is required";
    }

    if (!formData.product) {
      newErrors.product = "Please select a product";
    }

    if (!formData.item) {
      newErrors.item = "Please select item type";
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      newErrors.rate = "Rate must be greater than 0";
    }

    if (!formData.dateOfPayment) {
      newErrors.dateOfPayment = "Please select a date";
    }

    if (!formData.status) {
      newErrors.status = "Please select status";
    }

    if (!formData.methodOfPayment) {
      newErrors.methodOfPayment = "Please select payment method";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    
    if (successMessage) {
      setSuccessMessage("");
    }

    let updatedData = { ...formData, [name]: value };

    // Auto-calculate amount when quantity or rate changes
    if (name === "quantity" || name === "rate") {
      const quantity = parseFloat(
        name === "quantity" ? value : formData.quantity
      );
      const rate = parseFloat(
        name === "rate" ? value : formData.rate
      );
      if (!isNaN(quantity) && !isNaN(rate)) {
        updatedData.amount = (quantity * rate).toFixed(2);
      } else {
        updatedData.amount = "";
      }
    }

    // Auto-calculate balance when amount or status changes
    if (name === "amount" || name === "status") {
      const amount = parseFloat(updatedData.amount || formData.amount);
      const status = name === "status" ? value : formData.status;
      
      if (!isNaN(amount)) {
        if (status === "Paid") {
          updatedData.balance = "0";
        } else if (status === "Pending") {
          updatedData.balance = amount.toFixed(2);
        }
        // For "Partial", user can manually enter balance
      }
    }

    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      console.log("Form submitted:", formData);
      
      setSuccessMessage("Sale recorded successfully!");
      
      setTimeout(() => {
        setFormData({
          customerName: "",
          batchId: "",
          product: "",
          item: "",
          quantity: "",
          rate: "",
          amount: "",
          dateOfPayment: "",
          status: "",
          balance: "",
          methodOfPayment: "",
        });
        setSuccessMessage("");
      }, 2000);
      
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({ submit: "Failed to submit sale. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: CoffeeColors.SCREEN_BG }}>
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col shadow-lg`}
        style={{ backgroundColor: CoffeeColors.BUTTON_BROWN }}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/20">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <span style={{ color: CoffeeColors.WHITE }} className="text-xl">✱</span>
              <span style={{ color: CoffeeColors.WHITE }} className="font-bold text-sm">AgriManageDesktop</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-white/10 p-2 rounded"
            style={{ color: CoffeeColors.WHITE }}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <button 
            onClick={() => navigate('/wages')}
            className="w-full text-left hover:bg-white/10 p-3 rounded mb-2 flex items-center gap-3"
            style={{ color: CoffeeColors.WHITE }}
          >
            <span className="text-xl">💰</span>
            {sidebarOpen && <span>Wages</span>}
          </button>
          <button 
            onClick={() => navigate('/wage-entry')}
            className="w-full text-left hover:bg-white/10 p-3 rounded mb-2 flex items-center gap-3"
            style={{ color: CoffeeColors.WHITE }}
          >
            <span className="text-xl">📝</span>
            {sidebarOpen && <span>Wage Entry</span>}
          </button>
          <button 
            onClick={() => navigate('/sales-entry')}
            className="w-full text-left p-3 rounded mb-2 flex items-center gap-3 bg-white/20"
            style={{ color: CoffeeColors.WHITE }}
          >
            <span className="text-xl">📈</span>
            {sidebarOpen && <span>Sales Entry</span>}
          </button>
          <button 
            onClick={() => navigate('/expense')}
            className="w-full text-left hover:bg-white/10 p-3 rounded mb-2 flex items-center gap-3"
            style={{ color: CoffeeColors.WHITE }}
          >
            <span className="text-xl">💸</span>
            {sidebarOpen && <span>Expense</span>}
          </button>
          <button 
            onClick={() => navigate('/expense-list')}
            className="w-full text-left hover:bg-white/10 p-3 rounded mb-2 flex items-center gap-3"
            style={{ color: CoffeeColors.WHITE }}
          >
            <span className="text-xl">📋</span>
            {sidebarOpen && <span>Expense List</span>}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 overflow-y-auto">
        <div className="w-full max-w-4xl p-8 rounded-lg shadow-lg" style={{ backgroundColor: CoffeeColors.LIGHT_BG }}>
          <h1 className="text-3xl font-bold mb-8" style={{ color: CoffeeColors.DARK_BROWN }}>
            Sales Entry Form
          </h1>

          <form onSubmit={handleSubmit}>
            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 rounded border" style={{
                backgroundColor: '#E6FFE6',
                borderColor: CoffeeColors.SUCCESS_GREEN,
                color: CoffeeColors.SUCCESS_GREEN
              }}>
                ✓ {successMessage}
              </div>
            )}

            {/* General Error Message */}
            {errors.submit && (
              <div className="mb-4 p-3 rounded border" style={{
                backgroundColor: '#FFE5E5',
                borderColor: CoffeeColors.ERROR_RED,
                color: CoffeeColors.ERROR_RED
              }}>
                ✕ {errors.submit}
              </div>
            )}

            {/* Row 1: Customer Name and Batch ID */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  className={`w-full px-4 py-2 rounded focus:outline-none focus:ring-1`}
                  style={{
                    backgroundColor: CoffeeColors.WHITE,
                    borderWidth: '1px',
                    borderColor: errors.customerName ? CoffeeColors.ERROR_RED : CoffeeColors.LIGHT_BROWN,
                    color: CoffeeColors.DARK_BROWN
                  }}
                  required
                />
                {errors.customerName && (
                  <p className="text-xs mt-1" style={{ color: CoffeeColors.ERROR_RED }}>
                    {errors.customerName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                  Batch ID *
                </label>
                <input
                  type="text"
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleChange}
                  placeholder="Enter batch ID"
                  className={`w-full px-4 py-2 rounded focus:outline-none focus:ring-1`}
                  style={{
                    backgroundColor: CoffeeColors.WHITE,
                    borderWidth: '1px',
                    borderColor: errors.batchId ? CoffeeColors.ERROR_RED : CoffeeColors.LIGHT_BROWN,
                    color: CoffeeColors.DARK_BROWN
                  }}
                  required
                />
                {errors.batchId && (
                  <p className="text-xs mt-1" style={{ color: CoffeeColors.ERROR_RED }}>
                    {errors.batchId}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Product and Item */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                  Product *
                </label>
                <select
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded focus:outline-none focus:ring-1`}
                  style={{
                    backgroundColor: CoffeeColors.WHITE,
                    borderWidth: '1px',
                    borderColor: errors.product ? CoffeeColors.ERROR_RED : CoffeeColors.LIGHT_BROWN,
                    color: CoffeeColors.DARK_BROWN
                  }}
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((p, index) => (
                    <option key={index} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {errors.product && (
                  <p className="text-xs mt-1" style={{ color: CoffeeColors.ERROR_RED }}>
                    {errors.product}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                  Item *
                </label>
                <select
                  name="item"
                  value={formData.item}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded focus:outline-none focus:ring-1`}
                  style={{
                    backgroundColor: CoffeeColors.WHITE,
                    borderWidth: '1px',
                    borderColor: errors.item ? CoffeeColors.ERROR_RED : CoffeeColors.LIGHT_BROWN,
                    color: CoffeeColors.DARK_BROWN
                  }}
                  required
                >
                  <option value="">Select item type</option>
                  {items.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                {errors.item && (
                  <p className="text-xs mt-1" style={{ color: CoffeeColors.ERROR_RED }}>
                    {errors.item}
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Quantity and Rate */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                  Quantity (kg) *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="e.g. 100"
                  className={`w-full px-4 py-2 rounded focus:outline-none focus:ring-1`}
                  style={{
                    backgroundColor: CoffeeColors.WHITE,
                    borderWidth: '1px',
                    borderColor: errors.quantity ? CoffeeColors.ERROR_RED : CoffeeColors.LIGHT_BROWN,
                    color: CoffeeColors.DARK_BROWN
                  }}
                  required
                />
                {errors.quantity && (
                  <p className="text-xs mt-1" style={{ color: CoffeeColors.ERROR_RED }}>
                    {errors.quantity}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                  Rate (UGX per kg) *
                </label>
                <input
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="e.g. 5000"
                  className={`w-full px-4 py-2 rounded focus:outline-none focus:ring-1`}
                  style={{
                    backgroundColor: CoffeeColors.WHITE,
                    borderWidth: '1px',
                    borderColor: errors.rate ? CoffeeColors.ERROR_RED : CoffeeColors.LIGHT_BROWN,
                    color: CoffeeColors.DARK_BROWN
                  }}
                  required
                />
                {errors.rate && (
                  <p className="text-xs mt-1" style={{ color: CoffeeColors.ERROR_RED }}>
                    {errors.rate}
                  </p>
                )}
              </div>
            </div>

            {/* Row 4: Amount (Read-only) */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                Amount (UGX)
              </label>
              <input
                type="text"
                value={formData.amount ? formatCurrency(formData.amount) : 'UGX 0'}
                readOnly
                className="w-full px-4 py-2 rounded font-medium"
                style={{
                  backgroundColor: '#F5F5F5',
                  borderWidth: '1px',
                  borderColor: CoffeeColors.LIGHT_BROWN,
                  color: CoffeeColors.DARK_BROWN
                }}
              />
            </div>

            {/* Row 5: Date of Payment and Status */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                  Date of Payment *
                </label>
                <input
                  type="date"
                  name="dateOfPayment"
                  value={formData.dateOfPayment}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 rounded focus:outline-none focus:ring-1`}
                  style={{
                    backgroundColor: CoffeeColors.WHITE,
                    borderWidth: '1px',
                    borderColor: errors.dateOfPayment ? CoffeeColors.ERROR_RED : CoffeeColors.LIGHT_BROWN,
                    color: CoffeeColors.DARK_BROWN
                  }}
                  required
                />
                {errors.dateOfPayment && (
                  <p className="text-xs mt-1" style={{ color: CoffeeColors.ERROR_RED }}>
                    {errors.dateOfPayment}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded focus:outline-none focus:ring-1`}
                  style={{
                    backgroundColor: CoffeeColors.WHITE,
                    borderWidth: '1px',
                    borderColor: errors.status ? CoffeeColors.ERROR_RED : CoffeeColors.LIGHT_BROWN,
                    color: CoffeeColors.DARK_BROWN
                  }}
                  required
                >
                  <option value="">Select status</option>
                  {statuses.map((status, index) => (
                    <option key={index} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="text-xs mt-1" style={{ color: CoffeeColors.ERROR_RED }}>
                    {errors.status}
                  </p>
                )}
              </div>
            </div>

            {/* Row 6: Balance and Method of Payment */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                  Balance (UGX)
                </label>
                <input
                  type="number"
                  name="balance"
                  value={formData.balance}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="Auto-calculated or enter manually"
                  className={`w-full px-4 py-2 rounded focus:outline-none focus:ring-1`}
                  style={{
                    backgroundColor: formData.status === "Partial" ? CoffeeColors.WHITE : '#F5F5F5',
                    borderWidth: '1px',
                    borderColor: CoffeeColors.LIGHT_BROWN,
                    color: CoffeeColors.DARK_BROWN
                  }}
                  readOnly={formData.status !== "Partial"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                  Method of Payment *
                </label>
                <select
                  name="methodOfPayment"
                  value={formData.methodOfPayment}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded focus:outline-none focus:ring-1`}
                  style={{
                    backgroundColor: CoffeeColors.WHITE,
                    borderWidth: '1px',
                    borderColor: errors.methodOfPayment ? CoffeeColors.ERROR_RED : CoffeeColors.LIGHT_BROWN,
                    color: CoffeeColors.DARK_BROWN
                  }}
                  required
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map((method, index) => (
                    <option key={index} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
                {errors.methodOfPayment && (
                  <p className="text-xs mt-1" style={{ color: CoffeeColors.ERROR_RED }}>
                    {errors.methodOfPayment}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded font-semibold transition-colors`}
              style={{
                backgroundColor: isSubmitting ? CoffeeColors.GRAY_TEXT : CoffeeColors.BUTTON_BROWN,
                color: CoffeeColors.WHITE,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Sale'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SalesEntry;