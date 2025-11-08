// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//    X, RefreshCw, Calendar, ArrowUp, ArrowDown, Edit, Trash2, Search, Plus, ChevronsDown, Loader2, UserCircle, MapPin, Users, UserCheck, UserX, TrendingUp, Send
// } from 'lucide-react';
// import { SideNav } from '../components/SideNav';

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

// const STAFF_API_ENDPOINT = 'http://142.93.94.236:8000/api/staff/';

// const LOCATION_DATA = {
//     Wakiso: {
//         subcounties: {
//             "Kakiri": ["Kakiri Central", "Kakiri East", "Kakiri West"],
//             "Kira": ["Kira Central", "Kira Division A", "Kira Division B"]
//         }
//     },
//     Mpigi: {
//         subcounties: {
//             "MpigiTC": ["Mpigi Central", "Mpigi East", "Mpigi West"],
//             "Ggombe": ["Ggombe Central", "Ggombe North", "Ggombe South"]
//         }
//     },
//     Mbarara: {
//         subcounties: {
//             "Kakoba": ["Kakoba Division", "Kakoba East", "Kakoba West"],
//             "Nyamitanga": ["Nyamitanga Central", "Nyamitanga North", "Nyamitanga South"]
//         }
//     }
// };

// const StaffEntryModal = ({ isOpen, onClose, staffData, onSave }) => {
//     const today = new Date().toISOString().slice(0, 10);

//     // Helper function to format number with commas
//     const formatNumberWithCommas = (value) => {
//         if (!value && value !== 0) return '';
//         // Remove any existing commas and format
//         const num = value.toString().replace(/,/g, '');
//         return Number(num).toLocaleString('en-US');
//     };

//     const normalizeStaff = (s) => {
//         if (!s) return {
//             first_name: '',
//             last_name: '',
//             gender: '',
//             nin: '',
//             district: '',
//             subcounty: '',
//             parish: '',
//             village: '',
//             employment_status: '',
//             hire_date: today,
//             salary: '',
//         };
//         return {
//             first_name: s.first_name || '',
//             last_name: s.last_name || '',
//             gender: s.gender || '',
//             nin: s.nin || '',
//             district: s.district || '',
//             subcounty: s.subcounty || '',
//             parish: s.parish || '',
//             village: s.village || '',
//             employment_status: s.employment_status || '',
//             hire_date: s.hire_date || s.date_hired || today,
//             salary: s.salary ? formatNumberWithCommas(s.salary) : '',
//         };
//     };

//     const [formData, setFormData] = useState(normalizeStaff(staffData));
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
//         salary: null,
//     });
    

//     useEffect(() => {
//         if (isOpen) {
//             setFormData(normalizeStaff(staffData));
//             setValidation({
//                 first_name: null, last_name: null, gender: null, nin: null,
//                 district: null, subcounty: null, parish: null, village: null, employment_status: null, hire_date: null, salary: null
//             });
//             setSuccessMsg('');
//         }
//     }, [isOpen, staffData]);

//     const validateField = (name, value) => {
//         const v = String(value || '').trim();
//         switch (name) {
//             case 'first_name':
//             case 'last_name':
//                 return v.length >= 2;
//             case 'gender':
//                 return ['Male', 'Female'].includes(value);
//             case 'nin':
//                 // Must start with CM or CF (uppercase) and be exactly 14 alphanumeric characters
//                 return v.length === 14 && /^(CM|CF)[A-Za-z0-9]{12}$/.test(v);
//             case 'district':
//             case 'subcounty':
//             case 'parish':
//                 return v.length > 0;
//             case 'village':
//                 return v.length >= 2;
//             case 'salary':
//                 // Monthly Salary - Remove commas for validation
//                 const rawSalary = v.replace(/,/g, '');
//                 if (rawSalary === '') return false;
//                 const salaryNum = parseFloat(rawSalary);
//                 return !isNaN(salaryNum) && salaryNum >= 0;
//             case 'employment_status':
//                 return ['Full-time', 'Part-time', 'Contract', 'Seasonal', ].includes(value);
//             case 'hire_date':
//                 if (!v.length) return false;
//                 // Check if date is in the future
//                 const selectedDate = new Date(v);
//                 const currentDate = new Date();
//                 currentDate.setHours(0, 0, 0, 0); // Reset time to compare dates only
//                 return selectedDate <= currentDate;
//             default:
//                 return true;
//         }
//     };


//     const handleChange = (e) => {
//         const { name, value } = e.target;
        
//         setFormData(prev => {
//             const next = { ...prev };
            
//             if (name === 'salary') {
//                 // For salary field, format with commas as user types
//                 let formattedValue = value;
                
//                 // Only format if it's a valid number input
//                 if (value && /^[0-9,]*$/.test(value)) {
//                     // Remove all commas, then format with commas
//                     const rawValue = value.replace(/,/g, '');
//                     if (rawValue === '') {
//                         formattedValue = '';
//                     } else {
//                         formattedValue = Number(rawValue).toLocaleString('en-US');
//                     }
//                 }
                
//                 next[name] = formattedValue;
//             } else {
//                 next[name] = value;
//             }
            
//             // Handle location cascading updates
//             if (name === 'district') {
//                 next.subcounty = '';
//                 next.parish = '';
//             }
//             if (name === 'subcounty') {
//                 next.parish = '';
//             }
            
//             return next;
//         });
        
//         // For validation, use the raw value (without commas)
//         const rawValue = name === 'salary' ? value.replace(/,/g, '') : value;
//         setValidation(prev => ({ ...prev, [name]: validateField(name, rawValue) }));
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
//         const fieldsToCheck = ['first_name', 'last_name', 'gender', 'nin', 'district', 'subcounty', 'parish', 'village', 'employment_status', 'hire_date', 'salary'];
//         const newValidation = {};
//         let allValid = true;
//         for (const f of fieldsToCheck) {
//             // For salary, use raw value (without commas) for validation
//             const value = f === 'salary' ? formData[f].replace(/,/g, '') : formData[f];
//             const ok = validateField(f, value);
//             newValidation[f] = ok;
//             if (!ok) allValid = false;
//         }
//         setValidation(prev => ({ ...prev, ...newValidation }));
//         if (!allValid) {

//             return;
//         }

//         setIsSubmitting(true);

//         // Prepare data for saving - convert salary back to raw number
//         const resultData = {
//             ...formData,
//             // Convert formatted salary back to raw number for storage
//             salary: formData.salary ? parseFloat(formData.salary.replace(/,/g, '')) : '',
//             // preserve original id/staff_id when editing (if provided)
//             id: staffData?.id || Date.now() + Math.random(),
//             staff_id: staffData?.staff_id || `RF${Math.floor(Math.random() * 900) + 100}`
//         };

//         // Call the parent's onSave function and wait for it to complete
//         await onSave(resultData);
//         setIsSubmitting(false);

//         // Don't close the modal here - let the parent handle it after showing success message
//     };

//     if (!isOpen) return null;

//     // FIXED: Correct location data access
//     const districtOptions = Object.keys(LOCATION_DATA);
//     const subcountyOptions = formData.district ? Object.keys(LOCATION_DATA[formData.district].subcounties) : [];
//     const parishOptions = (formData.district && formData.subcounty)
//         ? (LOCATION_DATA[formData.district].subcounties[formData.subcounty] || [])
//         : [];

//     return (
//         <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
//             <div
//                 className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-auto flex flex-col overflow-hidden"
//                 style={{ maxHeight: '90vh', height: '80vh' }}
//             >
//                 <div className="flex items-center justify-between p-4 border-b border-gray-200" style={{ backgroundColor: '#FFFFFF' }}>
//                     <h2 className="text-xl font-semibold" style={{ color: CoffeeColors.DARK_BROWN }}>
//                         {staffData ? 'Edit Staff' : 'Staff Entry'}
//                     </h2>
//                     <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
//                         <X className="w-5 h-5 text-gray-500" />
//                     </button>
//                 </div>

