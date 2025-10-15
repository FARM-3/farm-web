import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, DollarSign, Calendar, User, MinusCircle, Wallet, Loader2, ArrowUp, ArrowDown, Plus } from 'lucide-react'; 
import NavBar from '../components/NavBar.jsx';

// --- Custom Styles (Copied from WageEntry.jsx) ---
const CUSTOM_COLORS = {
    headerBg: '#702A0B', 
    cardBg: '#F5EEDC', 
    actionBg: '#702A0B', 
    inputBg: '#FFFFFF', 
    inputBorder: '#B8A072',
    submitBg: '#702A0B', 
    primaryText: '#702A0B', 
    tableHeaderBg: '#B8A072', // Mid-tone Gold/Brown for table header
};

// IMPORTANT: This API endpoint must be running locally to fetch data
const Wage_API_Endpoint = 'https://api-3181.onrender.com/api/wages/';

// use shared NavBar component

const Button = ({ children, onClick, className, style, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        style={{ ...style, backgroundColor: CUSTOM_COLORS.actionBg }}
    >
        {children}
    </button>
);

// --- Component Logic ---


// Data Structure for Table Headers (used for sorting)
const TABLE_HEADERS = [
    { key: 'employee_name', label: 'Employee', icon: User, type: 'string' },
    { key: 'date_of_payment', label: 'Date Paid', icon: Calendar, type: 'date' },
    { key: 'days_worked', label: 'Days', icon: Calendar, type: 'number' },
    { key: 'monthly_pay', label: 'Base Pay', icon: Wallet, type: 'number' },
    { key: 'amount_paid', label: 'Total Paid', icon: DollarSign, type: 'number' },
    { key: 'deduction', label: 'Deduction', icon: MinusCircle, type: 'number' },
    { key: 'noted_reason', label: 'Note', icon: null, type: 'string' },
];

function WageDisplay() {
    const [wages, setWages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Sorting state
    const [sortConfig, setSortConfig] = useState({ key: 'date_of_payment', direction: 'descending' });

    // Function to fetch data from the API with exponential backoff
    const fetchWages = useCallback(async (retries = 3) => {
        setLoading(true);
        setError(null);
        
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(Wage_API_Endpoint);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                // Normalize response into an array to avoid runtime crashes
                const normalized = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.results)
                        ? data.results
                        : [];

                setWages(normalized);
                setError(null);
                setLoading(false);
                return; // Success, exit function

            } catch (err) {
                console.error(`Attempt ${i + 1} failed to fetch wages:`, err);
                if (i === retries - 1) {
                    // Last attempt failed
                    setError(`Could not load records. Check if the backend API is running at ${Wage_API_Endpoint}.`);
                    setWages([]);
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
        fetchWages();
    }, [fetchWages]);

    // Sorting logic
    const sortedWages = React.useMemo(() => {
        const base = Array.isArray(wages) ? wages : [];
        let sortableItems = [...base];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                // Handle number/currency sorting
                if (TABLE_HEADERS.find(h => h.key === sortConfig.key)?.type === 'number') {
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
    }, [wages, sortConfig]);

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
                    <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-gray-600">
                        <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" style={{ color: CUSTOM_COLORS.primaryText }} />
                        Loading wage records...
                    </td>
                </tr>
            );
        }

        if (error) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-red-600 font-medium">
                        {error}
                    </td>
                </tr>
            );
        }

        if (sortedWages.length === 0) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-gray-500 italic">
                        No wage records found. Click "Refresh" to try again.
                    </td>
                </tr>
            );
        }

        return sortedWages.map((wage, index) => (
            <tr key={index} className="border-b transition-colors duration-150 hover:bg-white/50">
                <td className="px-6 py-3 text-left font-medium text-gray-800">{wage.employee_name || 'N/A'}</td>
                <td className="px-6 py-3 text-center text-gray-600">{wage.date_of_payment || 'N/A'}</td>
                <td className="px-6 py-3 text-center text-gray-600">{wage.days_worked || 0}</td>
                <td className="px-6 py-3 text-right text-gray-800 font-semibold">{(wage.monthly_pay)}</td>
                <td className="px-6 py-3 text-right text-green-700 font-bold">{(wage.amount_paid)}</td>
                <td className="px-6 py-3 text-right text-red-600">{(wage.deduction)}</td>
                <td className="px-6 py-3 text-left text-sm italic text-gray-500">{wage.noted_reason || '-'}</td>
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
                        Wages Records
                    </h1>
                    <div className="flex gap-3">
                    <Button onClick={() => fetchWages()} disabled={loading} className="py-2 px-4 shadow-xl">
                        <RefreshCw className={`w-4 h-4 mr-2 {loading ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </Button>
                    <Button onClick={() => window.location.assign('/wage-entry')} className="py-2 px-4 shadow-xl">
                        <Plus className="w-4 h-4 mr-2" />
                        Record New Wage
                    </Button>
                    </div>
                </div>

                {/* Wage Records Table Container */}
                <div 
                    className="max-w-7xl w-full mx-4 p-4 sm:p-8 shadow-2xl rounded-2xl overflow-x-auto transition-all duration-300" 
                    style={{ backgroundColor: CUSTOM_COLORS.cardBg, border: `1px solid ${CUSTOM_COLORS.inputBorder}` }} 
                >
                    <div className="overflow-x-auto px-2 sm:px-4">
                        <table className="min-w-full divide-y divide-gray-200 mt-2">
                            <thead className="sticky top-0 z-10" style={{ backgroundColor: CUSTOM_COLORS.tableHeaderBg }}>
                                <tr>
                                    {TABLE_HEADERS.map((header) => (
                                        <th 
                                            key={header.key} 
                                            className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                            onClick={() => header.icon !== null && requestSort(header.key)} // Only allow sorting on specific columns
                                            scope="col"
                                        >
                                            <div className={`flex items-center ${header.type === 'number' ? 'justify-end' : 'justify-start'}`}>
                                                {header.icon && <header.icon className="w-4 h-4 mr-1" />}
                                                {header.label}
                                                {getSortIcon(header.key)}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white/70 divide-y divide-gray-200" style={{ color: CUSTOM_COLORS.primaryText }}>
                                {renderTableContent()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default WageDisplay;
