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

// const Wage_API_Endpoint = 'http://142.93.94.236:8000/api/wages/';

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
import { useNavigate } from 'react-router-dom';
import { RefreshCw, DollarSign, Calendar, User, MinusCircle, Wallet, Loader2, ArrowUp, ArrowDown, Plus, X, UserIcon, Edit, Trash2, Search, Eye } from 'lucide-react';
import { SideNav } from '../components/SideNav';
import { generateAndDownloadVoucher, validateWageRecordForVoucher } from '../utils/voucherGeneration';
import BulkWageSpreadsheet from '../components/BulkWageSpreadsheet';

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
    if (amount === null || amount === undefined || isNaN(amount)) return '0';
    const numAmount = typeof amount === 'number' ? amount : Number(amount);
    if (isNaN(numAmount)) return '0';
    return numAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const WAGES_API_ENDPOINT = 'http://142.93.94.236:8000/api/wages/';

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

// =========================================================
// --- BulkWageRecordModal Component (Bulk Recording) ---
// =========================================================

const BulkWageRecordModal = ({ isOpen, onClose, onSaveSuccess }) => {
    const [staff, setStaff] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(true);
    const [selectedStaffIds, setSelectedStaffIds] = useState([]);
    const [commonData, setCommonData] = useState({
        date_of_payment: new Date().toISOString().substring(0, 10),
        days_missed: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                setLoadingStaff(true);
                const response = await fetch('http://142.93.94.236:8000/api/staff/');
                if (!response.ok) throw new Error('Failed to fetch staff');
                const data = await response.json();
                const staffList = Array.isArray(data) ? data : data.results || [];
                setStaff(staffList);
            } catch (err) {
                console.error('Error fetching staff:', err);
                setStaff([]);
            } finally {
                setLoadingStaff(false);
            }
        };

        if (isOpen) {
            fetchStaff();
            setSelectedStaffIds([]);
            setCommonData({
                date_of_payment: new Date().toISOString().substring(0, 10),
                days_missed: '',
            });
            setErrors({});
            setMessage('');
        }
    }, [isOpen]);

    const handleStaffToggle = (staffId) => {
        console.log('Toggling staff ID:', staffId);
        console.log('Current selected IDs:', selectedStaffIds);
        setSelectedStaffIds(prev => {
            const newSelection = prev.includes(staffId)
                ? prev.filter(id => id !== staffId)
                : [...prev, staffId];
            console.log('New selected IDs:', newSelection);
            return newSelection;
        });
    };

    const handleSelectAll = () => {
        if (selectedStaffIds.length === staff.length) {
            setSelectedStaffIds([]);
        } else {
            setSelectedStaffIds(staff.map(s => s.id));
        }
    };

    const handleCommonDataChange = (e) => {
        const { name, value } = e.target;
        setCommonData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (selectedStaffIds.length === 0) {
            newErrors.staff = 'Please select at least one employee';
        }
        if (!commonData.date_of_payment) {
            newErrors.date_of_payment = 'Date of payment is required';
        }
        if (commonData.days_missed === '' || isNaN(Number(commonData.days_missed)) || Number(commonData.days_missed) < 0) {
            newErrors.days_missed = 'Valid days missed required';
        } else if (Number(commonData.days_missed) >= 30) {
            newErrors.days_missed = 'Days missed must be less than 30';
        }
        return newErrors;
    };

    const calculateAmountPaid = (monthlySalary, daysMissed) => {
        const salary = parseFloat(monthlySalary) || 0;
        const missed = parseFloat(daysMissed) || 0;
        if (salary <= 0) return 0;
        const dailyRate = salary / 30;
        const daysWorked = 30 - missed;
        const amountPaid = dailyRate * daysWorked;
        return Math.max(0, Math.round(amountPaid / 100) * 100);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validation = validate();
        setErrors(validation);

        if (Object.keys(validation).length > 0) {
            setMessage('Please fix the errors before submitting');
            return;
        }

        setSubmitting(true);
        setMessage('');

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Token ${token}`;

            // Fetch logged-in user's name
            let recordedBy = 'Unknown User';
            try {
                const userPhone = localStorage.getItem('userPhone') || sessionStorage.getItem('userPhone');
                if (userPhone) {
                    const userResponse = await fetch('http://142.93.94.236:8000/api/users/', { headers: token ? { 'Authorization': `Token ${token}` } : {} });
                    if (userResponse.ok) {
                        const users = await userResponse.json();
                        const usersList = Array.isArray(users) ? users : users.results || [];
                        const currentUser = usersList.find(user => user.phone === userPhone);
                        if (currentUser) {
                            recordedBy = currentUser.full_name ||
                                       `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() ||
                                       currentUser.name ||
                                       currentUser.username ||
                                       localStorage.getItem('userName') ||
                                       'Unknown User';
                        }
                    }
                }
            } catch (userErr) {
                console.error('Error fetching user:', userErr);
                recordedBy = localStorage.getItem('userName') || 'Unknown User';
            }

            const staffMember = staff.find(s => s.id === selectedStaffId);
            if (!staffMember) {
                setMessage('Selected employee not found');
                setSubmitting(false);
                return;
            }

            const monthlySalary = staffMember.monthly_salary || staffMember.base_pay || 0;
            const amountPaid = calculateAmountPaid(monthlySalary, commonData.days_missed);

            const payload = {
                employee_name: `${staffMember.first_name} ${staffMember.last_name}`,
                staff: staffMember.id,
                date_of_payment: commonData.date_of_payment,
                days_missed: parseInt(commonData.days_missed, 10) || 0,
                amount_paid: amountPaid,
                recorded_by: recordedBy,
            };

            const response = await fetch(WAGES_API_ENDPOINT, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setMessage(`Successfully recorded wage for ${staffMember.first_name} ${staffMember.last_name}!`);
                setTimeout(() => {
                    // Reset form for next entry
                    setSelectedStaffId(null);
                    setCommonData({
                        date_of_payment: new Date().toISOString().substring(0, 10),
                        days_missed: '',
                    });
                    setMessage('');
                    onSaveSuccess();
                }, 1500);
            } else {
                const errorData = await response.json().catch(() => ({}));
                setMessage(`Failed to record wage. ${errorData.detail || 'Please try again.'}`);
            }
        } catch (err) {
            console.error('Bulk recording error:', err);
            setMessage('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    if (!isOpen) return null;

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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] transition-all duration-300 ease-out transform scale-100 flex flex-col m-4"
                style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 15px rgba(139, 69, 19, 0.1)',
                    animation: 'slideUp 0.3s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200" style={{ backgroundColor: '#FFFFFF' }}>
                    <h2 className="text-xl font-semibold" style={{ color: '#333333' }}>
                        Bulk Wage Recording
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5" style={{ color: '#6B7280' }} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    {/* Common Fields */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-[#4A3423] mb-4">Common Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Date of Payment</label>
                                <Input
                                    type="date"
                                    name="date_of_payment"
                                    value={commonData.date_of_payment}
                                    onChange={handleCommonDataChange}
                                    max={getTodayDate()}
                                    className={`py-2.5 ${errors.date_of_payment ? 'border-2 border-[#EA4335]' : ''}`}
                                />
                                {errors.date_of_payment && <p className="mt-1 text-xs text-[#EA4335]">{errors.date_of_payment}</p>}
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Days Missed (Common for all)</label>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    name="days_missed"
                                    value={commonData.days_missed}
                                    onChange={handleCommonDataChange}
                                    placeholder="e.g. 2"
                                    min="0"
                                    max="29"
                                    className={`py-2.5 ${errors.days_missed ? 'border-2 border-[#EA4335]' : ''}`}
                                />
                                {errors.days_missed && <p className="mt-1 text-xs text-[#EA4335]">{errors.days_missed}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Staff Selection */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-[#4A3423]">
                                Select Employees ({selectedStaffIds.length} selected)
                            </h3>
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="px-4 py-2 text-sm font-medium text-[#795548] bg-[#efebe9] rounded-lg hover:bg-[#e0d5c7] transition-colors"
                            >
                                {selectedStaffIds.length === staff.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        {loadingStaff ? (
                            <div className="text-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin inline-block text-[#795548]" />
                                <p className="text-gray-600 mt-2">Loading staff...</p>
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                                {staff.length === 0 ? (
                                    <p className="text-center py-8 text-gray-500">No staff members found</p>
                                ) : (
                                    staff.map(staffMember => {
                                        const monthlySalary = staffMember.monthly_salary || staffMember.base_pay || 0;
                                        const estimatedPay = calculateAmountPaid(monthlySalary, commonData.days_missed);
                                        const isSelected = selectedStaffIds.includes(staffMember.id);
                                        console.log(`Staff ${staffMember.id} (${staffMember.first_name}):`, isSelected, 'Selected IDs:', selectedStaffIds);
                                        return (
                                            <div
                                                key={staffMember.id}
                                                className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-[#efebe9]' : ''}`}
                                            >
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            handleStaffToggle(staffMember.id);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-5 h-5 text-[#795548] border-gray-300 rounded focus:ring-[#795548] cursor-pointer mr-4"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-[#4A3423]">
                                                            {staffMember.first_name} {staffMember.last_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-4 mt-1">
                                                            <span>ID: {staffMember.staff_id || 'N/A'}</span>
                                                            <span>Monthly: UGX {formatUGX(monthlySalary)}</span>
                                                            {commonData.days_missed !== '' && (
                                                                <span className="text-[#34A853] font-medium">
                                                                    Estimated: UGX {formatUGX(estimatedPay)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                        {errors.staff && <p className="mt-2 text-xs text-[#EA4335]">{errors.staff}</p>}
                    </div>

                    {message && (
                        <div style={{
                            marginTop: '15px',
                            padding: '10px',
                            borderRadius: '6px',
                            backgroundColor: message.includes('Successfully') ? '#E8F5E8' : '#FFEBEE',
                            border: `1px solid ${message.includes('Successfully') ? CoffeeColors.SUCCESS_GREEN : CoffeeColors.ERROR_RED}`,
                            color: message.includes('Successfully') ? CoffeeColors.SUCCESS_GREEN : CoffeeColors.ERROR_RED,
                            fontSize: '12px',
                            fontWeight: '500',
                            textAlign: 'center'
                        }}>
                            {message}
                        </div>
                    )}
                </form>

                <div className="p-5 flex justify-end space-x-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <button
                        onClick={onClose}
                        type="button"
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        type="submit"
                        disabled={submitting || selectedStaffIds.length === 0}
                        className="px-8 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        style={{
                            background: submitting ? '#795548' : 'linear-gradient(135deg, #8B4513 0%, #6d3410 100%)',
                        }}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Recording {selectedStaffIds.length} wage(s)...
                            </>
                        ) : (
                            <>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Record {selectedStaffIds.length} Wage(s)
                            </>
                        )}
                    </button>
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
        </div>
    );
};

// =========================================================
// --- WagesModal Component (The Popup Form) ---
// =========================================================

const WagesModal = ({ isOpen, onClose, onSaveSuccess, initialData = {} }) => {
    const safeInitial = initialData || {};
    const [form, setForm] = useState({
        employee_id: safeInitial.employee_id || safeInitial.staff || '',
        staff_id: safeInitial.staff_id || '',
        employee_name: safeInitial.employee_name || '',
        date_of_payment: safeInitial.date_of_payment || new Date().toISOString().substring(0, 10),
        days_missed: safeInitial.days_missed || '',
        amount_paid: safeInitial.amount_paid || '',
        monthly_salary: safeInitial.monthly_salary || '',
        recorded_by: safeInitial.recorded_by || localStorage.getItem('userName') || 'Unknown User',
    });

    const [staff, setStaff] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(true);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const [showStaffDropdown, setShowStaffDropdown] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    // Auto-calculate amount paid based on monthly salary and days missed
    const calculateAmountPaid = (monthlySalary, daysMissed) => {
        const salary = parseFloat(monthlySalary) || 0;
        const missed = parseFloat(daysMissed) || 0;

        if (salary <= 0) return 0;

        // Formula: (monthly_salary / 30) * (30 - days_missed)
        const dailyRate = salary / 30;
        const daysWorked = 30 - missed;
        const amountPaid = dailyRate * daysWorked;

        // Round to nearest 100 to avoid remainder figures (e.g., 333,333 -> 333,300)
        return Math.max(0, Math.round(amountPaid / 100) * 100);
    };

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                setLoadingStaff(true);
                const response = await fetch('http://142.93.94.236:8000/api/staff/');
                if (!response.ok) throw new Error('Failed to fetch staff');
                const data = await response.json();
                const staffList = Array.isArray(data) ? data : data.results || [];
                setStaff(staffList);
            } catch (err) {
                console.error('Error fetching staff:', err);
                setStaff([]);
            } finally {
                setLoadingStaff(false);
            }
        };

        const fetchLoggedInUser = async () => {
            try {
                const userPhone = localStorage.getItem('userPhone') || sessionStorage.getItem('userPhone');
                if (!userPhone) {
                    return localStorage.getItem('userName') || 'Unknown User';
                }

                const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                const headers = {};
                if (token) headers['Authorization'] = `Token ${token}`;

                const response = await fetch('http://142.93.94.236:8000/api/users/', {
                    method: 'GET',
                    headers: headers
                });
                if (!response.ok) {
                    return localStorage.getItem('userName') || 'Unknown User';
                }

                const users = await response.json();
                const usersList = Array.isArray(users) ? users : users.results || [];
                const currentUser = usersList.find(user => user.phone === userPhone);

                if (currentUser) {
                    const fullName = currentUser.full_name ||
                                   `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() ||
                                   currentUser.name ||
                                   currentUser.username ||
                                   'Unknown User';
                    return fullName;
                }

                return localStorage.getItem('userName') || 'Unknown User';
            } catch (err) {
                console.error('Error fetching user details:', err);
                return localStorage.getItem('userName') || 'Unknown User';
            }
        };

        if (isOpen) {
            fetchStaff();
            setErrors({});
            setMessage('');
            setAttemptedSubmit(false);

            // Fetch logged-in user's name and initialize form
            fetchLoggedInUser().then(userName => {
                const safeData = initialData || {};
                setForm({
                    employee_id: safeData.employee_id || safeData.staff || '',
                    staff_id: safeData.staff_id || '',
                    employee_name: safeData.employee_name || '',
                    date_of_payment: safeData.date_of_payment || new Date().toISOString().substring(0, 10),
                    days_missed: safeData.days_missed || '',
                    amount_paid: safeData.amount_paid || '',
                    monthly_salary: safeData.monthly_salary || '',
                    recorded_by: safeData.recorded_by || userName,
                });
            }).catch(err => {
                console.error('Error initializing form:', err);
                const safeData = initialData || {};
                setForm({
                    employee_id: safeData.employee_id || safeData.staff || '',
                    staff_id: safeData.staff_id || '',
                    employee_name: safeData.employee_name || '',
                    date_of_payment: safeData.date_of_payment || new Date().toISOString().substring(0, 10),
                    days_missed: safeData.days_missed || '',
                    amount_paid: safeData.amount_paid || '',
                    monthly_salary: safeData.monthly_salary || '',
                    recorded_by: localStorage.getItem('userName') || 'Unknown User',
                });
            });
        }
    }, [isOpen, initialData]);

    // Auto-calculate when monthly_salary or days_missed changes
    useEffect(() => {
        if (form.monthly_salary && form.days_missed !== '') {
            const calculatedAmount = calculateAmountPaid(form.monthly_salary, form.days_missed);
            console.log('🧮 Auto-Calculation:', {
                monthly_salary: form.monthly_salary,
                days_missed: form.days_missed,
                calculated_amount: calculatedAmount,
                type: typeof calculatedAmount
            });
            setForm(prev => ({ ...prev, amount_paid: calculatedAmount }));
        } else {
            setForm(prev => ({ ...prev, amount_paid: '' }));
        }
    }, [form.monthly_salary, form.days_missed]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let updatedForm;

        if (name === 'employee_name') {
            // When typing employee name, clear employee_id if not selecting from list
            updatedForm = { ...form, employee_name: value };
            setShowStaffDropdown(true);
        } else if (name === 'days_missed') {
            // Prevent negative numbers and numbers >= 30
            if (value.includes('-')) {
                setErrors(prev => ({ ...prev, days_missed: 'Days missed must be a positive number.' }));
                return;
            }
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue) && numValue >= 30) {
                setErrors(prev => ({ ...prev, days_missed: 'Days missed should be less than 30.' }));
                return;
            }
            updatedForm = { ...form, [name]: value };
        } else {
            updatedForm = { ...form, [name]: value };
        }

        setForm(updatedForm);
        setMessage('');
        if (attemptedSubmit) {
            const validation = validate(updatedForm);
            setErrors(validation);
        } else {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showStaffDropdown && !event.target.closest('.employee-dropdown-container')) {
                setShowStaffDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showStaffDropdown]);

    const getBorderClass = (fieldName, required = true) => {
        // Show red border if there's an error
        if (errors[fieldName]) {
            return `border-2 border-[#EA4335]`;
        }

        // Show green border for valid required fields after submit attempt
        if (attemptedSubmit && required && form[fieldName] && form[fieldName] !== '' && !errors[fieldName]) {
            return `border-2 border-[#34A853]`;
        }

        // Show green border for valid optional fields that have values
        if (attemptedSubmit && !required && form[fieldName] && form[fieldName] !== '' && !errors[fieldName]) {
            return `border-2 border-[#34A853]`;
        }

        // Default border
        return 'border border-gray-300';
    };

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const validate = (currentForm = form) => {
        const newErrors = {};
        if (!currentForm.employee_name || currentForm.employee_name.trim() === '') {
            newErrors.employee_name = 'Employee is required.';
        }
        if (!currentForm.date_of_payment) newErrors.date_of_payment = 'Date of payment is required.';

        // Validate days_missed - must be a valid number between 0 and 29
        const daysMissed = String(currentForm.days_missed).trim();
        if (daysMissed === '' || isNaN(Number(daysMissed)) || Number(daysMissed) < 0) {
            newErrors.days_missed = 'Valid days missed required.';
        } else if (Number(daysMissed) >= 30) {
            newErrors.days_missed = 'Days missed must be less than 30.';
        }

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

        // Convert string values to proper numbers, ensuring no NaN values
        const daysMissed = String(form.days_missed).trim();

        // Ensure amount_paid is a number, not a string
        const amountPaid = typeof form.amount_paid === 'number'
            ? form.amount_paid
            : (parseFloat(form.amount_paid) || 0);

        const payload = {
            employee_name: form.employee_name, // Free-text employee name
            staff: form.employee_id, // Link to registered staff by staff_id (e.g., "RF001")
            date_of_payment: form.date_of_payment,
            days_missed: parseInt(daysMissed, 10) || 0,
            amount_paid: amountPaid, // Include calculated amount (as number)
            recorded_by: form.recorded_by, // Logged-in user's name
        };

        console.log('🔍 Form Data Before Payload:', {
            monthly_salary: form.monthly_salary,
            days_missed: form.days_missed,
            amount_paid: form.amount_paid,
            amount_paid_type: typeof form.amount_paid
        });
        console.log('📤 Submitting payload:', JSON.stringify(payload, null, 2));
        console.log('💰 Amount Paid Value:', amountPaid, 'Type:', typeof amountPaid);

        try {
            // Get auth token from localStorage or sessionStorage
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

            const headers = {
                'Content-Type': 'application/json',
            };

            // Add authorization header if token exists
            if (token) {
                headers['Authorization'] = `Token ${token}`;
            }

            let response;
            if (initialData?.id) {
                // Edit mode - update existing record
                response = await fetch(`${WAGES_API_ENDPOINT}${initialData.id}/`, {
                    method: 'PUT',
                    headers: headers,
                    body: JSON.stringify(payload),
                });
            } else {
                // Create mode - add new record
                response = await fetch(WAGES_API_ENDPOINT, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(payload),
                });
            }

            if (response.ok) {
                const savedData = await response.json();
                console.log('✅ API Success Response:', savedData);
                console.log('📝 Payload that was sent:', payload);
                console.log('🔑 Saved record ID:', savedData.id);
                console.log('💰 Amount Paid (Frontend Calculated):', payload.amount_paid);
                console.log('🔴 Amount Paid (Backend Returned):', savedData.amount_paid);

                // Check if backend modified the amount
                if (savedData.amount_paid !== payload.amount_paid) {
                    console.warn('⚠️ WARNING: Backend changed amount_paid!');
                    console.warn('   Sent:', payload.amount_paid);
                    console.warn('   Received:', savedData.amount_paid);
                }

                setMessage(initialData ? 'You have successfully updated the wage record!' : 'You have successfully recorded a new wage!');

                setTimeout(() => {
                    onSaveSuccess();
                }, 1500);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error Response:', response.status);
                console.error('Error details:', JSON.stringify(errorData, null, 2));
                console.error('Payload sent:', JSON.stringify(payload, null, 2));

                // Show detailed error message
                let errorMsg = `Failed to save wage (${response.status}). `;
                if (errorData.detail) {
                    errorMsg += errorData.detail;
                } else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
                    // Show field-specific errors if available
                    const fieldErrors = Object.entries(errorData)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join('; ');
                    errorMsg += fieldErrors;
                } else {
                    errorMsg += 'Please check the console for more details.';
                }
                setMessage(errorMsg);
            }
        } catch (err) {
            console.error('Network error:', err);
            setMessage('Network error. Please check your connection and try again.');
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
                    <div className="md:col-span-2 employee-dropdown-container relative">
                        <label htmlFor="employee_name" className="block mb-1 text-sm font-medium text-gray-700">Employee</label>
                        <input
                            type="text"
                            name="employee_name"
                            value={form.employee_name}
                            onChange={handleChange}
                            onFocus={() => !initialData?.id && setShowStaffDropdown(true)}
                            disabled={loadingStaff || initialData?.id}
                            placeholder={loadingStaff ? 'Loading staff...' : (initialData?.id ? 'Employee (locked)' : 'Type employee name or select from list')}
                            className={`w-full py-2.5 px-3 rounded-lg border text-sm font-medium ${(loadingStaff || initialData?.id) ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'} ${getBorderClass('employee_name')} ${loadingStaff ? 'opacity-50' : ''}`}
                            autoComplete="off"
                        />
                        {showStaffDropdown && !loadingStaff && !initialData?.id && staff.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {staff
                                    .filter(member => {
                                        const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
                                        const searchTerm = form.employee_name.toLowerCase();
                                        return fullName.includes(searchTerm) || member.staff_id?.toLowerCase().includes(searchTerm);
                                    })
                                    .map(member => (
                                        <div
                                            key={member.staff_id}
                                            onClick={() => {
                                                const fullName = `${member.first_name} ${member.last_name}`;
                                                // Get monthly salary from staff member (if available)
                                                const monthlySalary = member.monthly_salary || member.base_pay || 0;
                                                setForm({
                                                    ...form,
                                                    employee_id: member.id, // Use the integer ID, not staff_id
                                                    staff_id: member.staff_id, // Keep staff_id for display
                                                    employee_name: fullName,
                                                    monthly_salary: monthlySalary
                                                });
                                                setSelectedStaff(member);
                                                setShowStaffDropdown(false);
                                                setErrors(prev => ({ ...prev, employee_name: '' }));
                                            }}
                                            className="px-4 py-2 cursor-pointer hover:bg-[#efebe9] transition-colors"
                                        >
                                            <div className="font-medium text-[#4A3423]">
                                                {member.first_name} {member.last_name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {member.staff_id || 'No ID'}
                                                {(member.monthly_salary || member.base_pay) && (
                                                    <span className="ml-2 text-[#34A853]">
                                                        • UGX {formatUGX(member.monthly_salary || member.base_pay)}/month
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                        {errors.employee_name && <p className="mt-1 text-xs text-[#EA4335] flex items-center"><MinusCircle className='w-3 h-3 mr-1'/> Please fill in the required field.</p>}
                    </div>

                    <div>
                        <label htmlFor="date_of_payment" className="block mb-1 text-sm font-medium text-gray-700">Date Paid</label>
                        <Input
                            type="date"
                            name="date_of_payment"
                            value={form.date_of_payment}
                            onChange={handleChange}
                            max={getTodayDate()}
                            className={`py-2.5 ${getBorderClass('date_of_payment')}`}
                        />
                        {errors.date_of_payment && <p className="mt-1 text-xs text-[#EA4335] flex items-center"><MinusCircle className='w-3 h-3 mr-1'/> {errors.date_of_payment}</p>}
                    </div>

                    <div>
                        <label htmlFor="days_missed" className="block mb-1 text-sm font-medium text-gray-700">Days Missed</label>
                        <Input
                            type="number"
                            inputMode="numeric"
                            name="days_missed"
                            value={form.days_missed}
                            onChange={handleChange}
                            placeholder="e.g. 2"
                            min="0"
                            max="29"
                            className={`py-2.5 ${getBorderClass('days_missed')}`}
                        />
                        {errors.days_missed && <p className="mt-1 text-xs text-[#EA4335] flex items-center"><MinusCircle className='w-3 h-3 mr-1'/> {errors.days_missed}</p>}
                    </div>

                    <div>
                        <label htmlFor="recorded_by" className="block mb-1 text-sm font-medium text-gray-700">Recorded By</label>
                        <Input
                            type="text"
                            name="recorded_by"
                            value={form.recorded_by}
                            readOnly
                            className="py-2.5 bg-gray-50 cursor-not-allowed font-medium text-gray-700"
                        />
                    </div>
                </div>

                <hr className="border-gray-200 my-6" />

                <h3 className="text-lg font-semibold text-[#4A3423] mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-[#795548]" />
                    Calculated Amount
                </h3>
                <div className="grid grid-cols-1 gap-4 mb-6">
                    <div>
                        <label htmlFor="amount_paid" className="block mb-1 text-sm font-medium text-gray-700">Total Amount Paid (UGX)</label>
                        <Input
                            type="text"
                            name="amount_paid"
                            value={form.amount_paid ? `UGX ${formatUGX(form.amount_paid)}` : ''}
                            placeholder="e.g. 2200000"
                            readOnly
                            className="py-2.5 font-bold bg-gray-50 text-[#34A853] cursor-not-allowed"
                        />
                    </div>
                </div>

                {message && (
                    <div style={{
                        marginTop: '15px',
                        padding: '10px',
                        borderRadius: '6px',
                        backgroundColor: message.includes('successfully') ? '#E8F5E8' : '#FFEBEE',
                        border: `1px solid ${message.includes('successfully') ? CoffeeColors.SUCCESS_GREEN : CoffeeColors.ERROR_RED}`,
                        color: message.includes('successfully') ? CoffeeColors.SUCCESS_GREEN : CoffeeColors.ERROR_RED,
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
                            {initialData ? 'Updating...' : 'Submitting...'}
                        </>
                    ) : (
                        initialData ? 'Update Wage Record' : 'Submit Wage Record'
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
                    className="flex items-center justify-between p-4 border-b border-gray-200"
                    style={{
                        backgroundColor: '#FFFFFF'
                    }}
                >
                    <h2 className="text-xl font-semibold" style={{ color: '#333333' }}>
                        {initialData ? 'Edit Wage Record' : 'Wage Entry Form'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" style={{ color: '#6B7280' }} />
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
    { key: 'days_missed', label: 'Days Missed', icon: Calendar, type: 'number', align: 'center' },
    { key: 'amount_paid', label: 'Amount Paid', icon: DollarSign, type: 'number', align: 'right' },
    { key: 'actions', label: 'Actions', icon: null, type: 'actions', align: 'center' },
];

function Wages() {
    const navigate = useNavigate();
    const [wages, setWages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWage, setEditingWage] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [wageToDelete, setWageToDelete] = useState(null);
    const [allWagesForKPI, setAllWagesForKPI] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [showBulkRecordModal, setShowBulkRecordModal] = useState(false);
    const itemsPerPage = 7;

    // Helper function to round amount_paid to nearest 100
    const roundAmountToHundred = (amount) => {
        if (amount === null || amount === undefined || isNaN(amount)) return 0;
        return Math.round(Number(amount) / 100) * 100;
    };

    const fetchWages = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            // Get auth token
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Token ${token}`;
            }

            console.log('🔄 Fetching wages from API (page:', page, ')');
            const response = await fetch(`${WAGES_API_ENDPOINT}?page=${page}&page_size=${itemsPerPage}&ordering=-id`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }

            const data = await response.json();
            console.log('📊 Wages fetched from API:', data);
            console.log('📈 Number of wage records:', data.results ? data.results.length : (Array.isArray(data) ? data.length : 0));

            // Helper to round amounts in wage records and calculate if missing
            const roundWageAmounts = (wages) => {
                return wages.map(wage => {
                    // Calculate amount_paid if it's missing or zero
                    let calculatedAmount = wage.amount_paid;

                    // If amount_paid is null, undefined, 0, or NaN, calculate it
                    if (!calculatedAmount || calculatedAmount === 0 || isNaN(calculatedAmount)) {
                        const monthlySalary = Number(wage.monthly_salary) || Number(wage.monthly_pay) || 0;
                        const daysMissed = Number(wage.days_missed) || 0;

                        if (monthlySalary > 0) {
                            // Formula: (monthly_salary / 30) * (30 - days_missed)
                            const dailyRate = monthlySalary / 30;
                            const daysWorked = 30 - daysMissed;
                            calculatedAmount = dailyRate * daysWorked;

                            console.log('✨ Calculating missing amount_paid:', {
                                id: wage.id,
                                monthly_salary: monthlySalary,
                                days_missed: daysMissed,
                                daily_rate: dailyRate,
                                days_worked: daysWorked,
                                calculated: calculatedAmount
                            });
                        } else {
                            calculatedAmount = 0;
                            console.log('⚠️ Cannot calculate for wage ID ' + wage.id + ' - monthly_salary is 0 or missing');
                        }
                    }

                    const finalAmount = roundAmountToHundred(calculatedAmount);

                    console.log('🔍 Processing wage:', {
                        id: wage.id,
                        employee: wage.employee_name,
                        amount_paid_raw: wage.amount_paid,
                        calculated_amount: calculatedAmount,
                        final_rounded: finalAmount
                    });

                    return {
                        ...wage,
                        amount_paid: finalAmount
                    };
                });
            };

            // Handle both paginated and non-paginated responses
            if (data.results) {
                // Paginated response
                setWages(roundWageAmounts(data.results));
                setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));

                // Fetch all wages for KPI calculation
                if (data.count > itemsPerPage) {
                    const allResponse = await fetch(`${WAGES_API_ENDPOINT}?page_size=${data.count}&ordering=-id`, {
                        headers: headers
                    });
                    if (allResponse.ok) {
                        const allData = await allResponse.json();
                        setAllWagesForKPI(roundWageAmounts(allData.results || allData));
                    } else {
                        setAllWagesForKPI(roundWageAmounts(data.results));
                    }
                } else {
                    setAllWagesForKPI(roundWageAmounts(data.results));
                }
            } else if (Array.isArray(data)) {
                // Non-paginated response (array)
                const startIndex = (page - 1) * itemsPerPage;
                const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);
                setWages(roundWageAmounts(paginatedData));
                setTotalPages(Math.ceil(data.length / itemsPerPage));
                setAllWagesForKPI(roundWageAmounts(data));
            } else {
                setWages([]);
                setTotalPages(1);
                setAllWagesForKPI([]);
            }

            setError(null);
        } catch (err) {
            console.error('API fetch failed:', err.message);
            setError('Failed to load wages from server.');
            setWages([]);
            setTotalPages(1);
            setAllWagesForKPI([]);
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage]);

    useEffect(() => {
        fetchWages(currentPage);
    }, [fetchWages, currentPage]);

    const handleSaveSuccess = () => {
        setIsModalOpen(false);
        setEditingWage(null);
        setCurrentPage(1);
        // Simply refresh the data - the modal already updated MOCK_WAGES_DATA
        fetchWages(1);
    };

    const handleEdit = (wage) => {
        setEditingWage(wage);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (wage) => {
        setDeleteConfirm({ isOpen: true, wage });
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirm.wage) {
            // Remove from mock data
            const updatedWages = MOCK_WAGES_DATA.filter(w => w.id !== deleteConfirm.wage.id);
            // Update the mock data array (in a real app, this would be an API call)
            MOCK_WAGES_DATA.splice(0, MOCK_WAGES_DATA.length, ...updatedWages);
            setDeleteConfirm({ isOpen: false, wage: null });
            fetchWages(currentPage);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm({ isOpen: false, wage: null });
    };

    const sortedWages = React.useMemo(() => {
        const base = Array.isArray(wages) ? wages : [];

        // First, filter by search term
        let filteredItems = base;
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filteredItems = base.filter(wage => {
                const employeeName = (wage.employee_name || '').toLowerCase();
                return employeeName.includes(searchLower);
            });
        }

        // Then, sort the filtered results
        let sortableItems = [...filteredItems];
            sortableItems.sort((a, b) => {
                const dateA = new Date(a.date_of_payment || 0);
                const dateB = new Date(b.date_of_payment || 0);
                return dateB - dateA;
            });
        if (sortConfig.key !== null && sortConfig.key !== 'date_of_payment') {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                // Special handling for date fields to ensure proper date comparison

                if (TABLE_HEADERS.find(h => h.key === sortConfig.key)?.type === 'number') {
                    const numA = parseFloat(aValue || 0);
                    const numB = parseFloat(bValue || 0);
                    return sortConfig.direction === 'ascending' ? numA - numB : numB - numA;
                }

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        } else {
            // Default sort: most recent wages first (by ID descending - higher ID = more recent)
            sortableItems.sort((a, b) => {
                return b.id - a.id;
            });
        }
        return sortableItems;
    }, [wages, sortConfig, searchTerm]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key) {
            direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
        }   else {
            direction = key === 'date_of_payment' ? 'descending' : 'ascending';
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

    const handleViewVoucher = (wage) => {
        navigate(`/voucher?id=${wage.id}`);
    };

    const confirmDelete = async () => {
        if (wageToDelete) {
            setDeleting(true);
            try {
                // Get auth token
                const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                const headers = {};
                if (token) {
                    headers['Authorization'] = `Token ${token}`;
                }

                const response = await fetch(`${WAGES_API_ENDPOINT}${wageToDelete.id}/`, {
                    method: 'DELETE',
                    headers: headers,
                });

                if (response.ok) {
                    console.log('Wage deleted successfully');
                } else {
                    console.error('Failed to delete wage:', response.status);
                }
                setShowDeleteModal(false);
                setWageToDelete(null);
                // Refresh the current page
                fetchWages(currentPage);
            } catch (err) {
                console.error('Network error during delete:', err);
                alert('Network error. Please check your connection and try again.');
            } finally {
                setDeleting(false);
            }
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setWageToDelete(null);
    };

    // Calculate KPIs with live updates from all wages (not just current page)
    const kpis = useMemo(() => {
        const dataSource = allWagesForKPI.length > 0 ? allWagesForKPI : wages;

        if (!dataSource || dataSource.length === 0) {
            return {
                totalWagesPaid: 0,
                averageWagePerEmployee: 0,
                totalEmployees: 0,
                totalRecords: 0
            };
        }

        const totalWagesPaid = dataSource.reduce((sum, wage) => sum + (wage.amount_paid || 0), 0);

        // Count unique employees
        const uniqueEmployees = new Set(dataSource.map(wage => wage.employee_name)).size;
        const averageWagePerEmployee = uniqueEmployees > 0 ? totalWagesPaid / uniqueEmployees : 0;

        return {
            totalWagesPaid,
            averageWagePerEmployee,
            totalEmployees: uniqueEmployees,
            totalRecords: dataSource.length
        };
    }, [wages, allWagesForKPI]); // Re-calculate when wages state changes

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
            const formattedAmount = formatUGX(wage.amount_paid);
            console.log('💰 Rendering wage row:', {
                id: wage.id,
                employee: wage.employee_name,
                amount_paid: wage.amount_paid,
                formatted: formattedAmount,
                fullDisplay: `UGX ${formattedAmount}`
            });
            return (
                <tr key={index} className="border-b border-gray-100 transition-colors duration-150 hover:bg-[#efebe9]/30">
                    <td className="px-6 py-4 text-left font-semibold text-[#4A3423]">{wage.employee_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{dateStr}</td>
                    <td className="px-6 py-4 text-center text-gray-700 font-medium">{wage.days_missed || 0}</td>
                    <td className="px-6 py-4 text-right text-[#34A853] font-bold whitespace-nowrap">UGX {formattedAmount}</td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                            <button
                                onClick={() => handleViewVoucher(wage)}
                                className="text-gray-800 hover:text-green-600 p-1 rounded-md hover:bg-green-50 transition-colors"
                                title="View voucher"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleEditWage(wage)}
                                className="text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                                title="Edit wage record"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteWage(wage)}
                                className="text-error hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                                title="Delete wage record"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Card 1: Total Wages Paid */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-medium tracking-wide uppercase" style={{ color: '#666' }}>
                                Total Wages Paid
                            </h3>
                            <DollarSign size={20} style={{ color: '#8B5A3C' }} />
                        </div>
                        <div className="mt-2">
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium" style={{ color: '#888' }}>UGX</p>
                                <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{formatUGX(kpis.totalWagesPaid)}</p>
                            </div>
                            <div className="mt-3 text-xs">
                                <p style={{ color: '#666' }}>{kpis.totalRecords} wage record(s)</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Average Wage Per Employee */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-medium tracking-wide uppercase" style={{ color: '#666' }}>
                                Avg. Wage/Employee
                            </h3>
                            <Wallet size={20} style={{ color: '#8B5A3C' }} />
                        </div>
                        <div className="mt-2">
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium" style={{ color: '#888' }}>UGX</p>
                                <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{formatUGX(Math.round(kpis.averageWagePerEmployee))}</p>
                            </div>
                            <div className="mt-3 text-xs">
                                <p style={{ color: '#666' }}>Per unique employee</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Total Employees Paid */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-medium tracking-wide uppercase" style={{ color: '#666' }}>
                                Employees Paid
                            </h3>
                            <UserIcon size={20} style={{ color: '#8B5A3C' }} />
                        </div>
                        <div className="mt-2">
                            <div className="flex flex-col gap-1">
                                <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{kpis.totalEmployees}</p>
                            </div>
                            <div className="mt-3 text-xs">
                                <p style={{ color: '#666' }}>Unique employees</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex gap-3 flex-wrap items-center">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="py-2 px-4 shadow-xl rounded-xl flex items-center font-semibold text-white hover:shadow-2xl transition-all duration-200"
                            style={{ backgroundColor: '#8B4513' }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Record New Wage
                        </button>
                        <button
                            onClick={() => setShowBulkRecordModal(true)}
                            className="py-2 px-4 shadow-xl rounded-xl flex items-center font-semibold text-white hover:shadow-2xl transition-all duration-200"
                            style={{ backgroundColor: '#6d3410' }}
                            title="Record wages for multiple employees at once"
                        >
                            <DollarSign className="w-4 h-4 mr-2" />
                            Bulk Record Wages
                        </button>
                        <Button type="secondary" onClick={() => alert('Exporting data...')} className="py-2 px-4 shadow-xl">
                            Export to Excel
                        </Button>
                    </div>

                    <div className="flex gap-3 items-center flex-wrap">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="search"
                                placeholder="Search by employee name"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="p-2 pl-10 text-sm w-full sm:w-56 border border-gray-300 rounded-xl focus:ring-[#795548] focus:border-[#795548] transition-colors shadow-lg"
                            />
                        </div>

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

                <BulkWageSpreadsheet
                    isOpen={showBulkRecordModal}
                    onClose={() => setShowBulkRecordModal(false)}
                    onSaveSuccess={() => {
                        setShowBulkRecordModal(false);
                        fetchWages(currentPage);
                    }}
                />

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
                                    disabled={deleting}
                                    className="px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    style={{ background: deleting ? '#dc2626' : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
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
            </main>
        </SideNav>
    );
}

export default Wages;