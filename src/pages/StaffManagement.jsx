// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//     Home, DollarSign, ShoppingBag, Users, Settings, LogOut, Menu, X, Bell, UserCircle,
//     RefreshCw, Calendar, ArrowUp, ArrowDown, Edit, Trash2, Search, Plus, ChevronsDown, Loader2, MapPin
// } from 'lucide-react';
// import { SideNav } from '../components/SideNav';

// // --- Global Styles & Constants ---
// const CoffeeColors = {
//     SCREEN_BG: '#FFF8F6',
//     ACTIVE_LINK_BG: '#efebe9',
//     ACTIVE_LINK_TEXT: '#783A1E',
//     DARK_BROWN: '#4A3423',
//     MEDIUM_BROWN: '#795548',
//     BUTTON_BROWN: '#795548',
//     GRAY_TEXT: '#8D8D8D',
//     SUCCESS_GREEN: '#34A853',
//     ERROR_RED: '#EA4335',
// };

// const STAFF_API_ENDPOINT = 'https://api-3181.onrender.com/api/staff/';

// const LOCATION_DATA = {
//     Wakiso: {
//         subcounties: {
//             Kakiri: ['Kibuga Parish', 'Kagoma Parish'],
//             Kira: ['Kyaliwajjala Parish', 'Bweyogerere Parish'],
//         }
//     },
//     Mpigi: {
//         subcounties: {
//             MpigiTC: ['Central Parish', 'East Parish'],
//             Ggombe: ['North Parish', 'South Parish'],
//         }
//     },
//     Mbarara: {
//         subcounties: {
//             Kakoba: ['Parish A', 'Parish B'],
//             Nyamitanga: ['Parish C', 'Parish D'],
//         }
//     }
// };

// const StaffEntryModal = ({ isOpen, onClose, staffData, onSave }) => {
//     const [formData, setFormData] = useState(staffData || {
//         first_name: '',
//         last_name: '',
//         gender: '',
//         nin: '',
//         district: '',
//         subcounty: '',
//         parish: '',
//         village: '',
//         employment_status: '',
//         hire_date: new Date().toISOString().slice(0, 10),
//     });
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [successMsg, setSuccessMsg] = useState('');
//     const [validation, setValidation] = useState({
//         first_name: null,
//         last_name: null,
//         gender: null,
//         nin: null,
//         district: null,
//         subcounty: null,
//         parish: null,
//         village: null,
//         employment_status: null,
//         hire_date: null,
//     });

//     const isEditMode = !!staffData;

//     useEffect(() => {
//         if (isOpen) {
//             setFormData(staffData || {
//                 first_name: '',
//                 last_name: '',
//                 gender: '',
//                 nin: '',
//                 district: '',
//                 subcounty: '',
//                 parish: '',
//                 village: '',
//                 employment_status: '',
//                 hire_date: new Date().toISOString().slice(0, 10),
//             });
//             setValidation({
//                 first_name: null, last_name: null, gender: null, nin: null,
//                 district: null, subcounty: null, parish: null, village: null, employment_status: null, hire_date: null
//             });
//             setSuccessMsg('');
//         }
//     }, [isOpen, staffData]);

//     const nameRegex = /^[A-Za-z\s'-]{3,}$/;
//     // require at least 3 characters for NIN (adjust to your validation rules)
//     const ninRegex = /^.{3,}$/;

