import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SideNav from '../components/SideNav.jsx';

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

  const validateField = (name, value) => {
    switch (name) {
      case 'customerName':
        return value.trim().length < 2 ? 'Must be at least 2 characters' : '';
      case 'item': case 'status': case 'methodOfPayment':
        return !value ? 'This field is required' : '';
      case 'quantity': case 'rate':
        return !value || parseFloat(value) <= 0 ? 'Must be greater than 0' : '';
      case 'dateOfPayment':
        return !value ? 'Please select a date' : '';
      default: return '';
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

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'quantity' || name === 'rate') {
      const qty = parseFloat(name === 'quantity' ? value : formData.quantity);
      const rte = parseFloat(name === 'rate' ? value : formData.rate);
      if (!isNaN(qty) && !isNaN(rte)) {
        updatedData.amount = (qty * rte).toFixed(2);
      }
    }

    if (name === 'status' || name === 'amount') {
      const amt = parseFloat(updatedData.amount || formData.amount);
      const sts = name === 'status' ? value : formData.status;
      if (!isNaN(amt)) {
        if (sts === 'Paid') updatedData.balance = '0';
        else if (sts === 'Pending') updatedData.balance = amt.toFixed(2);
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
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'balance' && key !== 'amount') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

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
        ? `https://api-3181.onrender.com/api/sales/${editId}/`
        : 'https://api-3181.onrender.com/api/sales/';

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
      <div style={{ minHeight: '100vh', backgroundColor: '#F5F0E8', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#6B2E0F', marginBottom: '20px', textAlign: 'center' }}>
          {isEditing ? 'Edit Sale' : 'Sales Entry Form'}
        </h1>

        {/* Compact Form */}
        <div style={{
          backgroundColor: '#F5E6D3',
          borderRadius: '10px',
          padding: '20px',
          border: '2px solid #D4A574',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
        <div style={{ display: 'grid', gap: '12px' }}>

          {/* Row 2: Customer Name and Item in one row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6B2E0F', display: 'block', marginBottom: '4px' }}>
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
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6B2E0F', display: 'block', marginBottom: '4px' }}>
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
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6B2E0F', display: 'block', marginBottom: '4px' }}>
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
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6B2E0F', display: 'block', marginBottom: '4px' }}>
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
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6B2E0F', display: 'block', marginBottom: '4px' }}>
                Payment Date *
              </label>
              <input
                type="date"
                name="dateOfPayment"
                value={formData.dateOfPayment}
                onChange={handleChange}
                onBlur={handleBlur}
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
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6B2E0F', display: 'block', marginBottom: '4px' }}>
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
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6B2E0F', display: 'block', marginBottom: '4px' }}>
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
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6B2E0F', display: 'block', marginBottom: '4px' }}>
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
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#6B2E0F', display: 'block', marginBottom: '4px' }}>
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
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6B2E0F', display: 'block', marginBottom: '4px' }}>
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
                  border: '2px solid #C4A57B',
                  borderRadius: '6px',
                  backgroundColor: '#E8E8E8',
                  fontWeight: '600'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6B2E0F', display: 'block', marginBottom: '4px' }}>
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
              backgroundColor: loading ? '#CCCCCC' : '#6B2E0F',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#5A260D')}
            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#6B2E0F')}
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