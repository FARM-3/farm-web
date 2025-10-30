// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import {
//     Home, DollarSign, ShoppingBag, Users, Settings, LogOut, Menu, X, Bell, UserCircle,
//     RefreshCw, Calendar, Tag, MapPin, Truck, Send, Loader2, ArrowUp, ArrowDown, Edit, Trash2, Search, Filter, ChevronsDown
// } from 'lucide-react';
// import { SideNav } from '../components/SideNav';

// // --- Global Styles & Constants (Modern & Light Theme from Image) ---

// const ACCENT_COLORS = {
//     NAV_BG: '#FFFFFF', // White
//     MAIN_BG: '#F8F8F8', // Light Gray background
//     PRIMARY_TEXT: '#333333',
//     ACCENT_GREEN: '#4CAF50', // Export to Excel
//     ACCENT_BROWN: '#9F4A2F', // Record New Expense
//     TABLE_HEADER_BG: '#F4F4F4', // Light header
//     ACTIVE_NAV_BG: '#FFF7F4', // Very light peach for active link
//     ACTIVE_NAV_TEXT: '#9F4A2F',
//     INACTIVE_NAV_TEXT: '#6B7280',
// };

// // IMPORTANT: Updated to the live API endpoint
// const EXPENSE_API_ENDPOINT = 'https://api-3181.onrender.com/api/expenses/';


// // --- Helper Components ---

// const NavLink = ({ to, icon: Icon, children, currentPath }) => {
//     const isActive = currentPath === to;
//     return (
//         <a
//             href={to}
//             className={`flex items-center p-3 rounded-xl transition-all duration-200 cursor-pointer ${
//                 isActive
//                     ? 'font-semibold shadow-inner'
//                     : 'hover:bg-gray-100'
//             }`}
//             style={{
//                 backgroundColor: isActive ? ACCENT_COLORS.ACTIVE_NAV_BG : 'transparent',
//                 color: isActive ? ACCENT_COLORS.ACTIVE_NAV_TEXT : ACCENT_COLORS.INACTIVE_NAV_TEXT
//             }}
//         >
//             <Icon className="w-5 h-5 mr-3" />
//             <span className="text-sm">{children}</span>
//         </a>
//     );
// };

// const MenuButton = ({ onClick, isOpen }) => (
//     <button
//         onClick={onClick}
//         className="p-2 rounded-full md:hidden transition-all duration-300"
//         style={{ color: ACCENT_COLORS.ACCENT_BROWN, backgroundColor: ACCENT_COLORS.ACTIVE_NAV_BG }}
//     >
//         {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//     </button>
// );




// // Helper function to format currency (UGX style)
// const formatCurrency = (amount) => {
//     const value = parseFloat(amount);
//     if (isNaN(value)) return 'UGX 0';

//     return `UGX ${new Intl.NumberFormat('en-US', {
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 0,
//     }).format(Math.round(value))}`;
// };

// const ActionButton = ({ children, onClick, className, style, disabled }) => (
//     <button
//         onClick={onClick}
//         disabled={disabled}
//         className={`px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm ${className}`}
//         style={style} // Styles are passed directly
//     >
//         {children}
//     </button>
// );

// // Data Structure for Table Headers (used for sorting)
// const TABLE_HEADERS = [
//     { key: 'expense_name', label: 'Name', type: 'string' },
//     { key: 'category', label: 'Category', type: 'string' },
//     { key: 'date', label: 'Date', type: 'date' },
//     { key: 'amount', label: 'Amount', type: 'number' },
//     { key: 'supplier', label: 'Supplier', type: 'string' },
//     { key: 'location', label: 'Location', type: 'string' },
// ];


// function Expenses() {
//     const [expenses, setExpenses] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filterCategory, setFilterCategory] = useState('');
//     const navigate = useNavigate();

//     // Sorting state
//     const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

//     // Delete confirmation modal state
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [expenseToDelete, setExpenseToDelete] = useState(null);
//     const [deleting, setDeleting] = useState(false);

//     // Live Data Fetcher with retry logic
//     const fetchExpenses = useCallback(async (retries = 3) => {
//         setLoading(true);
//         setError(null);

//         console.log('--- Expense Fetch Started from Live API ---');

//         for (let i = 0; i < retries; i++) {
//             try {
//                 const response = await fetch(EXPENSE_API_ENDPOINT);
//                 if (!response.ok) {
//                     throw new Error(`HTTP error! status: ${response.status}`);
//                 }
//                 const data = await response.json();
//                 const normalized = Array.isArray(data)
//                     ? data
//                     : Array.isArray(data?.results)
//                         ? data.results
//                         : [];

//                 setExpenses(normalized);
//                 setError(null);
//                 setLoading(false);

//                 console.log('Expense Data fetched successfully. Total records:', normalized.length);
//                 return;

//             } catch (err) {
//                 console.error(`Attempt ${i + 1} failed to fetch expenses:`, err);
//                 if (i === retries - 1) {
//                     const finalError = `Could not load records from ${EXPENSE_API_ENDPOINT}. Failed reason: ${err.message}`;
//                     setError(finalError);
//                     setExpenses([]);
//                     setLoading(false);
//                     return;
//                 }
//                 // Exponential backoff delay
//                 await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
//             }
//         }
//     }, []);