//                 <form noValidate onSubmit={handleSubmit} className="flex-1 p-6 space-y-4 overflow-y-auto">
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
//                                 {validation.first_name === false && <p className="mt-1 text-xs text-red-600">This field is required — must be at least 2 characters.</p>}
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
//                                 {validation.last_name === false && <p className="mt-1 text-xs text-red-600">This field is required — must be at least 2 characters.</p>}
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
//                                 {validation.gender === false && <p className="mt-1 text-xs text-red-600">This field is required.</p>}
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">National ID (NIN)</label>
//                                 <input
//                                     name="nin"
//                                     value={formData.nin}
//                                     onChange={handleChange}
//                                     required
//                                     maxLength={14}
//                                     placeholder="14 alphanumeric characters"
//                                     className={getInputClass('nin')}
//                                 />
//                                 {validation.nin === false && <p className="mt-1 text-xs text-red-600">NIN must start with CM or CF and be exactly 14 alphanumeric characters.</p>}
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
//                                 {validation.district === false && <p className="mt-1 text-xs text-red-600">This field is required.</p>}
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
//                                         {subcountyOptions.map((subcounty, index) => (
//                                             <option key={index} value={subcounty}>{subcounty}</option>
//                                         ))}
//                                     </select>
//                                     <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
//                                         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                             <polyline points="6 9 12 15 18 9"></polyline>
//                                         </svg>
//                                     </div>
//                                 </div>
//                                 {validation.subcounty === false && <p className="mt-1 text-xs text-red-600">This field is required.</p>}
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
//                                         {parishOptions.map((parish, index) => (
//                                             <option key={index} value={parish}>{parish}</option>
//                                         ))}
//                                     </select>
//                                     <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
//                                         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                             <polyline points="6 9 12 15 18 9"></polyline>
//                                         </svg>
//                                     </div>
//                                 </div>
//                                 {validation.parish === false && <p className="mt-1 text-xs text-red-600">This field is required.</p>}
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
//                                 {validation.village === false && <p className="mt-1 text-xs text-red-600">This field is required — must be at least 2 characters.</p>}
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
//                                 {validation.employment_status === false && <p className="mt-1 text-xs text-red-600">This field is required.</p>}
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Hire date</label>
//                                 <input
//                                     name="hire_date"
//                                     type="date"
//                                     value={formData.hire_date}
//                                     onChange={handleChange}
//                                     required
//                                     className={getInputClass('hire_date')}
//                                 />
//                                 {validation.hire_date === false && (
//                                     <p className="mt-1 text-xs text-red-600">
//                                         {formData.hire_date && new Date(formData.hire_date) > new Date()
//                                             ? 'Invalid date — future dates are not accepted.'
//                                             : 'This field is required.'
//                                         }
//                                     </p>
//                                 )}
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary (UGX)</label>
//                                 <input
//                                     name="salary"
//                                     type="text" // Changed from "number" to "text" to allow commas
//                                     value={formData.salary}
//                                     onChange={handleChange}
//                                     placeholder="e.g., 500,000"
//                                     className={getInputClass('salary')}
//                                 />
//                                 {validation.salary === false && <p className="mt-1 text-xs text-red-600">Monthly Salary is required and must be a valid positive number.</p>}
//                             </div>
//                         </div>
//                     </section>

//                 </form>

//                 {/* Modal Footer */}
//                 <div className="flex justify-end p-4 border-t border-gray-200 space-x-3" style={{ backgroundColor: '#F8F8F8' }}>
//                     <button
//                         type="button"
//                         onClick={onClose}
//                         className="px-4 py-2 rounded-md"
//                         style={{ backgroundColor: '#E5E7EB', color: '#4B5563' }}
//                         disabled={isSubmitting}
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         type="submit"
//                         onClick={handleSubmit}
//                         disabled={isSubmitting}
//                         className="px-4 py-2 text-white rounded-md transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
//                         style={{ backgroundColor: '#9F4A2F' }}
//                     >
//                         {isSubmitting ? (
//                             <>
//                                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                                 {staffData ? 'Updating...' : 'Saving...'}
//                             </>
//                         ) : (
//                             <>
//                                 <Send className="w-4 h-4 mr-2" />
//                                 {staffData ? 'Save Changes' : 'Record Staff'}
//                             </>
//                         )}
//                     </button>
//                 </div>
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
//     { key: 'hire_date', label: 'Hire Date', type: 'date' },
//     { key: 'salary', label: 'Monthly Salary (UGX)', type: 'number' },
//     { key: 'actions', label: 'Actions', type: 'actions' },
// ];

// // INITIAL MOCK DATA - default staff records
// const INITIAL_STAFF_DATA = [
//     { id: 1, staff_id: 'RF001', first_name: 'Billy', last_name: 'Banks', gender: 'Male', nin: 'CM004GDT777G88', district: 'Wakiso', date_hired: '2023-06-15' },
//     { id: 2, staff_id: 'RF002', first_name: 'Ivan', last_name: 'Koreta', gender: 'Male', nin: 'CM00566674632A', district: 'Wakiso', date_hired: '2024-11-20' },
//     { id: 3, staff_id: 'RF003', first_name: 'Jackson', last_name: 'Ssemengo', gender: 'Male', nin: 'CM004673H7645F', district: 'Wakiso', date_hired: '2024-05-07' },
//     { id: 4, staff_id: 'RF004', first_name: 'Justine', last_name: 'Natasha', gender: 'Female', nin: 'CF003674F7894A', district: 'Wakiso', date_hired: '2024-10-16' },
//     { id: 5, staff_id: 'RF005', first_name: 'Agnes', last_name: 'Nalubega', gender: 'Female', nin: 'CF003675N876B', district: 'Mpigi', date_hired: '2023-03-22' },
//     { id: 6, staff_id: 'RF006', first_name: 'Peter', last_name: 'Mwesigye', gender: 'Male', nin: 'CM004678P1234C', district: 'Mbarara', date_hired: '2024-01-10' },
// ];

// // Helper functions for localStorage persistence
// const STORAGE_KEY = 'staff_management_data';

// const getStoredStaffData = () => {
//     try {
//         const stored = localStorage.getItem(STORAGE_KEY);
//         if (stored) {
//             return JSON.parse(stored);
//         }
//     } catch (error) {
//         console.error('Error reading from localStorage:', error);
//     }
//     return [...INITIAL_STAFF_DATA];
// };

// const saveStaffDataToStorage = (data) => {
//     try {
//         localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
//     } catch (error) {
//         console.error('Error saving to localStorage:', error);
//     }
// };

// // Initialize MOCK_STAFF_DATA from localStorage or use initial data
// let MOCK_STAFF_DATA = getStoredStaffData();

// function StaffPage() {
//     const [staff, setStaff] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filterGender, setFilterGender] = useState('');
//     const navigate = useNavigate();

//     const [sortConfig, setSortConfig] = useState({ key: 'date_hired', direction: 'descending' });
//     const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
//     const [staffToEdit, setStaffToEdit] = useState(null);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [staffToDelete, setStaffToDelete] = useState(null);
//     const [deleting, setDeleting] = useState(false);
//     const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
//                     const aDate = new Date(a.hire_date || a.date_hired || a[sortConfig.key] || 0);
//                     const bDate = new Date(b.hire_date || b.date_hired || b[sortConfig.key] || 0);
//                     return sortConfig.direction === 'ascending' ? aDate - bDate : bDate - aDate;
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
//         // convert to modal shape when opening
//         setStaffToEdit({
//             ...staffMember,
//             hire_date: staffMember.hire_date || staffMember.date_hired || ''
//         });
//         setIsStaffModalOpen(true);
//     };

