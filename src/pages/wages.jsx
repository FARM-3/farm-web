// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { RefreshCw, DollarSign, Calendar, User, MinusCircle, Wallet, Loader2, ArrowUp, ArrowDown, Plus, Menu, X, Bell, LogOut, UserIcon, TrendingUpIcon, Eye, Edit, Trash2, Filter } from 'lucide-react';
// import { SideNav } from '../components/SideNav';


// // --- CONFIGURATION & UTILITIES ---

// const CoffeeColors = {
//     SCREEN_BG: '#FFF8F6', ACTIVE_LINK_BG: '#efebe9', ACTIVE_LINK_TEXT: '#783A1E', DARK_BROWN: '#4A3423', MEDIUM_BROWN: '#795548', GRAY_TEXT: '#8D8D8D', SUCCESS_GREEN: '#34A853', ERROR_RED: '#EA4335',
// };

// const customTailwindConfig = {
//     theme: {
//         extend: {
//             colors: {
//                 'app-bg': CoffeeColors.SCREEN_BG, 'accent-btn': CoffeeColors.MEDIUM_BROWN, 'text-default': CoffeeColors.DARK_BROWN, 'sidebar-bg': '#FFFFFF', 'active-link-bg': CoffeeColors.ACTIVE_LINK_BG, 'active-link-text': CoffeeColors.ACTIVE_LINK_TEXT, 'success': CoffeeColors.SUCCESS_GREEN, 'error': CoffeeColors.ERROR_RED, 'light-coffee-brown': CoffeeColors.ACTIVE_LINK_BG,
//             },
//             fontFamily: { sans: ['Inter', 'sans-serif'], }
//         }
//     }
// };

// const styleScript = document.createElement('script');
// styleScript.innerHTML = `tailwind.config = ${JSON.stringify(customTailwindConfig)}`;
// document.head.appendChild(styleScript);

// const formatUGX = (amount) => {
//     if (typeof amount !== 'number') return amount || '0';
//     return amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
// };

// const Wage_API_Endpoint = 'https://api-3181.onrender.com/api/wages/';

// // --- SHARED COMPONENTS ---

// const Button = ({ children, onClick, className, disabled, type = 'primary' }) => {
//     const baseClasses = `px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm`;
    
//     let colorClasses;
//     if (type === 'secondary') {
//         colorClasses = `bg-light-coffee-brown text-active-link-text hover:bg-light-coffee-brown/80`;
//     } else {
//         colorClasses = `bg-accent-btn text-white hover:bg-accent-btn/90`;
//     }

//     return (
//         <button
//             onClick={onClick}
//             disabled={disabled}
//             className={`${baseClasses} ${colorClasses} ${className}`}
//         >
//             {children}
//         </button>
//     );
// };

// // =========================================================
// // --- WageDisplayPage Component (CLEANED AND STYLED TO IMAGE) ---
// // =========================================================

// const TABLE_HEADERS = [
//     { key: 'employee_name', label: 'Employee', icon: User, type: 'string', align: 'left' },
//     { key: 'date_of_payment', label: 'Date Paid', icon: Calendar, type: 'date', align: 'center' },
//     { key: 'days_worked', label: 'Days', icon: Calendar, type: 'number', align: 'center' },
//     { key: 'monthly_pay', label: 'Base Pay (UGX)', icon: Wallet, type: 'number', align: 'right' },
//     { key: 'amount_paid', label: 'Total Paid (UGX)', icon: DollarSign, type: 'number', align: 'right' },
//     { key: 'deduction', label: 'Deduction (UGX)', icon: MinusCircle, type: 'number', align: 'right' },
//     { key: 'noted_reason', label: 'Note', icon: null, type: 'string', align: 'left' },
//     { key: 'actions', label: 'Actions', icon: null, type: 'actions', align: 'center' }, // New Actions column
// ];

// function WageDisplayPage() {
//     const [wages, setWages] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [sortConfig, setSortConfig] = useState({ key: 'date_of_payment', direction: 'descending' });
//     const [currentPage, setCurrentPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(1);
//     const itemsPerPage = 7;
    
//     // --- Data Fetching Logic ---
//     const fetchWages = useCallback(async (page = 1) => {
//         setLoading(true);
//         setError(null);

