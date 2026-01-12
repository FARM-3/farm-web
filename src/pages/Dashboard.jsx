import React, { useState, useEffect, useCallback } from 'react';
import { SideNav } from '../components/SideNav';
import { TrendingUp, TrendingDown, ClipboardCheck, DollarSign, Package, Users, RefreshCw, Loader2, Activity } from 'lucide-react';
import { API_ENDPOINTS } from '../services/ApiConfig';

// API Endpoints - Uses .env configuration
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;
const SALES_API = `${API_BASE_URL}/sales/`;
const EXPENSES_API = `${API_BASE_URL}/expenses/`;
const WAGES_API = `${API_BASE_URL}/wages/`;
const STAFF_API = `${API_BASE_URL}/staff/`;
const ACTIVITIES_API = API_ENDPOINTS.ACTIVITIES;

// Updated colors to match the Farmer Registry design
const CoffeeColors = {
    SCREEN_BG: '#F5F5F5',
    PRIMARY_BROWN: '#6B4423',  // Main brown from Add Farmer button
    CARD_BROWN: '#8B5A3C',     // Card background brown
    DARK_TEXT: '#3D2817',      // Darker brown for text
    LIGHT_BROWN: '#D4A574',    // Light brown accents
    BORDER_GRAY: '#E0E0E0',
    SALE_GREEN: '#C8E6C9',     // Light green for sales
    EXPENSE_RED: '#FFCDD2',    // Light pink/red for expenses
};

// Helper function to format currency with thousand separators
const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        amount = Number(amount);
        if (isNaN(amount)) return '0';
    }
    return amount.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0,
        useGrouping: true 
    });
};

// --- COMPONENT: Dashboard Card (4 cards in a row) ---
const DashboardCard = ({ title, value, unit, subtitle, icon: Icon, iconColor, loading }) => (
    <div
        className="p-6 rounded-2xl shadow-lg flex-1 min-w-[220px] hover:shadow-xl transition-shadow"
        style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
    >
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-medium tracking-wide uppercase" style={{ color: '#666' }}>
                {title}
            </h3>
            <Icon size={20} style={{ color: CoffeeColors.CARD_BROWN }} />
        </div>

        <div className="mt-2">
            {loading ? (
                <div className="flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: CoffeeColors.CARD_BROWN }} />
                    <span className="text-sm" style={{ color: '#888' }}>Loading...</span>
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    {unit && <p className="text-sm font-medium" style={{ color: '#888' }}>{unit}</p>}
                    <p className="text-3xl font-bold" style={{ color: CoffeeColors.DARK_TEXT }}>{value}</p>
                </div>
            )}
        </div>

        {subtitle && (
            <div className="mt-3 text-xs">
                <p style={{ color: '#666' }}>
                    {subtitle}
                </p>
            </div>
        )}
    </div>
);

// --- COMPONENT: Recent Transaction Item ---
const TransactionItem = ({ type, description, amount, date }) => {
    const isSale = type === 'Sale';
    const bgColor = isSale ? CoffeeColors.SALE_GREEN : CoffeeColors.EXPENSE_RED;
    const textColor = isSale ? '#2E7D32' : '#C62828';

    return (
        <div className="grid grid-cols-12 gap-4 py-4 border-b" style={{ borderColor: CoffeeColors.BORDER_GRAY }}>
            <div className="col-span-2 flex items-center">
                <span
                    className="px-3 py-1 rounded-md text-xs font-medium"
                    style={{
                        backgroundColor: bgColor,
                        color: textColor
                    }}
                >
                    {type}
                </span>
            </div>
            <div className="col-span-5 flex items-center" style={{ color: CoffeeColors.DARK_TEXT, fontSize: '14px' }}>
                {description}
            </div>
            <div className="col-span-3 flex items-center justify-end font-medium" style={{ color: CoffeeColors.DARK_TEXT, fontSize: '14px' }}>
                {amount}
            </div>
            <div className="col-span-2 flex items-center justify-end text-sm" style={{ color: '#666' }}>
                {date}
            </div>
        </div>
    );
};