//     const handleSaveStaff = async (savedStaffData) => {
//         console.log('handleSaveStaff called with:', savedStaffData);
//         if (!savedStaffData) return;

//         // Validate and prepare data for API
//         const apiData = {
//             first_name: savedStaffData.first_name?.trim() || '',
//             last_name: savedStaffData.last_name?.trim() || '',
//             nin: savedStaffData.nin?.trim().toUpperCase() || '', // Convert to uppercase for API
//             district: savedStaffData.district?.trim() || '',
//             sub_county: (savedStaffData.subcounty || savedStaffData.sub_county || '').trim(),
//             parish: savedStaffData.parish?.trim() || '',
//             village: savedStaffData.village?.trim() || '',
//             gender: savedStaffData.gender?.trim() || '',
//             date_hired: savedStaffData.hire_date || savedStaffData.date_hired || '',
//             employment_type: savedStaffData.employment_status || 'Full-time', // Use exact value from form
//             salary: savedStaffData.salary || 0, // Salary is already a number from the modal
//             is_active: true
//         };

//         // Validate required fields
//         const requiredFields = ['first_name', 'last_name', 'nin', 'district', 'sub_county', 'parish', 'village', 'gender', 'date_hired'];
//         const missingFields = requiredFields.filter(field => !apiData[field]);

//         if (missingFields.length > 0) {
//             console.error('Missing required fields:', missingFields);
//             alert(`Missing required fields:\n${missingFields.map(f => `• ${f.replace(/_/g, ' ')}`).join('\n')}`);
//             return;
//         }

//         // Validate NIN pattern (alphanumeric only, no symbols)
//         const ninPattern = /^(CM|CF)[A-Za-z0-9]{12}$/;
//         if (!ninPattern.test(savedStaffData.nin?.trim() || '')) {
//             console.error('Invalid NIN format:', savedStaffData.nin);
//             alert('Invalid NIN format\n\nNational ID must start with CM or CF and be exactly 14 alphanumeric characters.');
//             return;
//         }

//         console.log('Sending to API:', JSON.stringify(apiData, null, 2));

//         try {
//             if (staffToEdit) {
//                 // Update existing staff via PUT request
//                 console.log('Updating existing staff via API');
//                 const response = await fetch(`${STAFF_API_ENDPOINT}${staffToEdit.staff_id}/`, {
//                     method: 'PUT',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify(apiData)
//                 });

//                 console.log('API Response Status:', response.status);

//                 if (!response.ok) {
//                     const errorText = await response.text();
//                     console.error('API Error Response:', errorText);
//                     try {
//                         const errorJson = JSON.parse(errorText);
//                         console.error('API Error Details:', errorJson);
//                         const errorMsg = Object.entries(errorJson).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`).join('\n');
//                         alert(`Failed to update staff:\n\n${errorMsg}`);
//                     } catch (e) {
//                         alert(`Failed to update staff\n\nServer responded with status ${response.status}:\n${errorText.substring(0, 200)}`);
//                     }
//                     throw new Error(`API Error: ${response.status}`);
//                 }

//                 const updatedStaff = await response.json();
//                 console.log('Staff updated successfully:', updatedStaff);

//                 // Update local state - merge API response with our saved data to ensure salary is included
//                 const staffWithDateHired = {
//                     ...updatedStaff,
//                     date_hired: updatedStaff.date_hired,
//                     salary: savedStaffData.salary // Ensure salary is preserved from our form data
//                 };
//                 const index = MOCK_STAFF_DATA.findIndex(s => s.id === savedStaffData.id);
//                 if (index > -1) {
//                     MOCK_STAFF_DATA[index] = { ...staffWithDateHired };
//                 }
//                 setStaff(prev => prev.map(s => s.id === savedStaffData.id ? { ...staffWithDateHired } : s));

//                 // Save to localStorage as backup
//                 saveStaffDataToStorage(MOCK_STAFF_DATA);

//                 // Close modal first
//                 setIsStaffModalOpen(false);
//                 setStaffToEdit(null);

//                 // Then show success message
//                 setTimeout(() => {
//                     setShowSuccessMessage(true);
//                     setTimeout(() => {
//                         setShowSuccessMessage(false);
//                     }, 3000);
//                 }, 100);
//             } else {
//                 // Add new staff via POST request
//                 console.log('Creating new staff via API');
//                 const response = await fetch(STAFF_API_ENDPOINT, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify(apiData)
//                 });

//                 console.log('API Response Status:', response.status);

//                 if (!response.ok) {
//                     const errorText = await response.text();
//                     console.error('API Error Response:', errorText);
//                     try {
//                         const errorJson = JSON.parse(errorText);
//                         console.error('API Error Details:', errorJson);
//                         const errorMsg = Object.entries(errorJson).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`).join('\n');
//                         alert(`Failed to create staff:\n\n${errorMsg}`);
//                     } catch (e) {
//                         alert(`Failed to create staff\n\nServer responded with status ${response.status}:\n${errorText.substring(0, 200)}`);
//                     }
//                     throw new Error(`API Error: ${response.status}`);
//                 }

//                 const newStaff = await response.json();
//                 console.log('Staff created successfully:', newStaff);

//                 // Update local state with API-generated data, ensuring salary is included
//                 const newStaffWithSalary = {
//                     ...newStaff,
//                     salary: savedStaffData.salary // Ensure salary is preserved from our form data
//                 };
//                 MOCK_STAFF_DATA.unshift(newStaffWithSalary);
//                 setStaff(prev => [newStaffWithSalary, ...prev]);

//                 // Save to localStorage as backup
//                 saveStaffDataToStorage(MOCK_STAFF_DATA);

//                 // Close modal first
//                 setIsStaffModalOpen(false);
//                 setStaffToEdit(null);

//                 // Then show success message
//                 setTimeout(() => {
//                     setShowSuccessMessage(true);
//                     setTimeout(() => {
//                         setShowSuccessMessage(false);
//                     }, 3000);
//                 }, 100);
//             }
//         } catch (error) {
//             console.error('Failed to save staff to API:', error);

//             // Check if it's a network error
//             if (error.message.includes('fetch') || error.message.includes('Network')) {
//                 alert('Network Error\n\nCould not connect to the server. Please check:\n• Your internet connection\n• The server is running at http://142.93.94.236:8000\n• CORS is properly configured on the server\n\nThe record has been saved locally but will not persist to the database.');
//             } else {
//                 alert(`Failed to save to database\n\nError: ${error.message}\n\nThe record has been saved locally but may not persist.`);
//             }

//             // Fallback to localStorage only
//             const staffWithDateHired = {
//                 ...savedStaffData,
//                 date_hired: savedStaffData.hire_date || savedStaffData.date_hired
//             };

//             if (staffToEdit) {
//                 const index = MOCK_STAFF_DATA.findIndex(s => s.id === savedStaffData.id);
//                 if (index > -1) {
//                     MOCK_STAFF_DATA[index] = { ...staffWithDateHired };
//                 }
//                 setStaff(prev => prev.map(s => s.id === savedStaffData.id ? { ...staffWithDateHired } : s));
//             } else {
//                 MOCK_STAFF_DATA.unshift(staffWithDateHired);
//                 setStaff(prev => [staffWithDateHired, ...prev]);
//             }

//             saveStaffDataToStorage(MOCK_STAFF_DATA);
//         }
//     };

//     const handleDeleteStaff = async () => {
//         if (!staffToDelete) return;
//         setDeleting(true);
//         try {
//             // Delete from API
//             const response = await fetch(`${STAFF_API_ENDPOINT}${staffToDelete.staff_id}/`, {
//                 method: 'DELETE'
//             });

