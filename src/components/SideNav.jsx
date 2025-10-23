import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Menu, X, Home, DollarSign, ShoppingCart, Package, Users, LogOut, Settings,
    BarChart3, TreePine, User as ProfileIcon, TrendingUp, TrendingDown, ClipboardCheck
} from 'lucide-react';

// --- CONFIGURATION: Updated Theme Colors to match the brown sidebar ---
const CoffeeColors = {
    SCREEN_BG: '#F8F9FB',      // Off-white/light gray for the main content area background
    SIDEBAR_BG: '#F8F9FB',     // Brown background for the sidebar (matching image)
    ACTIVE_BG: '#8B5A3C',      // Lighter brown for active/hover state
    WHITE_TEXT: '#3D2817',     // White text for sidebar
    LIGHT_TEXT: '#3D2817', // Semi-transparent white for non-active items
    DARK_BROWN: '#4A3423',     // Used for main content text
    BORDER_GRAY: '#E0E0E0',    // Light gray for borders/dividers
    LIGHT_HOVER: '#F5F5F5',    // Very light gray for subtle hover effect
    SUCCESS: '#4CAF50',        // Green for positive metrics
    ERROR: '#D32F2F',          // Red for negative metrics
};

// Define Navigation Items with a unique 'key' for comparison
const navItems = [
    { key: 'dashboard', name: 'Dashboard', icon: Home, href: '/dashboard' },
    { key: 'wages', name: 'Wages', icon: DollarSign, href: '/wages' },
    { key: 'sales', name: 'Sales', icon: ShoppingCart, href: '/sales' },
    { key: 'expenses', name: 'Expenses', icon: Package, href: '/expenses' },
    { key: 'staff', name: 'Staff', icon: Users, href: '/staff' },
    { key: 'aggregation', name: 'Aggregation', icon: BarChart3, href: '/aggregation' },
    { key: 'harvest', name: 'Harvest', icon: TreePine, href: '/harvest' },
];

const footerNavItems = [
    { key: 'profile', name: 'Profile', icon: ProfileIcon, href: '/profile' },
    { key: 'logout', name: 'Logout', icon: LogOut, href: '/logout' },
];

// --- UTILITY: Get Current Page Key ---
const getCurrentPageKey = () => {
    const path = window.location.pathname.split('/')[1] || 'dashboard';
    
    if (path.startsWith('sales')) return 'sales';
    if (path.startsWith('staff')) return 'staff';
    if (path.startsWith('wages')) return 'wages';
    if (path.startsWith('profile')) return 'profile';
    
    const item = [...navItems, ...footerNavItems].find(item => item.key === path);
    if (item) return path;

    return 'dashboard';
};

// --- COMPONENT: Sidebar Link ---
const SidebarLink = ({ item, currentPage, CoffeeColors }) => {
    const isActive = item.key === currentPage;

    const activeColor = CoffeeColors.WHITE_TEXT;
    const defaultColor = CoffeeColors.LIGHT_TEXT;
    
    const iconColor = isActive ? activeColor : defaultColor;
    const textColor = isActive ? activeColor : defaultColor;

    return (
        <Link
            key={item.name}
            to={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium
                        hover:scale-[1.01]
                        ${isActive ? 'shadow-sm' : ''}`}
            style={{
                color: textColor,
                backgroundColor: isActive ? 'rgba(200, 200, 200, 0.3)' : 'transparent',
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(200, 200, 200, 0.3)';
                }
            }}
            onMouseLeave={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }
            }}
        >
            <item.icon
                size={20}
                style={{ color: iconColor }}
            />
            <span className="text-base">{item.name}</span>
        </Link>
    );
};

// --- MAIN COMPONENT: SideNav (Exported) ---
export const SideNav = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const currentPage = useMemo(() => getCurrentPageKey(), []);
    const sidebarWidthClass = 'w-64';

    useEffect(() => {
        const handleResize = () => {
            if (typeof window !== 'undefined') {
                if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                } else {
                    setSidebarOpen(true);
                }
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen flex w-full" style={{ backgroundColor: CoffeeColors.SCREEN_BG, fontFamily: 'Inter, sans-serif' }}>
            
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768 && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-20 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Collapsible) - Now with brown background */}
            <aside
                className={`fixed top-0 left-0 h-full ${sidebarWidthClass} transform ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out z-50 shadow-lg md:translate-x-0`}
                style={{ backgroundColor: CoffeeColors.SIDEBAR_BG }}
            >
                {/* Logo and Title Section */}
                <div className="flex items-center justify-between p-4 h-20" style={{ borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
                    <div className="flex items-center gap-2">
                        <img
                            src="/logo.jpg"
                            alt="Rugyeyo Farm Logo"
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <h2 className="text-xl font-extrabold" style={{ color: CoffeeColors.DARK_BROWN }}>
                            Rugyeyo Farm
                        </h2>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden hover:bg-opacity-20 hover:bg-white p-1 rounded-lg"
                        style={{ color: CoffeeColors.WHITE_TEXT }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Main Navigation */}
                <nav className="mt-4 flex flex-col space-y-1 px-3 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100% - 13rem)' }}>
                    {navItems.map((item) => (
                        <SidebarLink key={item.key} item={item} currentPage={currentPage} CoffeeColors={CoffeeColors} />
                    ))}
                </nav>

                {/* Footer Links (Profile/Logout) */}
                <div className="py-4 px-3 absolute bottom-0 left-0 right-0" style={{ borderTop: `1px solid rgba(255,255,255,0.1)`, backgroundColor: CoffeeColors.SIDEBAR_BG }}>
                    <div className="flex flex-col space-y-1">
                        {footerNavItems.map((item) => (
                            <SidebarLink key={item.key} item={item} currentPage={currentPage} CoffeeColors={CoffeeColors} />
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div 
                className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'} w-full`} 
                style={{ minHeight: '100vh', backgroundColor: CoffeeColors.SCREEN_BG }}
            >
                
                {/* Fixed Header Bar (Top right corner icons) */}
                <header 
                    className={`fixed top-0 right-0 z-30 p-4 h-20 shadow-sm transition-all duration-300 ${sidebarOpen ? 'md:left-64' : 'md:left-0'} w-full`} 
                    style={{ backgroundColor: '#FFFFFF', borderBottom: `1px solid ${CoffeeColors.BORDER_GRAY}` }}
                >
                    <div className="flex items-center justify-end h-full max-w-7xl mx-auto">
                        
                        {/* Mobile Menu Button (Toggle Sidebar) - Left side on mobile */}
                        {!sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768 && (
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className={`p-2 rounded-full hover:bg-light-hover transition-colors mr-auto`}
                                style={{ color: CoffeeColors.DARK_BROWN }}
                                title="Open Sidebar"
                            >
                                <Menu size={24} />
                            </button>
                        )}

                        {/* Search Bar */}
                        <div className="flex-1 max-w-md mx-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search records, transactions..."
                                    className="w-full px-4 py-2 pl-10 rounded-lg border text-sm"
                                    style={{ 
                                        borderColor: CoffeeColors.BORDER_GRAY,
                                        backgroundColor: CoffeeColors.SCREEN_BG
                                    }}
                                />
                                <svg 
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                                    fill="none" 
                                    stroke="#999" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                        </div>

                        {/* User Profile Icon */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: CoffeeColors.DARK_BROWN }}>
                                <ProfileIcon size={20} style={{ color: CoffeeColors.WHITE_TEXT }} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Render children content, adding padding for the fixed header */}
                <div className="pt-20 p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SideNav;