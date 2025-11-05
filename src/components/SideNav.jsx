import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Menu, X, Home, DollarSign, ShoppingCart, Package, Users, LogOut, Settings,
    BarChart3, TreePine, User as ProfileIcon, TrendingUp, TrendingDown, ClipboardCheck
} from 'lucide-react';
import rugyeyoLogo from '../assets/rugyeyo_logo.png';

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
    { key: 'receipts', name: 'Receipts', icon: ClipboardCheck, href: '/receipts' },
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
    if (path === 'wagesrecords') return 'wagesrecords';
    if (path.startsWith('wages')) return 'wages';
    if (path.startsWith('profile')) return 'profile';

    const item = [...navItems, ...footerNavItems].find(item => item.key === path);
    if (item) return path;

    return 'dashboard';
};

// --- UTILITY: Logout Function (will be passed the setShowLogoutModal function) ---
const performLogout = () => {
    // Clear any stored authentication tokens or session data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userSession');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();

    // Redirect to landing page and force reload to prevent back navigation
    window.location.href = '/';
};

// --- COMPONENT: Sidebar Link ---
const SidebarLink = ({ item, currentPage, CoffeeColors, onLogoutClick }) => {
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
                onClick={onLogoutClick}
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
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const currentPage = useMemo(() => getCurrentPageKey(), []);
    const sidebarWidthClass = 'w-56';

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
                <div className="flex items-center justify-between p-4 h-auto py-6" style={{ borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
                    <div className="flex items-center gap-3">
                        <img
                            src={rugyeyoLogo}
                            alt="Rugyeyo Farm Logo"
                            style={{
                                width: '80px',
                                height: 'auto',
                                backgroundColor: 'transparent'
                            }}
                        />
                        <h2 className="text-lg font-extrabold" style={{ color: CoffeeColors.DARK_BROWN }}>
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
                            <SidebarLink key={item.key} item={item} currentPage={currentPage} CoffeeColors={CoffeeColors} onLogoutClick={() => setShowLogoutModal(true)} />
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div 
                className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-56' : 'md:ml-0'} w-full`} 
                style={{ minHeight: '100vh', backgroundColor: CoffeeColors.SCREEN_BG }}
            >
                
                {/* Fixed Header Bar (Top right corner icons) */}
                <header 
                    className={`fixed top-0 right-0 z-30 p-4 h-20 shadow-sm transition-all duration-300 ${sidebarOpen ? 'md:left-56' : 'md:left-0'} w-full`} 
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

                        {/* User Profile Icon with Dropdown */}
                        <div className="relative flex items-center space-x-3">
                            <button
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all hover:opacity-90"
                                style={{ backgroundColor: '#8B4513' }}
                            >
                                <ProfileIcon size={20} style={{ color: '#FFFFFF' }} />
                            </button>

                            {/* Dropdown Menu */}
                            {profileDropdownOpen && (
                                <>
                                    {/* Backdrop to close dropdown */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setProfileDropdownOpen(false)}
                                    />

                                    {/* Dropdown content */}
                                    <div
                                        className="absolute right-0 top-12 w-56 rounded-lg shadow-lg z-50 py-2"
                                        style={{ backgroundColor: '#FFFFFF', border: `1px solid ${CoffeeColors.BORDER_GRAY}` }}
                                    >
                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                            onClick={() => setProfileDropdownOpen(false)}
                                        >
                                            <Settings size={18} style={{ color: CoffeeColors.DARK_BROWN }} />
                                            <span style={{ color: CoffeeColors.DARK_BROWN, fontSize: '14px', fontWeight: '500' }}>
                                                Profile Settings
                                            </span>
                                        </Link>

                                        <button
                                            onClick={() => {
                                                setProfileDropdownOpen(false);
                                                setShowLogoutModal(true);
                                            }}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left"
                                        >
                                            <LogOut size={18} style={{ color: CoffeeColors.DARK_BROWN }} />
                                            <span style={{ color: CoffeeColors.DARK_BROWN, fontSize: '14px', fontWeight: '500' }}>
                                                Logout
                                            </span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Render children content, adding padding for the fixed header */}
                <div className="pt-20 p-8">
                    {children}
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                }}>
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0"
                        onClick={() => setShowLogoutModal(false)}
                    />

                    {/* Modal */}
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: '#FEE2E2' }}
                            >
                                <LogOut size={32} style={{ color: '#DC2626' }} />
                            </div>
                        </div>

                        {/* Title */}
                        <h3
                            className="text-2xl font-bold text-center mb-3"
                            style={{ color: '#1F2937' }}
                        >
                            Logout Confirmation
                        </h3>

                        {/* Message */}
                        <p
                            className="text-center mb-8"
                            style={{ color: '#6B7280', fontSize: '16px' }}
                        >
                            Are you sure you want to logout?
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
                                style={{
                                    backgroundColor: '#F3F4F6',
                                    color: '#374151',
                                    border: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#E5E7EB';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#F3F4F6';
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={performLogout}
                                className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
                                style={{
                                    backgroundColor: '#8B4513',
                                    color: '#FFFFFF',
                                    border: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#6d3410';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#8B4513';
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SideNav;