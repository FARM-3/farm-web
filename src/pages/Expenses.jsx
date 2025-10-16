import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, DollarSign, Calendar, Tag, MapPin, Truck, Send, Loader2, ArrowUp, ArrowDown, Edit, Trash2 } from 'lucide-react';
import NavBar from '../components/NavBar.jsx';

// --- Custom Styles (Consistent with other files) ---
const CUSTOM_COLORS = {
    headerBg: '#702A0B', // Dark Brown
    cardBg: '#F5EEDC', // Pale Cream
    inputBorder: '#B8A072',
    actionBg: '#702A0B',
    primaryText: '#702A0B',
    tableHeaderBg: '#B8A072',
};

// IMPORTANT: Updated to the live API endpoint
const EXPENSE_API_ENDPOINT = 'https://api-3181.onrender.com/api/expenses/';

const ActionButton = ({ children, onClick, className, style, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        style={{ ...style, backgroundColor: CUSTOM_COLORS.actionBg }}
    >
        {children}
    </button>
);

// Helper function to format currency
const formatCurrency = (amount) => {
    const value = parseFloat(amount);
    if (isNaN(value)) return '$0.00';

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

// Data Structure for Table Headers (used for sorting)
const TABLE_HEADERS = [
    { key: 'expense_name', label: 'Name', icon: Truck, type: 'string' },
    { key: 'category', label: 'Category', icon: Tag, type: 'string' },
    { key: 'date', label: 'Date', icon: Calendar, type: 'date' },
    { key: 'amount', label: 'Amount', icon: DollarSign, type: 'number' },
    { key: 'supplier', label: 'Supplier', icon: Truck, type: 'string' },
    { key: 'location', label: 'Location', icon: MapPin, type: 'string' },
];


function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
                // Normalize API response to always be an array (handles paginated objects with `results`)
                const normalized = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.results)
                        ? data.results
                        : [];

                setExpenses(normalized);
                setError(null);
                setLoading(false);

                console.log('Expense Data fetched successfully. Total records:', data.length);
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

    // Sorting logic (same as wages.jsx)
    const sortedExpenses = React.useMemo(() => {
        const base = Array.isArray(expenses) ? expenses : [];
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
    }, [expenses, sortConfig]);

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
        // Navigate to expense entry with expense data
        navigate('/expense-entry', { state: { editExpense: expense } });
    };

    const renderTableContent = () => {
        if (loading) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-gray-600">
                        <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" style={{ color: CUSTOM_COLORS.primaryText }} />
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
                        No expense records found. Click "Refresh" or "Record New Expense".
                    </td>
                </tr>
            );
        }

        return sortedExpenses.map((expense, index) => (
            <tr key={expense.id || index} className="border-b transition-colors duration-150 hover:bg-white/50">
                <td className="px-6 py-3 text-left font-medium text-gray-800">{expense.expense_name || 'N/A'}</td>
                <td className="px-6 py-3 text-left text-gray-600">{expense.category || '-'}</td>
                <td className="px-6 py-3 text-center text-gray-600">{expense.date || 'N/A'}</td>
                <td className="px-6 py-3 text-right text-red-600 font-bold">{(expense.amount)}</td>
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
        <>
            <NavBar />

            {/* Main Content Area */}
            <div className="min-h-screen flex flex-col items-center pt-24 md:pt-32 pb-10 font-sans"
                 style={{ backgroundColor: '#FAF7F1' }}>

                {/* Header and Action Bar */}
                <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 mb-6 flex justify-between items-center">
                    <h1 className="text-4xl font-extrabold" style={{ color: CUSTOM_COLORS.primaryText }}>
                        Expense Records Overview
                    </h1>
                    <div className="flex space-x-4">
                        <ActionButton onClick={() => fetchExpenses()} disabled={loading} className="py-2 px-4 shadow-xl" style={{ backgroundColor: CUSTOM_COLORS.headerBg }}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh Data
                        </ActionButton>
                        <ActionButton onClick={() => navigate('/expense-entry')} className="py-2 px-4 shadow-xl">
                            <Send className="w-4 h-4 mr-2" />
                            Record New Expense
                        </ActionButton>
                    </div>
                </div>

                {/* Expense Records Table Container */}
                <div
                    className="max-w-7xl w-full mx-4 p-4 sm:p-8 shadow-2xl rounded-2xl overflow-x-auto transition-all duration-300"
                    style={{ backgroundColor: CUSTOM_COLORS.cardBg, border: `1px solid ${CUSTOM_COLORS.inputBorder}` }}
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="sticky top-0 z-10" style={{ backgroundColor: CUSTOM_COLORS.tableHeaderBg }}>
                                <tr>
                                    {TABLE_HEADERS.map((header) => (
                                        <th
                                            key={header.key}
                                            className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                            onClick={() => requestSort(header.key)}
                                            scope="col"
                                        >
                                            <div className={`flex items-center ${header.type === 'number' ? 'justify-end' : 'justify-start'}`}>
                                                {header.icon && <header.icon className="w-4 h-4 mr-1" />}
                                                {header.label}
                                                {(header.icon !== null || header.key === sortConfig.key) && getSortIcon(header.key)}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/70 divide-y divide-gray-200" style={{ color: CUSTOM_COLORS.primaryText }}>
                                {renderTableContent()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && expenseToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4" style={{ color: CUSTOM_COLORS.primaryText }}>
                            Confirm Delete
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this expense for "{expenseToDelete.expense_name}"?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setExpenseToDelete(null);
                                }}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteExpense}
                                disabled={deleting}
                                className="px-4 py-2 text-white rounded-lg transition-colors flex items-center"
                                style={{ backgroundColor: '#D32F2F' }}
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
        </>
    );
}

export default Expenses;
