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
    { key: 'receipt', name: 'Receipt', icon: ClipboardCheck, href: '/receipt' },
    { key: 'harvest', name: 'Harvest', icon: TreePine, href: '/harvest' },
];

const footerNavItems = [
    { key: 'settings', name: 'Settings', icon: Settings, href: '/settings' },
    { key: 'logout', name: 'Logout', icon: LogOut, href: '/logout' },
];

// --- UTILITY: Get Current Page Key ---
const getCurrentPageKey = () => {
    const path = window.location.pathname.split('/')[1] || 'dashboard';

    if (path.startsWith('sales')) return 'sales';
    if (path.startsWith('staff')) return 'staff';
    if (path === 'wagesrecords') return 'wagesrecords';
    if (path.startsWith('wages')) return 'wages';
    if (path.startsWith('settings')) return 'settings';
    if (path.startsWith('receipt')) return 'receipt';

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
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium w-full text-left
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
                    size={18}
                    style={{ color: iconColor }}
                />
                <span className="text-sm">{item.name}</span>
            </button>
        );
    }

    return (
        <Link
            key={item.name}
            to={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium
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
                size={18}
                style={{ color: iconColor }}
            />
            <span className="text-sm">{item.name}</span>
        </Link>
    );
};

// --- MAIN COMPONENT: SideNav (Exported) ---
export const SideNav = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    // Profile state fetched from backend
    const [userProfileData, setUserProfileData] = useState({ name: '', phone: '', email: '', rawPassword: null });
    const [revealPassword, setRevealPassword] = useState(false);
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

    // Debug: Log state changes
    useEffect(() => {
        console.log('📊 SideNav State Update:');
        console.log('  - profileDropdownOpen:', profileDropdownOpen);
        console.log('  - showProfileModal:', showProfileModal);
        console.log('  - showLogoutModal:', showLogoutModal);
    }, [profileDropdownOpen, showProfileModal, showLogoutModal]);

    // Fetch user profile from backend (best-effort). Falls back to localStorage if API is unavailable.
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('authToken') || localStorage.getItem('token');
                if (!token) return;

                // Prefer the deployed API host used across the app. If you run a local
                // backend, change this to 'http://localhost:8000/api/users/me/' or make
                // the host configurable via an environment variable.
                const PROFILE_API = 'http://142.93.94.236:8000/api/users/me/';

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
                    <div className="flex items-center">
                        <img
                            src={rugyeyoLogo}
                            alt="Rugyeyo Farm Logo"
                            style={{
                                width: '80px',
                                height: 'auto',
                                backgroundColor: 'transparent'
                            }}
                        />
                        <h2 className="text-lg font-extrabold whitespace-nowrap" style={{ color: CoffeeColors.DARK_BROWN }}>
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
                    className={`fixed top-0 right-0 z-40 p-4 h-20 shadow-sm transition-all duration-300 ${sidebarOpen ? 'md:left-56' : 'md:left-0'} w-full`}
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
                                    onClick={() => {
                                        console.log('🔵 Profile button clicked!');
                                        console.log('🔵 Current profileDropdownOpen state:', profileDropdownOpen);
                                        setProfileDropdownOpen(!profileDropdownOpen);
                                    }}
                                    className="w-14 h-14 rounded-full flex items-center justify-center font-bold transition-all transform hover:scale-110 animate-pulse"
                                    style={{
                                        backgroundColor: '#ff3b30',
                                        boxShadow: '0 0 40px rgba(255,59,48,0.5), 0 0 20px rgba(255,59,48,0.3)',
                                        border: '3px solid white',
                                        zIndex: 80,
                                        position: 'relative'
                                    }}
                                    aria-label="Open profile menu"
                                    title="Profile Menu"
                                >
                                    <ProfileIcon size={28} style={{ color: '#FFFFFF' }} />
                                </button>

                            {/* Dropdown Menu */}
                                {profileDropdownOpen && (
                                    <>
                                        {/* Backdrop to close dropdown */}
                                        <div
                                            className="fixed inset-0 z-[60]"
                                            onClick={() => {
                                                setProfileDropdownOpen(false);
                                            }}
                                        />

                                        {/* Dropdown content - show user credentials fetched from backend */}
                                        <div
                                            className="absolute right-0 top-16 w-72 rounded-lg shadow-xl z-[70] py-2"
                                            style={{
                                                backgroundColor: '#FFFFFF',
                                                border: `1px solid ${CoffeeColors.BORDER_GRAY}`,
                                                boxShadow: '0 10px 40px rgba(0,0,0,0.12)'
                                            }}
                                        >
                                            <div className="px-4 py-3 border-b" style={{ borderColor: CoffeeColors.BORDER_GRAY }}>
                                                <p className="text-sm font-medium text-gray-900">{userProfileData.name || localStorage.getItem('userName') || 'User'}</p>
                                                <p className="text-xs text-gray-500">{userProfileData.email || localStorage.getItem('userEmail') || ''}</p>
                                            </div>

                                            <div className="px-4 py-3">
                                                <div className="text-xs text-gray-500">Phone</div>
                                                <div className="text-sm text-gray-800 mb-2">{userProfileData.phone || localStorage.getItem('userPhone') || 'N/A'}</div>

                                                <div className="text-xs text-gray-500 flex items-center justify-between">
                                                    <span>Password</span>
                                                    <button
                                                        onClick={() => setRevealPassword(prev => !prev)}
                                                        className="text-xs text-accent-btn underline ml-2"
                                                        style={{ color: CoffeeColors.DARK_BROWN, background: 'transparent', border: 'none' }}
                                                    >
                                                        {revealPassword ? 'Hide' : 'Reveal'}
                                                    </button>
                                                </div>
                                                <div className="text-sm text-gray-800 mb-3">
                                                    {/* For security, password is masked by default. We will not fetch or display plaintext password unless backend provides it explicitly (not recommended). */}
                                                    {revealPassword && userProfileData.rawPassword ? userProfileData.rawPassword : '••••••••'}
                                                </div>

                                                <div className="flex gap-2">
                                                    <Link
                                                        to="/settings"
                                                            onClick={() => setProfileDropdownOpen(false)}
                                                            className="flex-1 px-3 py-2 rounded-md text-sm text-center"
                                                            style={{ backgroundColor: CoffeeColors.ACTIVE_BG, color: '#fff', textDecoration: 'none' }}
                                                    >
                                                        Settings
                                                    </Link>

                                                    <button
                                                        onClick={() => {
                                                            // navigate to password reset in settings
                                                            window.location.href = '/settings#password';
                                                        }}
                                                        className="flex-1 px-3 py-2 rounded-md text-sm text-center border"
                                                    >
                                                        Reset Password
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="px-4 py-2 border-t" style={{ borderColor: CoffeeColors.BORDER_GRAY }}>
                                                <button
                                                    onClick={() => {
                                                        setProfileDropdownOpen(false);
                                                        setShowLogoutModal(true);
                                                    }}
                                                    className="w-full text-left px-2 py-2 text-sm text-red-600 hover:bg-gray-50 rounded"
                                                >
                                                    Logout
                                                </button>
                                            </div>
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
            {/* Profile Modal (opens from header profile icon) */}
            {showProfileModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
                    <div className="absolute inset-0" onClick={() => setShowProfileModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-[#3D2817]">My Profile</h3>
                            <button onClick={() => setShowProfileModal(false)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Profile fields read from localStorage (safe defaults) */}
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Name</p>
                                <p className="text-sm text-gray-800 font-medium">{localStorage.getItem('userName') || localStorage.getItem('userProfileName') || 'John Doe'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Role</p>
                                <p className="text-sm text-gray-800 font-medium">{localStorage.getItem('userRole') || 'user'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Contact</p>
                                <p className="text-sm text-gray-800 font-medium">{localStorage.getItem('userPhone') || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowProfileModal(false)} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SideNav;