import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, DollarSign, Calendar, Tag, MapPin, Truck, Send, Loader2, ArrowUp, ArrowDown, ArrowUpRight, ArrowDownLeft, Edit, Trash2 } from 'lucide-react';
import SideNav from '../components/SideNav.jsx';

// --- API ENDPOINT ---
const SALES_API_ENDPOINT = 'https://api-3181.onrender.com/api/sales/';

// --- UTILITIES ---

// Helper function for currency formatting (UGX)
const formatUGX = (amount) => {
    if (typeof amount !== 'number') return '';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'UGX',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount).replace('UGX', 'UGX ');
};

// --- CONFIGURATION ---
// Coffee Theme Colors from Login.jsx
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

const customTailwindConfig = {
    theme: {
        extend: {
            colors: {
                'app-bg': CoffeeColors.SCREEN_BG,
                'accent-header': CoffeeColors.LIGHT_BG,
                'accent-btn': CoffeeColors.BUTTON_BROWN,
                'text-default': CoffeeColors.DARK_BROWN,
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        }
    }
};

// Inject custom Tailwind config (Necessary for single-file environment)
const styleScript = document.createElement('script');
styleScript.innerHTML = `tailwind.config = ${JSON.stringify(customTailwindConfig)}`;
document.head.appendChild(styleScript);

const ActionButton = ({ children, onClick, className, style, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        style={{ ...style, backgroundColor: CoffeeColors.BUTTON_BROWN }}
    >
        {children}
    </button>
);

function Sales() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Sorting state
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

    // Sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [saleToDelete, setSaleToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Live data fetcher with retry logic
    const fetchSales = useCallback(async (retries = 3) => {
        setLoading(true);
        setError(null);

        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(SALES_API_ENDPOINT);
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

                setSales(normalized);
                setError(null);
                setLoading(false);
                return;

            } catch (err) {
                console.error(`Attempt ${i + 1} failed to fetch sales:`, err);
                if (i === retries - 1) {
                    const finalError = `Could not load sales records from ${SALES_API_ENDPOINT}. Failed reason: ${err.message}`;
                    setError(finalError);
                    setSales([]);
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
        fetchSales();
    }, [fetchSales]);

    // Sorting logic
    const sortedSales = React.useMemo(() => {
        const base = Array.isArray(sales) ? sales : [];
        let sortableItems = [...base];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                // Handle number sorting
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    if (aValue < bValue) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (aValue > bValue) {
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
    }, [sales, sortConfig]);

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

    // Handle delete sale
    const handleDeleteSale = async () => {
        if (!saleToDelete) return;

        setDeleting(true);
        try {
            const response = await fetch(`${SALES_API_ENDPOINT}${saleToDelete.id}/`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Remove the sale from the local state
                setSales(prevSales => prevSales.filter(sale => sale.id !== saleToDelete.id));
                setShowDeleteModal(false);
                setSaleToDelete(null);
            } else {
                console.error('Failed to delete sale');
            }
        } catch (error) {
            console.error('Error deleting sale:', error);
        } finally {
            setDeleting(false);
        }
    };

    // Handle edit sale
    const handleEditSale = (sale) => {
        // Navigate to sales entry with sale data
        navigate('/sales-entry', { state: { editSale: sale } });
    };

    const renderTableContent = () => {
        if (loading) {
            return (
                <tr className='h-24'>
                    <td colSpan={7} className="text-center py-6 text-gray-600">
                        <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" style={{ color: CoffeeColors.DARK_BROWN }} />
                        Loading sales records...
                    </td>
                </tr>
            );
        }

        if (error) {
            return (
                <tr className='h-24'>
                    <td colSpan={7} className="text-center py-6 text-red-600 font-medium">
                        {error}
                    </td>
                </tr>
            );
        }

        if (sortedSales.length === 0) {
            return (
                <tr className='h-24'>
                    <td colSpan={7} className="text-center py-6 text-gray-500 italic">
                        No sales records found. Click "Refresh" to try again.
                    </td>
                </tr>
            );
        }

        return sortedSales.map((sale, index) => {
            const customerName = sale.customer_name || 'N/A';
            const itemInfo = sale.item || 'N/A';
            const amountClass = 'text-green-600';

            return (
                <tr key={sale.id || index} className="border-b transition-colors duration-150 hover:bg-white/50">
                    <td className="px-6 py-3 text-left font-medium text-gray-800">{customerName}</td>
                    <td className="px-6 py-3 text-left text-gray-600">{itemInfo}</td>
                    <td className="px-6 py-3 text-center text-gray-700">{sale.quantity || 'N/A'}</td>
                    <td className="px-6 py-3 text-right text-green-600 font-bold">{formatUGX(sale.amount_paid || sale.amount)}</td>
                    <td className="px-6 py-3 text-left text-gray-700">{sale.method_of_payment || 'N/A'}</td>
                    <td className="px-6 py-3 text-right text-gray-500">{sale.date_of_payment || 'N/A'}</td>
                    <td className="px-6 py-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                            <button
                                onClick={() => handleEditSale(sale)}
                                className="p-1 rounded hover:bg-gray-200 transition-colors"
                                title="Edit sale"
                            >
                                <Edit className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                                onClick={() => {
                                    setSaleToDelete(sale);
                                    setShowDeleteModal(true);
                                }}
                                className="p-1 rounded hover:bg-gray-200 transition-colors"
                                title="Delete sale"
                            >
                                <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                        </div>
                    </td>
                </tr>
            );
        });
    };

    return (
        <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            {/* Main Content Area */}
            <div className="min-h-screen flex flex-col items-center pt-24 md:pt-32 pb-10 font-sans"
                  style={{ backgroundColor: CoffeeColors.SCREEN_BG }}>

                {/* Header and Action Bar */}
                <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 mb-6 flex justify-between items-center">
                    <h1 className="text-4xl font-extrabold" style={{ color: CoffeeColors.DARK_BROWN }}>
                        Sales Records Overview
                    </h1>
                    <div className="flex space-x-4">
                        <ActionButton onClick={() => fetchSales()} disabled={loading} className="py-2 px-4 shadow-xl">
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh Data
                        </ActionButton>
                        <ActionButton onClick={() => navigate('/sales-entry')} className="py-2 px-4 shadow-xl">
                            <Send className="w-4 h-4 mr-2" />
                            Record New Sale
                        </ActionButton>
                    </div>
                </div>

                {/* Sales Records Table Container */}
                <div
                    className="max-w-7xl w-full mx-4 p-4 sm:p-8 shadow-2xl rounded-2xl overflow-x-auto transition-all duration-300"
                    style={{ backgroundColor: '#F5EEDC', border: '1px solid #B8A072' }}
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="sticky top-0 z-10" style={{ backgroundColor: '#B8A072' }}>
                                <tr>
                                    <th
                                        key="customer_name"
                                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                        onClick={() => requestSort('customer_name')}
                                        scope="col"
                                    >
                                        <div className="flex items-center justify-start">
                                            Customer Name
                                            {getSortIcon('customer_name')}
                                        </div>
                                    </th>
                                    <th
                                        key="product"
                                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                        onClick={() => requestSort('product')}
                                        scope="col"
                                    >
                                        <div className="flex items-center justify-start">
                                            Item
                                            {getSortIcon('item')}
                                        </div>
                                    </th>
                                    <th
                                        key="quantity"
                                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                        onClick={() => requestSort('quantity')}
                                        scope="col"
                                    >
                                        <div className="flex items-center justify-center">
                                            Quantity
                                            {getSortIcon('quantity')}
                                        </div>
                                    </th>
                                    <th
                                        key="amount"
                                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                        onClick={() => requestSort('amount')}
                                        scope="col"
                                    >
                                    </th>
                                    <th
                                        key="method_of_payment"
                                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                        onClick={() => requestSort('method_of_payment')}
                                        scope="col"
                                    >
                                        <div className="flex items-center justify-start">
                                            Payment Method
                                            {getSortIcon('method_of_payment')}
                                        </div>
                                    </th>
                                    <th
                                        key="date_of_payment"
                                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                        onClick={() => requestSort('date_of_payment')}
                                        scope="col"
                                    >
                                        <div className="flex items-center justify-end">
                                            Date
                                            {getSortIcon('date_of_payment')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/70 divide-y divide-gray-200" style={{ color: CoffeeColors.DARK_BROWN }}>
                                {renderTableContent()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && saleToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4" style={{ color: CoffeeColors.DARK_BROWN }}>
                            Confirm Delete
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this transaction for customer "{saleToDelete.customer_name}"?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSaleToDelete(null);
                                }}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteSale}
                                disabled={deleting}
                                className="px-4 py-2 text-white rounded-lg transition-colors flex items-center"
                                style={{ backgroundColor: CoffeeColors.ERROR_RED }}
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

export default Sales;
