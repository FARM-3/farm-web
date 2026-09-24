import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Menu, X, Home, DollarSign, ShoppingCart, Package, Users, LogOut, Settings,
    BarChart3, TreePine, TrendingUp, TrendingDown, ClipboardCheck, Factory, CheckSquare,
    Warehouse, Truck, FileText, Globe, UserCircle, Wrench, Award, GraduationCap, Sprout, Building2,
    PanelLeftClose, PanelLeftOpen, MapPin, ChevronDown, ChevronRight,
} from 'lucide-react';
import BrandLogo from './BrandLogo';

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
    { key: 'customers', name: 'Customers', icon: UserCircle, href: '/customers' },
    { key: 'expenses', name: 'Expenses', icon: Package, href: '/expenses' },
    { key: 'suppliers', name: 'Suppliers', icon: Building2, href: '/suppliers' },
    { key: 'staff', name: 'Staff', icon: Users, href: '/staff' },
    { key: 'assets', name: 'Assets', icon: Wrench, href: '/assets' },
    { key: 'documents', name: 'Documents', icon: Award, href: '/documents' },
    { key: 'trainings', name: 'Training', icon: GraduationCap, href: '/trainings' },
    { key: 'aggregation', name: 'Aggregation', icon: BarChart3, href: '/aggregation' },
    { key: 'harvest', name: 'Harvest', icon: TreePine, href: '/harvest' },
    { key: 'processing', name: 'Processing', icon: Factory, href: '/processing' },
    { key: 'tasks', name: 'Task Management', icon: CheckSquare, href: '/tasks' },
];

const blocksNavItems = [
    { key: 'blocks', name: 'All Blocks', icon: MapPin, href: '/blocks' },
    { key: 'block-activities', name: 'Field Activities', icon: Sprout, href: '/block-activities' },
];

const reportsNavItems = [
    { key: 'reports', name: 'All Reports', icon: FileText, href: '/reports' },
];

const exportNavItems = [
    { key: 'export-inventory', name: 'Inventory', icon: Warehouse, href: '/export/inventory' },
    { key: 'export-dispatch', name: 'Dispatch', icon: Truck, href: '/export/dispatch' },
    { key: 'export-trace', name: 'Trace Report', icon: FileText, href: '/export/trace' },
    { key: 'export-dossier', name: 'Export Dossier', icon: FileText, href: '/export/dossier' },
];

const footerNavItems = [
    { key: 'settings', name: 'Settings', icon: Settings, href: '/settings' },
    { key: 'logout', name: 'Logout', icon: LogOut, href: '/logout' },
];

