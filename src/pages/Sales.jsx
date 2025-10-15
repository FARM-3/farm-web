import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, DollarSign, Calendar, Tag, MapPin, Truck, Send, Loader2, ArrowUp, ArrowDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import NavBar from '../components/NavBar.jsx';

// --- MOCK DATA ---
const MOCK_TRANSACTIONS = [
    { id: 1, type: 'Sale', description: 'Bulk Order #406', amount: 2100000, date: 'Oct 15', isExpense: false },
    { id: 2, type: 'Sale', description: 'Receipt #405', amount: 800000, date: 'Oct 13', isExpense: false },
    { id: 3, type: 'Sale', description: 'Receipt #404', amount: 450000, date: 'Oct 12', isExpense: false },
    { id: 4, type: 'Sale', description: 'Small Batch #403', amount: 300000, date: 'Oct 10', isExpense: false },
];

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

    // Mock data fetcher
    const fetchSales = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Simulate API call
        setTimeout(() => {
            setSales(MOCK_TRANSACTIONS.filter(tx => !tx.isExpense));
            setLoading(false);
        }, 1000);
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

    const renderTableContent = () => {
        if (loading) {
            return (
                <tr className='h-24'>
                    <td colSpan={4} className="text-center py-6 text-gray-600">
                        <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" style={{ color: CoffeeColors.DARK_BROWN }} />
                        Loading sales records...
                    </td>
                </tr>
            );
        }

        if (error) {
            return (
                <tr className='h-24'>
                    <td colSpan={4} className="text-center py-6 text-red-600 font-medium">
                        {error}
                    </td>
                </tr>
            );
        }

        if (sortedSales.length === 0) {
            return (
                <tr className='h-24'>
                    <td colSpan={4} className="text-center py-6 text-gray-500 italic">
                        No sales records found. Click "Refresh" to try again.
                    </td>
                </tr>
            );
        }

        return sortedSales.map((sale, index) => {
            const amountClass = 'text-green-600';
            const IconComponent = ArrowUpRight;

            return (
                <tr key={sale.id || index} className="border-b transition-colors duration-150 hover:bg-white/50">
                    <td className="px-6 py-3 text-left font-medium text-gray-800">{sale.type || 'Sale'}</td>
                    <td className="px-6 py-3 text-left text-gray-600">{sale.description || 'N/A'}</td>
                    <td className="px-6 py-3 text-right text-green-600 font-bold">{formatUGX(sale.amount)}</td>
                    <td className="px-6 py-3 text-right text-gray-500">{sale.date || 'N/A'}</td>
                </tr>
            );
        });
    };

    return (
        <>
            <NavBar />

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
                                        key="type"
                                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                        onClick={() => requestSort('type')}
                                        scope="col"
                                    >
                                        <div className="flex items-center justify-start">
                                            Type
                                            {getSortIcon('type')}
                                        </div>
                                    </th>
                                    <th
                                        key="description"
                                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                        onClick={() => requestSort('description')}
                                        scope="col"
                                    >
                                        <div className="flex items-center justify-start">
                                            Description
                                            {getSortIcon('description')}
                                        </div>
                                    </th>
                                    <th
                                        key="amount"
                                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                        onClick={() => requestSort('amount')}
                                        scope="col"
                                    >
                                        <div className="flex items-center justify-end">
                                            Amount
                                            {getSortIcon('amount')}
                                        </div>
                                    </th>
                                    <th
                                        key="date"
                                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                        onClick={() => requestSort('date')}
                                        scope="col"
                                    >
                                        <div className="flex items-center justify-end">
                                            Date
                                            {getSortIcon('date')}
                                        </div>
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
        </>
    );
}

export default Sales;