//     // Initial data fetch on component mount
//     useEffect(() => {
//         fetchExpenses();
//     }, [fetchExpenses]);

//     // Filtering logic
//     const filteredExpenses = React.useMemo(() => {
//         let filtered = expenses;

//         if (searchTerm) {
//             filtered = filtered.filter(e =>
//                 e.expense_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 e.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
//             );
//         }

//         if (filterCategory) {
//             filtered = filtered.filter(e => e.category === filterCategory);
//         }

//         return filtered;
//     }, [expenses, searchTerm, filterCategory]);


//     // Sorting logic (same as wages.jsx)
//     const sortedExpenses = React.useMemo(() => {
//         const base = Array.isArray(filteredExpenses) ? filteredExpenses : [];
//         let sortableItems = [...base];
//         if (sortConfig.key !== null) {
//             sortableItems.sort((a, b) => {
//                 const aValue = a[sortConfig.key];
//                 const bValue = b[sortConfig.key];

//                 const headerType = TABLE_HEADERS.find(h => h.key === sortConfig.key)?.type;

//                 // Handle number sorting
//                 if (headerType === 'number') {
//                     const numA = parseFloat(aValue || 0);
//                     const numB = parseFloat(bValue || 0);
//                     if (numA < numB) {
//                         return sortConfig.direction === 'ascending' ? -1 : 1;
//                     }
//                     if (numA > numB) {
//                         return sortConfig.direction === 'ascending' ? 1 : -1;
//                     }
//                     return 0;
//                 }

//                 // Default string/date sorting
//                 if (aValue < bValue) {
//                     return sortConfig.direction === 'ascending' ? -1 : 1;
//                 }
//                 if (aValue > bValue) {
//                     return sortConfig.direction === 'ascending' ? 1 : -1;
//                 }
//                 return 0;
//             });
//         }
//         return sortableItems;
//     }, [filteredExpenses, sortConfig]);

//     const requestSort = (key) => {
//         let direction = 'ascending';
//         if (sortConfig.key === key && sortConfig.direction === 'ascending') {
//             direction = 'descending';
//         }
//         setSortConfig({ key, direction });
//     };

//     const getSortIcon = (key) => {
//         if (sortConfig.key !== key) {
//             return null;
//         }
//         if (sortConfig.direction === 'ascending') {
//             return <ArrowUp className="w-3 h-3 ml-1" />;
//         }
//         return <ArrowDown className="w-3 h-3 ml-1" />;
//     };

//     // Extract unique categories for the filter dropdown
//     const uniqueCategories = React.useMemo(() => {
//         const categories = expenses.map(e => e.category).filter(Boolean);
//         return [...new Set(categories)].sort();
//     }, [expenses]);


//     // Handle delete expense
//     const handleDeleteExpense = async () => {
//         if (!expenseToDelete) return;

//         setDeleting(true);
//         try {
//             const response = await fetch(`${EXPENSE_API_ENDPOINT}${expenseToDelete.id}/`, {
//                 method: 'DELETE',
//             });

//             if (response.ok) {
//                 // Remove the expense from the local state
//                 setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== expenseToDelete.id));
//                 setShowDeleteModal(false);
//                 setExpenseToDelete(null);
//             } else {
//                 console.error('Failed to delete expense');
//             }
//         } catch (error) {
//             console.error('Error deleting expense:', error);
//         } finally {
//             setDeleting(false);
//         }
//     };

//     // Handle edit expense
//     const handleEditExpense = (expense) => {
//         // Navigate to expense entry with expense data (assuming an expense-entry route exists)
//         navigate('/expense-entry', { state: { editExpense: expense } });
//     };

//     const renderTableContent = () => {
//         if (loading) {
//             return (
//                 <tr className='h-24'>
//                     <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-gray-600">
//                         <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" style={{ color: ACCENT_COLORS.ACCENT_BROWN }} />
//                         Loading expense records...
//                     </td>
//                 </tr>
//             );
//         }

//         if (error) {
//             return (
//                 <tr className='h-24'>
//                     <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-red-600 font-medium">
//                         {error}
//                     </td>
//                 </tr>
//             );
//         }

//         if (sortedExpenses.length === 0) {
//             return (
//                 <tr className='h-24'>
//                     <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-gray-500 italic">
//                         No expense records found matching your criteria.
//                     </td>
//                 </tr>
//             );
//         }

//         return sortedExpenses.map((expense, index) => (
//             <tr key={expense.id || index} className="border-b transition-colors duration-150 hover:bg-gray-50">
//                 <td className="px-6 py-3 text-left font-medium text-gray-800">{expense.expense_name || 'N/A'}</td>
//                 <td className="px-6 py-3 text-left text-gray-600">{expense.category || '-'}</td>
//                 <td className="px-6 py-3 text-center text-gray-600">{expense.date || 'N/A'}</td>
//                 <td className="px-6 py-3 text-right font-bold" style={{ color: ACCENT_COLORS.ACCENT_BROWN }}>
//                     {formatCurrency(expense.amount)}
//                 </td>
//                 <td className="px-6 py-3 text-left text-gray-700">{expense.supplier || '-'}</td>
//                 <td className="px-6 py-3 text-left text-sm italic text-gray-500">{expense.location || '-'}</td>
//                 <td className="px-6 py-3 text-center">
//                     <div className="flex items-center justify-center space-x-2">
//                         <button
//                             onClick={() => handleEditExpense(expense)}
//                             className="p-1 rounded hover:bg-gray-200 transition-colors"
//                             title="Edit expense"
//                         >
//                             <Edit className="w-4 h-4 text-blue-600" />
//                         </button>
//                         <button
//                             onClick={() => {
//                                 setExpenseToDelete(expense);
//                                 setShowDeleteModal(true);
//                             }}
//                             className="p-1 rounded hover:bg-gray-200 transition-colors"
//                             title="Delete expense"
//                         >
//                             <Trash2 className="w-4 h-4 text-red-600" />
//                         </button>
//                     </div>
//                 </td>
//             </tr>
//         ));
//     };

