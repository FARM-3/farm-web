import React from 'react';
import { SideNav } from '../components/SideNav';
import { TrendingUp, TrendingDown, ClipboardCheck, DollarSign, Package, Users } from 'lucide-react';

// Re-import colors for this screen's components
const CoffeeColors = {
    SCREEN_BG: '#F8F9FB',      
    DARK_BROWN: '#4A3423',     
    BORDER_GRAY: '#E0E0E0',    
    SUCCESS: '#4CAF50',        
    ERROR: '#D32F2F',          
};

// --- COMPONENT: Dashboard Card (Matching the Financial/Staff Cards) ---
const DashboardCard = ({ title, value, unit, change, icon: Icon, iconColor }) => (
    <div className="p-6 rounded-xl shadow-lg flex-1 min-w-[280px] hover:shadow-xl transition-shadow" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${CoffeeColors.BORDER_GRAY}` }}>
        <div className="flex justify-between items-start">
            <h3 className="text-sm font-semibold uppercase" style={{ color: CoffeeColors.DARK_BROWN }}>{title}</h3>
            <Icon size={24} style={{ color: iconColor }} />
        </div>
        
        <div className="mt-4">
            <p className="text-4xl font-extrabold" style={{ color: CoffeeColors.DARK_BROWN }}>{value}</p>
            {unit && <p className="text-lg font-medium" style={{ color: CoffeeColors.DARK_BROWN }}>{unit}</p>}
        </div>
        
        <div className="mt-2 text-sm">
            {change ? (
                <p style={{ color: change.startsWith('+') ? CoffeeColors.SUCCESS : CoffeeColors.ERROR }}>
                    {change} vs last month
                </p>
            ) : (
                <p className="text-gray-500">Total registered employees</p>
            )}
        </div>
    </div>
);

// --- COMPONENT: Recent Transaction Item ---
const TransactionItem = ({ type, description, amount, date }) => {
    const isSale = type === 'Sale';
    const color = isSale ? CoffeeColors.SUCCESS : CoffeeColors.ERROR;
    const Icon = isSale ? TrendingUp : TrendingDown;

    return (
        <div className="grid grid-cols-12 gap-4 py-3 border-b" style={{ borderColor: CoffeeColors.BORDER_GRAY }}>
            <div className="col-span-1 flex items-center">
                <Icon size={18} style={{ color: color }} />
            </div>
            <div className="col-span-6" style={{ color: CoffeeColors.DARK_BROWN }}>{description}</div>
            <div className="col-span-3 text-right font-medium" style={{ color: color }}>{amount}</div>
            <div className="col-span-2 text-right text-sm text-gray-500">{date}</div>
        </div>
    );
};

// --- COMPONENT: DashboardScreen (The Content) ---
export const DashboardScreen = () => {
    return (
        <SideNav>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-8" style={{ color: CoffeeColors.DARK_BROWN }}>
                Financial Dashboard
            </h1>

            {/* Top Financial/Staff Cards */}
            <div className="flex flex-wrap gap-6 mb-12">
                <DashboardCard
                    title="Total Sales (MTD)"
                    value="12,500,000"
                    unit="UGX"
                    change="+12% vs last month"
                    icon={ClipboardCheck}
                    iconColor={CoffeeColors.SUCCESS}
                />
                <DashboardCard
                    title="Total Expenses (MTD)"
                    value="3,100,000"
                    unit="UGX"
                    change="-5% vs last month"
                    icon={ClipboardCheck}
                    iconColor={CoffeeColors.ERROR}
                />
                <DashboardCard
                    title="Active Staff"
                    value="35"
                    icon={Users}
                    iconColor={CoffeeColors.DARK_BROWN}
                />
            </div>

            {/* Sales vs Expenses Chart (Placeholder) and Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Chart Area */}
                <div className="lg:col-span-2 p-6 rounded-xl shadow-lg" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${CoffeeColors.BORDER_GRAY}` }}>
                    <h2 className="text-xl font-bold mb-4" style={{ color: CoffeeColors.DARK_BROWN }}>Sales vs Expenses (Last 6 Months)</h2>
                    <p className="text-sm text-gray-500 mb-6">Comparing financial performance over recent months.</p>
                    
                    {/* Placeholder for the bar chart */}
                    <div className="h-64 flex items-end justify-around p-4">
                        {/* Mock Bars to simulate the look of dashdum.png */}
                        {[12, 8, 14, 10, 16, 18, 15].map((h, index) => (
                            <div key={index} className="flex flex-col items-center w-8">
                                <div className="w-full" style={{ height: `${h * 4}px`, backgroundColor: CoffeeColors.DARK_BROWN, opacity: 0.8 }}></div>
                                <div className="w-full mt-1" style={{ height: `${(h / 3) * 4}px`, backgroundColor: CoffeeColors.ERROR, opacity: 0.8 }}></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Recent Transactions */}
                <div className="p-6 rounded-xl shadow-lg" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${CoffeeColors.BORDER_GRAY}` }}>
                    <h2 className="text-xl font-bold mb-4" style={{ color: CoffeeColors.DARK_BROWN }}>Recent Transactions</h2>
                    <p className="text-sm text-gray-500 mb-6">Overview of latest financial movements.</p>

                    {/* Transaction List */}
                    <div className="space-y-1">
                        <div className="grid grid-cols-12 gap-4 py-2 text-xs font-semibold uppercase border-b" style={{ color: CoffeeColors.DARK_BROWN, borderColor: CoffeeColors.BORDER_GRAY }}>
                            <div className="col-span-1">Type</div>
                            <div className="col-span-6">Description</div>
                            <div className="col-span-3 text-right">Amount</div>
                            <div className="col-span-2 text-right">Date</div>
                        </div>
                        <TransactionItem type="Sale" description="Bulk coffee bean order from roast & grind" amount="UGX 5,000,000" date="2024-09-01" />
                        <TransactionItem type="Expense" description="Staff payroll for Q3 2024" amount="UGX 1,500,000" date="2024-08-30" />
                        <TransactionItem type="Expense" description="Office supplies purchase" amount="UGX 250,000" date="2024-08-28" />
                        <TransactionItem type="Sale" description="Receipt for fresh produce delivery" amount="UGX 1,200,000" date="2024-08-27" />
                    </div>
                    
                    <button className="mt-6 w-full text-center text-sm font-medium hover:underline" style={{ color: CoffeeColors.DARK_BROWN }}>
                        View All Transactions
                    </button>
                </div>
            </div>
        </SideNav>
    );
};

export default DashboardScreen;