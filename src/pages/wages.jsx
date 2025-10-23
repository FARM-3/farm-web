import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, DollarSign, Calendar, User, MinusCircle, Wallet, Loader2, ArrowUp, ArrowDown, Plus, Menu, X, Bell, LogOut, UserIcon, TrendingUpIcon, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { SideNav } from '../components/SideNav';


// --- CONFIGURATION & UTILITIES ---

const CoffeeColors = {
    SCREEN_BG: '#FFF8F6', ACTIVE_LINK_BG: '#efebe9', ACTIVE_LINK_TEXT: '#783A1E', DARK_BROWN: '#4A3423', MEDIUM_BROWN: '#795548', GRAY_TEXT: '#8D8D8D', SUCCESS_GREEN: '#34A853', ERROR_RED: '#EA4335',
};


const formatUGX = (amount) => {
    if (typeof amount !== 'number') return amount || '0';
    return amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const Wage_API_Endpoint = 'https://api-3181.onrender.com/api/wages/';

// =========================================================
// --- WageDisplayPage Component (CLEANED AND STYLED TO IMAGE) ---
// =========================================================

const TABLE_HEADERS = [
    { key: 'employee_name', label: 'Employee', icon: User, type: 'string', align: 'left' },
    { key: 'date_of_payment', label: 'Date Paid', icon: Calendar, type: 'date', align: 'center' },
    { key: 'days_worked', label: 'Days', icon: Calendar, type: 'number', align: 'center' },
    { key: 'amount_paid', label: 'Total Paid (UGX)', icon: DollarSign, type: 'number', align: 'right' },
    { key: 'deduction', label: 'Deduction (UGX)', icon: MinusCircle, type: 'number', align: 'right' },
    { key: 'noted_reason', label: 'Note', icon: null, type: 'string', align: 'left' },
    { key: 'actions', label: 'Actions', icon: null, type: 'actions', align: 'center' }, // New Actions column
];

function WageDisplayPage() {
    const [wages, setWages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'date_of_payment', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 7;
    
    // --- Data Fetching Logic ---
    const fetchWages = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);

        const MOCK_WAGES = [
            { id: 1, employee_name: 'RF001 - John Doe', date_of_payment: '2025-10-18', days_worked: 22, monthly_pay: 2000000, amount_paid: 2200000, deduction: 0, noted_reason: 'Full attendance, bonus' },
            { id: 2, employee_name: 'RF002 - Jane Smith', date_of_payment: '2025-10-16', days_worked: 20, monthly_pay: 2000000, amount_paid: 2000000, deduction: 0, noted_reason: 'Sick leave 2 days' },
            { id: 3, employee_name: 'RF003 - Peter Jones', date_of_payment: '2025-10-16', days_worked: 15, monthly_pay: 2000000, amount_paid: 1200000, deduction: 800000, noted_reason: 'Missed 8 days' },
            { id: 4, employee_name: 'RF004 - Alice Brown', date_of_payment: '2025-10-17', days_worked: 25, monthly_pay: 2000000, amount_paid: 2200000, deduction: 0, noted_reason: 'Overtime bonus' },
            { id: 5, employee_name: 'RF005 - David Lee', date_of_payment: '2025-10-17', days_worked: 18, monthly_pay: 2000000, amount_paid: 1512000, deduction: 488000, noted_reason: 'Late attendance penalties' },
            { id: 6, employee_name: 'RF006 - Mark Johnson', date_of_payment: '2025-10-15', days_worked: 22, monthly_pay: 2000000, amount_paid: 2200000, deduction: 0, noted_reason: 'Full attendance' },
            { id: 7, employee_name: 'RF007 - Sarah Davis', date_of_payment: '2025-10-14', days_worked: 20, monthly_pay: 2000000, amount_paid: 2000000, deduction: 0, noted_reason: 'Sick leave 2 days' },
            { id: 8, employee_name: 'RF008 - Tom Wilson', date_of_payment: '2025-10-13', days_worked: 15, monthly_pay: 2000000, amount_paid: 1200000, deduction: 800000, noted_reason: 'Missed 8 days' },
            { id: 9, employee_name: 'RF009 - Emma White', date_of_payment: '2025-10-12', days_worked: 25, monthly_pay: 2000000, amount_paid: 2200000, deduction: 0, noted_reason: 'Overtime bonus' },
            { id: 10, employee_name: 'RF010 - Alex Green', date_of_payment: '2025-10-11', days_worked: 22, monthly_pay: 2000000, amount_paid: 2200000, deduction: 0, noted_reason: 'Full attendance' },
            { id: 11, employee_name: 'RF011 - Chloe Black', date_of_payment: '2025-10-10', days_worked: 20, monthly_pay: 2000000, amount_paid: 2000000, deduction: 0, noted_reason: 'Sick leave 2 days' },
        ];
        
        try {
            const response = await fetch(`${Wage_API_Endpoint}?page=${page}&page_size=${itemsPerPage}`);
            if (!response.ok) throw new Error("API not available, using mock data.");
            const data = await response.json();
            setWages(data.results || data);
            setTotalPages(Math.ceil((data.count || (data.results || data).length) / itemsPerPage));
            setError(null);
        } catch (err) {
            console.warn(`API fetch failed, using mock data: ${err.message}`);
            const startIndex = (page - 1) * itemsPerPage;
            const paginatedData = MOCK_WAGES.slice(startIndex, startIndex + itemsPerPage);
            setWages(paginatedData);
            setTotalPages(Math.ceil(MOCK_WAGES.length / itemsPerPage));
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage]);

    useEffect(() => {
        fetchWages(currentPage);
    }, [fetchWages, currentPage]);

    // --- Sorting & Pagination Logic ---
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

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
    };

    // --- Component Rendering ---

    const KPICards = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Card 1: Total Wages Paid */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" stroke={CoffeeColors.SUCCESS_GREEN} />
                        Total Wages Paid (This Period)
                    </p>
                    <TrendingUpIcon className="w-4 h-4" stroke={CoffeeColors.SUCCESS_GREEN} strokeWidth={2.2} />
                </div>
                <p className="text-4xl font-extrabold text-gray-900 leading-none">UGX {formatUGX(12500000)}</p>
                <p className="text-xs text-success mt-2 font-medium">+15.3% vs last month</p>
            </div>
            
            {/* Card 2: Avg. Wage/Employee */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                        <Wallet className="w-4 h-4 mr-1" stroke={CoffeeColors.MEDIUM_BROWN} />
                        Avg. Wage/Employee
                    </p>
                    <TrendingUpIcon className="w-4 h-4 text-error rotate-180" stroke={CoffeeColors.ERROR_RED} strokeWidth={2.2} />
                </div>
                <p className="text-4xl font-extrabold text-gray-900 leading-none">UGX {formatUGX(250000)}</p>
                <p className="text-xs text-error mt-2 font-medium">-8.1% from last month</p>
            </div>

            {/* Card 3: Total Employees */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                        <UserIcon className="w-4 h-4 mr-1" stroke={CoffeeColors.GRAY_TEXT} />
                        Total Employees
                    </p>
                    <UserIcon className="w-4 h-4 text-gray-500" strokeWidth={2.2} />
                </div>
                <p className="text-4xl font-extrabold text-gray-900 leading-none">50</p>
                <p className="text-xs text-gray-500 mt-2 font-medium">Stable over last quarter</p>
            </div>
        </div>
    );

    const renderTableContent = () => {
        if (loading) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-gray-600">
                        <Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-accent-btn" />
                        Loading wage records...
                    </td>
                </tr>
            );
        }

        if (error) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-error font-medium">
                        {error}
                    </td>
                </tr>
            );
        }

        if (sortedWages.length === 0) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-gray-500 italic">
                        No wage records found. Click "Record New Wage" or "Refresh Data".
                    </td>
                </tr>
            );
        }

        return sortedWages.map((wage, index) => {
            const dateStr = wage.date_of_payment ? new Date(wage.date_of_payment).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }) : 'N/A';
            return (
                <tr key={index} className="border-b border-gray-100 transition-colors duration-150 hover:bg-light-coffee-brown/40">
                    <td className="px-6 py-3 text-left font-medium text-text-default text-sm max-w-[200px] truncate">{wage.employee_name || 'N/A'}</td>
                    <td className="px-6 py-3 text-center text-gray-600">{dateStr}</td>
                    <td className="px-6 py-3 text-center text-gray-600">{wage.days_worked || 0}</td>
                    <td className="px-6 py-3 text-right text-success font-bold whitespace-nowrap">{formatUGX(wage.amount_paid)}</td>
                    <td className="px-6 py-3 text-right text-error whitespace-nowrap">{formatUGX(wage.deduction)}</td>
                    <td className="px-6 py-3 text-left text-xs italic text-gray-500 max-w-xs truncate">{wage.noted_reason || '-'}</td>
                    <td className="px-6 py-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                            <button onClick={() => alert(`Viewing wage for ${wage.employee_name}`)} className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors">
                                <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => alert(`Editing wage for ${wage.employee_name}`)} className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => alert(`Deleting wage for ${wage.employee_name}`)} className="text-error hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors">
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
            <main className={`${mobilePadding} pt-0`}>
                <h1 className="text-3xl sm:text-4xl font-bold text-text-default mb-2">Welcome Back!</h1> {/* Added Welcome Back! */}
                <h2 className="text-2xl sm:text-3xl font-bold text-text-default mb-8">
                    Wages Records Overview
                </h2>
                
                <KPICards />

                {/* Action Bar */}
                <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.location.assign('/wage-entry')}
                            className="py-2 px-4 shadow-xl rounded-xl flex items-center"
                            style={{ backgroundColor: '#795548', color: '#FFFFFF', border: 'none' }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Record New Wage
                        </button>
                        <button
                            onClick={() => alert('Exporting data...')}
                            className="py-2 px-4 shadow-xl rounded-xl"
                            style={{ backgroundColor: '#efebe9', color: '#783A1E', border: 'none' }}
                        >
                            Export to Excel
                        </button>
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
                        {/* Filter by Dropdown */}
                        <div className="relative inline-block text-left">
                            <select 
                                className="appearance-none bg-white border border-gray-300 rounded-xl py-2 pl-4 pr-8 text-sm text-gray-700 leading-tight focus:outline-none focus:ring-accent-btn focus:border-accent-btn shadow-lg hover:shadow-xl transition duration-300 ease-in-out"
                                defaultValue=""
                            >
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

                {/* Wage Records Table Container */}
                <div
                    className="max-w-full w-full mx-auto p-0 shadow-xl rounded-2xl overflow-hidden bg-white transition-all duration-300"
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="sticky top-0 z-10 bg-light-coffee-brown text-text-default">
                                <tr>
                                    {TABLE_HEADERS.map((header) => (
                                        <th
                                            key={header.key}
                                            className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 cursor-pointer ${
                                                header.align === 'right' ? 'text-right' : header.align === 'center' ? 'text-center' : 'text-left'
                                            } hover:bg-accent-btn/90 whitespace-nowrap`}
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
                            <tbody className="bg-white/80 divide-y divide-gray-100 text-sm text-text-default">
                                {renderTableContent()}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-100">
                            <div className="flex items-center text-sm text-gray-700">
                                <span className="text-gray-600">Page {currentPage} of {totalPages}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                    className="px-4 py-1.5 text-xs rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#efebe9', color: '#783A1E' }}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || loading}
                                    className="px-4 py-1.5 text-xs rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#efebe9', color: '#783A1E' }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </SideNav>
    );
}

export default WageDisplayPage;