//     return (
//         <SideNav>
//             <main className="p-4 sm:p-6 md:p-8 pt-0">

//                 {/* Main Content */}
//                 <div className="flex flex-col md:flex-row md:justify-between md:items-center">
//                     <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: ACCENT_COLORS.PRIMARY_TEXT }}>
//                         Expense Records Overview
//                     </h1>
//                     <div className="flex space-x-3 mt-4 md:mt-0">
//                         <ActionButton 
//                             onClick={() => navigate('/expense-entry')}
//                             style={{ backgroundColor: ACCENT_COLORS.ACCENT_BROWN }}
//                             className="shadow-xl"
//                         >
//                             <Send className="w-4 h-4 mr-2" />
//                             Record New Expense
//                         </ActionButton>
//                         <ActionButton 
//                             onClick={() => alert('Exporting to Excel is not yet implemented.')}
//                             style={{ backgroundColor: ACCENT_COLORS.ACCENT_GREEN }}
//                             className="shadow-xl"
//                         >
//                             Export to Excel
//                         </ActionButton>
//                     </div>
//                 </div>

//                 {/* Search, Filter, Refresh Bar */}
//                 <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-stretch sm:items-center p-4 rounded-lg bg-white shadow-md">
                    
//                     {/* Search Input */}
//                     <div className="relative flex-1 max-w-sm">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                         <input
//                             type="text"
//                             placeholder="Search by expense/supplier name..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition"
//                         />
//                     </div>

//                     {/* Filter Dropdown */}
//                     <div className="relative w-full sm:w-48">
//                         <select
//                             value={filterCategory}
//                             onChange={(e) => setFilterCategory(e.target.value)}
//                             className="appearance-none w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition"
//                         >
//                             <option value="">Filter by Category</option>
//                             {uniqueCategories.map(category => (
//                                 <option key={category} value={category}>{category}</option>
//                             ))}
//                         </select>
//                         <ChevronsDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
//                     </div>

//                     {/* Refresh Button */}
//                     <ActionButton 
//                         onClick={() => fetchExpenses()}
//                         disabled={loading}
//                         className="py-2 px-6 shadow-sm"
//                         style={{ backgroundColor: '#D4C3A3', color: ACCENT_COLORS.PRIMARY_TEXT }} // Light brown/beige
//                     >
//                         <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
//                         Refresh Data
//                     </ActionButton>
//                 </div>

//                 {/* Expense Records Table Container */}
//                     <table className="min-w-full divide-y divide-gray-200">
//                         <thead style={{ backgroundColor: '#efebe9', color: '#4A3423' }}>
//                             <tr>
//                                 {TABLE_HEADERS.map((header) => (
//                                     <th
//                                         key={header.key}
//                                         className="px-6 py-3 text-sm font-semibold uppercase tracking-wider cursor-pointer text-gray-700 hover:text-gray-900 transition-colors duration-150"
//                                         onClick={() => requestSort(header.key)}
//                                         scope="col"
//                                     >
//                                         <div className={`flex items-center ${header.type === 'number' ? 'justify-end' : 'justify-start'}`}>
//                                             {header.label}
//                                             {getSortIcon(header.key)}
//                                         </div>
//                                     </th>
//                                 ))}
//                                 <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-center text-gray-700">
//                                     Actions
//                                 </th>
//                             </tr>
//                         </thead>
//                         <tbody className="bg-white/80 divide-y divide-gray-100 text-xs">
//                             {renderTableContent()}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>


//             {/* Delete Confirmation Modal */}
//             {showDeleteModal && expenseToDelete && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full mx-4">
//                         <h3 className="text-xl font-bold mb-4" style={{ color: ACCENT_COLORS.ACCENT_BROWN }}>
//                             Confirm Deletion
//                         </h3>
//                         <p className="text-gray-600 mb-6">
//                             Are you sure you want to delete the expense: **{expenseToDelete.expense_name}**? This action cannot be undone.
//                         </p>
//                         <div className="flex justify-end space-x-3">
//                             <button
//                                 onClick={() => {
//                                     setShowDeleteModal(false);
//                                     setExpenseToDelete(null);
//                                 }}
//                                 className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
//                                 disabled={deleting}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleDeleteExpense}
//                                 disabled={deleting}
//                                 className="px-4 py-2 text-white rounded-lg transition-colors flex items-center shadow-md"
//                                 style={{ backgroundColor: '#D32F2F' }}
//                             >
//                                 {deleting ? (
//                                     <>
//                                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                                         Deleting...
//                                     </>
//                                 ) : (
//                                     'Delete Permanently'
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </SideNav>
//     );
// }