//         const MOCK_WAGES = [
//             { id: 1, employee_name: 'RF001 - John Doe', date_of_payment: '2025-10-18', days_worked: 22, monthly_pay: 2000000, amount_paid: 2200000, deduction: 0, noted_reason: 'Full attendance, bonus' },
//             { id: 2, employee_name: 'RF002 - Jane Smith', date_of_payment: '2025-10-16', days_worked: 20, monthly_pay: 2000000, amount_paid: 2000000, deduction: 0, noted_reason: 'Sick leave 2 days' },
//             { id: 3, employee_name: 'RF003 - Peter Jones', date_of_payment: '2025-10-16', days_worked: 15, monthly_pay: 2000000, amount_paid: 1200000, deduction: 800000, noted_reason: 'Missed 8 days' },
//             { id: 4, employee_name: 'RF004 - Alice Brown', date_of_payment: '2025-10-17', days_worked: 25, monthly_pay: 2000000, amount_paid: 2200000, deduction: 0, noted_reason: 'Overtime bonus' },
//             { id: 5, employee_name: 'RF005 - David Lee', date_of_payment: '2025-10-17', days_worked: 18, monthly_pay: 2000000, amount_paid: 1512000, deduction: 488000, noted_reason: 'Late attendance penalties' },
//             { id: 6, employee_name: 'RF006 - Mark Johnson', date_of_payment: '2025-10-15', days_worked: 22, monthly_pay: 2000000, amount_paid: 2200000, deduction: 0, noted_reason: 'Full attendance' },
//             { id: 7, employee_name: 'RF007 - Sarah Davis', date_of_payment: '2025-10-14', days_worked: 20, monthly_pay: 2000000, amount_paid: 2000000, deduction: 0, noted_reason: 'Sick leave 2 days' },
//             { id: 8, employee_name: 'RF008 - Tom Wilson', date_of_payment: '2025-10-13', days_worked: 15, monthly_pay: 2000000, amount_paid: 1200000, deduction: 800000, noted_reason: 'Missed 8 days' },
//             { id: 9, employee_name: 'RF009 - Emma White', date_of_payment: '2025-10-12', days_worked: 25, monthly_pay: 2000000, amount_paid: 2200000, deduction: 0, noted_reason: 'Overtime bonus' },
//             { id: 10, employee_name: 'RF010 - Alex Green', date_of_payment: '2025-10-11', days_worked: 22, monthly_pay: 2000000, amount_paid: 2200000, deduction: 0, noted_reason: 'Full attendance' },
//             { id: 11, employee_name: 'RF011 - Chloe Black', date_of_payment: '2025-10-10', days_worked: 20, monthly_pay: 2000000, amount_paid: 2000000, deduction: 0, noted_reason: 'Sick leave 2 days' },
//         ];
        
//         try {
//             const response = await fetch(`${Wage_API_Endpoint}?page=${page}&page_size=${itemsPerPage}`);
//             if (!response.ok) throw new Error("API not available, using mock data.");
//             const data = await response.json();
//             setWages(data.results || data);
//             setTotalPages(Math.ceil((data.count || (data.results || data).length) / itemsPerPage));
//             setError(null);
//         } catch (err) {
//             console.warn(`API fetch failed, using mock data: ${err.message}`);
//             const startIndex = (page - 1) * itemsPerPage;
//             const paginatedData = MOCK_WAGES.slice(startIndex, startIndex + itemsPerPage);
//             setWages(paginatedData);
//             setTotalPages(Math.ceil(MOCK_WAGES.length / itemsPerPage));
//         } finally {
//             setLoading(false);
//         }
//     }, [itemsPerPage]);

//     useEffect(() => {
//         fetchWages(currentPage);
//     }, [fetchWages, currentPage]);

//     // --- Sorting & Pagination Logic ---
//     const sortedWages = React.useMemo(() => {
//         const base = Array.isArray(wages) ? wages : [];
//         let sortableItems = [...base];
//         if (sortConfig.key !== null) {
//             sortableItems.sort((a, b) => {
//                 const aValue = a[sortConfig.key];
//                 const bValue = b[sortConfig.key];
                
//                 if (TABLE_HEADERS.find(h => h.key === sortConfig.key)?.type === 'number') {
//                     const numA = parseFloat(aValue || 0);
//                     const numB = parseFloat(bValue || 0);
//                     return sortConfig.direction === 'ascending' ? numA - numB : numB - numA;
//                 }
                
//                 if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
//                 if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
//                 return 0;
//             });
//         }
//         return sortableItems;
//     }, [wages, sortConfig]);

//     const requestSort = (key) => {
//         let direction = 'ascending';
//         if (sortConfig.key === key && sortConfig.direction === 'ascending') {
//             direction = 'descending';
//         }
//         setSortConfig({ key, direction });
//     };

//     const handlePageChange = (page) => {
//         setCurrentPage(page);
//     };

//     const getSortIcon = (key) => {
//         if (sortConfig.key !== key) return null;
//         return sortConfig.direction === 'ascending' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
//     };

//     // --- Component Rendering ---

//     const KPICards = () => (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//             {/* Card 1: Total Wages Paid */}
//             <div className="bg-white p-6 rounded-2xl shadow-lg">
//                 <div className="flex items-center justify-between mb-2">
//                     <p className="text-sm font-medium text-gray-500 flex items-center">
//                         <DollarSign className="w-4 h-4 mr-1" stroke={CoffeeColors.SUCCESS_GREEN} />
//                         Total Wages Paid (This Period)
//                     </p>
//                     <TrendingUpIcon className="w-4 h-4" stroke={CoffeeColors.SUCCESS_GREEN} strokeWidth={2.2} />
//                 </div>
//                 <p className="text-4xl font-extrabold text-gray-900 leading-none">UGX {formatUGX(12500000)}</p>
//                 <p className="text-xs text-success mt-2 font-medium">+15.3% vs last month</p>
//             </div>
            
//             {/* Card 2: Avg. Wage/Employee */}
//             <div className="bg-white p-6 rounded-2xl shadow-lg">
//                 <div className="flex items-center justify-between mb-2">
//                     <p className="text-sm font-medium text-gray-500 flex items-center">
//                         <Wallet className="w-4 h-4 mr-1" stroke={CoffeeColors.MEDIUM_BROWN} />
//                         Avg. Wage/Employee
//                     </p>
//                     <TrendingUpIcon className="w-4 h-4 text-error rotate-180" stroke={CoffeeColors.ERROR_RED} strokeWidth={2.2} />
//                 </div>
//                 <p className="text-4xl font-extrabold text-gray-900 leading-none">UGX {formatUGX(250000)}</p>
//                 <p className="text-xs text-error mt-2 font-medium">-8.1% from last month</p>
//             </div>