//     const validateField = (name, value) => {
//         switch (name) {
//             case 'first_name':
//             case 'last_name':
//                 return nameRegex.test(value || '');
//             case 'gender':
//                 return ['Male', 'Female', 'Other'].includes(value);
//             case 'nin':
//                 return ninRegex.test(value || '');
//             case 'district':
//             case 'subcounty':
//             case 'parish':
//                 // simple required check for location fields
//                 return !!value;
//             case 'village':
//                 return String(value || '').trim().length >= 2;
//             case 'employment_status':
//                 return ['Full-time', 'Part-time', 'Contract', 'Seasonal', 'Active', 'On Leave', 'Suspended', 'Terminated'].includes(value);
//             case 'date_hired':
//                 return !!value;
//             default:
//                 return true;
//         }
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => {
//             const next = { ...prev, [name]: value };
//             if (name === 'district') {
//                 next.subcounty = '';
//                 next.parish = '';
//             }
//             if (name === 'subcounty') {
//                 next.parish = '';
//             }
//             return next;
//         });

//         setValidation(prev => ({ ...prev, [name]: validateField(name, value) }));
//     };

//     const getInputClass = (field, withIcon = false, isSelect = false) => {
//         const base = "w-full rounded-lg outline-none bg-white ";
//         const padding = withIcon ? 'pl-12 pr-10 py-3' : 'p-3';
//         const valid = validation[field] === true;
//         const invalid = validation[field] === false;
//         const border = valid ? 'border border-green-500 focus:ring-1 focus:ring-green-300'
//             : invalid ? 'border border-red-500 focus:ring-1 focus:ring-red-200'
//                 : 'border border-gray-300 focus:ring-1 focus:ring-[#795548]';
//         const appearance = isSelect ? 'appearance-none' : '';
//         return `${base} ${padding} ${border} ${appearance} disabled:opacity-60 disabled:cursor-not-allowed`;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const fieldsToCheck = ['first_name', 'last_name', 'gender', 'nin', 'district', 'subcounty', 'parish', 'village', 'employment_status', 'hire_date'];
//         const newValidation = {};
//         let allValid = true;
//         for (const f of fieldsToCheck) {
//             const ok = validateField(f, formData[f]);
//             newValidation[f] = ok;
//             if (!ok) allValid = false;
//         }
//         setValidation(prev => ({ ...prev, ...newValidation }));

//         if (!allValid) {
//             alert('Please fill in all required fields correctly.');
//             return;
//         }

//         setIsSubmitting(true);

//         const resultData = {
//             ...formData,
//             id: staffData?.id || Date.now() + Math.random(),
//             staff_id: staffData?.staff_id || `RF${Math.floor(Math.random() * 900) + 100}`
//         };

//         await new Promise(resolve => setTimeout(resolve, 800));
//         onSave(resultData);
//         setIsSubmitting(false);
//         setSuccessMsg('Employee record saved successfully.');
//         setTimeout(() => {
//             setSuccessMsg('');
//             onClose();
//         }, 1400);
//     };

//     if (!isOpen) return null;

//     const districtOptions = Object.keys(LOCATION_DATA);
//     const subcountyOptions = formData.district ? Object.keys(LOCATION_DATA[formData.district].subcounties) : [];
//     const parishOptions = (formData.district && formData.subcounty)
//         ? (LOCATION_DATA[formData.district].subcounties[formData.subcounty] || [])
//         : [];

//     return (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start md:items-center justify-center z-50 p-4 overflow-y-auto">
//             <div
//                 className="bg-white rounded-xl shadow-2xl w-full max-w-xl md:max-w-2xl transform transition-all duration-300"
//                 style={{ maxHeight: '90vh', overflowY: 'auto' }}
//             >
//                 <div className="flex items-center justify-between px-6 py-4 border-b">
//                     <h3 className="text-xl md:text-2xl font-semibold" style={{ color: CoffeeColors.DARK_BROWN }}>
//                         {isEditMode ? 'Edit Employee' : 'Employee Information'}
//                     </h3>
//                     <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
//                         <X className="w-5 h-5 text-gray-600" />
//                     </button>
//                 </div>

//                 <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
//                     {successMsg && (
//                         <div className="px-4 py-2 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
//                             {successMsg}
//                         </div>
//                     )}

//                     <section className="bg-gray-50 border border-gray-100 rounded-lg p-4">
//                         <div className="flex items-center mb-3">
//                             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border mr-3">
//                                 <UserCircle className="w-5 h-5 text-gray-500" />
//                             </div>
//                             <h4 className="text-sm font-semibold text-gray-800">Employee information</h4>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
//                                 <input
//                                     name="first_name"
//                                     value={formData.first_name}
//                                     onChange={handleChange}
//                                     required
//                                     className={getInputClass('first_name')}
//                                 />
//                                 {validation.first_name === false && <p className="mt-1 text-xs text-red-600">First name must be at least 3 letters and contain no numbers.</p>}
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
//                                 <input
//                                     name="last_name"
//                                     value={formData.last_name}
//                                     onChange={handleChange}
//                                     required
//                                     className={getInputClass('last_name')}
//                                 />
//                                 {validation.last_name === false && <p className="mt-1 text-xs text-red-600">Last name must be at least 3 letters and contain no numbers.</p>}
//                             </div>

//                             <div className="relative">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
//                                 <div className="relative">
//                                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
//                                         <UserCircle className="w-4 h-4" />
//                                     </div>
//                                     <select
//                                         name="gender"
//                                         value={formData.gender}
//                                         onChange={handleChange}
//                                         required
//                                         className={getInputClass('gender', true, true)}
//                                     >
//                                         <option value="" disabled>-- Select Gender --</option>
//                                         <option value="Male">Male</option>
//                                         <option value="Female">Female</option>
                                    
//                                     </select>
//                                     <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
//                                         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                             <polyline points="6 9 12 15 18 9"></polyline>
//                                         </svg>
//                                     </div>
//                                 </div>
//                                 {validation.gender === false && <p className="mt-1 text-xs text-red-600">Please select a gender.</p>}
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">National ID (NIN)</label>
//                                 <input
//                                     name="nin"
//                                     value={formData.nin}
//                                     onChange={handleChange}
//                                     required
//                                     className={getInputClass('nin')}
//                                 />
//                                 {validation.nin === false && <p className="mt-1 text-xs text-red-600">NIN is required.</p>}
//                             </div>
//                         </div>
//                     </section>

//                     <section className="bg-gray-50 border border-gray-100 rounded-lg p-4">
//                         <div className="flex items-center mb-3">
//                             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border mr-3">
//                                 <MapPin className="w-5 h-5 text-gray-500" />
//                             </div>
//                             <h4 className="text-sm font-semibold text-gray-800">Address information</h4>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div className="relative min-w-0">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
//                                 <div className="relative">
//                                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
//                                         <MapPin className="w-4 h-4" />
//                                     </div>
//                                     <select
//                                         name="district"
//                                         value={formData.district}
//                                         onChange={handleChange}
//                                         required
//                                         className={getInputClass('district', true, true)}
//                                     >
//                                         <option value="">-- Select District --</option>
//                                         {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
//                                     </select>
//                                     <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
//                                         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                             <polyline points="6 9 12 15 18 9"></polyline>
//                                         </svg>
//                                     </div>
//                                 </div>
//                                 {validation.district === false && <p className="mt-1 text-xs text-red-600">Please choose a district.</p>}
//                             </div>

//                             <div className="relative min-w-0">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Subcounty *</label>
//                                 <div className="relative">
//                                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
//                                         <MapPin className="w-4 h-4" />
//                                     </div>
//                                     <select
//                                         name="subcounty"
//                                         value={formData.subcounty}
//                                         onChange={handleChange}
//                                         required
//                                         className={getInputClass('subcounty', true, true)}
//                                         disabled={!subcountyOptions.length}
//                                     >
//                                         <option value="" disabled>-- Select Subcounty --</option>
//                                         {subcountyOptions.map(s => <option key={s} value={s}>{s}</option>)}
//                                     </select>
//                                     <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
//                                         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                             <polyline points="6 9 12 15 18 9"></polyline>
//                                         </svg>
//                                     </div>
//                                 </div>
//                                 {validation.subcounty === false && <p className="mt-1 text-xs text-red-600">Please choose a subcounty.</p>}
//                             </div>

//                             <div className="relative min-w-0">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Parish *</label>
//                                 <div className="relative">
//                                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
//                                         <MapPin className="w-4 h-4" />
//                                     </div>
//                                     <select
//                                         name="parish"
//                                         value={formData.parish}
//                                         onChange={handleChange}
//                                         required
//                                         className={getInputClass('parish', true, true)}
//                                         disabled={!parishOptions.length}
//                                     >
//                                         <option value="" disabled>-- Select Parish --</option>
//                                         {parishOptions.map(p => <option key={p} value={p}>{p}</option>)}
                                        
//                                     </select>
//                                     <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
//                                         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                             <polyline points="6 9 12 15 18 9"></polyline>
//                                         </svg>
//                                     </div>
//                                 </div>
//                                 {validation.parish === false && <p className="mt-1 text-xs text-red-600">Please choose a parish.</p>}

//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Village *</label>
//                                 <div className="relative">
//                                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
//                                         <MapPin className="w-4 h-4" />
//                                     </div>
//                                     <input
//                                         name="village"
//                                         value={formData.village}
//                                         onChange={handleChange}
//                                         placeholder="e.g., Kisaasi"
//                                         required
//                                         className="w-full pl-10 p-3 border rounded-lg outline-none focus:ring-1 focus:ring-[#795548] bg-white"
//                                         style={{
//                                             borderColor: validation.village === true ? '#10B981' : validation.village === false ? '#EF4444' : '#D1D5DB'
//                                         }}
//                                     />
//                                 </div>
//                                 {validation.village === false && <p className="mt-1 text-xs text-red-600">Village must be at least 2 characters.</p>}
//                             </div>
//                         </div>
//                     </section>

//                     <section className="bg-gray-50 border border-gray-100 rounded-lg p-4">
//                         <div className="flex items-center mb-3">
//                             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border mr-3">
//                                 <Calendar className="w-4 h-4 text-gray-500" />
//                             </div>
//                             <h4 className="text-sm font-semibold text-gray-800">Employee details</h4>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div className="relative">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Employment status</label>
//                                 <div className="relative">
//                                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
//                                         <UserCircle className="w-4 h-4" />
//                                     </div>
//                                     <select
//                                         name="employment_status"
//                                         value={formData.employment_status}
//                                         onChange={handleChange}
//                                         required
//                                         className={getInputClass('employment_status', true, true)}
//                                     >
//                                         <option value="" disabled>-- Select status --</option>
//                                         <option value="Full-time">Full-time</option>
//                                         <option value="Part-time">Part-time</option>
//                                         <option value="Contract">Contract</option>
//                                         <option value="Seasonal">Seasonal</option>
//                                     </select>
//                                     <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
//                                         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                             <polyline points="6 9 12 15 18 9"></polyline>
//                                         </svg>
//                                     </div>
//                                 </div>
//                                 {validation.employment_status === false && <p className="mt-1 text-xs text-red-600">Please select employment status.</p>}
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Hire date</label>
//                                 <input
//                                     name="date_hired"
//                                     type="date"
//                                     value={formData.date_hired}
//                                     onChange={handleChange}
//                                     required
//                                     className={getInputClass('date_hired')}
//                                 />
//                                 {validation.hire_date === false && <p className="mt-1 text-xs text-red-600">Please provide hire date.</p>}
//                             </div>
//                         </div>
//                     </section>

//                     <div className="flex items-center justify-end space-x-3 pt-2 border-t pt-4">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//                             disabled={isSubmitting}
//                         >
//                             Cancel
//                         </button>

//                         <button
//                             type="submit"
//                             disabled={isSubmitting}
//                             className="px-4 py-2 rounded-lg flex items-center text-white disabled:opacity-60"
//                             style={{ backgroundColor: CoffeeColors.BUTTON_BROWN }}
//                         >
//                             {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isEditMode ? 'Updating...' : 'Saving...'}</> : (isEditMode ? 'Save Changes' : 'Record Employee')}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// const TABLE_HEADERS = [
//     { key: 'staff_id', label: 'Staff Id', type: 'string' },
//     { key: 'first_name', label: 'First Name', type: 'string' },
//     { key: 'last_name', label: 'Last Name', type: 'string' },
//     { key: 'gender', label: 'Gender', type: 'string' },
//     { key: 'nin', label: 'NIN', type: 'string' },
//     { key: 'district', label: 'District', type: 'string' },
//     { key: 'hire-date', label: 'Hire Date', type: 'date' },
// ];

// function StaffPage() {
//     const [staff, setStaff] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filterGender, setFilterGender] = useState('');
//     const navigate = useNavigate();

//     const [sortConfig, setSortConfig] = useState({ key: 'staff_id', direction: 'ascending' });
//     const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
//     const [staffToEdit, setStaffToEdit] = useState(null);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [staffToDelete, setStaffToDelete] = useState(null);
//     const [deleting, setDeleting] = useState(false);

//     const MOCK_STAFF_DATA = [
//         { id: 1, staff_id: 'RF001', first_name: 'Billy', last_name: 'Banks', gender: 'Male', nin: 'CM004GDT777G88', district: 'Wakiso', date_hired: '2023-06-15' },
//         { id: 2, staff_id: 'RF002', first_name: 'Ivan', last_name: 'Koreta', gender: 'Male', nin: 'CM00566674632A', district: 'Wakiso', date_hired: '2024-11-20' },
//         { id: 3, staff_id: 'RF003', first_name: 'Jackson', last_name: 'Ssemengo', gender: 'Male', nin: 'CM004673H7645F', district: 'Wakiso', date_hired: '2024-05-07' },
//         { id: 4, staff_id: 'RF004', first_name: 'Justine', last_name: 'Natasha', gender: 'Female', nin: 'CF003674F7894A', district: 'Wakiso', date_hired: '2024-10-16' },
//         { id: 5, staff_id: 'RF005', first_name: 'Agnes', last_name: 'Nalubega', gender: 'Female', nin: 'CF003675N876B', district: 'Mpigi', date_hired: '2023-03-22' },
//         { id: 6, staff_id: 'RF006', first_name: 'Peter', last_name: 'Mwesigye', gender: 'Male', nin: 'CM004678P1234C', district: 'Mbarara', date_hired: '2024-01-10' },
//     ];

//     const fetchStaff = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const response = await fetch(STAFF_API_ENDPOINT);
//             if (!response.ok) throw new Error(`HTTP ${response.status}`);
//             const data = await response.json();
//             const normalized = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
//             setStaff(normalized);
//         } catch (err) {
//             setError('Could not load data from API. Displaying mock data.');
//             setStaff(MOCK_STAFF_DATA);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => { fetchStaff(); }, [fetchStaff]);

//     const filteredStaff = useMemo(() => {
//         let current = staff;
//         if (searchTerm) {
//             const s = searchTerm.toLowerCase();
//             current = current.filter(su =>
//                 su.first_name?.toLowerCase().includes(s) ||
//                 su.last_name?.toLowerCase().includes(s) ||
//                 su.staff_id?.toLowerCase().includes(s)
//             );
//         }
//         if (filterGender) {
//             current = current.filter(su => su.gender?.toLowerCase() === filterGender.toLowerCase());
//         }
//         return current;
//     }, [staff, searchTerm, filterGender]);

//     const sortedStaff = useMemo(() => {
//         const base = Array.isArray(filteredStaff) ? filteredStaff : [];
//         const items = [...base];
//         if (sortConfig.key) {
//             items.sort((a, b) => {
//                 const aVal = a[sortConfig.key];
//                 const bVal = b[sortConfig.key];
//                 const headerType = TABLE_HEADERS.find(h => h.key === sortConfig.key)?.type;
//                 if (headerType === 'date') {
//                     return sortConfig.direction === 'ascending' ? new Date(aVal) - new Date(bVal) : new Date(bVal) - new Date(aVal);
//                 }
//                 if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
//                 if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
//                 return 0;
//             });
//         }
//         return items;
//     }, [filteredStaff, sortConfig]);

//     const requestSort = (key) => {
//         let direction = 'ascending';
//         if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
//         setSortConfig({ key, direction });
//     };

//     const getSortIcon = (key) => {
//         if (sortConfig.key !== key) return null;
//         return sortConfig.direction === 'ascending' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
//     };

//     const handleNewStaff = () => {
//         setStaffToEdit(null);
//         setIsStaffModalOpen(true);
//     };

//     const handleEditStaff = (staffMember) => {
//         setStaffToEdit(staffMember);
//         setIsStaffModalOpen(true);
//     };

//     const handleSaveStaff = (savedStaffData) => {
//         if (!savedStaffData) return;
//         if (staffToEdit) {
//             setStaff(prev => prev.map(s => s.id === savedStaffData.id ? savedStaffData : s));
//         } else {
//             setStaff(prev => [savedStaffData, ...prev]);
//         }
//     };

//     const handleDeleteStaff = async () => {
//         if (!staffToDelete) return;
//         setDeleting(true);
//         try {
//             await new Promise(resolve => setTimeout(resolve, 500));
//             setStaff(prev => prev.filter(s => s.id !== staffToDelete.id));
//             setShowDeleteModal(false);
//             setStaffToDelete(null);
//         } catch (err) {
//             setError('Failed to delete staff member.');
//         } finally {
//             setDeleting(false);
//         }
//     };

//     const renderTableContent = () => {
//         if (loading) {
//             return (
//                 <tr className='h-24'>
//                     <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-gray-600">
//                         <Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-accent-btn" />
//                         Loading staff records...
//                     </td>
//                 </tr>
//             );
//         }

//         if (error && staff.length === 0) {
//             return (
//                 <tr className='h-24'>
//                     <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-red-600 font-medium">
//                         {error}
//                     </td>
//                 </tr>
//             );
//         }

//         if (sortedStaff.length === 0) {
//             return (
//                 <tr className='h-24'>
//                     <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-gray-500 italic">
//                         No staff records found matching your criteria.
//                     </td>
//                 </tr>
//             );
//         }

//         return sortedStaff.map((staffMember, index) => (
//             <tr key={staffMember.id || index} className="border-b transition-colors duration-150 hover:bg-gray-50">
//                 <td className="px-6 py-3 text-left font-medium text-gray-800">{staffMember.staff_id || 'N/A'}</td>
//                 <td className="px-6 py-3 text-left text-gray-600">{staffMember.first_name || 'N/A'}</td>
//                 <td className="px-6 py-3 text-left text-gray-600">{staffMember.last_name || 'N/A'}</td>
//                 <td className="px-6 py-3 text-left text-gray-600">{staffMember.gender || '-'}</td>
//                 <td className="px-6 py-3 text-left text-gray-600">{staffMember.nin || '-'}</td>
//                 <td className="px-6 py-3 text-left text-gray-600">{staffMember.district || '-'}</td>
//                 <td className="px-6 py-3 text-right text-gray-600">{staffMember.date_hired || 'N/A'}</td>
//                 <td className="px-6 py-3 text-center">
//                     <div className="flex items-center justify-center space-x-2">
//                         <button onClick={() => handleEditStaff(staffMember)} className="text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-gray-100 transition-colors" title="Edit Staff Member">
//                             <Edit className="w-4 h-4" />
//                         </button>
//                         <button onClick={() => { setStaffToDelete(staffMember); setShowDeleteModal(true); }} className="text-error hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors" title="Delete Staff Member">
//                             <Trash2 className="w-4 h-4" />
//                         </button>
//                     </div>
//                 </td>
//             </tr>
//         ));
//     };

//     return (
//         <SideNav>
//             <main className="p-4 sm:p-6 md:p-8 pt-0">
//                 <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
//                     <h1 className="text-2xl md:text-3xl font-extrabold text-text-default mb-4 md:mb-0">Staff Details</h1>
//                     <div className="flex space-x-3 mt-4 md:mt-0">
//                         <button onClick={handleNewStaff} className="py-2 px-4 shadow-xl rounded-xl" style={{ backgroundColor: CoffeeColors.BUTTON_BROWN, color: '#FFFFFF', border: 'none' }}>
//                             <Plus className="w-5 h-5 mr-2 inline-block" /> Record New Staff
//                         </button>
//                         <button onClick={() => alert('Exporting to Excel is not yet implemented.')} className="py-2 px-4 shadow-xl rounded-xl" style={{ backgroundColor: CoffeeColors.ACTIVE_LINK_BG, color: CoffeeColors.ACTIVE_LINK_TEXT, border: 'none' }}>
//                             Export to Excel
//                         </button>
//                     </div>
//                 </div>

//                 <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-stretch sm:items-center p-4 rounded-lg bg-white shadow-md">
//                     <div className="relative flex-1 max-w-sm">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                         <input type="text" placeholder="Search by staff name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none" />
//                     </div>

//                     <div className="relative w-full sm:w-48">
//                         <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className="appearance-none w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg bg-white outline-none">
//                             <option value="">Filter by Gender</option>
//                             <option value="Male">Male</option>
//                             <option value="Female">Female</option>
//                         </select>
//                         <ChevronsDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
//                     </div>

//                     <button onClick={() => fetchStaff()} disabled={loading} className="py-2 px-4 shadow-xl rounded-xl flex items-center justify-center disabled:opacity-50" style={{ backgroundColor: CoffeeColors.ACTIVE_LINK_BG, color: CoffeeColors.ACTIVE_LINK_TEXT, border: 'none' }}>
//                         <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
//                     </button>
//                 </div>

//                 <div className="mt-8">
//                     <div className="w-full bg-white shadow-xl rounded-2xl overflow-x-auto">
//                         <table className="min-w-full divide-y divide-gray-200">
//                             <thead className="sticky top-0 z-10" style={{ backgroundColor: CoffeeColors.ACTIVE_LINK_BG, color: CoffeeColors.DARK_BROWN }}>
//                                 <tr>
//                                     {TABLE_HEADERS.map((header) => (
//                                         <th key={header.key} className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-accent-btn/90 transition-colors duration-150" onClick={() => requestSort(header.key)} scope="col">
//                                             <div className={`flex items-center ${header.type === 'number' ? 'justify-end' : 'justify-start'}`}>
//                                                 {header.label}
//                                                 {getSortIcon(header.key)}
//                                             </div>
//                                         </th>
//                                     ))}
//                                     <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-center">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-100">
//                                 {renderTableContent()}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </main>

//             <StaffEntryModal isOpen={isStaffModalOpen} onClose={() => { setIsStaffModalOpen(false); setStaffToEdit(null); }} staffData={staffToEdit} onSave={handleSaveStaff} />

//             {showDeleteModal && staffToDelete && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full mx-4">
//                         <h3 className="text-xl font-bold mb-4 text-text-default">Confirm Deletion</h3>
//                         <p className="text-gray-600 mb-6">Are you sure you want to delete staff member: <strong>{staffToDelete.first_name} {staffToDelete.last_name}</strong>? This action cannot be undone.</p>
//                         <div className="flex justify-end space-x-3">
//                             <button onClick={() => { setShowDeleteModal(false); setStaffToDelete(null); }} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100" disabled={deleting}>Cancel</button>
//                             <button onClick={handleDeleteStaff} disabled={deleting} className="px-4 py-2 text-white rounded-lg flex items-center" style={{ backgroundColor: '#D32F2F' }}>
//                                 {deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</> : 'Delete Permanently'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </SideNav>
//     );
// }

// export default StaffPage;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home, DollarSign, ShoppingBag, Users, Settings, LogOut, Menu, X, Bell, UserCircle,
    RefreshCw, Calendar, ArrowUp, ArrowDown, Edit, Trash2, Search, Plus, ChevronsDown, Loader2, User, MapPin, MapPin
} from 'lucide-react';
import { SideNav } from '../components/SideNav';