// --- COMPONENT: Recent Activity Item ---
const ActivityItem = ({ user, action, object, timestamp }) => {
    const getActionColor = (action) => {
        switch (action) {
            case 'created':
                return { bg: '#E8F5E9', text: '#2E7D32' };
            case 'updated':
                return { bg: '#E3F2FD', text: '#1565C0' };
            case 'deleted':
                return { bg: '#FFEBEE', text: '#C62828' };
            default:
                return { bg: '#F5F5F5', text: '#666' };
        }
    };

    const colors = getActionColor(action);
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return diffInDays === 1 ? '1d ago' : `${diffInDays}d ago`;
        }
    };

    return (
        <div className="flex items-center gap-3 py-3 border-b" style={{ borderColor: CoffeeColors.BORDER_GRAY }}>
            <div className="flex-shrink-0">
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.bg }}
                >
                    <Activity size={14} style={{ color: colors.text }} />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: CoffeeColors.DARK_TEXT }}>
                    <span className="font-medium">{user}</span>
                    {' '}
                    <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                        {action}
                    </span>
                    {' '}
                    <span className="truncate">{object}</span>
                </p>
            </div>
            <div className="flex-shrink-0 text-xs" style={{ color: '#999' }}>
                {formatTimestamp(timestamp)}
            </div>
        </div>
    );
};

