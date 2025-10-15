import React, { useState, useEffect, useCallback, useRef } from 'react';
// Firebase Imports (Assumed available in the environment)
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; 
import { setLogLevel } from 'firebase/firestore';   
// --- MOCK DATA ---
const MOCK_TRANSACTIONS = [
    { id: 1, type: 'Sale', description: 'Bulk Order #406', amount: 2100000, date: 'Oct 15', isExpense: false },
    { id: 2, type: 'Wage', description: 'Staff Wage - John', amount: 150000, date: 'Oct 15', isExpense: true },
    { id: 3, type: 'Expense', description: 'Office Supplies', amount: 45000, date: 'Oct 14', isExpense: true },
    { id: 4, type: 'Sale', description: 'Receipt #405', amount: 800000, date: 'Oct 13', isExpense: false },
    { id: 5, type: 'Expense', description: 'Fuel Refill', amount: 120000, date: 'Oct 13', isExpense: true },
    { id: 6, type: 'Sale', description: 'Receipt #404', amount: 450000, date: 'Oct 12', isExpense: false },
    { id: 7, type: 'Wage', description: 'Staff Wage - Jane', amount: 150000, date: 'Oct 11', isExpense: true },
    { id: 8, type: 'Sale', description: 'Small Batch #403', amount: 300000, date: 'Oct 10', isExpense: false },
];