// export default Expenses;


//expenses file with validations
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign, Send, Loader2, X, RefreshCw, ArrowUp, ArrowDown, Edit, Trash2, Search, ChevronsDown,
    Tag, Calendar, MapPin, AlignLeft, User, ShoppingBag, Receipt, Home, Plus
} from 'lucide-react';

// NOTE: Assuming SideNav is imported from '../components/SideNav'
import { SideNav } from '../components/SideNav'; 


// --- Configuration & Global Styles ---

const ACCENT_COLORS = {
    NAV_BG: '#FFFFFF', 
    MAIN_BG: '#F8F8F8', 
    PRIMARY_TEXT: '#333333',
    ACCENT_GREEN: '#4CAF50', 
    ACCENT_BROWN: '#9F4A2F', 
    TABLE_HEADER_BG: '#F4F4F4', 
};

// Colors derived from Image 2 (Sales Entry) for the modal
const CUSTOM_COLORS_MODAL = {
    HEADER_BG: '#FFFFFF', 
    HEADER_TEXT: '#333333', 
    HEADER_CLOSE_BTN: '#6B7280', 
    MODAL_BG: '#F8F8F8', 
    SECTION_BG: '#FFFFFF', 
    SECTION_HEADER_TEXT: '#333333', 
    SECTION_ICON: '#F59E0B', 
    INPUT_BG: '#F9FAFB', 
    INPUT_BORDER: '#D1D5DB', 
    TEXT_PRIMARY: '#333333',
    TEXT_SECONDARY: '#6B7280', 
    FOOTER_BG: '#F8F8F8', 
    
    BUTTON_PRIMARY_BG: '#9F4A2F', 
    BUTTON_PRIMARY_TEXT: '#FFFFFF',
    BUTTON_SECONDARY_BG: '#E5E7EB', 
    BUTTON_SECONDARY_TEXT: '#4B5563',
    REQUIRED_ASTERISK: '#EF4444', 
    VALID_BORDER: '#10B981', // Green-500 for validation success
    INVALID_BORDER: '#EF4444', // Red-500 for validation failure
};

const CATEGORIES = [
    'General Supplies', 'Fuel/Energy', 'Equipment Maintenance',
    'Feed/Seed', 'Labor', 'Utilities', 'Transportation', 'Other'
];

const EXPENSE_API_ENDPOINT = 'https://api-3181.onrender.com/api/expenses/';

const TABLE_HEADERS = [
    { key: 'expense_name', label: 'Name', type: 'string' },
    { key: 'category', label: 'Category', type: 'string' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'amount', label: 'Amount', type: 'number' },
    { key: 'supplier', label: 'Supplier', type: 'string' },
    { key: 'location', label: 'Location', type: 'string' },
];

// --- Helper Functions and Components (Modified for Validation) ---

const formatCurrency = (amount) => {
    const value = parseFloat(amount);
    if (isNaN(value)) return 'UGX 0';

    return `UGX ${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.round(value))}`;
};