//             if (response.ok || response.status === 404) {
//                 console.log('Staff deleted successfully from API');

//                 // Remove from MOCK_STAFF_DATA
//                 const index = MOCK_STAFF_DATA.findIndex(s => s.id === staffToDelete.id);
//                 if (index > -1) {
//                     MOCK_STAFF_DATA.splice(index, 1);
//                 }

//                 // Update state
//                 setStaff(prev => prev.filter(s => s.id !== staffToDelete.id));

//                 // Save to localStorage for persistence
//                 saveStaffDataToStorage(MOCK_STAFF_DATA);

//                 setShowDeleteModal(false);
//                 setStaffToDelete(null);
//             } else {
//                 throw new Error(`API Error: ${response.status}`);
//             }
//         } catch (err) {
//             console.error('Failed to delete from API:', err);
//             // Still delete locally even if API fails
//             const index = MOCK_STAFF_DATA.findIndex(s => s.id === staffToDelete.id);
//             if (index > -1) {
//                 MOCK_STAFF_DATA.splice(index, 1);
//             }
//             setStaff(prev => prev.filter(s => s.id !== staffToDelete.id));
//             saveStaffDataToStorage(MOCK_STAFF_DATA);

//             setShowDeleteModal(false);
//             setStaffToDelete(null);
//             setError('Deleted locally, but failed to sync with database.');
//         } finally {
//             setDeleting(false);
//         }
//     };

//     const renderTableContent = () => {
//         if (loading) {
//             return (
//                 <tr className='h-24'>
//                     <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-gray-600">
//                         <Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-accent-btn" />
//                         Loading staff records...
//                     </td>
//                 </tr>
//             );
//         }

//         if (error && staff.length === 0) {
//             return (
//                 <tr className='h-24'>
//                     <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-red-600 font-medium">
//                         {error}
//                     </td>
//                 </tr>
//             );
//         }

//         if (sortedStaff.length === 0) {
//             return (
//                 <tr className='h-24'>
//                     <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-gray-500 italic">
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
//                 <td className="px-6 py-3 text-left text-gray-600">{staffMember.hire_date || staffMember.date_hired || 'N/A'}</td>
//                 <td className="px-6 py-3 text-right text-gray-600">
//                     {staffMember.salary ? Number(staffMember.salary).toLocaleString() : '-'}
//                 </td>
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

//     // Calculate KPI metrics
//     const kpis = useMemo(() => {
//         if (!staff || staff.length === 0) {
//             return {
//                 totalStaff: 0,
//                 maleStaff: 0,
//                 femaleStaff: 0,
//                 recentHires: 0
//             };
//         }

//         const totalStaff = staff.length;
//         const maleStaff = staff.filter(s => s.gender === 'Male').length;
//         const femaleStaff = staff.filter(s => s.gender === 'Female').length;

//         // Count staff hired in the last 30 days
//         const thirtyDaysAgo = new Date();
//         thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
//         const recentHires = staff.filter(s => {
//             const hireDate = new Date(s.hire_date || s.date_hired);
//             return hireDate >= thirtyDaysAgo;
//         }).length;

//         return {
//             totalStaff,
//             maleStaff,
//             femaleStaff,
//             recentHires
//         };
//     }, [staff]);

//     const KPICards = () => (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
//                 <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-xs font-medium tracking-wide uppercase" style={{ color: '#666' }}>
//                         Total Staff
//                     </h3>
//                     <Users size={20} style={{ color: '#8B5A3C' }} />
//                 </div>
//                 {loading ? (
//                     <div className="flex items-center gap-2 mt-2">
//                         <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B5A3C' }} />
//                         <span className="text-sm" style={{ color: '#888' }}>Loading...</span>
//                     </div>
//                 ) : (
//                     <div className="mt-2">
//                         <div className="flex flex-col gap-1">
//                             <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{kpis.totalStaff}</p>
//                         </div>
//                         <div className="mt-3 text-xs">
//                             <p style={{ color: '#666' }}>Active employees</p>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
//                 <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-xs font-medium tracking-wide uppercase" style={{ color: '#666' }}>
//                         Male Staff
//                     </h3>
//                     <UserCheck size={20} style={{ color: '#8B5A3C' }} />
//                 </div>
//                 {loading ? (
//                     <div className="flex items-center gap-2 mt-2">
//                         <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B5A3C' }} />
//                         <span className="text-sm" style={{ color: '#888' }}>Loading...</span>
//                     </div>
//                 ) : (
//                     <div className="mt-2">
//                         <div className="flex flex-col gap-1">
//                             <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{kpis.maleStaff}</p>
//                         </div>
//                         <div className="mt-3 text-xs">
//                             <p style={{ color: '#666' }}>
//                                 {kpis.totalStaff > 0 ? `${((kpis.maleStaff / kpis.totalStaff) * 100).toFixed(0)}% of staff` : '0% of staff'}
//                             </p>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
//                 <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-xs font-medium tracking-wide uppercase" style={{ color: '#666' }}>
//                         Female Staff
//                     </h3>
//                     <UserX size={20} style={{ color: '#8B5A3C' }} />
//                 </div>
//                 {loading ? (
//                     <div className="flex items-center gap-2 mt-2">
//                         <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B5A3C' }} />
//                         <span className="text-sm" style={{ color: '#888' }}>Loading...</span>
//                     </div>
//                 ) : (
//                     <div className="mt-2">
//                         <div className="flex flex-col gap-1">
//                             <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{kpis.femaleStaff}</p>
//                         </div>
//                         <div className="mt-3 text-xs">
//                             <p style={{ color: '#666' }}>
//                                 {kpis.totalStaff > 0 ? `${((kpis.femaleStaff / kpis.totalStaff) * 100).toFixed(0)}% of staff` : '0% of staff'}
//                             </p>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
//                 <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-xs font-medium tracking-wide uppercase" style={{ color: '#666' }}>
//                         Recent Hires
//                     </h3>
//                     <TrendingUp size={20} style={{ color: '#8B5A3C' }} />
//                 </div>
//                 {loading ? (
//                     <div className="flex items-center gap-2 mt-2">
//                         <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B5A3C' }} />
//                         <span className="text-sm" style={{ color: '#888' }}>Loading...</span>
//                     </div>
//                 ) : (
//                     <div className="mt-2">
//                         <div className="flex flex-col gap-1">
//                             <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{kpis.recentHires}</p>
//                         </div>
//                         <div className="mt-3 text-xs">
//                             <p style={{ color: '#666' }}>Last 30 days</p>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );

//     return (
//         <SideNav>
//             <main className="p-4 sm:p-6 md:p-8 pt-0">
//                 <h2 className="text-2xl sm:text-3xl font-bold text-[#4A3423] mb-6">Staff Management Overview</h2>

//                 {/* Success Message Banner */}
//                 {showSuccessMessage && (
//                     <div className="mb-6 p-4 rounded-lg shadow-lg border-l-4 animate-fade-in" style={{ backgroundColor: '#D4EDDA', borderColor: '#28A745', color: '#155724' }}>
//                         <div className="flex items-center">
//                             <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
//                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                             </svg>
//                             <span className="font-semibold text-base">Staff record saved successfully</span>
//                         </div>
//                     </div>
//                 )}

//                 <KPICards />

