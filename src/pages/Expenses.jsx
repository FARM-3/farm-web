import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Home, DollarSign, ShoppingBag, Users, Settings, LogOut, Menu, X, Bell, UserCircle,
    RefreshCw, Calendar, Tag, MapPin, Truck, Send, Loader2, ArrowUp, ArrowDown, Edit, Trash2, Search, Filter, ChevronsDown
} from 'lucide-react';
import { SideNav } from '../components/SideNav';

// --- Global Styles & Constants (Modern & Light Theme from Image) ---

const CoffeeColors = {
    SCREEN_BG: '#FFF8F6', ACTIVE_LINK_BG: '#efebe9', ACTIVE_LINK_TEXT: '#783A1E', DARK_BROWN: '#4A3423', MEDIUM_BROWN: '#795548', BUTTON_BROWN: '#795548', GRAY_TEXT: '#8D8D8D', SUCCESS_GREEN: '#34A853', ERROR_RED: '#EA4335',
};

// IMPORTANT: Updated to the live API endpoint
const EXPENSE_API_ENDPOINT = 'https://api-3181.onrender.com/api/expenses/';


// --- Helper Components ---

const NavLink = ({ to, icon: Icon, children, currentPath }) => {
    const isActive = currentPath === to;
    return (
        <a
            href={to}
            className={`flex items-center p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                    ? 'font-semibold shadow-inner'
                    : 'hover:bg-gray-100'
            }`}
            style={{
                backgroundColor: isActive ? ACCENT_COLORS.ACTIVE_NAV_BG : 'transparent',
                color: isActive ? ACCENT_COLORS.ACTIVE_NAV_TEXT : ACCENT_COLORS.INACTIVE_NAV_TEXT
            }}
        >
            <Icon className="w-5 h-5 mr-3" />
            <span className="text-sm">{children}</span>
        </a>
    );
};

const MenuButton = ({ onClick, isOpen }) => (
    <button
        onClick={onClick}
        className="p-2 rounded-full md:hidden transition-all duration-300"
        style={{ color: ACCENT_COLORS.ACCENT_BROWN, backgroundColor: ACCENT_COLORS.ACTIVE_NAV_BG }}
    >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
);




// Helper function to format currency (UGX style)
const formatCurrency = (amount) => {
    const value = parseFloat(amount);
    if (isNaN(value)) return 'UGX 0';

    return `UGX ${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.round(value))}`;
};