const ActionButton = ({ children, onClick, className, style, disabled, type = "button" }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm ${className}`}
        style={style} 
    >
        {children}
    </button>
);

const ModalSectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center space-x-2 mb-4">
        <Icon className="w-5 h-5" style={{ color: CUSTOM_COLORS_MODAL.SECTION_ICON }} />
        <h3 className="text-base font-semibold" style={{ color: CUSTOM_COLORS_MODAL.SECTION_HEADER_TEXT }}>
            {title}
        </h3>
    </div>
);

// Validation function for field-specific error messages
const getFieldErrorMessage = (name, value) => {
    if (name === 'amount') {
        if (!value || value.trim() === '') return 'Amount is required';
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return 'Must be a valid number';
        if (numValue <= 0) return 'Must be a positive number';
        if (!/^\d+(\.\d{1,2})?$/.test(value)) return 'Must be a valid currency format';
        return null; // No error
    }
    
    if (name === 'date') {
        if (!value) return 'Date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (selectedDate > today) return 'Date cannot be in the future';
        return null; // No error
    }
    
    if (name === 'expense_name') {
        if (!value || !value.toString().trim()) return 'Expense name is required';
        if (value.trim().length < 2) return 'Must be at least 2 characters';
        return null; // No error
    }
    
    if (name === 'category') {
        if (!value || value === '') return 'Category is required';
        if (!CATEGORIES.includes(value)) return 'Please select a valid category';
        return null; // No error
    }
    
    if (name === 'supplier' || name === 'item' || name === 'location') {
        // Only validate length if field has value (since these are optional)
        if (value && value.trim().length < 2) return 'Must be at least 2 characters';
        return null; // No error
    }
    
    return null; // Default: no error
};

const InputField = ({ label, name, value, onChange, placeholder, required, type = "text", isTextArea = false, status = 'initial', errorMessage = '' }) => {
    const borderColor = status === 'valid' 
        ? CUSTOM_COLORS_MODAL.VALID_BORDER 
        : status === 'invalid' 
        ? CUSTOM_COLORS_MODAL.INVALID_BORDER 
        : CUSTOM_COLORS_MODAL.INPUT_BORDER;

    return (
        <div className="flex flex-col space-y-1">
            <label htmlFor={name} className="text-sm font-medium" style={{ color: CUSTOM_COLORS_MODAL.TEXT_SECONDARY }}>
                {label}
                {required && <span className="ml-1" style={{ color: CUSTOM_COLORS_MODAL.REQUIRED_ASTERISK }}>*</span>}
            </label>
            {isTextArea ? (
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    rows="3" 
                    className="flex-1 w-full px-3 py-2 text-sm rounded-md border focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
                    style={{
                        backgroundColor: CUSTOM_COLORS_MODAL.INPUT_BG,
                        borderColor: borderColor, 
                        color: CUSTOM_COLORS_MODAL.TEXT_PRIMARY,
                        resize: 'vertical'
                    }}
                />
            ) : (
                <input
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    type={type}
                    step={type === 'number' || name === 'amount' ? '0.01' : undefined}
                    className="flex-1 w-full px-3 py-2 text-sm rounded-md border focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
                    style={{
                        backgroundColor: CUSTOM_COLORS_MODAL.INPUT_BG,
                        borderColor: borderColor, 
                        color: CUSTOM_COLORS_MODAL.TEXT_PRIMARY,
                    }}
                />
            )}
            {errorMessage && (
                <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
            )}
        </div>
    );
};

const SelectField = ({ label, name, value, onChange, options, required, status = 'initial', errorMessage = '' }) => {
     const borderColor = status === 'valid' 
        ? CUSTOM_COLORS_MODAL.VALID_BORDER 
        : status === 'invalid' 
        ? CUSTOM_COLORS_MODAL.INVALID_BORDER 
        : CUSTOM_COLORS_MODAL.INPUT_BORDER;

    return (
        <div className="flex flex-col space-y-1">
            <label htmlFor={name} className="text-sm font-medium" style={{ color: CUSTOM_COLORS_MODAL.TEXT_SECONDARY }}>
                {label}
                {required && <span className="ml-1" style={{ color: CUSTOM_COLORS_MODAL.REQUIRED_ASTERISK }}>*</span>}
            </label>
            <div className="relative flex items-center">
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className="appearance-none flex-1 w-full px-3 py-2 text-sm rounded-md border focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 cursor-pointer"
                    style={{
                        backgroundColor: CUSTOM_COLORS_MODAL.INPUT_BG,
                        borderColor: borderColor, 
                        color: CUSTOM_COLORS_MODAL.TEXT_PRIMARY,
                    }}
                >
                    <option value="" disabled>-- Select Category --</option>
                    {options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
            {errorMessage && (
                <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
            )}
        </div>
    );
};


// --- ExpenseEntryModal Component (with Subtle Blur and Validation Logic) ---

function ExpenseEntryModal({ isOpen, onClose, editExpense, onExpenseSubmitted }) {
    const initialFormData = {
        expense_name: '', category: '', item: '', supplier: '', description: '', amount: '',
        date: new Date().toISOString().substring(0, 10), location: '',
    };
    
    // Tracks form data
    const [formData, setFormData] = useState(initialFormData);
    // Tracks validation status: { fieldName: 'initial' | 'valid' | 'invalid' }
    const [validationStatus, setValidationStatus] = useState({});
    // Tracks field-specific error messages
    const [fieldErrors, setFieldErrors] = useState({});

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Initialization and reset logic
    useEffect(() => {
        if (isOpen) {
            if (editExpense) {
                setIsEditing(true);
                setEditId(editExpense.id);
                setFormData({
                    expense_name: editExpense.expense_name || '',
                    category: editExpense.category || '',
                    item: editExpense.item || '',
                    supplier: editExpense.supplier || '',
                    description: editExpense.description || '',
                    amount: editExpense.amount?.toString() || '',
                    date: editExpense.date || new Date().toISOString().substring(0, 10),
                    location: editExpense.location || '',
                });
            } else {
                setIsEditing(false);
                setEditId(null);
                setFormData(initialFormData);
            }
            setValidationStatus({});
            setFieldErrors({});
            setMessage(null);
        }
    }, [isOpen, editExpense]);

    const validateField = useCallback((name, value) => {
        const errorMessage = getFieldErrorMessage(name, value);
        const isValid = !errorMessage;
        
        setFieldErrors(prev => ({
            ...prev,
            [name]: errorMessage
        }));
        
        setValidationStatus(prev => ({
            ...prev,
            [name]: isValid ? 'valid' : 'invalid'
        }));
        
        return isValid;
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setMessage(null);

        // Immediate field validation for all fields
        validateField(name, value);
    };

    const handleAmountChange = (e) => {
        const { value } = e.target;
        // Only allow valid number format characters
        if (/^\d*\.?\d*$/.test(value) || value === '') {
            setFormData(prev => ({ ...prev, amount: value }));
        }
        setMessage(null);

        // Immediate amount validation
        validateField('amount', value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Final Validation Check for all required fields
        const requiredFields = ['expense_name', 'category', 'amount', 'date'];
        let allValid = true;
        const newValidationStatus = {};
        const newFieldErrors = {};

        requiredFields.forEach(field => {
            const errorMessage = getFieldErrorMessage(field, formData[field]);
            const isValid = !errorMessage;
            
            newValidationStatus[field] = isValid ? 'valid' : 'invalid';
            newFieldErrors[field] = errorMessage;
            
            if (!isValid) allValid = false;
        });

        setValidationStatus(newValidationStatus);
        setFieldErrors(newFieldErrors);

        if (!allValid) {
            setMessage({ type: 'error', text: 'Please correct the highlighted fields before submitting.' });
            setLoading(false);
            return;
        }

        const dataToSend = { ...formData, amount: parseFloat(formData.amount).toFixed(2) };

        try {
            const url = isEditing ? `${EXPENSE_API_ENDPOINT}${editId}/` : EXPENSE_API_ENDPOINT;

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: isEditing ? 'Expense updated successfully!' : 'Expense recorded successfully!' });
                if (onExpenseSubmitted) onExpenseSubmitted();
                setTimeout(onClose, 1500);
            } else {
                const errorData = await response.json();
                setMessage({ type: 'error', text: `Failed to ${isEditing ? 'update' : 'save'} expense. Details: ${JSON.stringify(errorData)}` });
            }
        } catch (error) {
            setMessage({ type: 'error', text: `Network error. Could not connect to the server.` });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        // MODIFIED: Using Tailwind classes 'bg-black/30' and 'backdrop-blur-sm'
        // to achieve the blurred, dimmed background effect.
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/30 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl mx-auto rounded-lg shadow-2xl flex flex-col h-[90vh] md:h-[80vh] overflow-hidden"
                 style={{ backgroundColor: CUSTOM_COLORS_MODAL.MODAL_BG }}>

                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200" style={{ backgroundColor: CUSTOM_COLORS_MODAL.HEADER_BG }}>
                    <h2 className="text-xl font-semibold" style={{ color: CUSTOM_COLORS_MODAL.HEADER_TEXT }}>
                        Expense Entry
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5" style={{ color: CUSTOM_COLORS_MODAL.HEADER_CLOSE_BTN }} />
                    </button>
                </div>

                {/* Modal Body (Scrollable Form Content) */}
                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                    
                    {/* Expense Information Section - Mimics Customer Information */}
                    <div className="p-5 rounded-lg border border-gray-200" style={{ backgroundColor: CUSTOM_COLORS_MODAL.SECTION_BG }}>
                        <ModalSectionHeader icon={User} title="Expense Information" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField 
                                label="Expense Name" name="expense_name" value={formData.expense_name} onChange={handleChange} placeholder="e.g., Tractor Fuel, Seed Purchase" required 
                                status={validationStatus.expense_name}
                                errorMessage={fieldErrors.expense_name}
                            />
                            <SelectField 
                                label="Category" name="category" value={formData.category} onChange={handleChange} options={CATEGORIES} required 
                                status={validationStatus.category}
                                errorMessage={fieldErrors.category}
                            />
                        </div>
                    </div>

                    {/* Purchase Details Section - Mimics Order Details */}
                    <div className="p-5 rounded-lg border border-gray-200" style={{ backgroundColor: CUSTOM_COLORS_MODAL.SECTION_BG }}>
                        <ModalSectionHeader icon={ShoppingBag} title="Purchase Details" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <InputField 
                                label="Item Purchased" name="item" value={formData.item} onChange={handleChange} placeholder="e.g., Diesel, Tomato Seeds" 
                                errorMessage={fieldErrors.item}
                            />
                            <InputField 
                                label="Supplier" name="supplier" value={formData.supplier} onChange={handleChange} placeholder="e.g., Shell Petrol, Agro Distributor Ltd" 
                                errorMessage={fieldErrors.supplier}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField 
                                label="Amount (UGX)" name="amount" value={formData.amount} onChange={handleAmountChange} placeholder="0.00" required type="text"
                                status={validationStatus.amount}
                                errorMessage={fieldErrors.amount}
                            />
                            <InputField 
                                label="Date of Expense" name="date" value={formData.date} onChange={handleChange} required type="date"
                                status={validationStatus.date}
                                errorMessage={fieldErrors.date}
                            />
                        </div>
                    </div>

                    {/* Additional Details Section - Mimics Payment Information */}
                    <div className="p-5 rounded-lg border border-gray-200" style={{ backgroundColor: CUSTOM_COLORS_MODAL.SECTION_BG }}>
                        <ModalSectionHeader icon={Home} title="Farm Specifics" />
                        <div className="space-y-4">
                            <InputField 
                                label="Location/Farm Section" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Main Farm, Processing Unit" 
                                errorMessage={fieldErrors.location}
                            />
                            <InputField 
                                label="Detailed Description (Optional)" name="description" value={formData.description} onChange={handleChange} placeholder="Provide details about the expense, reason for purchase, or quantity." 
                                isTextArea={true} 
                            />
                        </div>
                    </div>

                    {/* Error message (if any) */}
                    {message && (
                        <div className={`p-3 text-center text-sm font-medium rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}
                </div>

                {/* Modal Footer (Buttons) */}
                <div className="flex justify-end p-4 border-t border-gray-200 space-x-3" style={{ backgroundColor: CUSTOM_COLORS_MODAL.FOOTER_BG }}>
                    <ActionButton
                        onClick={onClose}
                        className="rounded-md"
                        style={{ backgroundColor: CUSTOM_COLORS_MODAL.BUTTON_SECONDARY_BG, color: CUSTOM_COLORS_MODAL.BUTTON_SECONDARY_TEXT }}
                    >
                        Cancel
                    </ActionButton>
                    <ActionButton
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-md"
                        style={{ backgroundColor: CUSTOM_COLORS_MODAL.BUTTON_PRIMARY_BG, color: CUSTOM_COLORS_MODAL.BUTTON_PRIMARY_TEXT }}
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isEditing ? 'Updating...' : 'Submitting...'}</>
                        ) : (
                            <><Send className="w-4 h-4 mr-2" />{isEditing ? 'Save Changes' : 'Submit Expense Record'}</>
                        )}
                    </ActionButton>
                </div>
            </div>
        </div>
    );
}

