import { useState } from 'react';
import { Menu, X, Home, DollarSign, ShoppingCart, Package, Users, ChevronLeft, ChevronRight } from 'lucide-react';

function SalesEntry() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', product: '', item: '', quantity: '', rate: '',
    dateOfPayment: '', status: '', balance: '', batchId: '', methodOfPayment: '', amount: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const products = ['Coffee', 'Banana', 'Rice', 'Wheat', 'Cassava'];
  const items = ['Dried', 'Hulled'];
  const statuses = ['Paid', 'Pending', 'Partial'];
  const paymentMethods = ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque'];

  const navItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'Sales', icon: ShoppingCart },
    { name: 'Inventory', icon: Package },
    { name: 'Staff', icon: Users },
    { name: 'Wages', icon: DollarSign },
  ];

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName': case 'lastName':
        return value.trim().length < 2 ? 'Must be at least 2 characters' : '';
      case 'product': case 'item': case 'status': case 'methodOfPayment':
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

  const handleSubmit = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'balance' && key !== 'amount') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted:', formData);
      alert('Sale recorded successfully!');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F0E8', display: 'flex' }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
      
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100%',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s',
        width: sidebarCollapsed ? '60px' : '200px',
        backgroundColor: '#6B2E0F',
        zIndex: 50,
        padding: '10px'
      }} className="md:translate-x-0">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '0 5px' }}>
          {!sidebarCollapsed && <span style={{ color: 'white', fontWeight: 'bold' }}>Menu</span>}
          <div style={{ display: 'flex', gap: '5px' }}>
            <button onClick={() => setSidebarOpen(false)} style={{ color: 'white' }} className="md:hidden">
              <X size={16} />
            </button>
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ color: 'white' }} className="hidden md:block">
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href="#"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '14px',
                  backgroundColor: item.name === 'Sales' ? '#8B4513' : 'transparent',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                }}
                onMouseEnter={(e) => {
                  if (item.name !== 'Sales') e.target.style.backgroundColor = '#8B4513';
                }}
                onMouseLeave={(e) => {
                  if (item.name !== 'Sales') e.target.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={18} />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ 
        marginLeft: sidebarCollapsed ? '60px' : '200px', 
        flex: 1, 
        transition: 'margin-left 0.3s',
        padding: '15px'
      }} className="md:ml-0">
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px',
          padding: '10px 0'
        }}>
          <button 
            onClick={() => setSidebarOpen(true)}
            style={{
              padding: '6px',
              borderRadius: '6px',
              border: '1px solid #C4A57B',
              backgroundColor: 'white'
            }}
            className="md:hidden"
          >
            <Menu size={16} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#6B2E0F', margin: 0 }}>
            Sales Entry
          </h1>
        </div>

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
            {/* Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6B2E0F', display: 'block', marginBottom: '4px' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="John"
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '12px',
                    border: `2px solid ${getBorderColor('firstName')}`,
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none'
                  }}
                />
                {errors.firstName && <span style={{ color: '#D32F2F', fontSize: '10px', display: 'block', marginTop: '2px' }}>{errors.firstName}</span>}
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6B2E0F', display: 'block', marginBottom: '4px' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Doe"
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '12px',
                    border: `2px solid ${getBorderColor('lastName')}`,
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none'
                  }}
                />
                {errors.lastName && <span style={{ color: '#D32F2F', fontSize: '10px', display: 'block', marginTop: '2px' }}>{errors.lastName}</span>}
              </div>
            </div>

            {/* Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6B2E0F', display: 'block', marginBottom: '4px' }}>
                  Product *
                </label>
                <select
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '12px',
                    border: `2px solid ${getBorderColor('product')}`,
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none'
                  }}
                >
                  <option value="">Select</option>
                  {products.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.product && <span style={{ color: '#D32F2F', fontSize: '10px', display: 'block', marginTop: '2px' }}>{errors.product}</span>}
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

            <button
              onClick={handleSubmit}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#FFFFFF',
                backgroundColor: '#6B2E0F',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5A260D'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6B2E0F'}
            >
              Record Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesEntry;