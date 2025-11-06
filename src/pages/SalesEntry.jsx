import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, X } from 'lucide-react';
import SideNav from '../components/SideNav.jsx';

// Unified color scheme matching wages and expenses
const CUSTOM_COLORS = {
    headerBg: '#702A0B',
    cardBg: '#F5EEDC',
    actionBg: '#702A0B',
    inputBg: '#FFFFFF',
    inputBorder: '#B8A072',
};

function SalesEntry() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    customerName: '', item: '', quantity: '', rate: '',
    dateOfPayment: '', status: '', balance: '', batchId: '', methodOfPayment: '', amount: '', amountPaid: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = ['Coffee', 'Banana', 'Rice'];

  // Check if we're editing an existing sale
  useEffect(() => {
    const editSale = location.state?.editSale;
    if (editSale) {
      setIsEditing(true);
      setEditId(editSale.id);
      setFormData({
        customerName: editSale.customer_name || '',
        item: editSale.item || '',
        quantity: editSale.quantity?.toString() || '',
        rate: editSale.rate?.toString() || '',
        dateOfPayment: editSale.date_of_payment || '',
        status: editSale.status || '',
        balance: editSale.balance?.toString() || '',
        batchId: editSale.batch_id || '',
        methodOfPayment: editSale.method_of_payment || '',
        amount: editSale.amount?.toString() || '',
        amountPaid: editSale.amount_paid?.toString() || ''
      });
    }
  }, [location.state]);
  const statuses = ['Paid', 'Pending', 'Partial'];
  const paymentMethods = ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque'];

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'customerName':
        if (!value || value.trim().length === 0) {
          return 'Customer name is required';
        }
        if (value.trim().length < 2) {
          return 'Customer name must be at least 2 characters';
        }
        if (value.trim().length > 100) {
          return 'Customer name must not exceed 100 characters';
        }
        return '';

      case 'item':
        return !value ? 'Please select an item' : '';

      case 'quantity':
        if (!value || value === '') {
          return 'Quantity is required';
        }
        const qty = parseFloat(value);
        if (isNaN(qty)) {
          return 'Quantity must be a valid number';
        }
        if (qty <= 0) {
          return 'Quantity must be greater than 0';
        }
        if (qty > 1000000) {
          return 'Quantity seems unreasonably high';
        }
        return '';

      case 'rate':
        if (!value || value === '') {
          return 'Rate is required';
        }
        const rate = parseFloat(value);
        if (isNaN(rate)) {
          return 'Rate must be a valid number';
        }
        if (rate <= 0) {
          return 'Rate must be greater than 0';
        }
        if (rate < 100) {
          return 'Rate seems too low (minimum 100 UGX)';
        }
        return '';

      case 'dateOfPayment':
        if (!value) {
          return 'Payment date is required';
        }
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate > today) {
          return 'Cannot select a future date';
        }
        return '';

      case 'status':
        return !value ? 'Please select a payment status' : '';

      case 'methodOfPayment':
        return !value ? 'Please select a payment method' : '';

      case 'amountPaid':
        if (!value || value === '') {
          return 'Amount paid is required';
        }
        const amtPaid = parseFloat(value);
        if (isNaN(amtPaid)) {
          return 'Amount paid must be a valid number';
        }
        if (amtPaid < 0) {
          return 'Amount paid cannot be negative';
        }
        // Validate amount paid vs total amount
        const totalAmount = parseFloat(formData.amount);
        if (!isNaN(totalAmount) && amtPaid > totalAmount) {
          return 'Amount paid cannot exceed total amount';
        }
        return '';

      default:
        return '';
    }
  };

  const getBorderColor = (fieldName) => {
    if (!touched[fieldName]) return '#C4A57B';
    if (errors[fieldName]) return '#D32F2F';
    if (formData[fieldName]) return '#388E3C'; // Green for valid
    return '#C4A57B';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-calculate amount when quantity or rate changes
    if (name === 'quantity' || name === 'rate') {
      const qty = parseFloat(name === 'quantity' ? value : formData.quantity);
      const rte = parseFloat(name === 'rate' ? value : formData.rate);
      if (!isNaN(qty) && !isNaN(rte)) {
        updatedData.amount = (qty * rte).toFixed(2);
      } else {
        updatedData.amount = '';
      }
    }

    // Auto-calculate balance based on status and amount
    if (name === 'status' || name === 'amount' || name === 'amountPaid') {
      const amt = parseFloat(updatedData.amount || formData.amount);
      const amtPaid = parseFloat(name === 'amountPaid' ? value : formData.amountPaid);
      const sts = name === 'status' ? value : formData.status;

      if (!isNaN(amt)) {
        if (sts === 'Paid') {
          updatedData.balance = '0';
          updatedData.amountPaid = amt.toFixed(2);
        } else if (sts === 'Pending') {
          updatedData.balance = amt.toFixed(2);
          updatedData.amountPaid = '0';
        } else if (sts === 'Partial' && !isNaN(amtPaid)) {
          updatedData.balance = (amt - amtPaid).toFixed(2);
        }
      }
    }

    setFormData(updatedData);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'balance' && key !== 'amount' && key !== 'batchId') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    // Additional validation: Check if amount is less than rate
    const amount = parseFloat(formData.amount);
    const rate = parseFloat(formData.rate);
    if (!isNaN(amount) && !isNaN(rate) && amount < rate) {
      newErrors.amount = `Total amount (${amount.toLocaleString()} UGX) cannot be less than rate per kg (${rate.toLocaleString()} UGX)`;
    }

    // Check if amountPaid is appropriate for status
    const amtPaid = parseFloat(formData.amountPaid);
    const totalAmount = parseFloat(formData.amount);
    if (formData.status === 'Paid' && amtPaid < totalAmount) {
      newErrors.status = 'Status cannot be "Paid" if amount paid is less than total amount';
    }

    setErrors(newErrors);

    // Show error message if validation fails
    if (Object.keys(newErrors).length > 0) {
      setMessage('Please fix all validation errors before submitting');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload = {
        customer_name: formData.customerName,
        item: formData.item,
        quantity: parseFloat(formData.quantity),
        rate: parseFloat(formData.rate),
        amount: parseFloat(formData.amount),
        amount_paid: parseFloat(formData.amountPaid) || 0,
        date_of_payment: formData.dateOfPayment,
        status: formData.status,
        balance: parseFloat(formData.balance),
        batch_id: formData.batchId || null,
        method_of_payment: formData.methodOfPayment
      };

      const url = isEditing
        ? `http://142.93.94.236:8000/api/sales/${editId}/`
        : 'http://142.93.94.236:8000/api/sales/';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage(isEditing ? 'Sale updated successfully!' : 'Sale recorded successfully!');
        // Reset form
        setFormData({
          customerName: '', item: '', quantity: '', rate: '',
          dateOfPayment: '', status: '', balance: '', batchId: '', methodOfPayment: '', amount: '', amountPaid: ''
        });
        setErrors({});
        setTouched({});
        setIsEditing(false);
        setEditId(null);
        // Navigate to sales page to show the updated record
        setTimeout(() => {
          navigate('/sales');
        }, 1500);
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        setMessage(`Failed to ${isEditing ? 'update' : 'save'} sale: ${response.status} - ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F1', padding: '20px' }}>
        {/* Styled Header */}
        <div
          className="flex justify-between items-center p-5 rounded-t-2xl mb-0"
          style={{
            backgroundColor: '#8B5A3C',
            maxWidth: '600px',
            margin: '0 auto',
            borderRadius: '10px 10px 0 0'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? 'Edit Sale' : 'Sales Entry Form'}
            </h1>
          </div>
          <button
            onClick={() => navigate('/sales')}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Compact Form */}
        <div style={{
          backgroundColor: CUSTOM_COLORS.cardBg,
          borderRadius: '0 0 10px 10px',
          padding: '20px',
          border: `1px solid ${CUSTOM_COLORS.inputBorder}`,
          borderTop: 'none',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
        <div style={{ display: 'grid', gap: '12px' }}>

          {/* Row 2: Customer Name and Item in one row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: CUSTOM_COLORS.headerBg, display: 'block', marginBottom: '4px' }}>
                Customer Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="John Doe"
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '12px',
                  border: `2px solid ${getBorderColor('customerName')}`,
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              />
              {errors.customerName && <span style={{ color: '#D32F2F', fontSize: '10px', display: 'block', marginTop: '2px' }}>{errors.customerName}</span>}
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: CUSTOM_COLORS.headerBg, display: 'block', marginBottom: '4px' }}>
                Item *
              </label>
              <select
                name="item"
                value={formData.item}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '12px',
                  border: `2px solid ${getBorderColor('item')}`,
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              >
                <option value="">Select</option>
                {items.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              {errors.item && <span style={{ color: '#D32F2F', fontSize: '10px', display: 'block', marginTop: '2px' }}>{errors.item}</span>}
            </div>
          </div>

          {/* Row 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: CUSTOM_COLORS.headerBg, display: 'block', marginBottom: '4px' }}>
                Qty (kg) *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="100"
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '12px',
                  border: `2px solid ${getBorderColor('quantity')}`,
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              />
              {errors.quantity && <span style={{ color: '#D32F2F', fontSize: '10px', display: 'block', marginTop: '2px' }}>{errors.quantity}</span>}
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: CUSTOM_COLORS.headerBg, display: 'block', marginBottom: '4px' }}>
                Rate (UGX) *
              </label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="5000"
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '12px',
                  border: `2px solid ${getBorderColor('rate')}`,
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              />
              {errors.rate && <span style={{ color: '#D32F2F', fontSize: '10px', display: 'block', marginTop: '2px' }}>{errors.rate}</span>}
            </div>
          </div>

          {/* Row 4 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: CUSTOM_COLORS.headerBg, display: 'block', marginBottom: '4px' }}>
                Payment Date *
              </label>
              <input
                type="date"
                name="dateOfPayment"
                value={formData.dateOfPayment}
                onChange={handleChange}
                onBlur={handleBlur}
                max={getTodayDate()}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '12px',
                  border: `2px solid ${getBorderColor('dateOfPayment')}`,
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              />
              {errors.dateOfPayment && <span style={{ color: '#D32F2F', fontSize: '10px', display: 'block', marginTop: '2px' }}>{errors.dateOfPayment}</span>}
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: CUSTOM_COLORS.headerBg, display: 'block', marginBottom: '4px' }}>
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '12px',
                  border: `2px solid ${getBorderColor('status')}`,
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              >
                <option value="">Select</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.status && <span style={{ color: '#D32F2F', fontSize: '10px', display: 'block', marginTop: '2px' }}>{errors.status}</span>}
            </div>
          </div>

          {/* Row 5 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: CUSTOM_COLORS.headerBg, display: 'block', marginBottom: '4px' }}>
                Payment Method *
              </label>
              <select
                name="methodOfPayment"
                value={formData.methodOfPayment}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '12px',
                  border: `2px solid ${getBorderColor('methodOfPayment')}`,
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              >
                <option value="">Select</option>
                {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.methodOfPayment && <span style={{ color: '#D32F2F', fontSize: '10px', display: 'block', marginTop: '2px' }}>{errors.methodOfPayment}</span>}
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: CUSTOM_COLORS.headerBg, display: 'block', marginBottom: '4px' }}>
                Batch ID
              </label>
              <input
                type="text"
                name="batchId"
                value={formData.batchId}
                onChange={handleChange}
                placeholder="BATCH-001"
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '12px',
                  border: '2px solid #C4A57B',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Amount Paid */}
          <div style={{ marginTop: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: CUSTOM_COLORS.headerBg, display: 'block', marginBottom: '4px' }}>
              Amount Paid (UGX) *
            </label>
            <input
              type="number"
              name="amountPaid"
              value={formData.amountPaid}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="0"
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '12px',
                border: `2px solid ${getBorderColor('amountPaid')}`,
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            />
            {errors.amountPaid && <span style={{ color: '#D32F2F', fontSize: '10px', display: 'block', marginTop: '2px' }}>{errors.amountPaid}</span>}
          </div>

          {/* Auto-calculated */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '5px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: CUSTOM_COLORS.headerBg, display: 'block', marginBottom: '4px' }}>
                Total Amount
              </label>
              <input
                type="text"
                value={formData.amount ? `UGX ${parseFloat(formData.amount).toLocaleString()}` : 'UGX 0'}
                readOnly
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '12px',
                  border: errors.amount ? '2px solid #D32F2F' : '2px solid #C4A57B',
                  borderRadius: '6px',
                  backgroundColor: '#E8E8E8',
                  fontWeight: '600'
                }}
              />
              {errors.amount && <span style={{ color: '#D32F2F', fontSize: '10px', display: 'block', marginTop: '2px' }}>{errors.amount}</span>}
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: CUSTOM_COLORS.headerBg, display: 'block', marginBottom: '4px' }}>
                Balance
              </label>
              <input
                type="text"
                value={formData.balance ? `UGX ${parseFloat(formData.balance).toLocaleString()}` : 'UGX 0'}
                readOnly
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '12px',
                  border: '2px solid #C4A57B',
                  borderRadius: '6px',
                  backgroundColor: '#E8E8E8',
                  fontWeight: '600'
                }}
              />
            </div>
          </div>

          {message && (
            <div style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '10px',
              backgroundColor: message.includes('successfully') ? '#E8F5E8' : '#FFEBEE',
              border: `1px solid ${message.includes('successfully') ? '#4CAF50' : '#F44336'}`,
              color: message.includes('successfully') ? '#2E7D32' : '#C62828',
              fontSize: '12px',
              fontWeight: '500',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#FFFFFF',
              backgroundColor: loading ? '#CCCCCC' : CUSTOM_COLORS.actionBg,
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#5A260D')}
            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = CUSTOM_COLORS.actionBg)}
          >
            {loading ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Sale' : 'Record Sale')}
          </button>
        </div>
      </div>
    </div>
    </SideNav>
  );
}

export default SalesEntry;