//                 <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
//                     <div className="hidden md:block"></div>
//                     <div className="flex space-x-3 mt-4 md:mt-0">
//                         <button
//                             onClick={handleNewStaff}
//                             className="py-2 px-4 shadow-xl rounded-xl flex items-center font-semibold text-white hover:shadow-2xl transition-all duration-200"
//                             style={{ backgroundColor: '#8B4513' }}
//                         >
//                             <Plus className="w-4 h-4 mr-2" />
//                             Record New Staff
//                         </button>
//                         <button
//                             onClick={() => alert('Exporting to Excel is not yet implemented.')}
//                             className="py-2 px-4 shadow-xl rounded-xl font-semibold hover:shadow-2xl transition-all duration-200"
//                             style={{ backgroundColor: '#efebe9', color: '#783A1E', border: 'none' }}
//                         >
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
//                                         <th key={header.key} className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${header.type === 'actions' ? '' : 'cursor-pointer hover:bg-accent-btn/90'} transition-colors duration-150`} onClick={header.type === 'actions' ? undefined : () => requestSort(header.key)} scope="col">
//                                             <div className={`flex items-center ${header.type === 'number' ? 'justify-end' : header.type === 'actions' ? 'justify-center' : 'justify-start'}`}>
//                                                 {header.label}
//                                                 {header.type !== 'actions' && getSortIcon(header.key)}
//                                             </div>
//                                         </th>
//                                     ))}
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-100 text-xs">
//                                 {renderTableContent()}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </main>

//             <StaffEntryModal isOpen={isStaffModalOpen} onClose={() => { setIsStaffModalOpen(false); setStaffToEdit(null); }} staffData={staffToEdit} onSave={handleSaveStaff} />


//             {/* Delete Confirmation Modal */}
//             {showDeleteModal && staffToDelete && (
//                 <div
//                     className="fixed inset-0 flex justify-center items-center transition-all duration-300 backdrop-blur-sm"
//                     style={{
//                         background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(75, 52, 35, 0.5) 100%)',
//                         zIndex: 1000,
//                     }}
//                     onClick={() => { setShowDeleteModal(false); setStaffToDelete(null); }}
//                 >
//                     <div
//                         className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 p-6"
//                         onClick={(e) => e.stopPropagation()}
//                     >
//                         <div className="flex items-center justify-between mb-4">
//                             <h3 className="text-xl font-bold text-[#4A3423]">Confirm Delete</h3>
//                             <button
//                                 onClick={() => { setShowDeleteModal(false); setStaffToDelete(null); }}
//                                 className="p-1 rounded-full hover:bg-gray-100 transition-colors"
//                             >
//                                 <X className="w-5 h-5 text-gray-500" />
//                             </button>
//                         </div>
//                         <p className="text-gray-700 mb-6">
//                             Are you sure you want to delete staff member: <strong>{staffToDelete.first_name} {staffToDelete.last_name}</strong>?
//                             <br />
//                             <span className="text-sm text-gray-500">This action cannot be undone.</span>
//                         </p>
//                         <div className="flex justify-end gap-3">
//                             <button
//                                 onClick={() => { setShowDeleteModal(false); setStaffToDelete(null); }}
//                                 className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
//                                 disabled={deleting}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleDeleteStaff}
//                                 disabled={deleting}
//                                 className="px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 flex items-center"
//                                 style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
//                             >
//                                 {deleting ? (
//                                     <>
//                                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                                         Deleting...
//                                     </>
//                                 ) : (
//                                     'Delete'
//                                 )}
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
   X, RefreshCw, Calendar, ArrowUp, ArrowDown, Edit, Trash2, Search, Plus, ChevronsDown, Loader2, UserCircle, MapPin, Users, UserCheck, UserX, TrendingUp, Send
} from 'lucide-react';
import { SideNav } from '../components/SideNav';

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

const STAFF_API_ENDPOINT = 'http://142.93.94.236:8000/api/staff/';

const LOCATION_DATA = {
    Wakiso: {
        subcounties: {
            "Kakiri": ["Kakiri Central", "Kakiri East", "Kakiri West"],
            "Kira": ["Kira Central", "Kira Division A", "Kira Division B"]
        }
    },
    Mpigi: {
        subcounties: {
            "MpigiTC": ["Mpigi Central", "Mpigi East", "Mpigi West"],
            "Ggombe": ["Ggombe Central", "Ggombe North", "Ggombe South"]
        }
    },
    Mbarara: {
        subcounties: {
            "Kakoba": ["Kakoba Division", "Kakoba East", "Kakoba West"],
            "Nyamitanga": ["Nyamitanga Central", "Nyamitanga North", "Nyamitanga South"]
        }
    }
};

