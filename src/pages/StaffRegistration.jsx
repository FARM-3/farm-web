import React, { useState, useEffect } from 'react';
import { Menu, X, Home, DollarSign, ShoppingCart, Package, Users, CheckCircle, UserPlus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// API endpoint for staff registration
const STAFF_API_ENDPOINT = 'http://142.93.94.236:8000/api/staff/';

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

function StaffRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    nin: '',
    district: '',
    subcounty: '',
    parish: '',
    village: '',
    employment_status: '',
    hire_date: '',
  });

  // Check if we're editing an existing staff member
  useEffect(() => {
    const editStaff = location.state?.editStaff;
    console.log('Edit staff data:', editStaff);
    if (editStaff) {
      setIsEditing(true);
      setEditId(editStaff.id);
      setForm({
        first_name: editStaff.first_name || '',
        last_name: editStaff.last_name || '',
        gender: editStaff.gender || '',
        nin: editStaff.nin || '',
        district: editStaff.district || '',
        subcounty: editStaff.sub_county || '',
        parish: editStaff.parish || '',
        village: editStaff.village || '',
        employment_status: editStaff.employment_status || '',
        hire_date: editStaff.date_hired || '',
      });
    }
  }, [location.state]);

  // Validation logic remains unchanged as requested
  const validateField = (name, value) => {
    switch(name) {
      case 'first_name':
      case 'last_name':
        return value.trim().length >= 2 ? '' : 'Must be at least 2 characters';
      case 'nin':
        // Allowing standard NIN format validation (letters/numbers 9-14 chars)
        return /^[A-Z0-9]{9,14}$/i.test(value) ? '' : 'Invalid NIN format (9-14 alphanumeric characters)';
      case 'hire_date':
        if (!value) return 'Date is required';
        const selected = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selected <= today ? '' : 'Cannot select future date';
      case 'gender':
      case 'district':
      case 'subcounty':
      case 'parish':
      case 'employment_status':
        return value ? '' : 'Please select an option';
      case 'village':
        return value.trim().length >= 2 ? '' : 'Must be at least 2 characters';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setMessage(''); // Clear any previous messages

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    setTouched(Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return Object.keys(form).every(key => {
      const error = validateField(key, form[key]);
      return !error;
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setMessage('');

    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        gender: form.gender,
        nin: form.nin.toUpperCase(),
        district: form.district,
        sub_county: form.subcounty,
        parish: form.parish,
        village: form.village,
        employment_status: form.employment_status,
        date_hired: form.hire_date,
      };

      console.log('Sending payload:', payload);

      const url = isEditing
        ? `${STAFF_API_ENDPOINT}${editId}/`
        : STAFF_API_ENDPOINT;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage(isEditing ? 'Staff member updated successfully!' : 'Staff member registered successfully!');
        setShowSuccess(true);

        // Clear form after success
        setForm({
          first_name: '',
          last_name: '',
          gender: '',
          nin: '',
          district: '',
          subcounty: '',
          parish: '',
          village: '',
          employment_status: '',
          hire_date: '',
        });
        setTouched({});
        setErrors({});
        setIsEditing(false);
        setEditId(null);

        // Navigate to staff management page after a short delay
        setTimeout(() => {
          navigate('/staff-management');
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        setMessage(`Failed to ${isEditing ? 'update' : 'register'} staff: ${response.status} - ${JSON.stringify(errorData)}`);
      }
    } catch (err) {
      console.error('Network error:', err);
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const navItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'Wages', icon: DollarSign, href: '/wages' },
    { name: 'Sales', icon: ShoppingCart, href: '/sales' },
    { name: 'Expenses', icon: Package, href: '/expenses' },
    { name: 'Staff', icon: Users, href: '/staff' },
  ];

  const getInputStyle = (fieldName) => {
    const hasError = touched[fieldName] && errors[fieldName];
    const isSuccess = touched[fieldName] && !errors[fieldName] && form[fieldName];
    
    return {
      backgroundColor: CoffeeColors.WHITE,
      borderColor: isSuccess ? CoffeeColors.SUCCESS_GREEN : hasError ? CoffeeColors.ERROR_RED : CoffeeColors.LIGHT_BROWN,
      borderWidth: '2px',
    };
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: CoffeeColors.SCREEN_BG }}>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Collapsible on Mobile, Fixed on Desktop) */}
      <div
        // REMOVED md:translate-x-0 to allow collapsing on desktop
        className={`fixed top-0 left-0 h-full w-64 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-50 shadow-2xl`}
        style={{ backgroundColor: CoffeeColors.DARK_BROWN }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: CoffeeColors.MEDIUM_BROWN }}>
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="Rugyeyo Farm Logo"
              className="w-10 h-10 rounded-full object-cover border-2"
              style={{ borderColor: CoffeeColors.WHITE }}
            />
            <h2 className="text-xl font-bold" style={{ color: CoffeeColors.WHITE }}>
              Rugyeyo Farm
            </h2>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="md:hidden hover:opacity-75 transition-opacity p-1 rounded-lg"
            style={{ color: CoffeeColors.WHITE }}
          >
            <X size={24} />
          </button>
        </div>
        <nav className="mt-6 flex flex-col space-y-2 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:translate-x-1"
                style={{ 
                  color: CoffeeColors.WHITE,
                  backgroundColor: item.name === 'Staff' ? CoffeeColors.MEDIUM_BROWN : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (item.name !== 'Staff') {
                    e.currentTarget.style.backgroundColor = CoffeeColors.MEDIUM_BROWN;
                  }
                }}
                onMouseLeave={(e) => {
                  if (item.name !== 'Staff') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area - Dynamic margin added for desktop collapsing */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        {/* Fixed Header - Dynamic left position added */}
        <div className={`fixed top-0 right-0 left-0 z-30 p-4 shadow-md transition-all duration-300 ${sidebarOpen ? 'md:left-64' : 'md:left-0'}`} style={{ backgroundColor: CoffeeColors.LIGHT_BG }}>
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button (opens sidebar) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg shadow-sm"
              style={{ backgroundColor: CoffeeColors.WHITE }}
            >
              <Menu size={24} style={{ color: CoffeeColors.DARK_BROWN }} />
            </button>
            
            {/* Desktop Toggle Button (toggles sidebar) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:block p-2 rounded-lg shadow-sm"
              style={{ backgroundColor: CoffeeColors.WHITE }}
            >
              {sidebarOpen ? (
                <X size={24} style={{ color: CoffeeColors.DARK_BROWN }} />
              ) : (
                <Menu size={24} style={{ color: CoffeeColors.DARK_BROWN }} />
              )}
            </button>
            
            <h1 className="text-lg font-bold md:text-xl" style={{ color: CoffeeColors.DARK_BROWN }}>
              Staff Registration
            </h1>
            {/* Spacer for alignment on mobile */}
            <div className="w-10 md:w-0"></div>
          </div>
        </div>

        {/* Success Message Modal */}
        {showSuccess && (
          <div 
            className="fixed top-20 left-4 right-4 md:left-72 md:right-8 z-40 p-4 rounded-lg shadow-lg flex items-center gap-3 transition-opacity duration-300 ease-out"
            style={{ backgroundColor: CoffeeColors.SUCCESS_GREEN, color: CoffeeColors.WHITE }}
          >
            <CheckCircle size={24} />
            <span className="font-semibold">Staff member registered successfully!</span>
          </div>
        )}

        {/* FORM CONTAINER (Same size as WageEntry form) */}
        <div className="min-h-screen pt-24 md:pt-32 pb-12 flex justify-center">
          <div className="w-full max-w-3xl mt-12 shadow-2xl rounded-2xl"
               style={{ backgroundColor: '#F5EEDC' }}>

            {/* Styled Header */}
            <div
              className="flex justify-between items-center p-5 rounded-t-2xl"
              style={{
                backgroundColor: '#8B5A3C'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">
                  {isEditing ? 'Edit Staff Member' : 'Staff Registration Form'}
                </h1>
              </div>
              <button
                onClick={() => navigate('/staff')}
                className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 sm:p-8" style={{ border: `1px solid #B8A072`, borderTop: 'none', borderRadius: '0 0 1rem 1rem' }}>

            <div className="space-y-6">
              {/* Employee Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-3 text-base font-semibold" style={{ color: CoffeeColors.DARK_BROWN }}>
                    First Name <span style={{ color: CoffeeColors.ERROR_RED }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="John"
                    autoComplete="given-name"
                    className="w-full p-4 rounded-xl focus:outline-none transition-colors text-lg"
                    style={getInputStyle('first_name')}
                  />
                  {touched.first_name && errors.first_name && (
                    <p className="text-sm mt-2" style={{ color: CoffeeColors.ERROR_RED }}>
                      {errors.first_name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-3 text-base font-semibold" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Last Name <span style={{ color: CoffeeColors.ERROR_RED }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Doe"
                    autoComplete="family-name"
                    className="w-full p-4 rounded-xl focus:outline-none transition-colors text-lg"
                    style={getInputStyle('last_name')}
                  />
                  {touched.last_name && errors.last_name && (
                    <p className="text-sm mt-2" style={{ color: CoffeeColors.ERROR_RED }}>
                      {errors.last_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Gender & NIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-3 text-base font-semibold" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Gender <span style={{ color: CoffeeColors.ERROR_RED }}>*</span>
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full p-4 rounded-lg focus:outline-none transition-colors text-lg"
                    style={getInputStyle('gender')}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {touched.gender && errors.gender && (
                    <p className="text-sm mt-2" style={{ color: CoffeeColors.ERROR_RED }}>
                      {errors.gender}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-3 text-base font-semibold" style={{ color: CoffeeColors.DARK_BROWN }}>
                    NIN <span style={{ color: CoffeeColors.ERROR_RED }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="nin"
                    value={form.nin}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="CM12345678"
                    maxLength="14"
                    className="w-full p-4 rounded-lg focus:outline-none transition-colors text-lg"
                    style={getInputStyle('nin')}
                  />
                  {touched.nin && errors.nin && (
                    <p className="text-sm mt-2" style={{ color: CoffeeColors.ERROR_RED }}>
                      {errors.nin}
                    </p>
                  )}
                </div>
              </div>

              {/* District & Subcounty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-3 text-base font-semibold" style={{ color: CoffeeColors.DARK_BROWN }}>
                    District <span style={{ color: CoffeeColors.ERROR_RED }}>*</span>
                  </label>
                  <select
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full p-4 rounded-lg focus:outline-none transition-colors text-lg"
                    style={getInputStyle('district')}
                  >
                    <option value="">Select</option>
                    <option value="Kampala">Kampala</option>
                    <option value="Wakiso">Wakiso</option>
                    <option value="Mukono">Mukono</option>
                    <option value="Mpigi">Mpigi</option>
                  </select>
                  {touched.district && errors.district && (
                    <p className="text-sm mt-2" style={{ color: CoffeeColors.ERROR_RED }}>
                      {errors.district}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-3 text-base font-semibold" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Subcounty <span style={{ color: CoffeeColors.ERROR_RED }}>*</span>
                  </label>
                  <select
                    name="subcounty"
                    value={form.subcounty}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full p-4 rounded-lg focus:outline-none transition-colors text-lg"
                    style={getInputStyle('subcounty')}
                  >
                    <option value="">Select</option>
                    <option value="Nakawa">Nakawa</option>
                    <option value="Kawempe">Kawempe</option>
                    <option value="Makindye">Makindye</option>
                  </select>
                  {touched.subcounty && errors.subcounty && (
                    <p className="text-sm mt-2" style={{ color: CoffeeColors.ERROR_RED }}>
                      {errors.subcounty}
                    </p>
                  )}
                </div>
              </div>

              {/* Parish & Village */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-3 text-base font-semibold" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Parish <span style={{ color: CoffeeColors.ERROR_RED }}>*</span>
                  </label>
                  <select
                    name="parish"
                    value={form.parish}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full p-4 rounded-lg focus:outline-none transition-colors text-lg"
                    style={getInputStyle('parish')}
                  >
                    <option value="">Select</option>
                    <option value="Bugolobi">Bugolobi</option>
                    <option value="Mbuya">Mbuya</option>
                    <option value="Naguru">Naguru</option>
                  </select>
                  {touched.parish && errors.parish && (
                    <p className="text-sm mt-2" style={{ color: CoffeeColors.ERROR_RED }}>
                      {errors.parish}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-3 text-base font-semibold" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Village <span style={{ color: CoffeeColors.ERROR_RED }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={form.village}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Kisaasi"
                    className="w-full p-4 rounded-lg focus:outline-none transition-all text-lg"
                    style={getInputStyle('village')}
                  />
                  {touched.village && errors.village && (
                    <p className="text-sm mt-2" style={{ color: CoffeeColors.ERROR_RED }}>
                      {errors.village}
                    </p>
                  )}
                </div>
              </div>

              {/* Employment Status & Hire Date (Combined into one row for better flow) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-3 text-base font-semibold" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Employment Status <span style={{ color: CoffeeColors.ERROR_RED }}>*</span>
                  </label>
                  <select
                    name="employment_status"
                    value={form.employment_status}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full p-4 rounded-lg focus:outline-none transition-colors text-lg"
                    style={getInputStyle('employment_status')}
                  >
                    <option value="">Select</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Seasonal">Seasonal</option>
                  </select>
                  {touched.employment_status && errors.employment_status && (
                    <p className="text-sm mt-2" style={{ color: CoffeeColors.ERROR_RED }}>
                      {errors.employment_status}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-3 text-base font-semibold" style={{ color: CoffeeColors.DARK_BROWN }}>
                    Hire Date <span style={{ color: CoffeeColors.ERROR_RED }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="hire_date"
                    value={form.hire_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    max={getTodayDate()}
                    className="w-full p-4 rounded-lg focus:outline-none transition-colors text-lg"
                    style={getInputStyle('hire_date')}
                  />
                  {touched.hire_date && errors.hire_date && (
                    <p className="text-sm mt-2" style={{ color: CoffeeColors.ERROR_RED }}>
                      {errors.hire_date}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="sm:col-span-2 mt-2">
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
                  disabled={!isFormValid() || loading}
                  className="w-full py-3 font-semibold"
                  style={{
                    backgroundColor: '#8B4513',
                    color: '#FFFFFF',
                    opacity: (!isFormValid() || loading) ? 0.7 : 1,
                    cursor: (!isFormValid() || loading) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? (isEditing ? 'Updating...' : 'Registering...') : (isEditing ? 'Update Staff' : 'Register Staff')}
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffRegistration;