//             {/* Card 3: Total Employees */}
//             <div className="bg-white p-6 rounded-2xl shadow-lg">
//                 <div className="flex items-center justify-between mb-2">
//                     <p className="text-sm font-medium text-gray-500 flex items-center">
//                         <UserIcon className="w-4 h-4 mr-1" stroke={CoffeeColors.GRAY_TEXT} />
//                         Total Employees
//                     </p>
//                     <UserIcon className="w-4 h-4 text-gray-500" strokeWidth={2.2} />
//                 </div>
//                 <p className="text-4xl font-extrabold text-gray-900 leading-none">50</p>
//                 <p className="text-xs text-gray-500 mt-2 font-medium">Stable over last quarter</p>
//             </div>
//         </div>
//     );

//     const renderTableContent = () => {
//         if (loading) {
//             return (
//                 <tr className='h-24'>
//                     <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-gray-600">
//                         <Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-accent-btn" />
//                         Loading wage records...
//                     </td>
//                 </tr>
//             );
//         }

//         if (error) {
//             return (
//                 <tr className='h-24'>
//                     <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-error font-medium">
//                         {error}
//                     </td>
//                 </tr>
//             );
//         }

//         if (sortedWages.length === 0) {
//             return (
//                 <tr className='h-24'>
//                     <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-gray-500 italic">
//                         No wage records found. Click "Record New Wage" or "Refresh Data".
//                     </td>
//                 </tr>
//             );
//         }

//         return sortedWages.map((wage, index) => {
//             const dateStr = wage.date_of_payment ? new Date(wage.date_of_payment).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }) : 'N/A';
//             return (
//                 <tr key={index} className="border-b border-gray-100 transition-colors duration-150 hover:bg-light-coffee-brown/40">
//                     <td className="px-6 py-3 text-left font-medium text-text-default text-sm max-w-[200px] truncate">{wage.employee_name || 'N/A'}</td>
//                     <td className="px-6 py-3 text-center text-gray-600">{dateStr}</td>
//                     <td className="px-6 py-3 text-center text-gray-600">{wage.days_worked || 0}</td>
//                     <td className="px-6 py-3 text-right text-text-default font-semibold whitespace-nowrap">{formatUGX(wage.monthly_pay)}</td>
//                     <td className="px-6 py-3 text-right text-success font-bold whitespace-nowrap">{formatUGX(wage.amount_paid)}</td>
//                     <td className="px-6 py-3 text-right text-error whitespace-nowrap">{formatUGX(wage.deduction)}</td>
//                     <td className="px-6 py-3 text-left text-xs italic text-gray-500 max-w-xs truncate">{wage.noted_reason || '-'}</td>
//                     <td className="px-6 py-3 text-center">
//                         <div className="flex items-center justify-center space-x-2">
//                             <button onClick={() => alert(`Viewing wage for ${wage.employee_name}`)} className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors">
//                                 <Eye className="w-4 h-4" />
//                             </button>
//                             <button onClick={() => alert(`Editing wage for ${wage.employee_name}`)} className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors">
//                                 <Edit className="w-4 h-4" />
//                             </button>
//                             <button onClick={() => alert(`Deleting wage for ${wage.employee_name}`)} className="text-error hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors">
//                                 <Trash2 className="w-4 h-4" />
//                             </button>
//                         </div>
//                     </td>
//                 </tr>
//             );
//         });
//     };

//     const mobilePadding = 'p-4 sm:p-6 md:p-8';

//     return (
//         <SideNav>
//             <main className={`${mobilePadding} pt-0`}>
//                 <h1 className="text-3xl sm:text-4xl font-bold text-text-default mb-2">Welcome Back!</h1> {/* Added Welcome Back! */}
//                 <h2 className="text-2xl sm:text-3xl font-bold text-text-default mb-8">
//                     Wages Records Overview
//                 </h2>
                
//                 <KPICards />