const StaffEntryModal = ({ isOpen, onClose, staffData, onSave }) => {
    const today = new Date().toISOString().slice(0, 10);

    // Helper function to format number with commas
    const formatNumberWithCommas = (value) => {
        if (!value && value !== 0) return '';
        // Remove any existing commas and format
        const num = value.toString().replace(/,/g, '');
        return Number(num).toLocaleString('en-US');
    };

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
            salary: '',
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
            hire_date: s.hire_date || s.date_hired || today,
            salary: s.salary ? formatNumberWithCommas(s.salary) : '',
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
        salary: null,
    });
    

    useEffect(() => {
        if (isOpen) {
            setFormData(normalizeStaff(staffData));
            setValidation({
                first_name: null, last_name: null, gender: null, nin: null,
                district: null, subcounty: null, parish: null, village: null, employment_status: null, hire_date: null, salary: null
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
                return ['Male', 'Female'].includes(value);
            case 'nin':
                // Must start with CM or CF (uppercase) and be exactly 14 alphanumeric characters
                return v.length === 14 && /^(CM|CF)[A-Za-z0-9]{12}$/.test(v);
            case 'district':
            case 'subcounty':
            case 'parish':
                return v.length > 0;
            case 'village':
                return v.length >= 2;
            case 'salary':
                // Monthly Salary - Remove commas for validation
                const rawSalary = v.replace(/,/g, '');
                if (rawSalary === '') return false;
                const salaryNum = parseFloat(rawSalary);
                return !isNaN(salaryNum) && salaryNum >= 0;
            case 'employment_status':
                return ['Full-time', 'Part-time', 'Contract', 'Seasonal', ].includes(value);
            case 'hire_date':
                if (!v.length) return false;
                // Check if date is in the future
                const selectedDate = new Date(v);
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0); // Reset time to compare dates only
                return selectedDate <= currentDate;
            default:
                return true;
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const next = { ...prev };
            
            if (name === 'salary') {
                // For salary field, format with commas as user types
                let formattedValue = value;
                
                // Only format if it's a valid number input
                if (value && /^[0-9,]*$/.test(value)) {
                    // Remove all commas, then format with commas
                    const rawValue = value.replace(/,/g, '');
                    if (rawValue === '') {
                        formattedValue = '';
                    } else {
                        formattedValue = Number(rawValue).toLocaleString('en-US');
                    }
                }
                
                next[name] = formattedValue;
            } else {
                next[name] = value;
            }
            
            // Handle location cascading updates
            if (name === 'district') {
                next.subcounty = '';
                next.parish = '';
            }
            if (name === 'subcounty') {
                next.parish = '';
            }
            
            return next;
        });
        
        // For validation, use the raw value (without commas)
        const rawValue = name === 'salary' ? value.replace(/,/g, '') : value;
        setValidation(prev => ({ ...prev, [name]: validateField(name, rawValue) }));
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
        const fieldsToCheck = ['first_name', 'last_name', 'gender', 'nin', 'district', 'subcounty', 'parish', 'village', 'employment_status', 'hire_date', 'salary'];
        const newValidation = {};
        let allValid = true;
        for (const f of fieldsToCheck) {
            // For salary, use raw value (without commas) for validation
            const value = f === 'salary' ? formData[f].replace(/,/g, '') : formData[f];
            const ok = validateField(f, value);
            newValidation[f] = ok;
            if (!ok) allValid = false;
        }
        setValidation(prev => ({ ...prev, ...newValidation }));
        if (!allValid) {

            return;
        }

        setIsSubmitting(true);

        // Prepare data for saving - convert salary back to raw number
        const resultData = {
            ...formData,
            // Convert formatted salary back to raw number for storage
            salary: formData.salary ? parseFloat(formData.salary.replace(/,/g, '')) : '',
            // preserve original id/staff_id when editing (if provided)
            id: staffData?.id || Date.now() + Math.random(),
            staff_id: staffData?.staff_id || `RF${Math.floor(Math.random() * 900) + 100}`
        };

        // Call the parent's onSave function and wait for it to complete
        await onSave(resultData);
        setIsSubmitting(false);

        // Don't close the modal here - let the parent handle it after showing success message
    };

    if (!isOpen) return null;

    // FIXED: Correct location data access
    const districtOptions = Object.keys(LOCATION_DATA);
    const subcountyOptions = formData.district ? Object.keys(LOCATION_DATA[formData.district].subcounties) : [];
    const parishOptions = (formData.district && formData.subcounty)
        ? (LOCATION_DATA[formData.district].subcounties[formData.subcounty] || [])
        : [];

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-auto flex flex-col overflow-hidden"
                style={{ maxHeight: '90vh', height: '80vh' }}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200" style={{ backgroundColor: '#FFFFFF' }}>
                    <h2 className="text-xl font-semibold" style={{ color: CoffeeColors.DARK_BROWN }}>
                        {staffData ? 'Edit Staff' : 'Staff Entry'}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form noValidate onSubmit={handleSubmit} className="flex-1 p-6 space-y-4 overflow-y-auto">
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
                                    maxLength={14}
                                    placeholder="14 alphanumeric characters"
                                    className={getInputClass('nin')}
                                />
                                {validation.nin === false && <p className="mt-1 text-xs text-red-600">NIN must start with CM or CF and be exactly 14 alphanumeric characters.</p>}
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
                                        {subcountyOptions.map((subcounty, index) => (
                                            <option key={index} value={subcounty}>{subcounty}</option>
                                        ))}
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
                                        {parishOptions.map((parish, index) => (
                                            <option key={index} value={parish}>{parish}</option>
                                        ))}
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
                                {validation.hire_date === false && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {formData.hire_date && new Date(formData.hire_date) > new Date()
                                            ? 'Invalid date — future dates are not accepted.'
                                            : 'This field is required.'
                                        }
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary (UGX)</label>
                                <input
                                    name="salary"
                                    type="text" // Changed from "number" to "text" to allow commas
                                    value={formData.salary}
                                    onChange={handleChange}
                                    placeholder="e.g., 500,000"
                                    className={getInputClass('salary')}
                                />
                                {validation.salary === false && <p className="mt-1 text-xs text-red-600">Monthly Salary is required and must be a valid positive number.</p>}
                            </div>
                        </div>
                    </section>

                </form>

                {/* Modal Footer */}
                <div className="flex justify-end p-4 border-t border-gray-200 space-x-3" style={{ backgroundColor: '#F8F8F8' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-md"
                        style={{ backgroundColor: '#E5E7EB', color: '#4B5563' }}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-white rounded-md transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        style={{ backgroundColor: '#9F4A2F' }}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {staffData ? 'Updating...' : 'Saving...'}
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                {staffData ? 'Save Changes' : 'Record Staff'}
                            </>
                        )}
                    </button>
                </div>
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
    { key: 'hire_date', label: 'Hire Date', type: 'date' },
    { key: 'salary', label: 'Monthly Salary (UGX)', type: 'number' },
    { key: 'actions', label: 'Actions', type: 'actions' },
];

// FIXED: Added salary field to initial mock data
const INITIAL_STAFF_DATA = [
    { id: 1, staff_id: 'RF001', first_name: 'Billy', last_name: 'Banks', gender: 'Male', nin: 'CM004GDT777G88', district: 'Wakiso', date_hired: '2023-06-15', salary: 500000 },
    { id: 2, staff_id: 'RF002', first_name: 'Ivan', last_name: 'Koreta', gender: 'Male', nin: 'CM00566674632A', district: 'Wakiso', date_hired: '2024-11-20', salary: 450000 },
    { id: 3, staff_id: 'RF003', first_name: 'Jackson', last_name: 'Ssemengo', gender: 'Male', nin: 'CM004673H7645F', district: 'Wakiso', date_hired: '2024-05-07', salary: 600000 },
    { id: 4, staff_id: 'RF004', first_name: 'Justine', last_name: 'Natasha', gender: 'Female', nin: 'CF003674F7894A', district: 'Wakiso', date_hired: '2024-10-16', salary: 550000 },
    { id: 5, staff_id: 'RF005', first_name: 'Agnes', last_name: 'Nalubega', gender: 'Female', nin: 'CF003675N876B', district: 'Mpigi', date_hired: '2023-03-22', salary: 480000 },
    { id: 6, staff_id: 'RF006', first_name: 'Peter', last_name: 'Mwesigye', gender: 'Male', nin: 'CM004678P1234C', district: 'Mbarara', date_hired: '2024-01-10', salary: 520000 },
];

// Helper functions for localStorage persistence
const STORAGE_KEY = 'staff_management_data';

const getStoredStaffData = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error reading from localStorage:', error);
    }
    return [...INITIAL_STAFF_DATA];
};

const saveStaffDataToStorage = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

// Initialize MOCK_STAFF_DATA from localStorage or use initial data
let MOCK_STAFF_DATA = getStoredStaffData();

