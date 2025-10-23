import React from 'react';
import { SideNav } from '../components/SideNav';
import { TrendingUp, TrendingDown, ClipboardCheck, DollarSign, Package, Users } from 'lucide-react';

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

// --- COMPONENT: Dashboard Card (4 cards in a row) ---
const DashboardCard = ({ title, value, unit, subtitle, icon: Icon, iconColor }) => (
    <div 
        className="p-6 rounded-2xl shadow-md flex-1 min-w-[220px] hover:shadow-lg transition-shadow" 
        style={{ 
            backgroundColor: CoffeeColors.CARD_BROWN,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}
    >
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-medium tracking-wide" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {title}
            </h3>
            <Icon size={20} style={{ color: 'rgba(255,255,255,0.9)' }} />
        </div>
        
        <div className="mt-2">
            <div className="flex flex-col gap-1">
                {unit && <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>{unit}</p>}
                <p className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>{value}</p>
            </div>
        </div>
        
        {subtitle && (
            <div className="mt-3 text-xs">
                <p style={{ color: 'rgba(255,255,255,0.75)' }}>
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
        <div className="grid grid-cols-12 gap-4 py-4 border-b" style={{ borderColor: CoffeeColors.BORDER_GRAY, fontFamily: "'Inter', sans-serif" }}>
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

// --- COMPONENT: DashboardScreen (The Content) ---
export const DashboardScreen = () => {
    return (
        <SideNav>
            <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
                <h1 className="text-3xl font-bold mb-8" style={{ color: CoffeeColors.DARK_TEXT }}>
                    Financial Dashboard
                </h1>

                {/* Top Financial/Staff Cards - 4 cards in one row */}
                <div className="flex flex-wrap gap-4 mb-10">
                    <DashboardCard
                        title="Total Sales"
                        value="12,500,000"
                        unit="UGX"
                        icon={DollarSign}
                        iconColor="#FFFFFF"
                    />
                    <DashboardCard
                        title="Total Expenses"
                        value="3,100,000"
                        unit="UGX"
                        icon={Package}
                        iconColor="#FFFFFF"
                    />
                    <DashboardCard
                        title="Active Staff"
                        value="35"
                        subtitle="+Total registered employees"
                        icon={Users}
                        iconColor="#FFFFFF"
                    />
                    <DashboardCard
                        title="Total Wages"
                        value="9,400,000"
                        unit="UGX"
                        icon={TrendingUp}
                        iconColor="#FFFFFF"
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
                                <span>UGX</span>
                                <span>12M</span>
                                <span className="mt-4">UGX</span>
                                <span>9M</span>
                                <span className="mt-4">UGX</span>
                                <span>6M</span>
                                <span className="mt-4">UGX</span>
                                <span>3M</span>
                                <span className="mt-4">UGX</span>
                                <span>0M</span>
                            </div>
                            
                            {/* Bars */}
                            {[
                                { sales: 7, expense: 4, label: 'Apr' },
                                { sales: 9, expense: 4, label: 'May' },
                                { sales: 13, expense: 4, label: 'Jun' },
                                { sales: 11, expense: 5, label: 'Jul' },
                                { sales: 16, expense: 6, label: 'Aug' },
                                { sales: 15, expense: 6, label: 'Sep' }
                            ].map((data, index) => (
                                <div key={index} className="flex flex-col items-center gap-2 flex-1 max-w-[70px]">
                                    <div className="w-full flex gap-2 items-end justify-center" style={{ height: '280px' }}>
                                        {/* Sales bar - brown matching Add Farmer button */}
                                        <div 
                                            className="rounded-t transition-all"
                                            style={{ 
                                                height: `${(data.sales / 16) * 100}%`,
                                                width: '45%',
                                                backgroundColor: CoffeeColors.CARD_BROWN
                                            }}
                                        ></div>
                                        {/* Expense bar - pink/red */}
                                        <div 
                                            className="rounded-t transition-all"
                                            style={{ 
                                                height: `${(data.expense / 16) * 100}%`,
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
                                            { label: 'Sales', value: 12500000, color: CoffeeColors.CARD_BROWN },
                                            { label: 'Expenses', value: 3100000, color: '#E57373' },
                                            { label: 'Wages', value: 9400000, color: '#FFB74D' }
                                        ];
                                        const total = data.reduce((sum, item) => sum + item.value, 0);
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
                                        { label: 'Sales', value: 12500000, color: CoffeeColors.CARD_BROWN, percentage: 50 },
                                        { label: 'Expenses', value: 3100000, color: '#E57373', percentage: 12.4 },
                                        { label: 'Wages', value: 9400000, color: '#FFB74D', percentage: 37.6 }
                                    ].map((item, index) => (
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
                                                    UGX {(item.value / 1000000).toFixed(1)}M ({item.percentage}%)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
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
                            <TransactionItem 
                                type="Sale" 
                                description="Bulk coffee bean order from Roast & Grind" 
                                amount="UGX 5,000,000" 
                                date="2024-09-01" 
                            />
                            <TransactionItem 
                                type="Expense" 
                                description="Staff payroll for Q3 2024" 
                                amount="UGX 1,500,000" 
                                date="2024-08-30" 
                            />
                            <TransactionItem 
                                type="Expense" 
                                description="Office supplies purchase" 
                                amount="UGX 250,000" 
                                date="2024-08-28" 
                            />
                            <TransactionItem 
                                type="Sale" 
                                description="Receipt for fresh produce delivery" 
                                amount="UGX 1,200,000" 
                                date="2024-08-27" 
                            />
                            <TransactionItem 
                                type="Expense" 
                                description="Farm equipment maintenance" 
                                amount="UGX 800,000" 
                                date="2024-08-25" 
                            />
                            <TransactionItem 
                                type="Sale" 
                                description="Online sale of specialty honey" 
                                amount="UGX 300,000" 
                                date="2024-08-24" 
                            />
                        </div>
                        
                        <button 
                            className="mt-6 w-full text-center text-sm font-medium py-2 rounded hover:opacity-80 transition-opacity" 
                            style={{ color: '#6366F1' }}
                        >
                            View All Transactions
                        </button>
                    </div>
                </div>
            </div>
        </SideNav>
    );
};

export default DashboardScreen;