// --- Global Styles & Constants ---
const CoffeeColors = {
    SCREEN_BG: '#FFF8F6',
    ACTIVE_LINK_BG: '#efebe9',
    ACTIVE_LINK_TEXT: '#783A1E',
    DARK_BROWN: '#4A3423',
    MEDIUM_BROWN: '#795548',
    BUTTON_BROWN: '#795548',
    GRAY_TEXT: '#8D8D8D',
    SUCCESS_GREEN: '#34A853',
    ERROR_RED: '#EA4335',
};

const STAFF_API_ENDPOINT = 'https://api-3181.onrender.com/api/staff/';

const LOCATION_DATA = {
    Wakiso: {
        subcounties: {
            Kakiri: ['Kibuga Parish', 'Kagoma Parish'],
            Kira: ['Kyaliwajjala Parish', 'Bweyogerere Parish'],
        }
    },
    Mpigi: {
        subcounties: {
            MpigiTC: ['Central Parish', 'East Parish'],
            Ggombe: ['North Parish', 'South Parish'],
        }
    },
    Mbarara: {
        subcounties: {
            Kakoba: ['Parish A', 'Parish B'],
            Nyamitanga: ['Parish C', 'Parish D'],
        }
    }
};

const StaffEntryModal = ({ isOpen, onClose, staffData, onSave }) => {
    const today = new Date().toISOString().slice(0, 10);

    const normalizeStaff = (s) => {
        if (!s) return {
            first_name: '',
            last_name: '',
            gender: '',
            nin: '',
            district: '',
            subcounty: '',
            parish: '',
            village: '',
            employment_status: '',
            hire_date: today,
        };
        return {
            first_name: s.first_name || '',
            last_name: s.last_name || '',
            gender: s.gender || '',
            nin: s.nin || '',
            district: s.district || '',
            subcounty: s.subcounty || '',
            parish: s.parish || '',
            village: s.village || '',
            employment_status: s.employment_status || '',
            // support both keys coming from different sources
            hire_date: s.hire_date || s.date_hired || today,
        };
    };

    const [formData, setFormData] = useState(normalizeStaff(staffData));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [validation, setValidation] = useState({
        first_name: null,
        last_name: null,
        gender: null,
        nin: null,
        district: null,
        subcounty: null,
        parish: null,
        village: null,
        employment_status: null,
        hire_date: null,
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(normalizeStaff(staffData));
            setValidation({
                first_name: null, last_name: null, gender: null, nin: null,
                district: null, subcounty: null, parish: null, village: null, employment_status: null, hire_date: null
            });
            setSuccessMsg('');
        }
    }, [isOpen, staffData]);

    const validateField = (name, value) => {
        const v = String(value || '').trim();
        switch (name) {
            case 'first_name':
            case 'last_name':
                return v.length >= 2;
            case 'gender':
                return ['Male', 'Female', 'Other'].includes(value);
            case 'nin':
                return v.length > 0;
            case 'district':
            case 'subcounty':
            case 'parish':
                return v.length > 0;
            case 'village':
                return v.length >= 2;
            case 'employment_status':
                return ['Full-time', 'Part-time', 'Contract', 'Seasonal', 'Active', 'On Leave', 'Suspended', 'Terminated'].includes(value);
            case 'hire_date':
                return v.length > 0;
            default:
                return true;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'district') {
                next.subcounty = '';
                next.parish = '';
            }
            if (name === 'subcounty') {
                next.parish = '';
            }
            return next;
        });
        setValidation(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    const getInputClass = (field, withIcon = false, isSelect = false) => {
        const base = "w-full rounded-lg outline-none bg-white ";
        const padding = withIcon ? 'pl-12 pr-10 py-3' : 'p-3';
        const valid = validation[field] === true;
        const invalid = validation[field] === false;
        const border = valid ? 'border border-green-500 focus:ring-1 focus:ring-green-300'
            : invalid ? 'border border-red-500 focus:ring-1 focus:ring-red-200'
                : 'border border-gray-300 focus:ring-1 focus:ring-[#795548]';
        const appearance = isSelect ? 'appearance-none' : '';
        return `${base} ${padding} ${border} ${appearance} disabled:opacity-60 disabled:cursor-not-allowed`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fieldsToCheck = ['first_name', 'last_name', 'gender', 'nin', 'district', 'subcounty', 'parish', 'village', 'employment_status', 'hire_date'];
        const newValidation = {};
        let allValid = true;
        for (const f of fieldsToCheck) {
            const ok = validateField(f, formData[f]);
            newValidation[f] = ok;
            if (!ok) allValid = false;
        }
        setValidation(prev => ({ ...prev, ...newValidation }));

        if (!allValid) {
            // keep UI-driven messages; still give a lightweight hint
            alert('Please fix highlighted fields before submitting.');
            return;
        }

        setIsSubmitting(true);

        const resultData = {
            ...formData,
            // preserve original id/staff_id when editing (if provided)
            id: staffData?.id || Date.now() + Math.random(),
            staff_id: staffData?.staff_id || `RF${Math.floor(Math.random() * 900) + 100}`
        };

        await new Promise(resolve => setTimeout(resolve, 600));
        onSave(resultData);
        setIsSubmitting(false);
        setSuccessMsg('Employee record saved successfully.');
        setTimeout(() => {
            setSuccessMsg('');
            onClose();
        }, 1200);
    };

    if (!isOpen) return null;

    const districtOptions = Object.keys(LOCATION_DATA);
    const subcountyOptions = formData.district ? Object.keys(LOCATION_DATA[formData.district].subcounties) : [];
    const parishOptions = (formData.district && formData.subcounty)
        ? (LOCATION_DATA[formData.district].subcounties[formData.subcounty] || [])
        : [];

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start md:items-center justify-center z-50 p-4 overflow-y-auto">
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-xl md:max-w-2xl transform transition-all duration-300"
                style={{ maxHeight: '90vh', overflowY: 'auto' }}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h3 className="text-xl md:text-2xl font-semibold" style={{ color: CoffeeColors.DARK_BROWN }}>
                        {staffData ? 'Edit Employee' : 'Employee Information'}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5"> */}
                    <form noValidate onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                    {successMsg && (
                        <div className="px-4 py-2 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
                            {successMsg}
                        </div>
                    )}

                    <section className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border mr-3">
                                <UserCircle className="w-5 h-5 text-gray-500" />
                            </div>
                            <h4 className="text-sm font-semibold text-gray-800">Employee information</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                                <input
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                    className={getInputClass('first_name')}
                                />
                                {validation.first_name === false && <p className="mt-1 text-xs text-red-600">This field is required — must be at least 2 characters.</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                                <input
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                    className={getInputClass('last_name')}
                                />
                                {validation.last_name === false && <p className="mt-1 text-xs text-red-600">This field is required — must be at least 2 characters.</p>}
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <UserCircle className="w-4 h-4" />
                                    </div>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        required
                                        className={getInputClass('gender', true, true)}
                                    >
                                        <option value="" disabled>-- Select Gender --</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                </div>
                                {validation.gender === false && <p className="mt-1 text-xs text-red-600">This field is required.</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">National ID (NIN)</label>
                                <input
                                    name="nin"
                                    value={formData.nin}
                                    onChange={handleChange}
                                    required
                                    className={getInputClass('nin')}
                                />
                                {validation.nin === false && <p className="mt-1 text-xs text-red-600">This field is required.</p>}
                            </div>
                        </div>
                    </section>

                    <section className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border mr-3">
                                <MapPin className="w-5 h-5 text-gray-500" />
                            </div>
                            <h4 className="text-sm font-semibold text-gray-800">Address information</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative min-w-0">
                                <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <select
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        required
                                        className={getInputClass('district', true, true)}
                                    >
                                        <option value="">-- Select District --</option>
                                        {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                </div>
                                {validation.district === false && <p className="mt-1 text-xs text-red-600">This field is required.</p>}
                            </div>

                            <div className="relative min-w-0">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subcounty *</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <select
                                        name="subcounty"
                                        value={formData.subcounty}
                                        onChange={handleChange}
                                        required
                                        className={getInputClass('subcounty', true, true)}
                                        disabled={!subcountyOptions.length}
                                    >
                                        <option value="" disabled>-- Select Subcounty --</option>
                                        {subcountyOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                </div>
                                {validation.subcounty === false && <p className="mt-1 text-xs text-red-600">This field is required.</p>}
                            </div>

                            <div className="relative min-w-0">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Parish *</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <select
                                        name="parish"
                                        value={formData.parish}
                                        onChange={handleChange}
                                        required
                                        className={getInputClass('parish', true, true)}
                                        disabled={!parishOptions.length}
                                    >
                                        <option value="" disabled>-- Select Parish --</option>
                                        {parishOptions.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                </div>
                                {validation.parish === false && <p className="mt-1 text-xs text-red-600">This field is required.</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Village *</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <input
                                        name="village"
                                        value={formData.village}
                                        onChange={handleChange}
                                        placeholder="e.g., Kisaasi"
                                        required
                                        className="w-full pl-10 p-3 border rounded-lg outline-none focus:ring-1 focus:ring-[#795548] bg-white"
                                        style={{
                                            borderColor: validation.village === true ? '#10B981' : validation.village === false ? '#EF4444' : '#D1D5DB'
                                        }}
                                    />
                                </div>
                                {validation.village === false && <p className="mt-1 text-xs text-red-600">This field is required — must be at least 2 characters.</p>}
                            </div>
                        </div>
                    </section>

                    <section className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border mr-3">
                                <Calendar className="w-4 h-4 text-gray-500" />
                            </div>
                            <h4 className="text-sm font-semibold text-gray-800">Employee details</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employment status</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <UserCircle className="w-4 h-4" />
                                    </div>
                                    <select
                                        name="employment_status"
                                        value={formData.employment_status}
                                        onChange={handleChange}
                                        required
                                        className={getInputClass('employment_status', true, true)}
                                    >
                                        <option value="" disabled>-- Select status --</option>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Seasonal">Seasonal</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                </div>
                                {validation.employment_status === false && <p className="mt-1 text-xs text-red-600">This field is required.</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hire date</label>
                                <input
                                    name="hire_date"
                                    type="date"
                                    value={formData.hire_date}
                                    onChange={handleChange}
                                    required
                                    className={getInputClass('hire_date')}
                                />
                                {validation.hire_date === false && <p className="mt-1 text-xs text-red-600">This field is required.</p>}
                            </div>
                        </div>
                    </section>

                    <div className="flex items-center justify-end space-x-3 pt-2 border-t pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-lg flex items-center text-white disabled:opacity-60"
                            style={{ backgroundColor: CoffeeColors.BUTTON_BROWN }}
                        >
                            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{staffData ? 'Updating...' : 'Saving...'}</> : (staffData ? 'Save Changes' : 'Record Employee')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TABLE_HEADERS = [
    { key: 'staff_id', label: 'Staff Id', type: 'string' },
    { key: 'first_name', label: 'First Name', type: 'string' },
    { key: 'last_name', label: 'Last Name', type: 'string' },
    { key: 'gender', label: 'Gender', type: 'string' },
    { key: 'nin', label: 'NIN', type: 'string' },
    { key: 'district', label: 'District', type: 'string' },
    { key: 'hire-date', label: 'Hire Date', type: 'date' },
];

function StaffPage() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const navigate = useNavigate();

    const [sortConfig, setSortConfig] = useState({ key: 'staff_id', direction: 'ascending' });
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [staffToEdit, setStaffToEdit] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const MOCK_STAFF_DATA = [
        { id: 1, staff_id: 'RF001', first_name: 'Billy', last_name: 'Banks', gender: 'Male', nin: 'CM004GDT777G88', district: 'Wakiso', date_hired: '2023-06-15' },
        { id: 2, staff_id: 'RF002', first_name: 'Ivan', last_name: 'Koreta', gender: 'Male', nin: 'CM00566674632A', district: 'Wakiso', date_hired: '2024-11-20' },
        { id: 3, staff_id: 'RF003', first_name: 'Jackson', last_name: 'Ssemengo', gender: 'Male', nin: 'CM004673H7645F', district: 'Wakiso', date_hired: '2024-05-07' },
        { id: 4, staff_id: 'RF004', first_name: 'Justine', last_name: 'Natasha', gender: 'Female', nin: 'CF003674F7894A', district: 'Wakiso', date_hired: '2024-10-16' },
        { id: 5, staff_id: 'RF005', first_name: 'Agnes', last_name: 'Nalubega', gender: 'Female', nin: 'CF003675N876B', district: 'Mpigi', date_hired: '2023-03-22' },
        { id: 6, staff_id: 'RF006', first_name: 'Peter', last_name: 'Mwesigye', gender: 'Male', nin: 'CM004678P1234C', district: 'Mbarara', date_hired: '2024-01-10' },
    ];

    const fetchStaff = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(STAFF_API_ENDPOINT);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const normalized = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
            setStaff(normalized);
        } catch (err) {
            setError('Could not load data from API. Displaying mock data.');
            setStaff(MOCK_STAFF_DATA);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStaff(); }, [fetchStaff]);

    const filteredStaff = useMemo(() => {
        let current = staff;
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            current = current.filter(su =>
                su.first_name?.toLowerCase().includes(s) ||
                su.last_name?.toLowerCase().includes(s) ||
                su.staff_id?.toLowerCase().includes(s)
            );
        }
        if (filterGender) {
            current = current.filter(su => su.gender?.toLowerCase() === filterGender.toLowerCase());
        }
        return current;
    }, [staff, searchTerm, filterGender]);

    const sortedStaff = useMemo(() => {
        const base = Array.isArray(filteredStaff) ? filteredStaff : [];
        const items = [...base];
        if (sortConfig.key) {
            items.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                const headerType = TABLE_HEADERS.find(h => h.key === sortConfig.key)?.type;
                if (headerType === 'date') {
                    const aDate = new Date(a.hire_date || a.date_hired || a[sortConfig.key] || 0);
                    const bDate = new Date(b.hire_date || b.date_hired || b[sortConfig.key] || 0);
                    return sortConfig.direction === 'ascending' ? aDate - bDate : bDate - aDate;
                }
                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [filteredStaff, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
    };

    const handleNewStaff = () => {
        setStaffToEdit(null);
        setIsStaffModalOpen(true);
    };

    const handleEditStaff = (staffMember) => {
        // convert to modal shape when opening
        setStaffToEdit({
            ...staffMember,
            hire_date: staffMember.hire_date || staffMember.date_hired || ''
        });
        setIsStaffModalOpen(true);
    };

    const handleSaveStaff = (savedStaffData) => {
        if (!savedStaffData) return;
        // keep list consistent: store hire_date; existing mock uses date_hired but we support both when rendering
        if (staffToEdit) {
            setStaff(prev => prev.map(s => s.id === savedStaffData.id ? { ...savedStaffData } : s));
        } else {
            setStaff(prev => [savedStaffData, ...prev]);
        }
    };

    const handleDeleteStaff = async () => {
        if (!staffToDelete) return;
        setDeleting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setStaff(prev => prev.filter(s => s.id !== staffToDelete.id));
            setShowDeleteModal(false);
            setStaffToDelete(null);
        } catch (err) {
            setError('Failed to delete staff member.');
        } finally {
            setDeleting(false);
        }
    };

    const renderTableContent = () => {
        if (loading) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-gray-600">
                        <Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-accent-btn" />
                        Loading staff records...
                    </td>
                </tr>
            );
        }

        if (error && staff.length === 0) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-red-600 font-medium">
                        {error}
                    </td>
                </tr>
            );
        }

        if (sortedStaff.length === 0) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-gray-500 italic">
                        No staff records found matching your criteria.
                    </td>
                </tr>
            );
        }

        return sortedStaff.map((staffMember, index) => (
            <tr key={staffMember.id || index} className="border-b transition-colors duration-150 hover:bg-gray-50">
                <td className="px-6 py-3 text-left font-medium text-gray-800">{staffMember.staff_id || 'N/A'}</td>
                <td className="px-6 py-3 text-left text-gray-600">{staffMember.first_name || 'N/A'}</td>
                <td className="px-6 py-3 text-left text-gray-600">{staffMember.last_name || 'N/A'}</td>
                <td className="px-6 py-3 text-left text-gray-600">{staffMember.gender || '-'}</td>
                <td className="px-6 py-3 text-left text-gray-600">{staffMember.nin || '-'}</td>
                <td className="px-6 py-3 text-left text-gray-600">{staffMember.district || '-'}</td>
                <td className="px-6 py-3 text-right text-gray-600">{staffMember.hire_date || staffMember.date_hired || 'N/A'}</td>
                <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleEditStaff(staffMember)} className="text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-gray-100 transition-colors" title="Edit Staff Member">
                            <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setStaffToDelete(staffMember); setShowDeleteModal(true); }} className="text-error hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors" title="Delete Staff Member">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </tr>
        ));
    };

    return (
        <SideNav>
            <main className="p-4 sm:p-6 md:p-8 pt-0">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-text-default mb-4 md:mb-0">Staff Details</h1>
                    <div className="flex space-x-3 mt-4 md:mt-0">
                        <button onClick={handleNewStaff} className="py-2 px-4 shadow-xl rounded-xl" style={{ backgroundColor: CoffeeColors.BUTTON_BROWN, color: '#FFFFFF', border: 'none' }}>
                            <Plus className="w-5 h-5 mr-2 inline-block" /> Record New Staff
                        </button>
                        <button onClick={() => alert('Exporting to Excel is not yet implemented.')} className="py-2 px-4 shadow-xl rounded-xl" style={{ backgroundColor: CoffeeColors.ACTIVE_LINK_BG, color: CoffeeColors.ACTIVE_LINK_TEXT, border: 'none' }}>
                            Export to Excel
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-stretch sm:items-center p-4 rounded-lg bg-white shadow-md">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search by staff name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none" />
                    </div>

                    <div className="relative w-full sm:w-48">
                        <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className="appearance-none w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg bg-white outline-none">
                            <option value="">Filter by Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        <ChevronsDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>

                    <button onClick={() => fetchStaff()} disabled={loading} className="py-2 px-4 shadow-xl rounded-xl flex items-center justify-center disabled:opacity-50" style={{ backgroundColor: CoffeeColors.ACTIVE_LINK_BG, color: CoffeeColors.ACTIVE_LINK_TEXT, border: 'none' }}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
                    </button>
                </div>

                <div className="mt-8">
                    <div className="w-full bg-white shadow-xl rounded-2xl overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="sticky top-0 z-10" style={{ backgroundColor: CoffeeColors.ACTIVE_LINK_BG, color: CoffeeColors.DARK_BROWN }}>
                                <tr>
                                    {TABLE_HEADERS.map((header) => (
                                        <th key={header.key} className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-accent-btn/90 transition-colors duration-150" onClick={() => requestSort(header.key)} scope="col">
                                            <div className={`flex items-center ${header.type === 'number' ? 'justify-end' : 'justify-start'}`}>
                                                {header.label}
                                                {getSortIcon(header.key)}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {renderTableContent()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <StaffEntryModal isOpen={isStaffModalOpen} onClose={() => { setIsStaffModalOpen(false); setStaffToEdit(null); }} staffData={staffToEdit} onSave={handleSaveStaff} />

            {showDeleteModal && staffToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4 text-text-default">Confirm Deletion</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete staff member: <strong>{staffToDelete.first_name} {staffToDelete.last_name}</strong>? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => { setShowDeleteModal(false); setStaffToDelete(null); }} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100" disabled={deleting}>Cancel</button>
                            <button onClick={handleDeleteStaff} disabled={deleting} className="px-4 py-2 text-white rounded-lg flex items-center" style={{ backgroundColor: '#D32F2F' }}>
                                {deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</> : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SideNav>
    );
}

export default StaffPage;