const Button = ({ children, onClick, className, disabled, type = 'primary' }) => {
    const baseClasses = `px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm`;

    let colorClasses;
    if (type === 'secondary') {
        colorClasses = `bg-light-coffee-brown text-active-link-text hover:bg-light-coffee-brown/80`;
    } else {
        colorClasses = `bg-accent-btn text-white hover:bg-accent-btn/90`;
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${colorClasses} ${className}`}
        >
            {children}
        </button>
    );
};

// Data Structure for Table Headers (used for sorting)
const TABLE_HEADERS = [
    { key: 'expense_name', label: 'Name', type: 'string' },
    { key: 'category', label: 'Category', type: 'string' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'amount', label: 'Amount', type: 'number' },
    { key: 'supplier', label: 'Supplier', type: 'string' },
    { key: 'location', label: 'Location', type: 'string' },
];


function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const navigate = useNavigate();

    // Sorting state
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Live Data Fetcher with retry logic
    const fetchExpenses = useCallback(async (retries = 3) => {
        setLoading(true);
        setError(null);

        console.log('--- Expense Fetch Started from Live API ---');

        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(EXPENSE_API_ENDPOINT);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const normalized = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.results)
                        ? data.results
                        : [];

                setExpenses(normalized);
                setError(null);
                setLoading(false);

                console.log('Expense Data fetched successfully. Total records:', normalized.length);
                return;

            } catch (err) {
                console.error(`Attempt ${i + 1} failed to fetch expenses:`, err);
                if (i === retries - 1) {
                    const finalError = `Could not load records from ${EXPENSE_API_ENDPOINT}. Failed reason: ${err.message}`;
                    setError(finalError);
                    setExpenses([]);
                    setLoading(false);
                    return;
                }
                // Exponential backoff delay
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }
    }, []);


    // Initial data fetch on component mount
    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    // Filtering logic
    const filteredExpenses = React.useMemo(() => {
        let filtered = expenses;

        if (searchTerm) {
            filtered = filtered.filter(e =>
                e.expense_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterCategory) {
            filtered = filtered.filter(e => e.category === filterCategory);
        }

        return filtered;
    }, [expenses, searchTerm, filterCategory]);


    // Sorting logic (same as wages.jsx)
    const sortedExpenses = React.useMemo(() => {
        const base = Array.isArray(filteredExpenses) ? filteredExpenses : [];
        let sortableItems = [...base];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                const headerType = TABLE_HEADERS.find(h => h.key === sortConfig.key)?.type;

                // Handle number sorting
                if (headerType === 'number') {
                    const numA = parseFloat(aValue || 0);
                    const numB = parseFloat(bValue || 0);
                    if (numA < numB) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (numA > numB) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                }

                // Default string/date sorting
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredExpenses, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return null;
        }
        if (sortConfig.direction === 'ascending') {
            return <ArrowUp className="w-3 h-3 ml-1" />;
        }
        return <ArrowDown className="w-3 h-3 ml-1" />;
    };

    // Extract unique categories for the filter dropdown
    const uniqueCategories = React.useMemo(() => {
        const categories = expenses.map(e => e.category).filter(Boolean);
        return [...new Set(categories)].sort();
    }, [expenses]);


    // Handle delete expense
    const handleDeleteExpense = async () => {
        if (!expenseToDelete) return;

        setDeleting(true);
        try {
            const response = await fetch(`${EXPENSE_API_ENDPOINT}${expenseToDelete.id}/`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Remove the expense from the local state
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

    // Handle edit expense
    const handleEditExpense = (expense) => {
        // Navigate to expense entry with expense data (assuming an expense-entry route exists)
        navigate('/expense-entry', { state: { editExpense: expense } });
    };

    const renderTableContent = () => {
        if (loading) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-gray-600">
                        <Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-accent-btn" />
                        Loading expense records...
                    </td>
                </tr>
            );
        }

        if (error) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-red-600 font-medium">
                        {error}
                    </td>
                </tr>
            );
        }

        if (sortedExpenses.length === 0) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-gray-500 italic">
                        No expense records found matching your criteria.
                    </td>
                </tr>
            );
        }

        return sortedExpenses.map((expense, index) => (
            <tr key={expense.id || index} className="border-b transition-colors duration-150 hover:bg-gray-50">
                <td className="px-6 py-3 text-left font-medium text-gray-800">{expense.expense_name || 'N/A'}</td>
                <td className="px-6 py-3 text-left text-gray-600">{expense.category || '-'}</td>
                <td className="px-6 py-3 text-center text-gray-600">{expense.date || 'N/A'}</td>
                <td className="px-6 py-3 text-right font-bold text-text-default">
                    {formatCurrency(expense.amount)}
                </td>
                <td className="px-6 py-3 text-left text-gray-700">{expense.supplier || '-'}</td>
                <td className="px-6 py-3 text-left text-sm italic text-gray-500">{expense.location || '-'}</td>
                <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                        <button
                            onClick={() => handleEditExpense(expense)}
                            className="p-1 rounded hover:bg-gray-200 transition-colors"
                            title="Edit expense"
                        >
                            <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                            onClick={() => {
                                setExpenseToDelete(expense);
                                setShowDeleteModal(true);
                            }}
                            className="p-1 rounded hover:bg-gray-200 transition-colors"
                            title="Delete expense"
                        >
                            <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                    </div>
                </td>
            </tr>
        ));
    };

    return (
        <SideNav>
            <main className="p-4 sm:p-6 md:p-8 pt-0">

                {/* Top Action Bar */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-text-default mb-4 md:mb-0">
                        Expense Records Overview
                    </h1>
                    <div className="flex space-x-3 mt-4 md:mt-0">
                        <Button
                            type="secondary"
                            onClick={() => navigate('/expense-entry')}
                            className="shadow-xl"
                        >
                            Record New Expense
                        </Button>
                        <Button
                            type="secondary"
                            onClick={() => alert('Exporting to Excel is not yet implemented.')}
                            className="shadow-xl"
                        >
                            Export to Excel
                        </Button>
                    </div>
                </div>

                {/* Search, Filter, Refresh Bar */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-stretch sm:items-center p-4 rounded-lg bg-white shadow-md">
                    
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by expense/supplier name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition"
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative w-full sm:w-48">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="appearance-none w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition"
                        >
                            <option value="">Filter by Category</option>
                            {uniqueCategories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <ChevronsDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>

                    {/* Refresh Button */}
                    <Button
                        type="secondary"
                        onClick={() => fetchExpenses()}
                        disabled={loading}
                        className="py-2 px-6 shadow-lg"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </Button>
                </div>

                {/* Expense Records Table Container */}
                <div className="mt-8">
                    <div className="w-full bg-white shadow-xl rounded-2xl overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-light-coffee-brown text-text-default">
                                <tr>
                                    {TABLE_HEADERS.map((header) => (
                                        <th
                                            key={header.key}
                                            className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer text-gray-700 hover:text-gray-900 transition-colors duration-150"
                                            onClick={() => requestSort(header.key)}
                                            scope="col"
                                        >
                                            <div className={`flex items-center ${header.type === 'number' ? 'justify-end' : 'justify-start'}`}>
                                                {header.label}
                                                {getSortIcon(header.key)}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-center text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {renderTableContent()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && expenseToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4 text-text-default">
                            Confirm Deletion
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete the expense: **{expenseToDelete.expense_name}**? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setExpenseToDelete(null);
                                }}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteExpense}
                                disabled={deleting}
                                className="px-4 py-2 text-white rounded-lg transition-colors flex items-center shadow-md"
                                style={{ backgroundColor: '#D32F2F' }}
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Permanently'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SideNav>
    );
}

export default Expenses;