//                 {/* Action Bar */}
//                 <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
//                     <div className="flex gap-3">
//                         <Button onClick={() => window.location.assign('/wage-entry')} className="py-2 px-4 shadow-xl">
//                             <Plus className="w-4 h-4 mr-2" />
//                             Record New Wage
//                         </Button>
//                         <Button 
//                             type="secondary" 
//                             onClick={() => alert('Exporting data...')} 
//                             className="py-2 px-4 shadow-xl"
//                         >
//                             Export to Excel
//                         </Button>
//                     </div>
//                     <div className="flex gap-3 items-center">
//                         <Button type="secondary" onClick={() => fetchWages(currentPage)} disabled={loading} className="py-2 px-4 shadow-xl">
//                             <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
//                             Refresh Data
//                         </Button>
//                         {/* Filter by Dropdown */}
//                         <div className="relative inline-block text-left">
//                             <select 
//                                 className="appearance-none bg-white border border-gray-300 rounded-xl py-2 pl-4 pr-8 text-sm text-gray-700 leading-tight focus:outline-none focus:ring-accent-btn focus:border-accent-btn shadow-lg hover:shadow-xl transition duration-300 ease-in-out"
//                                 defaultValue=""
//                             >
//                                 <option value="" disabled>Filter by</option>
//                                 <option value="date">Date</option>
//                                 <option value="employee">Employee</option>
//                                 <option value="deduction">Deduction Status</option>
//                             </select>
//                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
//                                 <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Wage Records Table Container */}
//                 <div
//                     className="max-w-full w-full mx-auto p-0 shadow-xl rounded-2xl overflow-hidden bg-white transition-all duration-300"
//                 >
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full divide-y divide-gray-100">
//                             <thead className="sticky top-0 z-10 bg-light-coffee-brown text-text-default">
//                                 <tr>
//                                     {TABLE_HEADERS.map((header) => (
//                                         <th
//                                             key={header.key}
//                                             className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 cursor-pointer ${
//                                                 header.align === 'right' ? 'text-right' : header.align === 'center' ? 'text-center' : 'text-left'
//                                             } hover:bg-accent-btn/90 whitespace-nowrap`}
//                                             onClick={() => header.icon !== null && requestSort(header.key)}
//                                             scope="col"
//                                         >
//                                             <div className={`flex items-center ${header.align === 'right' ? 'justify-end' : header.align === 'center' ? 'justify-center' : 'justify-start'}`}>
//                                                 {header.icon && <header.icon className="w-4 h-4 mr-1" />}
//                                                 {header.label}
//                                                 {getSortIcon(header.key)}
//                                             </div>
//                                         </th>
//                                     ))}
//                                 </tr>
//                             </thead>
//                             <tbody className="bg-white/80 divide-y divide-gray-100 text-sm text-text-default">
//                                 {renderTableContent()}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Pagination Controls */}
//                     {totalPages > 1 && (
//                         <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-100">
//                             <div className="flex items-center text-sm text-gray-700">
//                                 <span className="text-gray-600">Page {currentPage} of {totalPages}</span>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                                 <Button
//                                     onClick={() => handlePageChange(currentPage - 1)}
//                                     disabled={currentPage === 1 || loading}
//                                     className="px-4 py-1.5 text-xs bg-light-coffee-brown text-active-link-text hover:bg-light-coffee-brown/80 rounded-lg shadow-sm"
//                                     type="secondary" 
//                                 >
//                                     Previous
//                                 </Button>
//                                 <Button
//                                     onClick={() => handlePageChange(currentPage + 1)}
//                                     disabled={currentPage === totalPages || loading}
//                                     className="px-4 py-1.5 text-xs bg-light-coffee-brown text-active-link-text hover:bg-light-coffee-brown/80 rounded-lg shadow-sm"
//                                     type="secondary"
//                                 >
//                                     Next
//                                 </Button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </main>
//         </SideNav>
//     );
// }

// export default WageDisplayPage;



import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, DollarSign, Calendar, User, MinusCircle, Wallet, Loader2, ArrowUp, ArrowDown, Plus, X, UserIcon, Edit, Trash2, FileText } from 'lucide-react';
import { SideNav } from '../components/SideNav';

const styleElement = document.createElement('style');
styleElement.innerHTML = `
    body, html {
        overflow-x: hidden !important;
        max-width: 100vw !important;
    }
`;
document.head.appendChild(styleElement);

// --- CONFIGURATION & UTILITIES ---

const CoffeeColors = {
    SCREEN_BG: '#FFF8F6', ACTIVE_LINK_BG: '#efebe9', ACTIVE_LINK_TEXT: '#783A1E', DARK_BROWN: '#4A3423', MEDIUM_BROWN: '#795548', GRAY_TEXT: '#8D8D8D', SUCCESS_GREEN: '#34A853', ERROR_RED: '#EA4335',
    MODAL_HEADER_BG: '#FFFFFF',
};