// Values are in millions (M) for chart simplicity
const MOCK_CHART_DATA = [
    { month: 'Apr', sales: 10.0, expenses: 3.5 },
    { month: 'May', sales: 11.5, expenses: 4.0 },
    { month: 'Jun', sales: 9.8, expenses: 3.1 },
    { month: 'Jul', sales: 13.0, expenses: 4.5 },
    { month: 'Aug', sales: 15.5, expenses: 4.8 },
    { month: 'Sep', sales: 12.5, expenses: 3.1 },
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

// --- ICON COMPONENTS (Inline SVG Definitions) ---
const DashboardIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>;
const TrendingUpIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13 16 9 12 2 19"/><polyline points="16 7 22 7 22 13"/></svg>;
const CreditCardIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const ReceiptIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2H4zM8 10h8m-8 4h8m-4 4h4"/></svg>;
const UserCogIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.7 10.7l-1.3-1.3c-.4-.4-1-.4-1.4 0L15.3 10c-.4.4-1 .4-1.4 0L12.6 8.7c-.4-.4-1-.4-1.4 0L9.3 10c-.4.4-1 .4-1.4 0L6.6 8.7c-.4-.4-1-.4-1.4 0L3.8 10.7c-.4.4-1 .4-1.4 0L1.1 9.4c-.4-.4-.4-1 0-1.4L2.4 6.7c.4-.4.4-1 0-1.4L1.1 4c-.4-.4-.4-1 0-1.4L3.8 1.3c.4-.4 1-.4 1.4 0L6.6 2.6c.4.4 1 .4 1.4 0L9.3 1.3c.4-.4 1-.4 1.4 0L12.6 2.6c.4.4 1 .4 1.4 0L15.3 1.3c.4-.4 1-.4 1.4 0L18.1 2.6c.4.4 1 .4 1.4 0L20.8 1.3c.4-.4 1-.4 1.4 0L23.1 3.8c.4.4.4 1 0 1.4L21.8 6.6c-.4.4-.4 1 0 1.4L23.1 9.3c.4.4.4 1 0 1.4L20.8 12.6c-.4.4-1 .4-1.4 0L18.1 11.3c-.4-.4-1-.4-1.4 0L15.3 12.6c-.4.4-1 .4-1.4 0L12.6 11.3c-.4-.4-1-.4-1.4 0L9.3 12.6c-.4.4-1 .4-1.4 0L6.6 11.3c-.4-.4-1-.4-1.4 0L3.8 12.6c-.4.4-1 .4-1.4 0L1.1 11.3c-.4-.4-.4-1 0-1.4L2.4 10.1c.4-.4.4-1 0-1.4L1.1 7.4c-.4-.4-.4-1 0-1.4L3.8 5.1c.4-.4 1-.4 1.4 0L6.6 6.4c.4.4 1 .4 1.4 0L9.3 5.1c.4-.4 1-.4 1.4 0L12.6 6.4c.4.4 1 .4 1.4 0L15.3 5.1c.4-.4 1-.4 1.4 0L18.1 6.4c.4.4 1 .4 1.4 0L20.8 5.1c.4-.4 1-.4 1.4 0z"/></svg>;
const WalletIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18v-4h-4c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2h4z"/><path d="M21 17a2 2 0 0 0 0-4h-4"/></svg>;
const BellIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const MenuIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const XIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>;
const LineChartIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17l-6-6-4 4-3-3"/></svg>;
const MinusCircleIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
const UsersIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ArrowUpRight = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>;
const ArrowDownLeft = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/></svg>;
const LogOutIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;


// --- CONFIGURATION ---
// Coffee Theme Colors from Login.jsx
const CoffeeColors = {
    SCREEN_BG: '#FFF8F6',
    LIGHT_BG: '#FEEFEA',
    DARK_BROWN: '#4A3423',
    BUTTON_BROWN: '#783A1E', // <--- UPDATED to your desired brown for the sidebar (bg-accent-btn)
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
'accent-header': CoffeeColors.LIGHT_BG, // Keep light background for main header
'accent-btn': CoffeeColors.BUTTON_BROWN,
'text-default': CoffeeColors.DARK_BROWN,
'sidebar-bg': CoffeeColors.BUTTON_BROWN, // Add specific color for sidebar background
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


// --- COMPONENT: SidebarLink ---
const SidebarLink = ({ icon: IconComponent, title, href, isActive, isCollapsed, textColor }) => {
    const activeClasses = isActive
        ? 'bg-accent-btn text-white shadow-md'
        : 'text-text-default hover:bg-gray-100';

    const iconColor = isActive ? 'white' : 'currentColor';
    const textColorClass = textColor || (isActive ? 'text-white' : 'text-text-default');

    // If collapsed on desktop, hide both icon and text
    const layoutClasses = isCollapsed
        ? 'justify-center w-10 h-10 p-0 opacity-0 hidden'
        : 'justify-start p-3';

    return (
        <a
            href={href || "#"}
            className={`flex items-center rounded-xl font-semibold transition-all duration-200
                ${layoutClasses} ${activeClasses}`}
        >
            <IconComponent
                className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`}
                stroke={iconColor}
                strokeWidth={2.2}
            />
<span
    className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100 block'} ${textColorClass}`}
>
    {title}
</span>
        </a>
    );
};


// --- COMPONENT: FinancialChart (SVG Bar Chart) ---
// (Chart component remains the same for brevity)
const FinancialChart = () => {
    const chartRef = useRef(null);

    const drawChart = useCallback(() => {
        const container = chartRef.current;
        if (!container) return;

        // Clear previous content
        container.innerHTML = '';

        // Dimensions
        const width = container.clientWidth;
        const height = container.clientHeight;
        const padding = 35; 
        
        // Layout calculations
        const dataLength = MOCK_CHART_DATA.length;
        const totalBarWidth = 18; 
        const barGap = 8; 
        
        const innerWidth = width - 2 * padding;
        const groupWidth = innerWidth / dataLength;
        const startX = padding;
        
        // Find max value for scaling (Y-axis)
        const maxSales = Math.max(...MOCK_CHART_DATA.map(d => d.sales));
        const maxExpenses = Math.max(...MOCK_CHART_DATA.map(d => d.expenses));
        const maxY = Math.ceil((Math.max(maxSales, maxExpenses) * 1.1) / 5) * 5; 
        
        // Scaling function for Y-axis (converts data value to pixel height)
        const scaleY = (value) => (height - 2 * padding) * (value / maxY);
        
        // SVG Initialization
        let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" class="font-sans">`;

        // Y-Axis Grid Lines (4 lines, 5 segments)
        for (let i = 0; i <= 4; i++) {
            const yValue = (maxY / 4) * (4 - i);
            const yPos = padding + (height - 2 * padding) * (i / 4);
            
            // Line (Grid)
            svg += `<line x1="${padding}" y1="${yPos}" x2="${width - padding}" y2="${yPos}" stroke="#E5E7EB" stroke-dasharray="2" />`;
            
            // Label (0M, 5M, 10M, 15M, etc.)
            if (i <= 4) {
                 svg += `<text x="${padding - 5}" y="${yPos + (i < 4 ? 4 : -4)}" text-anchor="end" fill="#6B7280" font-size="10">
                    ${yValue.toFixed(0)}M
                </text>`;
            }
        }
        
        // X-Axis Line
        const xAxisY = height - padding;
        svg += `<line x1="${padding}" y1="${xAxisY}" x2="${width - padding}" y2="${xAxisY}" stroke="#9CA3AF" />`;


        // Drawing Bars and Labels
        MOCK_CHART_DATA.forEach((d, i) => {
            // Calculate the starting X for the group (Sales Bar + Expenses Bar)
            const barGroupWidth = 2 * totalBarWidth + barGap;
            const xGroupStart = startX + i * groupWidth + (groupWidth / 2) - (barGroupWidth / 2); 
            
            // Sales Bar (Green: #38A169)
            const salesHeight = scaleY(d.sales);
            svg += `<rect 
                x="${xGroupStart}" y="${xAxisY - salesHeight}" 
                width="${totalBarWidth}" height="${salesHeight}" 
                rx="2" ry="2" fill="#38A169" title="Sales: UGX ${d.sales}M"
            />`; 

            // Expenses Bar (Red: #E53E3E)
            const expensesHeight = scaleY(d.expenses);
            svg += `<rect 
                x="${xGroupStart + totalBarWidth + barGap}" y="${xAxisY - expensesHeight}" 
                width="${totalBarWidth}" height="${expensesHeight}" 
                rx="2" ry="2" fill="#E53E3E" title="Expenses: UGX ${d.expenses}M"
            />`; 

            // Month Label
            svg += `<text x="${xGroupStart + barGroupWidth / 2}" y="${xAxisY + 15}" text-anchor="middle" fill="#444444" font-size="11">
                ${d.month}
            </text>`;
        });

        // Legend
        const legendX = width - padding - 150;
        const legendY = 10;
        
        svg += `<rect x="${legendX}" y="${legendY}" width="10" height="10" fill="#38A169" rx="2" />
                <text x="${legendX + 15}" y="${legendY + 9}" font-size="11" fill="#444444">Sales</text>`;

        svg += `<rect x="${legendX + 70}" y="${legendY}" width="10" height="10" fill="#E53E3E" rx="2" />
                <text x="${legendX + 85}" y="${legendY + 9}" font-size="11" fill="#444444">Expenses</text>`;

        svg += `</svg>`;
        
        container.innerHTML = svg;
    }, []);

    // Effect to draw chart on mount and on window resize
    useEffect(() => {
        drawChart();
        window.addEventListener('resize', drawChart);
        return () => window.removeEventListener('resize', drawChart);
    }, [drawChart]);

    return (
        <div id="financial-chart" ref={chartRef} className="h-64 w-full">
            {/* SVG Chart will be rendered here */}
        </div>
    );
};


// --- COMPONENT: TransactionsTable ---
const TransactionsTable = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Recent Transactions</h3>
            <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {MOCK_TRANSACTIONS.map(tx => {
                            const amountClass = tx.isExpense ? 'text-red-600' : 'text-green-600';
                            const IconComponent = tx.isExpense ? ArrowDownLeft : ArrowUpRight;
                            
                            return (
                                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <IconComponent className={`w-4 h-4 ${amountClass} inline-block mr-2`} strokeWidth={2.2} />
                                        <span className="md:hidden">{tx.type.charAt(0)}</span>
                                        <span className="hidden md:inline">{tx.type}</span>
                                    </td>
                                    <td className="px-3 py-3 font-medium truncate max-w-[150px]">{tx.description}</td>
                                    <td className={`px-3 py-3 text-right font-bold ${amountClass}`}>{formatUGX(tx.amount)}</td>
                                    <td className="px-3 py-3 text-right text-gray-500">{tx.date}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="text-center mt-4">
                <a href="#" className="text-sm font-medium text-accent-btn hover:text-accent-btn/80">View All Transactions</a>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---
const App = () => {
    // State for sidebar visibility (defaults open on desktop, closed on mobile via logic)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userId, setUserId] = useState(null);
    const [isMobile, setIsMobile] = useState(false);


    // --- FIREBASE INITIALIZATION & AUTH ---
    useEffect(() => {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        if (!firebaseConfig) {
            setUserId("UI-ONLY-MODE");
            return;
        }

        setLogLevel('Debug');
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        const authenticateUser = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Firebase Auth Error:", error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
        });

        authenticateUser();
        return () => unsubscribe();
    }, []);

    // --- SIDEBAR LOGIC ---
    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);

    // Initial mobile setup and resize handler
    useEffect(() => {
        const handleResize = () => {
            const currentIsMobile = window.innerWidth < 769;
            setIsMobile(currentIsMobile);
            
            // On desktop, the sidebar is either w-64 (open) or w-16 (collapsed).
            // On mobile, the sidebar is always w-64 but uses translate-x to hide.
            if (!currentIsMobile && !isSidebarOpen) {
                // If transitioning to desktop, make sure sidebar is treated as collapsed (not fully hidden)
                // We don't change isSidebarOpen state, we just let the CSS handle it.
            }
            if (currentIsMobile && isSidebarOpen) {
                 // On mobile, if we are open, we want to stay open until clicked.
            }
        };

        // Set initial state and ensure mobile starts closed
        const initialIsMobile = window.innerWidth < 769;
        setIsMobile(initialIsMobile);
        if (initialIsMobile) {
             setIsSidebarOpen(false);
        } else {
             setIsSidebarOpen(true);
        }


        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- RENDERING CLASSES ---
    // Desktop: w-64 (open) or w-16 (collapsed)
    // Mobile: w-64 but uses translate-x (always wide to hold text)
    const sidebarWidthClass = 'w-64'; 
    const desktopCollapseClass = isSidebarOpen ? 'md:w-64' : 'md:w-16';

    // Main content margin adjusts based on desktop state. Mobile has no margin.
    const mainMarginClass = isSidebarOpen ? 'md:ml-64' : 'md:ml-16';
    
    // Check if the sidebar should hide its text (only on desktop collapsed mode)
    const isTextHidden = !isSidebarOpen && !isMobile;
    
    // Main layout class for mobile overlay effect
    const layoutClass = isSidebarOpen && isMobile ? 'overflow-hidden h-screen' : 'overflow-auto';
    

    // --- COMPONENTS FOR RETURN ---

const MainSidebar = () => (
<>
{/* Overlay for mobile view when menu is open. Higher z-index than content. */}
{isSidebarOpen && isMobile && (
<div
className="fixed inset-0 bg-black bg-opacity-50 z-40"
onClick={toggleSidebar}
></div>
)}

<aside
className={`bg-sidebar-bg shadow-xl h-full fixed top-0 left-0 z-50 p-4 flex flex-col
transition-all duration-300 ${sidebarWidthClass} ${desktopCollapseClass}
${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
`}
>
                {/* App Logo/Title and Toggle */}
                <div className="h-16 flex items-center justify-between px-2 mb-6">
<h1 className={`text-2xl font-extrabold text-black whitespace-nowrap
    transition-opacity duration-200 ${isTextHidden ? 'opacity-0 hidden' : 'opacity-100 block'}`}>
    Rugyeyo Farm
</h1>
                    {/* Toggle button: always visible in sidebar, but only acts as the close button on mobile, or primary toggle on desktop */}
                    <button 
                        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isTextHidden ? 'mx-auto' : ''}`} 
                        onClick={toggleSidebar}
                    >
{/* Show X on mobile (to close) OR when sidebar is open on desktop (to collapse) */}
{isSidebarOpen ? (
    <XIcon className="w-6 h-6 text-black" strokeWidth={2.2} />
) : (
    <MenuIcon className="w-6 h-6 text-black" strokeWidth={2.2} />
)}
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 space-y-2">
                    {/* Note: SidebarLink uses bg-accent-btn for active state, which is now the brown color */}
<SidebarLink icon={DashboardIcon} title="Menu" isActive={true} isCollapsed={isTextHidden} textColor="text-black"/>
                    <SidebarLink icon={TrendingUpIcon} title="Sales" href="/sales" isActive={false} isCollapsed={isTextHidden} />
                    <SidebarLink icon={CreditCardIcon} title="Expenses" href="/expenses" isActive={false} isCollapsed={isTextHidden} />
                    <SidebarLink icon={ReceiptIcon} title="Receipts Management" isActive={false} isCollapsed={isTextHidden} />
                    <SidebarLink icon={UserCogIcon} title="Staff Registration" isActive={false} isCollapsed={isTextHidden} />
                    <SidebarLink icon={WalletIcon} title="Wages" href="/wages" isActive={false} isCollapsed={isTextHidden} />
                </nav>

                {/* Footer/User Info */}
                <div className="mt-auto pt-4 border-t border-white/20">
                    <div className={`text-xs text-white/80 truncate transition-opacity duration-200 ${isTextHidden ? 'opacity-0 hidden' : 'opacity-100 block'}`}>
                        User ID: {userId || 'Authenticating...'}
                    </div>
                    <a href="#" className={`flex items-center p-3 rounded-xl text-sm text-white hover:bg-white/10 mt-2
                        ${isTextHidden ? 'justify-center w-10 h-10 p-0' : 'justify-start'}`}>
                        <LogOutIcon className={`w-4 h-4 ${isTextHidden ? '' : 'mr-3'}`} />
                        <span className={`whitespace-nowrap transition-opacity duration-200 ${isTextHidden ? 'opacity-0 hidden' : 'opacity-100 block'}`}>Logout</span>
                    </a>
                </div>
            </aside>
        </>
    );

const MainHeader = () => (
<header className="bg-sidebar-bg rounded-xl p-4 flex items-center justify-between shadow-md mb-8 z-30 relative">
<div className="flex items-center">
{/* Mobile Menu Button (always visible on mobile to open sidebar) */}
<button
className="p-2 mr-3 rounded-full md:hidden hover:bg-sidebar-bg/50"
onClick={toggleSidebar}
>
<MenuIcon className="w-6 h-6 text-white" strokeWidth={2.2} />
</button>

{/* Desktop Collapse Button (only visible on desktop when sidebar is w-16) - Now handled in MainSidebar for better placement */}
<h2 className="text-xl md:text-2xl font-bold text-black">Financial Dashboard</h2>
</div>

<div className="flex items-center space-x-4">
<button className="p-2 rounded-full hover:bg-sidebar-bg/50">
<BellIcon className="w-6 h-6 text-white" strokeWidth={2.2} />
</button>
<div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
JP
</div>
</div>
</header>
);

    const KPISection = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

            <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-accent-btn">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">Total Sales (MTD)</p>
                    <LineChartIcon className="w-6 h-6 text-accent-btn" strokeWidth={2.2} />
                </div>
                <p className="mt-1 text-3xl font-extrabold text-gray-900">{formatUGX(12500000)}</p>
                <p className="text-xs text-accent-btn mt-2">+12% vs last month</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-accent-btn">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">Total Expenses (MTD)</p>
                    <MinusCircleIcon className="w-6 h-6 text-accent-btn" strokeWidth={2.2} />
                </div>
                <p className="mt-1 text-3xl font-extrabold text-gray-900">{formatUGX(3100000)}</p>
                <p className="text-xs text-accent-btn mt-2">-5% vs last month</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-accent-btn">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">Active Staff</p>
                    <UsersIcon className="w-6 h-6 text-accent-btn" strokeWidth={2.2} />
                </div>
                <p className="mt-1 text-3xl font-extrabold text-gray-900">35</p>
                <p className="text-xs text-gray-500 mt-2">Total registered employees</p>
            </div>
        </div>
    );


    return (
        <div className={`min-h-screen bg-app-bg ${layoutClass}`}>
            
            <MainSidebar />

            <main className={`p-4 md:p-8 transition-all duration-300 ${mainMarginClass} pt-0`}>
                <MainHeader />
                <KPISection />
                
                {/* Charts and Recent Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Primary Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Sales vs Expenses (Last 6 Months)</h3>
                        <FinancialChart />
                    </div>

                    {/* Right Column: Recent Transactions Table */}
                    <TransactionsTable />
                </div>
            </main>
        </div>
    );
};

export default App;