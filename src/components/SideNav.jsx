import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Menu, X, Home, DollarSign, ShoppingCart, Package, Users, LogOut, Settings,
    BarChart3, TreePine, User as ProfileIcon, TrendingUp, TrendingDown, ClipboardCheck
} from 'lucide-react';

// --- CONFIGURATION: Unified Theme Colors (Light Theme) ---
const CoffeeColors = {
    SCREEN_BG: '#F8F9FB',      // Off-white/light gray for the main content area background
    SIDEBAR_BG: '#FFFFFF',     // Pure White background for the sidebar
    LIGHT_BG: '#FEEFEA',       // Light Coffee Brown for active link background
    DARK_BROWN: '#4A3423',     // Used for all primary text, icons, and non-active links
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

// --- UTILITY: Logout Function ---
const handleLogout = () => {
    // Clear any stored authentication tokens or session data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userSession');
    sessionStorage.clear();

    // Redirect to login page
    window.location.href = '/login';
};

// --- COMPONENT: Sidebar Link ---
const SidebarLink = ({ item, currentPage, CoffeeColors, onLogout }) => {
    const isActive = item.key === currentPage;

    const activeColor = CoffeeColors.DARK_BROWN;
    const defaultColor = CoffeeColors.DARK_BROWN;

    const iconColor = isActive ? activeColor : defaultColor;
    const textColor = isActive ? activeColor : defaultColor;

    const hoverBg = CoffeeColors.LIGHT_HOVER;

    // Special handling for logout link
    if (item.key === 'logout') {
        return (
            <button
                onClick={onLogout}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium w-full text-left
                            hover:scale-[1.01]
                            ${isActive ? 'shadow-sm' : ''}`}
                style={{
                    color: textColor,
                    backgroundColor: isActive ? CoffeeColors.LIGHT_BG : 'transparent',
                }}
                onMouseEnter={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.backgroundColor = hoverBg;
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
            </button>
        );
    }

    return (
        <Link
            key={item.name}
            to={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium
                        hover:scale-[1.01]
                        ${isActive ? 'shadow-sm' : ''}`}
            style={{
                color: textColor,
                backgroundColor: isActive ? CoffeeColors.LIGHT_BG : 'transparent',
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = hoverBg;
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

            {/* Sidebar (Collapsible) */}
            <aside
                className={`fixed top-0 left-0 h-full ${sidebarWidthClass} transform ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out z-50 shadow-lg md:translate-x-0`}
                style={{ backgroundColor: CoffeeColors.SIDEBAR_BG }}
            >
                {/* Logo and Title Section */}
                <div className="flex items-center justify-between p-4 h-20 border-b" style={{ borderColor: CoffeeColors.BORDER_GRAY }}>
                    <div className="flex items-center gap-2">
                        <img
                            src="/logo.jpg"
                            alt="Rugyeyo Farm Logo"
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <h2 className="text-xl font-extrabold" style={{ color: CoffeeColors.DARK_BROWN }}>
                            Rugyeyo Farm
                        </h2>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden hover:bg-light-hover p-1 rounded-lg"
                        style={{ color: CoffeeColors.DARK_BROWN }}
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
                <div className="py-4 px-3 border-t absolute bottom-0 left-0 right-0" style={{ borderColor: CoffeeColors.BORDER_GRAY, backgroundColor: CoffeeColors.SIDEBAR_BG }}>
                    <div className="flex flex-col space-y-1">
                        {footerNavItems.map((item) => (
                            <SidebarLink key={item.key} item={item} currentPage={currentPage} CoffeeColors={CoffeeColors} onLogout={handleLogout} />
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
                    style={{ backgroundColor: CoffeeColors.SIDEBAR_BG, borderBottom: `1px solid ${CoffeeColors.BORDER_GRAY}` }}
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

                        {/* User/Notification Icons (Right-aligned) */}
                        <div className="flex items-center space-x-3">
                            <button className="p-2 rounded-full hover:bg-light-hover transition-colors" title="Notifications">
                                <svg className="w-6 h-6" fill="none" stroke={CoffeeColors.DARK_BROWN} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.16 6.137 6 7.822 6 10v4.158a2.032 2.032 0 01-.595 1.437L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0h-6"></path></svg>
                            </button>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold border" style={{ backgroundColor: CoffeeColors.LIGHT_HOVER, color: CoffeeColors.DARK_BROWN, borderColor: CoffeeColors.BORDER_GRAY }}>
                                <ProfileIcon size={24} style={{ color: CoffeeColors.DARK_BROWN }} />
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