// --- COMPONENT: DashboardScreen (The Content) ---
export const DashboardScreen = () => {
    const [dashboardData, setDashboardData] = useState({
        totalSales: 0,
        totalExpenses: 0,
        totalWages: 0,
        activeStaff: 0,
        recentTransactions: [],
        recentActivities: [],
        monthlySales: [],
        monthlyExpenses: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Fetch dashboard data from all endpoints
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Helper function to fetch all pages of paginated data
            const fetchAllPages = async (url) => {
                let allResults = [];
                let nextUrl = url;

                // Get auth token from localStorage OR sessionStorage (try multiple keys for compatibility)
                const token = localStorage.getItem('authToken') ||
                             localStorage.getItem('token') ||
                             sessionStorage.getItem('authToken') ||
                             sessionStorage.getItem('token');

                const headers = {
                    'Content-Type': 'application/json',
                };
                if (token) {
                    // Activities endpoint uses Bearer, other endpoints use Token
                    const authType = url.includes('activities') ? 'Bearer' : 'Token';
                    headers['Authorization'] = `${authType} ${token}`;
                }

                while (nextUrl) {
                    const response = await fetch(nextUrl, { headers }).catch(() => ({ ok: false }));

                    if (!response.ok) break;

                    const data = await response.json();

                    // Handle both paginated and non-paginated responses
                    if (Array.isArray(data)) {
                        allResults = allResults.concat(data);
                        break; // No pagination
                    } else {
                        allResults = allResults.concat(data.results || []);
                        nextUrl = data.next; // Move to next page
                    }
                }

                return allResults;
            };

            // Fetch all data in parallel
            const [sales, expenses, wages, staff, activities] = await Promise.all([
                fetchAllPages(SALES_API),
                fetchAllPages(EXPENSES_API),
                fetchAllPages(WAGES_API),
                fetchAllPages(STAFF_API),
                fetchAllPages(ACTIVITIES_API).catch(err => {
                    console.error('Failed to fetch activities:', err);
                    console.error('Activities API URL:', ACTIVITIES_API);
                    return []; // Return empty array if activities fail
                })
            ]);

            // Calculate totals
            const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || sale.amount || 0), 0);
            const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
            const totalWages = wages.reduce((sum, wage) => sum + parseFloat(wage.amount_paid || 0), 0);
            const activeStaff = staff.length;

            // Prepare recent transactions (combine sales and expenses, sort by date)
            const recentTransactions = [
                ...sales.slice(0, 5).map(sale => ({
                    type: 'Sale',
                    description: `${sale.item || 'Item'} - ${sale.customer_name || 'Customer'}`,
                    amount: `UGX ${formatCurrency(parseFloat(sale.total_amount || sale.amount || 0))}`,
                    date: sale.date || sale.date_of_payment || 'N/A'
                })),
                ...expenses.slice(0, 5).map(expense => ({
                    type: 'Expense',
                    description: expense.expense_name || expense.description || 'Expense',
                    amount: `UGX ${formatCurrency(parseFloat(expense.amount || 0))}`,
                    date: expense.date || 'N/A'
                }))
            ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

            // Calculate monthly sales and expenses (last 6 months)
            const getMonthlyData = (data, dateField, amountField) => {
                const monthlyTotals = {};
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                data.forEach(item => {
                    const date = new Date(item[dateField]);
                    if (!isNaN(date)) {
                        const monthKey = `${months[date.getMonth()]}`;
                        const amount = parseFloat(item[amountField] || 0);
                        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + amount;
                    }
                });

                return monthlyTotals;
            };

            const monthlySalesData = getMonthlyData(sales, 'date_of_payment', 'total_amount');
            const monthlyExpensesData = getMonthlyData(expenses, 'date', 'amount');

            // Get last 6 months
            const currentMonth = new Date().getMonth();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const last6Months = [];
            for (let i = 5; i >= 0; i--) {
                const monthIndex = (currentMonth - i + 12) % 12;
                const monthName = months[monthIndex];
                last6Months.push({
                    label: monthName,
                    sales: (monthlySalesData[monthName] || 0) / 1000000, // Convert to millions
                    expense: (monthlyExpensesData[monthName] || 0) / 1000000
                });
            }

            // Prepare recent activities (limit to 10 most recent)
            const recentActivities = activities.slice(0, 10).map(activity => ({
                id: activity.id,
                user: activity.user_name || 'System',
                action: activity.action,
                object: activity.object_repr || 'Unknown',
                timestamp: activity.timestamp
            }));

            setDashboardData({
                totalSales,
                totalExpenses,
                totalWages,
                activeStaff,
                recentTransactions,
                recentActivities,
                monthlySales: last6Months,
                monthlyExpenses: last6Months
            });
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            fetchDashboardData();
        }, 300000); // 5 minutes

        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    const { totalSales, totalExpenses, totalWages, activeStaff, recentTransactions, recentActivities, monthlySales } = dashboardData;
    const maxValue = Math.max(...monthlySales.map(m => Math.max(m.sales, m.expense)), 1);

    return (
        <SideNav>
            <div className="pt-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold" style={{ color: CoffeeColors.DARK_TEXT }}>
                        Financial Dashboard
                    </h1>
                </div>

                {lastUpdated && (
                    <p className="text-sm mb-6" style={{ color: '#666' }}>
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                )}

                {error && (
                    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: CoffeeColors.EXPENSE_RED, color: '#C62828' }}>
                        {error}
                    </div>
                )}

                {/* Top Financial/Staff Cards - 4 cards in one row */}
                <div className="flex flex-wrap gap-4 mb-10">
                    <DashboardCard
                        title="Total Sales"
                        value={formatCurrency(totalSales)}
                        unit="UGX"
                        icon={DollarSign}
                        loading={loading}
                    />
                    <DashboardCard
                        title="Total Expenses"
                        value={formatCurrency(totalExpenses)}
                        unit="UGX"
                        icon={Package}
                        loading={loading}
                    />
                    <DashboardCard
                        title="Active Staff"
                        value={activeStaff.toString()}
                        subtitle="Total registered employees"
                        icon={Users}
                        loading={loading}
                    />
                    <DashboardCard
                        title="Total Wages"
                        value={formatCurrency(totalWages)}
                        unit="UGX"
                        icon={TrendingUp}
                        loading={loading}
                    />
                </div>

                {/* Sales vs Expenses Chart and Recent Transactions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Left Column: Chart Area */}
                    <div className="p-6 rounded-2xl shadow-md" style={{ backgroundColor: '#FFFFFF' }}>
                        <h2 className="text-xl font-bold mb-1" style={{ color: CoffeeColors.DARK_TEXT }}>
                            Sales vs Expenses (Last 6 Months)
                        </h2>
                        <p className="text-sm mb-6" style={{ color: '#666' }}>
                            Comparing financial performance over recent months.
                        </p>

                        {/* Chart with brown bars matching Add Farmer button color */}
                        <div className="relative h-80 flex items-end justify-around px-6 py-6" style={{ borderBottom: '2px solid #E0E0E0', borderLeft: '2px solid #E0E0E0' }}>
                            {/* Y-axis labels */}
                            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs" style={{ color: '#666' }}>
                                <span>{(maxValue).toFixed(1)}M</span>
                                <span>{(maxValue * 0.75).toFixed(1)}M</span>
                                <span>{(maxValue * 0.5).toFixed(1)}M</span>
                                <span>{(maxValue * 0.25).toFixed(1)}M</span>
                                <span>0M</span>
                            </div>

                            {/* Bars */}
                            {monthlySales.map((data, index) => (
                                <div key={index} className="flex flex-col items-center gap-2 flex-1 max-w-[70px]">
                                    <div className="w-full flex gap-2 items-end justify-center" style={{ height: '280px' }}>
                                        {/* Sales bar - brown matching Add Farmer button */}
                                        <div
                                            className="rounded-t transition-all"
                                            style={{
                                                height: `${(data.sales / maxValue) * 100}%`,
                                                width: '45%',
                                                backgroundColor: CoffeeColors.CARD_BROWN
                                            }}
                                        ></div>
                                        {/* Expense bar - pink/red */}
                                        <div
                                            className="rounded-t transition-all"
                                            style={{
                                                height: `${(data.expense / maxValue) * 100}%`,
                                                width: '45%',
                                                backgroundColor: '#E57373'
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-medium" style={{ color: '#666' }}>{data.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="flex gap-6 mt-6 justify-center">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CoffeeColors.CARD_BROWN }}></div>
                                <span className="text-sm" style={{ color: CoffeeColors.DARK_TEXT }}>Sales</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#E57373' }}></div>
                                <span className="text-sm" style={{ color: CoffeeColors.DARK_TEXT }}>Expenses</span>
                            </div>
                        </div>

                        {/* Financial Distribution Pie Chart - Compact Version */}
                        <div className="mt-8 pt-6 border-t" style={{ borderColor: CoffeeColors.BORDER_GRAY }}>
                            <h3 className="text-lg font-bold mb-1" style={{ color: CoffeeColors.DARK_TEXT }}>
                                Financial Distribution
                            </h3>
                            <p className="text-xs mb-4" style={{ color: '#666' }}>
                                Breakdown of total financial activities
                            </p>

                            <div className="flex items-center justify-center gap-6">
                                {/* Compact Pie Chart SVG */}
                                <svg width="160" height="160" viewBox="0 0 240 240">
                                    {(() => {
                                        const data = [
                                            { label: 'Sales', value: totalSales, color: CoffeeColors.CARD_BROWN },
                                            { label: 'Expenses', value: totalExpenses, color: '#E57373' },
                                            { label: 'Wages', value: totalWages, color: '#FFB74D' }
                                        ];
                                        const total = data.reduce((sum, item) => sum + item.value, 0);
                                        if (total === 0) return null;

                                        let currentAngle = 0;

                                        return data.map((item, index) => {
                                            const percentage = (item.value / total) * 100;
                                            const angle = (percentage / 100) * 360;
                                            const startAngle = currentAngle;
                                            currentAngle += angle;

                                            const startRad = (startAngle - 90) * (Math.PI / 180);
                                            const endRad = (startAngle + angle - 90) * (Math.PI / 180);
                                            const radius = 100;

                                            const x1 = 120 + radius * Math.cos(startRad);
                                            const y1 = 120 + radius * Math.sin(startRad);
                                            const x2 = 120 + radius * Math.cos(endRad);
                                            const y2 = 120 + radius * Math.sin(endRad);

                                            const largeArc = angle > 180 ? 1 : 0;
                                            const path = `M 120 120 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                                            return (
                                                <path
                                                    key={index}
                                                    d={path}
                                                    fill={item.color}
                                                    stroke="#FFFFFF"
                                                    strokeWidth="2"
                                                    className="transition-all hover:opacity-80 cursor-pointer"
                                                />
                                            );
                                        });
                                    })()}
                                </svg>

                                {/* Compact Legend */}
                                <div className="flex flex-col gap-2">
                                    {[
                                        { label: 'Sales', value: totalSales, color: CoffeeColors.CARD_BROWN },
                                        { label: 'Expenses', value: totalExpenses, color: '#E57373' },
                                        { label: 'Wages', value: totalWages, color: '#FFB74D' }
                                    ].map((item, index) => {
                                        const total = totalSales + totalExpenses + totalWages;
                                        const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                                        return (
                                            <div key={index} className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-sm flex-shrink-0"
                                                    style={{ backgroundColor: item.color }}
                                                ></div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium" style={{ color: CoffeeColors.DARK_TEXT }}>
                                                        {item.label}
                                                    </span>
                                                    <span className="text-xs" style={{ color: '#666' }}>
                                                        UGX {(item.value / 1000000).toFixed(1)}M ({percentage}%)
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Recent Transactions */}
                    <div className="p-6 rounded-2xl shadow-md" style={{ backgroundColor: '#FFFFFF' }}>
                        <h2 className="text-xl font-bold mb-1" style={{ color: CoffeeColors.DARK_TEXT }}>
                            Recent Transactions
                        </h2>
                        <p className="text-sm mb-6" style={{ color: '#666' }}>
                            Overview of latest financial movements.
                        </p>

                        {/* Transaction List */}
                        <div className="space-y-1">
                            <div className="grid grid-cols-12 gap-4 py-3 text-xs font-semibold border-b-2" style={{ color: CoffeeColors.DARK_TEXT, borderColor: CoffeeColors.BORDER_GRAY }}>
                                <div className="col-span-2">Type</div>
                                <div className="col-span-5">Description</div>
                                <div className="col-span-3 text-right">Amount</div>
                                <div className="col-span-2 text-right">Date</div>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: CoffeeColors.CARD_BROWN }} />
                                </div>
                            ) : recentTransactions.length > 0 ? (
                                recentTransactions.map((transaction, index) => (
                                    <TransactionItem key={index} {...transaction} />
                                ))
                            ) : (
                                <div className="text-center py-8" style={{ color: '#666' }}>
                                    No recent transactions found.
                                </div>
                            )}
                        </div>

                        <button
                            className="mt-6 w-full text-center text-sm font-medium py-2 rounded hover:opacity-80 transition-opacity"
                            style={{ color: '#6366F1' }}
                            onClick={() => window.location.href = '/sales'}
                        >
                            View All Transactions
                        </button>
                    </div>
                </div>

                {/* Recent Activities Section - Bottom of Page */}
                <div className="mt-8">
                    <div className="p-6 rounded-2xl shadow-md" style={{ backgroundColor: '#FFFFFF' }}>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <Activity size={20} style={{ color: CoffeeColors.CARD_BROWN }} />
                                <h2 className="text-xl font-bold" style={{ color: CoffeeColors.DARK_TEXT }}>
                                    Recent Activities
                                </h2>
                            </div>
                            <button
                                onClick={fetchDashboardData}
                                disabled={loading}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: CoffeeColors.CARD_BROWN }} />
                                <span className="text-sm" style={{ color: CoffeeColors.CARD_BROWN }}>Refresh</span>
                            </button>
                        </div>
                        <p className="text-sm mb-6" style={{ color: '#666' }}>
                            Latest system activities and changes
                        </p>

                        {/* Activities List */}
                        <div className="space-y-1">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: CoffeeColors.CARD_BROWN }} />
                                </div>
                            ) : recentActivities && recentActivities.length > 0 ? (
                                recentActivities.map((activity) => (
                                    <ActivityItem key={activity.id} {...activity} />
                                ))
                            ) : (
                                <div className="text-center py-8" style={{ color: '#666' }}>
                                    No recent activities found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SideNav>
    );
};

export default DashboardScreen;