// --- UTILITY: Get Current Page Key ---
const getCurrentPageKey = () => {
    const path = window.location.pathname.split('/')[1] || 'dashboard';

    if (path.startsWith('sales')) return 'sales';
    if (path.startsWith('customers')) return 'customers';
    if (path.startsWith('suppliers')) return 'suppliers';
    if (path.startsWith('assets')) return 'assets';
    if (path.startsWith('documents')) return 'documents';
    if (path.startsWith('trainings')) return 'trainings';
    if (path.startsWith('staff')) return 'staff';
    if (path === 'wagesrecords') return 'wagesrecords';
    if (path.startsWith('wages')) return 'wages';
    if (path.startsWith('settings')) return 'settings';
    if (path.startsWith('receipt')) return 'receipt';
    if (path.startsWith('processing')) return 'processing';
    if (path.startsWith('tasks')) return 'tasks';
    if (path.startsWith('block-activities')) return 'block-activities';
    if (path.startsWith('blocks')) return 'blocks';
    if (path.startsWith('reports')) return 'reports';
    if (path.startsWith('export')) {
        if (path.includes('inventory')) return 'export-inventory';
        if (path.includes('dispatch')) return 'export-dispatch';
        if (path.includes('dossier')) return 'export-dossier';
        if (path.includes('trace')) return 'export-trace';
        return 'export-inventory';
    }

    const item = [...navItems, ...footerNavItems, ...exportNavItems, ...reportsNavItems].find(item => item.key === path);
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

const BlocksNavGroup = ({ items, currentPage, CoffeeColors, collapsed, expanded, onToggle }) => {
    const isChildActive = items.some(i => i.key === currentPage);
    const iconColor = CoffeeColors.DARK_BROWN;

    if (collapsed) {
        return (
            <div className="flex flex-col gap-1">
                {items.map(item => (
                    <SidebarLink key={item.key} item={item} currentPage={currentPage} CoffeeColors={CoffeeColors} collapsed />
                ))}
            </div>
        );
    }

    return (
        <div>
            <button
                type="button"
                onClick={onToggle}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium w-full text-left hover:scale-[1.01] ${isChildActive ? 'shadow-sm' : ''}`}
                style={{
                    color: iconColor,
                    backgroundColor: isChildActive ? 'rgba(200, 200, 200, 0.3)' : 'transparent',
                }}
            >
                <MapPin size={18} style={{ color: iconColor }} />
                <span className="text-sm flex-1">Blocks</span>
                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {expanded && (
                <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-gray-200 pl-2">
                    {items.map(item => (
                        <SidebarLink key={item.key} item={item} currentPage={currentPage} CoffeeColors={CoffeeColors} collapsed={false} nested />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- COMPONENT: Sidebar Link ---
const SidebarLink = ({ item, currentPage, CoffeeColors, onLogoutClick, collapsed, nested = false }) => {
    const isActive = item.key === currentPage;

    const activeColor = CoffeeColors.DARK_BROWN;
    const defaultColor = CoffeeColors.DARK_BROWN;

    const iconColor = isActive ? activeColor : defaultColor;
    const textColor = isActive ? activeColor : defaultColor;

    const hoverBg = CoffeeColors.LIGHT_HOVER;
    const linkClass = `flex items-center gap-2 py-2 rounded-lg transition-all font-medium hover:scale-[1.01] ${isActive ? 'shadow-sm' : ''} ${collapsed ? 'justify-center px-2' : nested ? 'px-2' : 'px-3'}`;

    // Special handling for logout link
    if (item.key === 'logout') {
        return (
            <button
                type="button"
                title={collapsed ? item.name : undefined}
                onClick={onLogoutClick}
                className={`${linkClass} w-full text-left`}
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
                <item.icon size={18} style={{ color: iconColor }} />
                {!collapsed && <span className="text-sm">{item.name}</span>}
            </button>
        );
    }

    return (
        <Link
            key={item.name}
            to={item.href}
            title={collapsed ? item.name : undefined}
            className={linkClass}
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
            <item.icon size={18} style={{ color: iconColor }} />
            {!collapsed && <span className="text-sm">{item.name}</span>}
        </Link>
    );
};

// --- MAIN COMPONENT: SideNav (Exported) ---
export const SideNav = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
    const currentPage = useMemo(() => getCurrentPageKey(), []);
    const [blocksExpanded, setBlocksExpanded] = useState(
        () => ['blocks', 'block-activities'].includes(getCurrentPageKey())
    );
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [userProfileData, setUserProfileData] = useState({ name: 'User', phone: '', email: '', rawPassword: null });
    const sidebarWidthClass = collapsed ? 'w-16' : 'w-56';
    const sidebarMarginClass = collapsed ? 'md:ml-16' : 'md:ml-56';
    const headerLeftClass = collapsed ? 'md:left-16' : 'md:left-56';

    const toggleCollapsed = () => {
        setCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('sidebarCollapsed', String(next));
            return next;
        });
    };

    useEffect(() => {
        const handleResize = () => {
            if (typeof window !== 'undefined') {
                const mobile = window.innerWidth < 768;
                setIsMobile(mobile);
                if (mobile) setMobileOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Debug: Log state changes
    useEffect(() => {
        console.log('📊 SideNav State Update:');
        console.log('  - showLogoutModal:', showLogoutModal);
    }, [showLogoutModal]);

    // Fetch user profile from backend (best-effort). Falls back to localStorage if API is unavailable.
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('authToken') || localStorage.getItem('token');
                if (!token) return;

                // Prefer the deployed API host used across the app. If you run a local
                // Uses .env configuration for API endpoint
                const PROFILE_API = `${import.meta.env.VITE_API_URL}/api/users/me/`;

                const res = await fetch(PROFILE_API, {
                    headers: {
                        'Content-Type': 'application/json',
                        // OpenAPI YAML uses Bearer JWT for /api/users/me/
                        'Authorization': `Bearer ${token}`
                    },
                    credentials: 'include'
                });

                if (!res.ok) {
                    // If remote profile fetch fails, fall back to localStorage below
                    throw new Error('Profile fetch failed');
                }

                const data = await res.json();
                // Normalize possible field names
                const name = data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.name || data.username || localStorage.getItem('userName');
                const phone = data.phone || data.contact || data.mobile || localStorage.getItem('userPhone');
                const email = data.email || localStorage.getItem('userEmail');
                const rawPassword = data.password || null; // most backends won't return this for security

                setUserProfileData({ name, phone, email, rawPassword });
            } catch (err) {
                // Fallback: use any locally stored values
                setUserProfileData({
                    name: localStorage.getItem('userName') || 'User',
                    phone: localStorage.getItem('userPhone') || '',
                    email: localStorage.getItem('userEmail') || '',
                    rawPassword: null
                });
            }
        };

        fetchProfile();
    }, []);

    return (
        <div className="min-h-screen flex w-full" style={{ backgroundColor: CoffeeColors.SCREEN_BG, fontFamily: 'Inter, sans-serif' }}>
            
            {/* Mobile Sidebar Overlay */}
            {isMobile && mobileOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-20 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full ${sidebarWidthClass} transform ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0 transition-all duration-300 ease-in-out z-50 shadow-lg flex flex-col`}
                style={{ backgroundColor: CoffeeColors.SIDEBAR_BG }}
            >
                {/* Logo and collapse toggle */}
                <div className={`flex items-center ${collapsed ? 'flex-col gap-2 px-2' : 'justify-between px-4'} py-4 h-auto flex-shrink-0 border-b border-gray-200`}>
                    <BrandLogo size="sm" variant="dark" iconOnly={collapsed} />
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={toggleCollapsed}
                            className="hidden md:flex p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            style={{ color: CoffeeColors.DARK_BROWN }}
                            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            className="md:hidden p-1 rounded-lg hover:bg-gray-100"
                            style={{ color: CoffeeColors.WHITE_TEXT }}
                        >
                            <X size={22} />
                        </button>
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className={`mt-3 flex flex-col space-y-1 flex-1 overflow-y-auto min-h-0 ${collapsed ? 'px-1.5' : 'px-3'}`}>
                    {navItems.map((item) => (
                        <SidebarLink key={item.key} item={item} currentPage={currentPage} CoffeeColors={CoffeeColors} collapsed={collapsed} />
                    ))}
                    <BlocksNavGroup
                        items={blocksNavItems}
                        currentPage={currentPage}
                        CoffeeColors={CoffeeColors}
                        collapsed={collapsed}
                        expanded={blocksExpanded}
                        onToggle={() => setBlocksExpanded(v => !v)}
                    />
                    <div className="pt-4 mt-2 border-t border-gray-200">
                        {!collapsed && (
                            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide flex items-center gap-1" style={{ color: CoffeeColors.DARK_BROWN }}>
                                <BarChart3 size={14} /> Reports
                            </p>
                        )}
                        {collapsed && (
                            <div className="flex justify-center pb-2" title="Reports">
                                <BarChart3 size={14} style={{ color: CoffeeColors.DARK_BROWN }} />
                            </div>
                        )}
                        {reportsNavItems.map((item) => (
                            <SidebarLink key={item.key} item={item} currentPage={currentPage} CoffeeColors={CoffeeColors} collapsed={collapsed} />
                        ))}
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-200">
                        {!collapsed && (
                            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide flex items-center gap-1" style={{ color: CoffeeColors.DARK_BROWN }}>
                                <Globe size={14} /> Export & Compliance
                            </p>
                        )}
                        {collapsed && (
                            <div className="flex justify-center pb-2" title="Export & Compliance">
                                <Globe size={14} style={{ color: CoffeeColors.DARK_BROWN }} />
                            </div>
                        )}
                        {exportNavItems.map((item) => (
                            <SidebarLink key={item.key} item={item} currentPage={currentPage} CoffeeColors={CoffeeColors} collapsed={collapsed} />
                        ))}
                    </div>
                </nav>

                {/* Footer Links */}
                <div className={`py-4 flex-shrink-0 border-t border-gray-200 ${collapsed ? 'px-1.5' : 'px-3'}`} style={{ backgroundColor: CoffeeColors.SIDEBAR_BG }}>
                    <div className="flex flex-col space-y-1">
                        {footerNavItems.map((item) => (
                            <SidebarLink key={item.key} item={item} currentPage={currentPage} CoffeeColors={CoffeeColors} collapsed={collapsed} onLogoutClick={() => setShowLogoutModal(true)} />
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div
                className={`flex-1 transition-all duration-300 ${sidebarMarginClass} w-full`}
                style={{ minHeight: '100vh', backgroundColor: CoffeeColors.SCREEN_BG }}
            >
                <header
                    className={`fixed top-0 right-0 z-40 p-4 h-20 shadow-sm transition-all duration-300 ${headerLeftClass} w-full`}
                    style={{ backgroundColor: '#FFFFFF', borderBottom: `1px solid ${CoffeeColors.BORDER_GRAY}` }}
                >
                    <div className="flex items-center h-full max-w-7xl mx-auto">
                        {(isMobile && !mobileOpen) && (
                            <button
                                type="button"
                                onClick={() => setMobileOpen(true)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                style={{ color: CoffeeColors.DARK_BROWN }}
                                title="Open menu"
                            >
                                <Menu size={24} />
                            </button>
                        )}
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