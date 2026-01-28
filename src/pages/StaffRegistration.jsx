import React, { useState, useEffect } from 'react';
import { Menu, X, Home, DollarSign, ShoppingCart, Package, Users, CheckCircle, UserPlus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// API endpoint for staff registration - Uses .env configuration
const STAFF_API_ENDPOINT = `${import.meta.env.VITE_API_URL}/api/staff/`;

// Comprehensive location data - Districts with Sub-Counties
const LOCATION_DATA = {
  'Wakiso': ['Bussi Sub-County', 'Kakiri Sub-County', 'Kakiri Town Council', 'Kasanje Sub-County', 'Katabi Town Council', 'Masuliita Sub-County', 'Masulita Town Council', 'Mende Sub-County', 'Namayumba Sub-County', 'Namayumba Town Council', 'Kajjansi Town Council', 'Wakiso Sub-County', 'Wakiso Town Council', 'Wakiso — Division A', 'Wakiso — Division B', 'Bweyogerere Division', 'Kira Division', 'Namugongo Division', 'Kasangati Town Council', 'Bunamwaya Division', 'Masajja Division', 'Ndejje Division', 'Busukuma Division', 'Gombe Division', 'Nabweru Division', 'Nansana Division', 'Kyengera Town Council'],
  'Kampala': ['Kawempe Division', 'Makindye Division', 'Nakawa Division', 'Rubaga Division', 'Kampala Central Division', 'Lubaga Division'],
  'Mukono': ['Mukono Municipality', 'Mukono North Sub-County', 'Mukono South Sub-County', 'Seeta Sub-County', 'Ssi Sub-County', 'Goma Sub-County', 'Semyebenye Sub-County'],
  'Luwero': ['Luwero Municipality', 'Luwero Town Council', 'Luwero Sub-County', 'Wobulenzi Town Council', 'Wahraka Sub-County', 'Katikamu Sub-County', 'Kamira Sub-County', 'Madudu Sub-County'],
  'Mbale': ['Mbale Municipality', 'Mbale Town Council', 'Mbale Sub-County', 'Busano Sub-County', 'Namwezi Sub-County', 'Bufuka Sub-County'],
  'Masaka': ['Masaka Municipality', 'Masaka Town Council', 'Masaka East Sub-County', 'Masaka South Sub-County', 'Kiyindi Sub-County', 'Nyendo Sub-County', 'Kasome Sub-County']
};

// Parishes by sub-county
const PARISHES_BY_SUB_COUNTY = {
  'Bussi Sub-County': ['Balabala', 'Bussi', 'Gulwe', 'Tebankiza', 'Zzinga'],
  'Kakiri Sub-County': ['Kikandwa', 'Luwunga', 'Kamuli', 'Sentema', 'Lubbe', 'Buwanuka', 'Magoggo', 'Nampunge'],
  'Kakiri Town Council (parishes / wards)': ['Bukalango', 'Busujja', 'Kakiri', 'Kikubampanga', 'Lugeye', 'Nakyelongoosa'],
  'Kasanje Sub-County': ['Bulumbu', 'Jjungo', 'Kasanje', 'Mako', 'Sokolo', 'Ssazi', 'Zziba'],
  'Katabi Town Council': ['Kabale', 'Kisubi', 'Kitala', 'Nalugala', 'Nkumba'],
  'Masuliita Sub-County': ['Bbale Mukwenda', 'Kyengeza', 'Lwemwedde', 'Manze', 'Nakikungube', 'Tumbaali'],
  'Masulita Town Council': ['Kabale', 'Kanzize', 'Katikamu', 'Lugungudde', 'Masulita'],
  'Mende Sub-County': ['Bakka', 'Banda', 'Kaliiti', 'Mende', 'Namusera'],
  'Namayumba Sub-County': ['Bbembe', 'Bukondo', 'Kanziro', 'Kitayita', 'Kyasa', 'Nakedde'],
  'Namayumba Town Council': ['Kyampisi', 'Kyanuuna', 'Luguzi', 'Luttisi'],
  'Kajjansi Town Council': ['Bulwanyi', 'Bweya', 'Kitende', 'Nakawuka', 'Namulanda', 'Nankonge', 'Ngongolo', 'Nkungulutale', 'Nsaggu', 'Ssisa', 'Wamala'],
  'Wakiso Sub-County': ['Bukasa', 'Buloba', 'Kyebando', 'Lukwanga', 'Nakabugo', 'Ssumbwe'],
  'Wakiso Town Council': ['Gombe', 'Kasengejje', 'Kavumba', 'Kisimbiri', 'Mpunga', 'Naluvule', 'Namusera'],
  'Wakiso — Division A (Wakiso Town Division A)': ['Central', 'Katabi'],
  'Wakiso — Division B (Wakiso Town Division B)': ['Kigungu', 'Kiwafu'],
  'Bweyogerere Division': ['Bweyogerere'],
  'Kira Division': ['Kimwanyi', 'Kira'],
  'Namugongo Division': ['Kireka', 'Kyaliwajjala'],
  'Kasangati Town Council': ['Bulamu', 'Gayaza', 'Kabubbu', 'Katadde', 'Kiteezi', 'Masooli', 'Nangabo', 'Wampeewo', 'Wattuba'],
  'Bunamwaya Division': ['Bunamwaya', 'Mutundwe'],
  'Masajja Division': ['Busabala', 'Masajja', 'Namasuba'],
  'Ndejje Division': ['Mutungo', 'Ndejje', 'Seguku'],
  'Busukuma Division': ['Busukuma', 'Guluddene'],
  'Gombe Division': ['Buwambo', 'Gombe', 'Kavule', 'Kiryamuli', 'Matugga', 'Migadde', 'Mwereerwe', 'Nasse', 'Ssanga', 'Tikalu', 'Wambale'],
  'Nabweru Division': ['Kawanda', 'Maganjo', 'Nakyesanja', 'Wamala'],
  'Nansana Division': ['Ochieng', 'Kazo', 'Nabweru North', 'Nabweru South', 'Nansana East', 'Nansana West'],
  'Kyengera Town Council': ['Buddo', 'Kasenge', 'Katereke', 'Kikajjo', 'Kitemu-Kisozi', 'Kyengera Town Board', 'Maya', 'Nabbingo', 'Nanziga', 'Nsangi'],
  // Kampala divisions
  'Kawempe Division': ['Makerere', 'Wandegeya', 'Mulago', 'Nansana'],
  'Makindye Division': ['Kibuli', 'Makindye', 'Nsambya', 'Mengo'],
  'Nakawa Division': ['Bugolobi', 'Mbuya', 'Naguru', 'Naalya'],
  'Rubaga Division': ['Rubaga', 'Kabowa', 'Kabalagala', 'Nateete'],
  'Kampala Central Division': ['Central', 'Komamboga', 'Kisenyi'],
  'Lubaga Division': ['Lubaga', 'Kasubi', 'Mulago', 'Wampewo'],
  // Mukono sub-counties
  'Mukono Municipality': ['Mukono Central', 'Mukono East', 'Mukono West'],
  'Mukono North Sub-County': ['Buwenda', 'Lugazi', 'Namike'],
  'Mukono South Sub-County': ['Bukungu', 'Kiwoko', 'Njeru'],
  'Seeta Sub-County': ['Seeta East', 'Seeta West', 'Balawoli'],
  'Ssi Sub-County': ['Ssi Central', 'Ssi South'],
  'Goma Sub-County': ['Goma', 'Nakyesanja'],
  'Semyebenye Sub-County': ['Semyebenye', 'Kigula'],
  // Luwero sub-counties
  'Luwero Municipality': ['Luwero Town', 'Luwero Central'],
  'Luwero Town Council': ['Town East', 'Town West'],
  'Luwero Sub-County': ['Luwero Central', 'Luwero South'],
  'Wobulenzi Town Council': ['Wobulenzi Central', 'Wobulenzi West'],
  'Wahraka Sub-County': ['Wahraka Central', 'Wahraka South'],
  'Katikamu Sub-County': ['Katikamu Central', 'Katikamu North'],
  'Kamira Sub-County': ['Kamira East', 'Kamira West'],
  'Madudu Sub-County': ['Madudu Central', 'Madudu South'],
  // Mbale sub-counties
  'Mbale Municipality': ['Mbale Central', 'Mbale East'],
  'Mbale Town Council': ['Mbale Town'],
  'Mbale Sub-County': ['Mbale North', 'Mbale South'],
  'Busano Sub-County': ['Busano', 'Simu'],
  'Namwezi Sub-County': ['Namwezi', 'Buteza'],
  'Bufuka Sub-County': ['Bufuka', 'Mutoto'],
  // Masaka sub-counties
  'Masaka Municipality': ['Masaka Central', 'Masaka West'],
  'Masaka Town Council': ['Masaka Town'],
  'Masaka East Sub-County': ['Masaka East Central', 'Masaka East South'],
  'Masaka South Sub-County': ['Masaka South Central', 'Masaka South West'],
  'Kiyindi Sub-County': ['Kiyindi Central', 'Kiyindi North'],
  'Nyendo Sub-County': ['Nyendo Central', 'Nyendo East'],
  'Kasome Sub-County': ['Kasome Central', 'Kasome East']
};

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

    // Fix: Reset dependent fields when district changes
    if (name === 'district') {
      setForm(prev => ({
        ...prev,
        [name]: value,
        subcounty: '', // Reset subcounty when district changes
        parish: '' // Reset parish when subcounty changes
      }));
    }
    // Fix: Reset parish when subcounty changes
    else if (name === 'subcounty') {
      setForm(prev => ({
        ...prev,
        [name]: value,
        parish: '' // Reset parish when subcounty changes
      }));
    }
    else {
      setForm(prev => ({ ...prev, [name]: value }));
    }

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
              src="/logo.png"
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
                      placeholder="CM12345678901234"
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
                    <option value="">Select District</option>
                    {Object.keys(LOCATION_DATA).map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
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
                    disabled={!form.district}
                    className="w-full p-4 rounded-lg focus:outline-none transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={getInputStyle('subcounty')}
                  >
                    <option value="">Select Sub-County</option>
                    {form.district && LOCATION_DATA[form.district]?.map((subcounty) => (
                      <option key={subcounty} value={subcounty}>{subcounty}</option>
                    ))}
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
                    disabled={!form.subcounty}
                    className="w-full p-4 rounded-lg focus:outline-none transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={getInputStyle('parish')}
                  >
                    <option value="">Select Parish</option>
                    {form.subcounty && PARISHES_BY_SUB_COUNTY[form.subcounty]?.map((parish) => (
                      <option key={parish} value={parish}>{parish}</option>
                    ))}
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