// --- ExpensesPage Component (Main Export) ---

export function ExpensesPage() {
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchExpenses = useCallback(async (retries = 3) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(EXPENSE_API_ENDPOINT);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const normalized = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
            setExpenses(normalized);
            setLoading(false);
        } catch (err) {
            setError(`Could not load records. Failed reason: ${err.message}`);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const filteredExpenses = useMemo(() => {
        let filtered = expenses;
        if (searchTerm) filtered = filtered.filter(e => e.expense_name?.toLowerCase().includes(searchTerm.toLowerCase()) || e.supplier?.toLowerCase().includes(searchTerm.toLowerCase()));
        if (filterCategory) filtered = filtered.filter(e => e.category === filterCategory);
        return filtered;
    }, [expenses, searchTerm, filterCategory]);

    const sortedExpenses = useMemo(() => {
        const base = Array.isArray(filteredExpenses) ? filteredExpenses : [];
        let sortableItems = [...base];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                const headerType = TABLE_HEADERS.find(h => h.key === sortConfig.key)?.type;

                if (headerType === 'number') {
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
    }, [filteredExpenses, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
    };

    const uniqueCategories = useMemo(() => {
        const categories = expenses.map(e => e.category).filter(Boolean);
        return [...new Set(categories)].sort();
    }, [expenses]);


    const handleEditExpense = (expense) => {
        setExpenseToEdit(expense);
        setShowExpenseModal(true);
    };

    const handleAddNewExpense = () => {
        setExpenseToEdit(null);
        setShowExpenseModal(true);
    };

    const handleModalCloseAndRefresh = () => {
        setShowExpenseModal(false);
        fetchExpenses();
    };

    const handleDeleteExpense = async () => {
        if (!expenseToDelete) return;
        setDeleting(true);
        try {
            const response = await fetch(`${EXPENSE_API_ENDPOINT}${expenseToDelete.id}/`, { method: 'DELETE' });
            if (response.ok) {
                setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== expenseToDelete.id));
                setShowDeleteModal(false);
                setExpenseToDelete(null);
            } else {
                console.error('Failed to delete expense');
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
        } finally {
            setDeleting(false);
        }
    };

    const renderTableContent = () => {
        if (loading) return <tr><td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-gray-600"><Loader2 className="w-6 h-6 animate-spin inline-block mr-2" style={{ color: ACCENT_COLORS.ACCENT_BROWN }} />Loading expense records...</td></tr>;
        if (error) return <tr><td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-red-600 font-medium">{error}</td></tr>;
        if (sortedExpenses.length === 0) return <tr><td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-gray-500 italic">No expense records found matching your criteria.</td></tr>;

        return sortedExpenses.map((expense, index) => (
            <tr key={expense.id || index} className="border-b transition-colors duration-150 hover:bg-gray-50">
                <td className="px-6 py-3 text-left font-medium text-gray-800">{expense.expense_name || 'N/A'}</td>
                <td className="px-6 py-3 text-left text-gray-600">{expense.category || '-'}</td>
                <td className="px-6 py-3 text-center text-gray-600">{expense.date || 'N/A'}</td>
                <td className="px-6 py-3 text-right font-bold" style={{ color: ACCENT_COLORS.ACCENT_BROWN }}>{formatCurrency(expense.amount)}</td>
                <td className="px-6 py-3 text-left text-gray-700">{expense.supplier || '-'}</td>
                <td className="px-6 py-3 text-left text-sm italic text-gray-500">{expense.location || '-'}</td>
                <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleEditExpense(expense)} className="text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-gray-100 transition-colors">
                            <Edit className="w-4 h-4" />
</button>
                        <button onClick={() => { setExpenseToDelete(expense); setShowDeleteModal(true); }} className="text-error hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors">
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

                <h2 className="text-2xl sm:text-3xl font-bold text-[#4A3423] mb-8">
                    Expense Records Overview
                </h2>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Total Expenses */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-500 flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" stroke="#EA4335" />
                                Total Expenses
                            </p>
                            <Calendar className="w-4 h-4" stroke="#8D8D8D" strokeWidth={2.2} />
                        </div>
                        {loading ? (
                            <div className="flex items-center gap-2 mt-2">
                                <Loader2 className="w-6 h-6 animate-spin text-[#795548]" />
                                <span className="text-sm text-gray-500">Loading...</span>
                            </div>
                        ) : (
                            <>
                                <p className="text-4xl font-extrabold text-gray-900 leading-none">
                                    UGX {expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-xs text-gray-500 mt-2 font-medium">Total records: {expenses.length}</p>
                            </>
                        )}
                    </div>

                    {/* Average Expense */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-500 flex items-center">
                                <Tag className="w-4 h-4 mr-1" stroke="#795548" />
                                Average Expense
                            </p>
                            <Calendar className="w-4 h-4" stroke="#8D8D8D" strokeWidth={2.2} />
                        </div>
                        {loading ? (
                            <div className="flex items-center gap-2 mt-2">
                                <Loader2 className="w-6 h-6 animate-spin text-[#795548]" />
                                <span className="text-sm text-gray-500">Loading...</span>
                            </div>
                        ) : (
                            <>
                                <p className="text-4xl font-extrabold text-gray-900 leading-none">
                                    UGX {expenses.length > 0 ? (expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0) / expenses.length).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}
                                </p>
                                <p className="text-xs text-gray-500 mt-2 font-medium">Per transaction</p>
                            </>
                        )}
                    </div>

                    {/* Unique Categories */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-500 flex items-center">
                                <ShoppingBag className="w-4 h-4 mr-1" stroke="#8D8D8D" />
                                Expense Categories
                            </p>
                            <ShoppingBag className="w-4 h-4 text-gray-500" strokeWidth={2.2} />
                        </div>
                        {loading ? (
                            <div className="flex items-center gap-2 mt-2">
                                <Loader2 className="w-6 h-6 animate-spin text-[#795548]" />
                                <span className="text-sm text-gray-500">Loading...</span>
                            </div>
                        ) : (
                            <>
                                <p className="text-4xl font-extrabold text-gray-900 leading-none">
                                    {new Set(expenses.map(exp => exp.category).filter(Boolean)).size}
                                </p>
                                <p className="text-xs text-gray-500 mt-2 font-medium">Unique categories</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Action Bar & Filter */}
                <div className="mb-4 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex gap-3 items-center w-full sm:w-auto order-2 sm:order-1">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="search"
                                placeholder="Search by expense/supplier..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="p-2 pl-10 text-sm w-full sm:w-56 border border-gray-300 rounded-xl focus:ring-accent-btn focus:border-accent-btn transition-colors shadow-lg"
                            />
                        </div>
                        <div className="relative inline-block text-left">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-xl py-2 pl-4 pr-8 text-sm text-gray-700 leading-tight focus:outline-none focus:ring-accent-btn focus:border-accent-btn shadow-lg transition duration-300 ease-in-out"
                            >
                                <option value="">Filter by Category</option>
                                {uniqueCategories.map(category => (<option key={category} value={category}>{category}</option>))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                        <button
                            onClick={() => fetchExpenses()}
                            disabled={loading}
                            className="py-2 px-4 shadow-xl rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            style={{ backgroundColor: '#efebe9', color: '#783A1E', border: 'none' }}
                        >
                            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                            Refresh Data
                        </button>
                    </div>

                    <div className="flex gap-3 order-1 sm:order-2">
                        <button
                            onClick={handleAddNewExpense}
                            className="py-2 px-4 shadow-xl rounded-xl flex items-center font-semibold text-white hover:shadow-2xl transition-all duration-200"
                            style={{ backgroundColor: '#8B4513' }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Record New Expense
                        </button>
                        <button
                            onClick={() => alert('Exporting...')}
                            className="py-2 px-4 shadow-xl rounded-xl"
                            style={{ backgroundColor: '#efebe9', color: '#783A1E', border: 'none' }}
                        >
                            Export to Excel
                        </button>
                    </div>
                </div>


                {/* --- Expense Records Table --- */}
                <div className="max-w-full w-full mx-auto p-0 shadow-xl rounded-2xl overflow-hidden bg-white transition-all duration-300"><div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead style={{ backgroundColor: '#efebe9', color: '#4A3423' }}>
                            <tr>
                                {TABLE_HEADERS.map((header) => (
                                    <th key={header.key} onClick={() => requestSort(header.key)} scope="col" className="px-6 py-3 text-sm font-semibold uppercase tracking-wider cursor-pointer text-gray-700 hover:text-gray-900 transition-colors duration-150">
                                        <div className={`flex items-center ${header.type === 'number' ? 'justify-end' : 'justify-start'}`}>
                                            {header.label}
                                            {getSortIcon(header.key)}
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-center text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white/80 divide-y divide-gray-100 text-xs">
                            {renderTableContent()}
                        </tbody>
                    </table>
                    </div>
                </div>
            </main>

            {/* --- Delete Confirmation Modal --- */}
            {showDeleteModal && expenseToDelete && (
                <div
                    className="fixed inset-0 flex justify-center items-center transition-all duration-300 backdrop-blur-sm"
                    style={{
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(75, 52, 35, 0.5) 100%)',
                        zIndex: 1000,
                    }}
                    onClick={() => { setShowDeleteModal(false); setExpenseToDelete(null); }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-[#4A3423]">Confirm Delete</h3>
                            <button
                                onClick={() => { setShowDeleteModal(false); setExpenseToDelete(null); }}
                                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete the expense: <strong>{expenseToDelete.expense_name}</strong>?
                            <br />
                            <span className="text-sm text-gray-500">This action cannot be undone.</span>
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setExpenseToDelete(null); }}
                                className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteExpense}
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

            {/* --- Expense Entry Modal (Internal Component) --- */}
            <ExpenseEntryModal
                isOpen={showExpenseModal}
                onClose={handleModalCloseAndRefresh}
                editExpense={expenseToEdit}
                onExpenseSubmitted={fetchExpenses}
            />

        </SideNav>
    );
}

export default ExpensesPage;