function StaffPage() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const navigate = useNavigate();

    const [sortConfig, setSortConfig] = useState({ key: 'date_hired', direction: 'descending' });
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [staffToEdit, setStaffToEdit] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const fetchStaff = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(STAFF_API_ENDPOINT);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const normalized = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
            
            // FIXED: Ensure all staff records have salary field
            const staffWithSalary = normalized.map(staff => ({
                ...staff,
                salary: staff.salary || 0, // Default to 0 if missing
                hire_date: staff.hire_date || staff.date_hired // Normalize date field
            }));
            
            setStaff(staffWithSalary);
        } catch (err) {
            setError('Could not load data from API. Displaying mock data.');
            // FIXED: Ensure mock data has salary
            const mockWithSalary = MOCK_STAFF_DATA.map(staff => ({
                ...staff,
                salary: staff.salary || 0 // Add default salary if missing
            }));
            setStaff(mockWithSalary);
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
                if (headerType === 'number') {
                    const aNum = Number(aVal) || 0;
                    const bNum = Number(bVal) || 0;
                    return sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
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

    const handleSaveStaff = async (savedStaffData) => {
        console.log('handleSaveStaff called with:', savedStaffData);
        if (!savedStaffData) return;

        // Validate and prepare data for API
        const apiData = {
            first_name: savedStaffData.first_name?.trim() || '',
            last_name: savedStaffData.last_name?.trim() || '',
            nin: savedStaffData.nin?.trim().toUpperCase() || '', // Convert to uppercase for API
            district: savedStaffData.district?.trim() || '',
            sub_county: (savedStaffData.subcounty || savedStaffData.sub_county || '').trim(),
            parish: savedStaffData.parish?.trim() || '',
            village: savedStaffData.village?.trim() || '',
            gender: savedStaffData.gender?.trim() || '',
            date_hired: savedStaffData.hire_date || savedStaffData.date_hired || '',
            employment_type: savedStaffData.employment_status || 'Full-time', // Use exact value from form
            salary: savedStaffData.salary || 0, // Salary is already a number from the modal
            is_active: true
        };

        // Validate required fields
        const requiredFields = ['first_name', 'last_name', 'nin', 'district', 'sub_county', 'parish', 'village', 'gender', 'date_hired'];
        const missingFields = requiredFields.filter(field => !apiData[field]);

        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            alert(`Missing required fields:\n${missingFields.map(f => `• ${f.replace(/_/g, ' ')}`).join('\n')}`);
            return;
        }

        // Validate NIN pattern (alphanumeric only, no symbols)
        const ninPattern = /^(CM|CF)[A-Za-z0-9]{12}$/;
        if (!ninPattern.test(savedStaffData.nin?.trim() || '')) {
            console.error('Invalid NIN format:', savedStaffData.nin);
            alert('Invalid NIN format\n\nNational ID must start with CM or CF and be exactly 14 alphanumeric characters.');
            return;
        }

        console.log('Sending to API:', JSON.stringify(apiData, null, 2));

        try {
            if (staffToEdit) {
                // Update existing staff via PUT request
                console.log('Updating existing staff via API');
                const response = await fetch(`${STAFF_API_ENDPOINT}${staffToEdit.staff_id}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(apiData)
                });

                console.log('API Response Status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error Response:', errorText);
                    try {
                        const errorJson = JSON.parse(errorText);
                        console.error('API Error Details:', errorJson);
                        const errorMsg = Object.entries(errorJson).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`).join('\n');
                        alert(`Failed to update staff:\n\n${errorMsg}`);
                    } catch (e) {
                        alert(`Failed to update staff\n\nServer responded with status ${response.status}:\n${errorText.substring(0, 200)}`);
                    }
                    throw new Error(`API Error: ${response.status}`);
                }

                const updatedStaff = await response.json();
                console.log('Staff updated successfully:', updatedStaff);

                // FIXED: Update local state - ensure salary is properly preserved
                const staffWithSalary = {
                    ...updatedStaff,
                    salary: savedStaffData.salary, // Explicitly preserve salary from form data
                    hire_date: updatedStaff.hire_date || updatedStaff.date_hired,
                    date_hired: updatedStaff.hire_date || updatedStaff.date_hired
                };
                
                const index = MOCK_STAFF_DATA.findIndex(s => s.id === savedStaffData.id);
                if (index > -1) {
                    MOCK_STAFF_DATA[index] = { ...staffWithSalary };
                }
                setStaff(prev => prev.map(s => s.id === savedStaffData.id ? { ...staffWithSalary } : s));

                // Save to localStorage as backup
                saveStaffDataToStorage(MOCK_STAFF_DATA);

                // Close modal first
                setIsStaffModalOpen(false);
                setStaffToEdit(null);

                // Then show success message
                setTimeout(() => {
                    setShowSuccessMessage(true);
                    setTimeout(() => {
                        setShowSuccessMessage(false);
                    }, 3000);
                }, 100);
            } else {
                // Add new staff via POST request
                console.log('Creating new staff via API');
                const response = await fetch(STAFF_API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(apiData)
                });

                console.log('API Response Status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error Response:', errorText);
                    try {
                        const errorJson = JSON.parse(errorText);
                        console.error('API Error Details:', errorJson);
                        const errorMsg = Object.entries(errorJson).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`).join('\n');
                        alert(`Failed to create staff:\n\n${errorMsg}`);
                    } catch (e) {
                        alert(`Failed to create staff\n\nServer responded with status ${response.status}:\n${errorText.substring(0, 200)}`);
                    }
                    throw new Error(`API Error: ${response.status}`);
                }

                const newStaff = await response.json();
                console.log('Staff created successfully:', newStaff);

                // FIXED: Update local state with API-generated data, ensuring salary is included
                const newStaffWithSalary = {
                    ...newStaff,
                    salary: savedStaffData.salary, // Explicitly include salary from form data
                    hire_date: newStaff.hire_date || newStaff.date_hired,
                    date_hired: newStaff.hire_date || newStaff.date_hired
                };
                
                MOCK_STAFF_DATA.unshift(newStaffWithSalary);
                setStaff(prev => [newStaffWithSalary, ...prev]);

                // Save to localStorage as backup
                saveStaffDataToStorage(MOCK_STAFF_DATA);

                // Close modal first
                setIsStaffModalOpen(false);
                setStaffToEdit(null);

                // Then show success message
                setTimeout(() => {
                    setShowSuccessMessage(true);
                    setTimeout(() => {
                        setShowSuccessMessage(false);
                    }, 3000);
                }, 100);
            }
        } catch (error) {
            console.error('Failed to save staff to API:', error);

            // Check if it's a network error
            if (error.message.includes('fetch') || error.message.includes('Network')) {
                alert('Network Error\n\nCould not connect to the server. Please check:\n• Your internet connection\n• The server is running at http://142.93.94.236:8000\n• CORS is properly configured on the server\n\nThe record has been saved locally but will not persist to the database.');
            } else {
                alert(`Failed to save to database\n\nError: ${error.message}\n\nThe record has been saved locally but may not persist.`);
            }

            // Fallback to localStorage only
            const staffWithSalary = {
                ...savedStaffData,
                date_hired: savedStaffData.hire_date || savedStaffData.date_hired
            };

            if (staffToEdit) {
                const index = MOCK_STAFF_DATA.findIndex(s => s.id === savedStaffData.id);
                if (index > -1) {
                    MOCK_STAFF_DATA[index] = { ...staffWithSalary };
                }
                setStaff(prev => prev.map(s => s.id === savedStaffData.id ? { ...staffWithSalary } : s));
            } else {
                MOCK_STAFF_DATA.unshift(staffWithSalary);
                setStaff(prev => [staffWithSalary, ...prev]);
            }

            saveStaffDataToStorage(MOCK_STAFF_DATA);
        }
    };

    const handleDeleteStaff = async () => {
        if (!staffToDelete) return;
        setDeleting(true);
        try {
            // Delete from API
            const response = await fetch(`${STAFF_API_ENDPOINT}${staffToDelete.staff_id}/`, {
                method: 'DELETE'
            });

            if (response.ok || response.status === 404) {
                console.log('Staff deleted successfully from API');

                // Remove from MOCK_STAFF_DATA
                const index = MOCK_STAFF_DATA.findIndex(s => s.id === staffToDelete.id);
                if (index > -1) {
                    MOCK_STAFF_DATA.splice(index, 1);
                }

                // Update state
                setStaff(prev => prev.filter(s => s.id !== staffToDelete.id));

                // Save to localStorage for persistence
                saveStaffDataToStorage(MOCK_STAFF_DATA);

                setShowDeleteModal(false);
                setStaffToDelete(null);
            } else {
                throw new Error(`API Error: ${response.status}`);
            }
        } catch (err) {
            console.error('Failed to delete from API:', err);
            // Still delete locally even if API fails
            const index = MOCK_STAFF_DATA.findIndex(s => s.id === staffToDelete.id);
            if (index > -1) {
                MOCK_STAFF_DATA.splice(index, 1);
            }
            setStaff(prev => prev.filter(s => s.id !== staffToDelete.id));
            saveStaffDataToStorage(MOCK_STAFF_DATA);

            setShowDeleteModal(false);
            setStaffToDelete(null);
            setError('Deleted locally, but failed to sync with database.');
        } finally {
            setDeleting(false);
        }
    };

    const renderTableContent = () => {
        // Add debug logging to see what data we have
        console.log('Rendering staff data:', sortedStaff);
        
        if (loading) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-gray-600">
                        <Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-accent-btn" />
                        Loading staff records...
                    </td>
                </tr>
            );
        }

        if (error && staff.length === 0) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-red-600 font-medium">
                        {error}
                    </td>
                </tr>
            );
        }

        if (sortedStaff.length === 0) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-gray-500 italic">
                        No staff records found matching your criteria.
                    </td>
                </tr>
            );
        }

        return sortedStaff.map((staffMember, index) => {
            // Debug each staff member's salary
            console.log(`Staff ${staffMember.first_name} salary:`, staffMember.salary);
            
            return (
                <tr key={staffMember.id || index} className="border-b transition-colors duration-150 hover:bg-gray-50">
                    <td className="px-6 py-3 text-left font-medium text-gray-800">{staffMember.staff_id || 'N/A'}</td>
                    <td className="px-6 py-3 text-left text-gray-600">{staffMember.first_name || 'N/A'}</td>
                    <td className="px-6 py-3 text-left text-gray-600">{staffMember.last_name || 'N/A'}</td>
                    <td className="px-6 py-3 text-left text-gray-600">{staffMember.gender || '-'}</td>
                    <td className="px-6 py-3 text-left text-gray-600">{staffMember.nin || '-'}</td>
                    <td className="px-6 py-3 text-left text-gray-600">{staffMember.district || '-'}</td>
                    <td className="px-6 py-3 text-left text-gray-600">{staffMember.hire_date || staffMember.date_hired || 'N/A'}</td>
                    <td className="px-6 py-3 text-right text-gray-600">
                        {staffMember.salary ? Number(staffMember.salary).toLocaleString() : 'No salary'}
                    </td>
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
            );
        });
    };

    // Calculate KPI metrics
    const kpis = useMemo(() => {
        if (!staff || staff.length === 0) {
            return {
                totalStaff: 0,
                maleStaff: 0,
                femaleStaff: 0,
                recentHires: 0
            };
        }

        const totalStaff = staff.length;
        const maleStaff = staff.filter(s => s.gender === 'Male').length;
        const femaleStaff = staff.filter(s => s.gender === 'Female').length;

        // Count staff hired in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentHires = staff.filter(s => {
            const hireDate = new Date(s.hire_date || s.date_hired);
            return hireDate >= thirtyDaysAgo;
        }).length;

        return {
            totalStaff,
            maleStaff,
            femaleStaff,
            recentHires
        };
    }, [staff]);

    const KPICards = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-medium tracking-wide uppercase" style={{ color: '#666' }}>
                        Total Staff
                    </h3>
                    <Users size={20} style={{ color: '#8B5A3C' }} />
                </div>
                {loading ? (
                    <div className="flex items-center gap-2 mt-2">
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B5A3C' }} />
                        <span className="text-sm" style={{ color: '#888' }}>Loading...</span>
                    </div>
                ) : (
                    <div className="mt-2">
                        <div className="flex flex-col gap-1">
                            <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{kpis.totalStaff}</p>
                        </div>
                        <div className="mt-3 text-xs">
                            <p style={{ color: '#666' }}>Active employees</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-medium tracking-wide uppercase" style={{ color: '#666' }}>
                        Male Staff
                    </h3>
                    <UserCheck size={20} style={{ color: '#8B5A3C' }} />
                </div>
                {loading ? (
                    <div className="flex items-center gap-2 mt-2">
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B5A3C' }} />
                        <span className="text-sm" style={{ color: '#888' }}>Loading...</span>
                    </div>
                ) : (
                    <div className="mt-2">
                        <div className="flex flex-col gap-1">
                            <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{kpis.maleStaff}</p>
                        </div>
                        <div className="mt-3 text-xs">
                            <p style={{ color: '#666' }}>
                                {kpis.totalStaff > 0 ? `${((kpis.maleStaff / kpis.totalStaff) * 100).toFixed(0)}% of staff` : '0% of staff'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-medium tracking-wide uppercase" style={{ color: '#666' }}>
                        Female Staff
                    </h3>
                    <UserX size={20} style={{ color: '#8B5A3C' }} />
                </div>
                {loading ? (
                    <div className="flex items-center gap-2 mt-2">
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B5A3C' }} />
                        <span className="text-sm" style={{ color: '#888' }}>Loading...</span>
                    </div>
                ) : (
                    <div className="mt-2">
                        <div className="flex flex-col gap-1">
                            <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{kpis.femaleStaff}</p>
                        </div>
                        <div className="mt-3 text-xs">
                            <p style={{ color: '#666' }}>
                                {kpis.totalStaff > 0 ? `${((kpis.femaleStaff / kpis.totalStaff) * 100).toFixed(0)}% of staff` : '0% of staff'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-medium tracking-wide uppercase" style={{ color: '#666' }}>
                        Recent Hires
                    </h3>
                    <TrendingUp size={20} style={{ color: '#8B5A3C' }} />
                </div>
                {loading ? (
                    <div className="flex items-center gap-2 mt-2">
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B5A3C' }} />
                        <span className="text-sm" style={{ color: '#888' }}>Loading...</span>
                    </div>
                ) : (
                    <div className="mt-2">
                        <div className="flex flex-col gap-1">
                            <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{kpis.recentHires}</p>
                        </div>
                        <div className="mt-3 text-xs">
                            <p style={{ color: '#666' }}>Last 30 days</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <SideNav>
            <main className="p-4 sm:p-6 md:p-8 pt-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#4A3423] mb-6">Staff Management Overview</h2>

                {/* Success Message Banner */}
                {showSuccessMessage && (
                    <div className="mb-6 p-4 rounded-lg shadow-lg border-l-4 animate-fade-in" style={{ backgroundColor: '#D4EDDA', borderColor: '#28A745', color: '#155724' }}>
                        <div className="flex items-center">
                            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold text-base">Staff record saved successfully</span>
                        </div>
                    </div>
                )}

                <KPICards />

                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                    <div className="hidden md:block"></div>
                    <div className="flex space-x-3 mt-4 md:mt-0">
                        <button
                            onClick={handleNewStaff}
                            className="py-2 px-4 shadow-xl rounded-xl flex items-center font-semibold text-white hover:shadow-2xl transition-all duration-200"
                            style={{ backgroundColor: '#8B4513' }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Record New Staff
                        </button>
                        <button
                            onClick={() => alert('Exporting to Excel is not yet implemented.')}
                            className="py-2 px-4 shadow-xl rounded-xl font-semibold hover:shadow-2xl transition-all duration-200"
                            style={{ backgroundColor: '#efebe9', color: '#783A1E', border: 'none' }}
                        >
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
                                        <th key={header.key} className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${header.type === 'actions' ? '' : 'cursor-pointer hover:bg-accent-btn/90'} transition-colors duration-150`} onClick={header.type === 'actions' ? undefined : () => requestSort(header.key)} scope="col">
                                            <div className={`flex items-center ${header.type === 'number' ? 'justify-end' : header.type === 'actions' ? 'justify-center' : 'justify-start'}`}>
                                                {header.label}
                                                {header.type !== 'actions' && getSortIcon(header.key)}
                                            </div>
                                        </th>
                                    ))}
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


            {/* Delete Confirmation Modal */}
            {showDeleteModal && staffToDelete && (
                <div
                    className="fixed inset-0 flex justify-center items-center transition-all duration-300 backdrop-blur-sm"
                    style={{
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(75, 52, 35, 0.5) 100%)',
                        zIndex: 1000,
                    }}
                    onClick={() => { setShowDeleteModal(false); setStaffToDelete(null); }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-[#4A3423]">Confirm Delete</h3>
                            <button
                                onClick={() => { setShowDeleteModal(false); setStaffToDelete(null); }}
                                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete staff member: <strong>{staffToDelete.first_name} {staffToDelete.last_name}</strong>?
                            <br />
                            <span className="text-sm text-gray-500">This action cannot be undone.</span>
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setStaffToDelete(null); }}
                                className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteStaff}
                                disabled={deleting}
                                className="px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 flex items-center"
                                style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SideNav>
    );
}

export default StaffPage;