const formatUGX = (amount) => {
    if (typeof amount !== 'number') return amount || '0';
    return amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const MOCK_WAGES_DATA = [
    { id: 1, employee_name: 'RF001 - John Doe', date_of_payment: '2025-10-18', days_worked: 22, monthly_pay: 2000000, amount_paid: 2200000, deduction: 0, noted_reason: 'Full attendance, bonus' },
    { id: 2, employee_name: 'RF002 - Jane Smith', date_of_payment: '2025-10-16', days_worked: 20, monthly_pay: 2000000, amount_paid: 2000000, deduction: 0, noted_reason: 'Sick leave 2 days' },
    { id: 3, employee_name: 'RF003 - Peter Jones', date_of_payment: '2025-10-16', days_worked: 15, monthly_pay: 2000000, amount_paid: 1200000, deduction: 800000, noted_reason: 'Missed 8 days' },
];

// --- SHARED COMPONENTS (Local Definitions for Modal) ---

// Button now accepts htmlType and sets the native type attribute.
// Default htmlType is "button" so buttons inside forms do not implicitly submit.
const Button = ({ children, onClick, className = '', disabled, type = 'primary', htmlType = 'button', style }) => {
    const baseClasses = `px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold`;
    let colorClasses;
    if (type === 'secondary') {
        colorClasses = `bg-[${CoffeeColors.ACTIVE_LINK_BG}] text-[${CoffeeColors.ACTIVE_LINK_TEXT}] hover:bg-[${CoffeeColors.ACTIVE_LINK_BG}]/80`;
    } else {
        colorClasses = `bg-[${CoffeeColors.MEDIUM_BROWN}] text-white hover:bg-[${CoffeeColors.MEDIUM_BROWN}]/90`;
    }

    return (
        <button
            type={htmlType}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${colorClasses} ${className}`}
            style={style}
        >
            {children}
        </button>
    );
};

// Input forwards unknown props (id, autoComplete, aria-*, etc.) and sets id default from name.
const Input = ({ type = 'text', name, id, value, onChange, placeholder, className = '', style, readOnly = false, ...rest }) => (
    <input
        id={id || name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        {...rest}
        className={`w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#795548] focus:border-[#795548] text-[#4A3423] ${className}`}
        style={style}
    />
);

// =========================================================
// --- WagesModal Component (The Popup Form) ---
// =========================================================

const WagesModal = ({ isOpen, onClose, onSaveSuccess, initialData = {} }) => {
    const safeInitial = initialData || {};
    const [form, setForm] = useState({
        employee_name: safeInitial.employee_name || '',
        date_of_payment: safeInitial.date_of_payment || new Date().toISOString().substring(0, 10),
        days_worked: safeInitial.days_worked || '',
        monthly_pay: safeInitial.monthly_pay || '',
         amount_paid: safeInitial.amount_paid || '',
         deduction: safeInitial.deduction || '0',
         noted_reason: safeInitial.noted_reason || '',
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const safeData = initialData || {};
            setForm({
                employee_name: safeData.employee_name || '',
                date_of_payment: safeData.date_of_payment || new Date().toISOString().substring(0, 10),
                days_worked: safeData.days_worked || '',
                monthly_pay: safeData.monthly_pay || '',
                amount_paid: safeData.amount_paid || '',
                deduction:  safeData.deduction || '0',
                noted_reason: safeData.noted_reason || '',
            });
            setErrors({});
            setMessage('');
            setAttemptedSubmit(false);
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setMessage('');
        if (attemptedSubmit) {
            const validation = validate({ ...form, [name]: value });
            setErrors(validation);
        } else {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const getBorderClass = (fieldName, required = true) => {
        if (errors[fieldName]) {
            return `border-2 border-[#EA4335]`;
        }
        if (attemptedSubmit && required && form[fieldName] && !errors[fieldName]) {
            return `border-2 border-[#34A853]`;
        }
        if (attemptedSubmit && !required && form[fieldName] && !errors[fieldName]) {
            return `border-2 border-gray-300`;
        }
        return '';
    };

    const validate = (currentForm = form) => {
        const newErrors = {};
        if (!currentForm.employee_name.trim()) newErrors.employee_name = 'Employee name is required.';
        if (!currentForm.date_of_payment) newErrors.date_of_payment = 'Date of payment is required.';
        if (currentForm.days_worked === '' || isNaN(Number(currentForm.days_worked)) || Number(currentForm.days_worked) < 0) newErrors.days_worked = 'Valid days worked required.';
        if (currentForm.amount_paid === '' || isNaN(Number(currentForm.amount_paid)) || Number(currentForm.amount_paid) < 0) newErrors.amount_paid = 'Valid amount paid required.';
        if (currentForm.deduction === '' || isNaN(Number(currentForm.deduction)) || Number(currentForm.deduction) < 0) newErrors.deduction = 'Valid deduction required.';
        if (currentForm.monthly_pay !== '' && (isNaN(Number(currentForm.monthly_pay)) || Number(currentForm.monthly_pay) < 0)) newErrors.monthly_pay = 'Monthly pay must be a valid number.';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAttemptedSubmit(true);
        const validation = validate();
        setErrors(validation);

        if (Object.keys(validation).length > 0) {
            setMessage('Please fill in the required fields to submit.');
            return;
        }

        setSubmitting(true);
        setMessage('');

        const payload = {
            employee_name: form.employee_name,
            date_of_payment: form.date_of_payment,
            days_worked: Number(form.days_worked) || 0,
            monthly_pay: form.monthly_pay === '' ? null : Number(form.monthly_pay),
            amount_paid: Number(form.amount_paid) || 0,
            deduction: Number(form.deduction) || 0,
            noted_reason: form.noted_reason || '',
        };

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            console.log('Mock API POST Success with payload:', payload);
            setMessage('You have successfully recorded a new wage!');
            setTimeout(() => {
                onSaveSuccess(payload);
            }, 1000);
        } catch (err) {
            console.error('Network error/Mock failure:', err);
            setMessage('Mock network error. Wage was NOT saved.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const EntryForm = (
        <form onSubmit={handleSubmit} className="p-0 flex flex-col h-full">
            <div className="p-6 overflow-y-auto flex-1">
                <h3 className="text-lg font-semibold text-[#4A3423] mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-[#795548]" />
                    Employee Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="md:col-span-2">
                        <label htmlFor="employee_name" className="block mb-1 text-sm font-medium text-gray-700">Full Name</label>
                        <Input
                            name="employee_name"
                            value={form.employee_name}
                            onChange={handleChange}
                            placeholder="e.g., RF001 - John Doe"
                            className={`py-2.5 ${getBorderClass('employee_name')}`}
                        />
                        {errors.employee_name && <p className="mt-1 text-xs text-[#EA4335] flex items-center"><MinusCircle className='w-3 h-3 mr-1'/> Please fill in the required field.</p>}
                    </div>

                    <div>
                        <label htmlFor="date_of_payment" className="block mb-1 text-sm font-medium text-gray-700">Date Paid</label>
                        <Input
                            type="date"
                            name="date_of_payment"
                            value={form.date_of_payment}
                            onChange={handleChange}
                            className={`py-2.5 ${getBorderClass('date_of_payment')}`}
                        />
                        {errors.date_of_payment && <p className="mt-1 text-xs text-[#EA4335] flex items-center"><MinusCircle className='w-3 h-3 mr-1'/> Please fill in the required field.</p>}
                    </div>

                    <div>
                        <label htmlFor="days_worked" className="block mb-1 text-sm font-medium text-gray-700">Days Worked</label>
                        <Input
                            type="number"
                            name="days_worked"
                            value={form.days_worked}
                            onChange={handleChange}
                            placeholder="e.g. 22"
                            className={`py-2.5 ${getBorderClass('days_worked')}`}
                        />
                        {errors.days_worked && <p className="mt-1 text-xs text-[#EA4335] flex items-center"><MinusCircle className='w-3 h-3 mr-1'/> Please fill in the required field.</p>}
                    </div>
                </div>

                <hr className="border-gray-200 mb-6" />

                <h3 className="text-lg font-semibold text-[#4A3423] mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-[#795548]" />
                    Wage Payment Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label htmlFor="monthly_pay" className="block mb-1 text-sm font-medium text-gray-700">Monthly Base Pay (UGX)</label>
                        <Input
                            type="number"
                            name="monthly_pay"
                            value={form.monthly_pay}
                            onChange={handleChange}
                            placeholder="e.g. 2000000 (Optional)"
                            className={`py-2.5 ${getBorderClass('monthly_pay', false)}`}
                        />
                        {errors.monthly_pay && <p className="mt-1 text-xs text-[#EA4335] flex items-center"><MinusCircle className='w-3 h-3 mr-1'/> {errors.monthly_pay}</p>}
                    </div>

                    <div>
                        <label htmlFor="deduction" className="block mb-1 text-sm font-medium text-gray-700">Deduction (UGX)</label>
                        <Input
                            type="number"
                            name="deduction"
                            value={form.deduction}
                            onChange={handleChange}
                            placeholder="e.g. 0 or 800000"
                            className={`py-2.5 ${getBorderClass('deduction')}`}
                        />
                        {errors.deduction && <p className="mt-1 text-xs text-[#EA4335] flex items-center"><MinusCircle className='w-3 h-3 mr-1'/> Please fill in the required field.</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="amount_paid" className="block mb-1 text-sm font-medium text-gray-700">Total Amount Paid (UGX)</label>
                        <Input
                            type="number"
                            name="amount_paid"
                            value={form.amount_paid}
                            onChange={handleChange}
                            placeholder="e.g. 2200000"
                            className={`py-2.5 font-bold ${getBorderClass('amount_paid')}`}
                        />
                        {errors.amount_paid && <p className="mt-1 text-xs text-[#EA4335] flex items-center"><MinusCircle className='w-3 h-3 mr-1'/> Please fill in the required field.</p>}
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-[#4A3423] mb-4 flex items-center mt-6">
                    <FileText className="w-5 h-5 mr-2 text-[#795548]" />
                    Payment Reason / Note
                </h3>
                <div className="md:col-span-2">
                    <label htmlFor="noted_reason" className="block mb-1 text-sm font-medium text-gray-700">Detailed Note</label>
                    <textarea
                        id="noted_reason"
                        name="noted_reason"
                        value={form.noted_reason}
                        onChange={handleChange}
                        placeholder="Brief reason (e.g., Full attendance, Overtime bonus, Missed 8 days)"
                        rows="3"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#795548] focus:border-[#795548] text-[#4A3423] resize-none"
                    />
                </div>

                {message && (
                    <div style={{
                        marginTop: '15px',
                        padding: '10px',
                        borderRadius: '6px',
                        backgroundColor: message.includes('successfully recorded a new wage') ? '#E8F5E8' : '#FFEBEE',
                        border: `1px solid ${message.includes('successfully recorded a new wage') ? CoffeeColors.SUCCESS_GREEN : CoffeeColors.ERROR_RED}`,
                        color: message.includes('successfully recorded a new wage') ? CoffeeColors.SUCCESS_GREEN : CoffeeColors.ERROR_RED,
                        fontSize: '12px',
                        fontWeight: '500',
                        textAlign: 'center'
                    }}>
                        {message}
                    </div>
                )}
            </div>

            <div className="p-5 flex justify-end space-x-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <button
                    onClick={onClose}
                    type="button"
                    className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    style={{
                        background: submitting ? '#795548' : 'linear-gradient(135deg, #8B4513 0%, #6d3410 100%)',
                    }}
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Wage Record'
                    )}
                </button>
            </div>
        </form>
    );

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-center transition-all duration-300 backdrop-blur-sm"
            style={{
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(75, 52, 35, 0.5) 100%)',
                animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] transition-all duration-300 ease-out transform scale-100 flex flex-col m-4"
                style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 15px rgba(139, 69, 19, 0.1)',
                    animation: 'slideUp 0.3s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <header
                    className="flex justify-between items-center p-5 rounded-t-2xl flex-shrink-0 border-b-2"
                    style={{
                        background: 'linear-gradient(135deg, #8B4513 0%, #6d3410 100%)',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Wage Entry Form</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {EntryForm}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
};

// =========================================================
// --- WagesPage Component (Main App) ---
// =========================================================

const TABLE_HEADERS = [
    { key: 'employee_name', label: 'Employee', icon: User, type: 'string', align: 'left' },
    { key: 'date_of_payment', label: 'Date Paid', icon: Calendar, type: 'date', align: 'center' },
    { key: 'days_worked', label: 'Days Worked', icon: Calendar, type: 'number', align: 'center' },
    { key: 'amount_paid', label: 'Amount Paid', icon: DollarSign, type: 'number', align: 'right' },
    { key: 'deduction', label: 'Deduction', icon: MinusCircle, type: 'number', align: 'right' },
    { key: 'actions', label: 'Actions', icon: null, type: 'actions', align: 'center' },
];

function Wages() {
    const [wages, setWages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'date_of_payment', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWage, setEditingWage] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [wageToDelete, setWageToDelete] = useState(null);
    const itemsPerPage = 7;

    const fetchWages = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const startIndex = (page - 1) * itemsPerPage;
            const paginatedData = MOCK_WAGES_DATA.slice(startIndex, startIndex + itemsPerPage);
            setWages(paginatedData);
            setTotalPages(Math.ceil(MOCK_WAGES_DATA.length / itemsPerPage));
            setError(null);
        } catch (err) {
            console.warn(`API fetch failed, using mock data: ${err.message}`);
            const startIndex = (page - 1) * itemsPerPage;
            const paginatedData = MOCK_WAGES_DATA.slice(startIndex, startIndex + itemsPerPage);
            setWages(paginatedData);
            setTotalPages(Math.ceil(MOCK_WAGES_DATA.length / itemsPerPage));
            setError(null);
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage]);

    useEffect(() => {
        fetchWages(currentPage);
    }, [fetchWages, currentPage]);

    const handleSaveSuccess = (wageData) => {
        if (editingWage) {
            // Update existing wage
            setWages(prevWages => prevWages.map(w => w.id === editingWage.id ? { ...editingWage, ...wageData } : w));

            // Also update MOCK_WAGES_DATA for persistence
            const index = MOCK_WAGES_DATA.findIndex(w => w.id === editingWage.id);
            if (index > -1) {
                MOCK_WAGES_DATA[index] = { ...MOCK_WAGES_DATA[index], ...wageData };
            }
        } else {
            // Add new wage
            const newWage = {
                id: MOCK_WAGES_DATA.length > 0 ? Math.max(...MOCK_WAGES_DATA.map(w => w.id)) + 1 : 1,
                ...wageData
            };

            setWages(prevWages => [newWage, ...prevWages]);
            MOCK_WAGES_DATA.unshift(newWage);
        }

        setIsModalOpen(false);
        setEditingWage(null);
        setCurrentPage(1);
        fetchWages(1);
    };

    const sortedWages = React.useMemo(() => {
        const base = Array.isArray(wages) ? wages : [];
        let sortableItems = [...base];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (TABLE_HEADERS.find(h => h.key === sortConfig.key)?.type === 'number') {
                    const numA = parseFloat(aValue || 0);
                    const numB = parseFloat(bValue || 0);
                    return sortConfig.direction === 'ascending' ? numA - numB : numB - numA;
                }

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [wages, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handlePageChange = (page) => setCurrentPage(page);

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
    };

    const handleEditWage = (wage) => {
        setEditingWage(wage);
        setIsModalOpen(true);
    };

    const handleDeleteWage = (wage) => {
        setWageToDelete(wage);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (wageToDelete) {
            // Update the wages list by removing the deleted wage
            setWages(prevWages => prevWages.filter(w => w.id !== wageToDelete.id));

            // Also remove from MOCK_WAGES_DATA if needed for persistence in this session
            const index = MOCK_WAGES_DATA.findIndex(w => w.id === wageToDelete.id);
            if (index > -1) {
                MOCK_WAGES_DATA.splice(index, 1);
            }

            setShowDeleteModal(false);
            setWageToDelete(null);

            // Refresh the current page
            fetchWages(currentPage);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setWageToDelete(null);
    };

    // Calculate KPIs with live updates from MOCK_WAGES_DATA
    const kpis = useMemo(() => {
        if (!MOCK_WAGES_DATA || MOCK_WAGES_DATA.length === 0) {
            return {
                totalWagesPaid: 0,
                averageWagePerEmployee: 0,
                totalEmployees: 0,
                totalDeductions: 0
            };
        }

        const totalWagesPaid = MOCK_WAGES_DATA.reduce((sum, wage) => sum + (wage.amount_paid || 0), 0);
        const totalDeductions = MOCK_WAGES_DATA.reduce((sum, wage) => sum + (wage.deduction || 0), 0);

        // Count unique employees
        const uniqueEmployees = new Set(MOCK_WAGES_DATA.map(wage => wage.employee_name)).size;
        const averageWagePerEmployee = uniqueEmployees > 0 ? totalWagesPaid / uniqueEmployees : 0;

        return {
            totalWagesPaid,
            averageWagePerEmployee,
            totalEmployees: uniqueEmployees,
            totalDeductions
        };
    }, [wages]); // Re-calculate when wages state changes

    const renderTableContent = () => {
        if (loading) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-gray-600">
                        <Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-[#795548]" />
                        Loading wage records...
                    </td>
                </tr>
            );
        }

        if (error || sortedWages.length === 0) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-gray-500 italic">
                        {error || 'No wage records found. Click "Record New Wage".'}
                    </td>
                </tr>
            );
        }

        return sortedWages.map((wage, index) => {
            const dateStr = wage.date_of_payment ? new Date(wage.date_of_payment).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
            return (
                <tr key={index} className="border-b border-gray-100 transition-colors duration-150 hover:bg-[#efebe9]/30">
                    <td className="px-6 py-4 text-left font-semibold text-[#4A3423]">{wage.employee_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{dateStr}</td>
                    <td className="px-6 py-4 text-center text-gray-700 font-medium">{wage.days_worked || 0}</td>
                    <td className="px-6 py-4 text-right text-[#34A853] font-bold whitespace-nowrap">UGX {formatUGX(wage.amount_paid)}</td>
                    <td className="px-6 py-4 text-right text-[#EA4335] font-semibold whitespace-nowrap">UGX {formatUGX(wage.deduction)}</td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                            <button
                                onClick={() => handleEditWage(wage)}
                                className="text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteWage(wage)}
                                className="text-error hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </td>
                </tr>
            );
        });
    };

    const mobilePadding = 'p-4 sm:p-6 md:p-8';

    return (
        <SideNav>
            <main className={`${mobilePadding} pt-0`} style={{ maxWidth: '100%', overflowX: 'hidden' }}>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#4A3423] mb-8">Wages Records Overview</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Card 1: Total Wages Paid */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-500 flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" stroke={CoffeeColors.SUCCESS_GREEN} />
                                Total Wages Paid
                            </p>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <DollarSign className="w-5 h-5" stroke={CoffeeColors.SUCCESS_GREEN} strokeWidth={2.5} />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900 leading-none">UGX {formatUGX(kpis.totalWagesPaid)}</p>
                        <p className="text-xs text-gray-500 mt-2 font-medium">{MOCK_WAGES_DATA.length} wage record(s)</p>
                    </div>

                    {/* Card 2: Average Wage Per Employee */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-500 flex items-center">
                                <Wallet className="w-4 h-4 mr-1" stroke={CoffeeColors.MEDIUM_BROWN} />
                                Avg. Wage/Employee
                            </p>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Wallet className="w-5 h-5" stroke={CoffeeColors.MEDIUM_BROWN} strokeWidth={2.5} />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900 leading-none">UGX {formatUGX(Math.round(kpis.averageWagePerEmployee))}</p>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Per unique employee</p>
                    </div>

                    {/* Card 3: Total Employees Paid */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-500 flex items-center">
                                <UserIcon className="w-4 h-4 mr-1" stroke={CoffeeColors.GRAY_TEXT} />
                                Employees Paid
                            </p>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <UserIcon className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900 leading-none">{kpis.totalEmployees}</p>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Unique employees</p>
                    </div>

                    {/* Card 4: Total Deductions */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-500 flex items-center">
                                <MinusCircle className="w-4 h-4 mr-1" stroke={CoffeeColors.ERROR_RED} />
                                Total Deductions
                            </p>
                            <div className="p-2 bg-red-50 rounded-lg">
                                <MinusCircle className="w-5 h-5" stroke={CoffeeColors.ERROR_RED} strokeWidth={2.5} />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900 leading-none">UGX {formatUGX(kpis.totalDeductions)}</p>
                        <p className="text-xs text-[#EA4335] mt-2 font-medium">Total amount deducted</p>
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="py-2 px-4 shadow-xl rounded-xl flex items-center font-semibold text-white hover:shadow-2xl transition-all duration-200"
                            style={{ backgroundColor: '#8B4513' }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Record New Wage
                        </button>
                        <Button type="secondary" onClick={() => alert('Exporting data...')} className="py-2 px-4 shadow-xl">
                            Export to Excel
                        </Button>
                    </div>

                    <div className="flex gap-3 items-center">
                        <button
                            onClick={() => fetchWages(currentPage)}
                            disabled={loading}
                            className="py-2 px-4 shadow-xl rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#efebe9', color: '#783A1E', border: 'none' }}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh Data
                        </button>

                        <div className="relative inline-block text-left">
                            <select className="appearance-none bg-white border border-gray-300 rounded-xl py-2 pl-4 pr-8 text-sm text-gray-700 leading-tight focus:outline-none focus:ring-[#795548] focus:border-[#795548] shadow-lg hover:shadow-xl transition duration-300 ease-in-out" defaultValue="">
                                <option value="" disabled>Filter by</option>
                                <option value="date">Date</option>
                                <option value="employee">Employee</option>
                                <option value="deduction">Deduction Status</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-full w-full mx-auto p-0 shadow-xl rounded-2xl overflow-hidden bg-white transition-all duration-300" style={{ maxWidth: '100%' }}>
                    <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                        <table className="min-w-full divide-y divide-gray-100" style={{ width: '100%', tableLayout: 'auto' }}>
                            <thead className="sticky top-0 z-10 bg-[#efebe9] text-[#4A3423]">
                                <tr>
                                    {TABLE_HEADERS.map((header) => (
                                        <th
                                            key={header.key}
                                            className={`px-6 py-3 text-sm font-semibold uppercase tracking-wider ${header.align === 'right' ? 'text-right' : header.align === 'center' ? 'text-center' : 'text-left'} whitespace-nowrap ${header.icon !== null ? 'cursor-pointer' : ''}`}
                                            onClick={() => header.icon !== null && requestSort(header.key)}
                                            scope="col"
                                        >
                                            <div className={`flex items-center ${header.align === 'right' ? 'justify-end' : header.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                                                {header.icon && <header.icon className="w-4 h-4 mr-1" />}
                                                {header.label}
                                                {getSortIcon(header.key)}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white/80 divide-y divide-gray-100 text-xs text-[#4A3423]">
                                {renderTableContent()}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-100">
                            <div className="flex items-center text-sm text-gray-700">
                                <span className="text-gray-600">Page {currentPage} of {totalPages}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} type="secondary" className="px-3 py-1 text-xs">Previous</Button>
                                <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} type="secondary" className="px-3 py-1 text-xs">Next</Button>
                            </div>
                        </div>
                    )}
                </div>

                <WagesModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingWage(null); }} onSaveSuccess={handleSaveSuccess} initialData={editingWage} />

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div
                        className="fixed inset-0 flex justify-center items-center transition-all duration-300 backdrop-blur-sm"
                        style={{
                            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(75, 52, 35, 0.5) 100%)',
                            zIndex: 1000,
                        }}
                        onClick={cancelDelete}
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-[#4A3423]">Confirm Delete</h3>
                                <button
                                    onClick={cancelDelete}
                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete the wage record for <strong>{wageToDelete?.employee_name}</strong>?
                                <br />
                                <span className="text-sm text-gray-500">This action cannot be undone.</span>
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={cancelDelete}
                                    className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-200"
                                    style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </SideNav>
    );
}

export default Wages;