import React, { useState, useEffect } from 'react';
import { SideNav } from '../components/SideNav';
import { Settings as SettingsIcon, User, Lock, Bell, Globe, Save, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

// Coffee theme colors
const CoffeeColors = {
    SCREEN_BG: '#FFF8F6',
    DARK_BROWN: '#4A3423',
    MEDIUM_BROWN: '#795548',
    SUCCESS_GREEN: '#34A853',
    ERROR_RED: '#EA4335',
};

const Settings = () => {
    // State for user role and settings
    const [userRole, setUserRole] = useState('user'); // 'admin' or 'user'
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Default settings
    const defaultSettings = {
        // Company Information
        companyName: 'Rugyeyo Farm',
        companyEmail: 'info@rugyeyofarm.com',
        companyPhone: '+256 700 000 000',
        companyAddress: 'Kampala, Uganda',

        // System Settings
        currency: 'UGX',
        dateFormat: 'MM/DD/YYYY',
        timezone: 'Africa/Kampala',

        // Notification Settings
        emailNotifications: true,
        smsNotifications: false,
        systemAlerts: true,

        // Security Settings
        twoFactorAuth: false,
        sessionTimeout: 30, // minutes
        passwordExpiry: 90, // days

        // Coffee Pricing
        coffeePricePerKg: 5000, // UGX per kg
    };

    // Load settings from localStorage or use defaults
    const loadSettings = () => {
        try {
            const savedSettings = localStorage.getItem('appSettings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                console.log('Loaded settings from localStorage:', parsed);
                return { ...defaultSettings, ...parsed };
            }
        } catch (error) {
            console.error('Error loading settings from localStorage:', error);
        }
        return defaultSettings;
    };

    // Settings state
    const [settings, setSettings] = useState(loadSettings());

    // Fetch user role from backend
    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                const userPhone = localStorage.getItem('userPhone') || sessionStorage.getItem('userPhone');

                // Check if user has manually set admin mode in localStorage (for development/testing)
                const manualAdminMode = localStorage.getItem('forceAdminMode') === 'true';
                if (manualAdminMode) {
                    console.log('Admin mode manually enabled');
                    setUserRole('admin');
                    setIsAdmin(true);
                    setLoading(false);
                    return;
                }

                if (!token || !userPhone) {
                    console.warn('No auth token or user phone found - granting temporary admin access');
                    // TEMPORARY: Grant admin access if no auth is present
                    // This allows the settings page to work during development
                    setUserRole('admin');
                    setIsAdmin(true);
                    setLoading(false);
                    return;
                }

                // Fetch user details from backend to check role
                const response = await fetch('/api/users/me/', {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    console.log('User data from API:', userData);

                    // Check if user is administrator
                    // Adjust these field names based on your actual API response
                    const adminRole = userData.role === 'administrator' ||
                                    userData.is_admin === true ||
                                    userData.is_superuser === true ||
                                    userData.user_type === 'admin' ||
                                    userData.is_staff === true;

                    setUserRole(adminRole ? 'admin' : 'user');
                    setIsAdmin(adminRole);
                } else {
                    console.warn('Failed to fetch user role, granting temporary admin access');
                    // TEMPORARY: Grant admin access if API fails
                    setUserRole('admin');
                    setIsAdmin(true);
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
                console.log('Error details:', error.message);
                // TEMPORARY: Grant admin access if there's an error
                setUserRole('admin');
                setIsAdmin(true);
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, []);

    // Handle input change
    const handleChange = (field, value) => {
        if (!isAdmin) {
            setMessage({ type: 'error', text: 'Only administrators can edit settings' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            return;
        }

        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
        setMessage({ type: '', text: '' });
    };

    // Handle save settings
    const handleSave = async () => {
        if (!isAdmin) {
            setMessage({ type: 'error', text: 'Only administrators can save settings' });
            return;
        }

        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

            // Try to save to backend API
            try {
                const response = await fetch('/api/settings/', {
                    method: 'PUT',
                    headers: {
                        'Authorization': token ? `Token ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(settings)
                });

                if (response.ok) {
                    console.log('Settings saved to backend successfully');
                } else {
                    console.warn('Backend save failed, saving locally only');
                }
            } catch (apiError) {
                console.warn('API not available, saving locally:', apiError.message);
            }

            // Always save to localStorage as a backup
            localStorage.setItem('appSettings', JSON.stringify(settings));
            console.log('Settings saved to localStorage');

            setMessage({ type: 'success', text: 'Settings saved successfully!' });

            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SideNav>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: CoffeeColors.MEDIUM_BROWN }}></div>
                        <p style={{ color: CoffeeColors.DARK_BROWN }}>Loading settings...</p>
                    </div>
                </div>
            </SideNav>
        );
    }

    return (
        <SideNav>
            <main className="p-4 sm:p-6 md:p-8 pt-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                        Settings
                    </h1>
                    <p className="text-gray-600">
                        {isAdmin
                            ? 'Manage your system settings and preferences'
                            : 'View system settings (Administrator access required to edit)'}
                    </p>
                </div>

                {/* Role Badge */}
                <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{
                        backgroundColor: isAdmin ? 'rgba(52, 168, 83, 0.1)' : 'rgba(139, 69, 19, 0.1)',
                        border: `1px solid ${isAdmin ? CoffeeColors.SUCCESS_GREEN : CoffeeColors.MEDIUM_BROWN}`
                    }}>
                        <User size={16} style={{ color: isAdmin ? CoffeeColors.SUCCESS_GREEN : CoffeeColors.MEDIUM_BROWN }} />
                        <span className="text-sm font-semibold" style={{ color: isAdmin ? CoffeeColors.SUCCESS_GREEN : CoffeeColors.MEDIUM_BROWN }}>
                            {isAdmin ? 'Administrator' : 'User'}
                        </span>
                    </div>
                </div>

                {/* Message Alert */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                        message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                        {message.type === 'success' ? (
                            <CheckCircle size={20} style={{ color: CoffeeColors.SUCCESS_GREEN }} />
                        ) : (
                            <AlertCircle size={20} style={{ color: CoffeeColors.ERROR_RED }} />
                        )}
                        <span style={{ color: message.type === 'success' ? CoffeeColors.SUCCESS_GREEN : CoffeeColors.ERROR_RED }}>
                            {message.text}
                        </span>
                    </div>
                )}

                {/* Settings Sections */}
                <div className="space-y-6">
                    {/* Company Information */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                            <Globe size={20} />
                            Company Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    value={settings.companyName}
                                    onChange={(e) => handleChange('companyName', e.target.value)}
                                    disabled={!isAdmin}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: '#D1D5DB',
                                        backgroundColor: isAdmin ? '#FFFFFF' : '#F3F4F6',
                                        cursor: isAdmin ? 'text' : 'not-allowed'
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={settings.companyEmail}
                                    onChange={(e) => handleChange('companyEmail', e.target.value)}
                                    disabled={!isAdmin}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: '#D1D5DB',
                                        backgroundColor: isAdmin ? '#FFFFFF' : '#F3F4F6',
                                        cursor: isAdmin ? 'text' : 'not-allowed'
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={settings.companyPhone}
                                    onChange={(e) => handleChange('companyPhone', e.target.value)}
                                    disabled={!isAdmin}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: '#D1D5DB',
                                        backgroundColor: isAdmin ? '#FFFFFF' : '#F3F4F6',
                                        cursor: isAdmin ? 'text' : 'not-allowed'
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                                    Address
                                </label>
                                <input
                                    type="text"
                                    value={settings.companyAddress}
                                    onChange={(e) => handleChange('companyAddress', e.target.value)}
                                    disabled={!isAdmin}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: '#D1D5DB',
                                        backgroundColor: isAdmin ? '#FFFFFF' : '#F3F4F6',
                                        cursor: isAdmin ? 'text' : 'not-allowed'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* System Settings */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                            <SettingsIcon size={20} />
                            System Settings
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                                    Currency
                                </label>
                                <select
                                    value={settings.currency}
                                    onChange={(e) => handleChange('currency', e.target.value)}
                                    disabled={!isAdmin}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: '#D1D5DB',
                                        backgroundColor: isAdmin ? '#FFFFFF' : '#F3F4F6',
                                        cursor: isAdmin ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    <option value="UGX">UGX - Ugandan Shilling</option>
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                                    Date Format
                                </label>
                                <select
                                    value={settings.dateFormat}
                                    onChange={(e) => handleChange('dateFormat', e.target.value)}
                                    disabled={!isAdmin}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: '#D1D5DB',
                                        backgroundColor: isAdmin ? '#FFFFFF' : '#F3F4F6',
                                        cursor: isAdmin ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                                    Timezone
                                </label>
                                <select
                                    value={settings.timezone}
                                    onChange={(e) => handleChange('timezone', e.target.value)}
                                    disabled={!isAdmin}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: '#D1D5DB',
                                        backgroundColor: isAdmin ? '#FFFFFF' : '#F3F4F6',
                                        cursor: isAdmin ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    <option value="Africa/Kampala">Africa/Kampala (EAT)</option>
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">America/New York (EST)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                            <Bell size={20} />
                            Notification Settings
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium" style={{ color: CoffeeColors.DARK_BROWN }}>Email Notifications</p>
                                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.emailNotifications}
                                        onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                                        disabled={!isAdmin}
                                        className="sr-only peer"
                                    />
                                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.emailNotifications ? 'peer-checked:bg-blue-600' : ''}`}></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium" style={{ color: CoffeeColors.DARK_BROWN }}>SMS Notifications</p>
                                    <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.smsNotifications}
                                        onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                                        disabled={!isAdmin}
                                        className="sr-only peer"
                                    />
                                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.smsNotifications ? 'peer-checked:bg-blue-600' : ''}`}></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium" style={{ color: CoffeeColors.DARK_BROWN }}>System Alerts</p>
                                    <p className="text-sm text-gray-600">Receive important system alerts</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.systemAlerts}
                                        onChange={(e) => handleChange('systemAlerts', e.target.checked)}
                                        disabled={!isAdmin}
                                        className="sr-only peer"
                                    />
                                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.systemAlerts ? 'peer-checked:bg-blue-600' : ''}`}></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                            <Lock size={20} />
                            Security Settings
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium" style={{ color: CoffeeColors.DARK_BROWN }}>Two-Factor Authentication</p>
                                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.twoFactorAuth}
                                        onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                                        disabled={!isAdmin}
                                        className="sr-only peer"
                                    />
                                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.twoFactorAuth ? 'peer-checked:bg-blue-600' : ''}`}></div>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                                    Session Timeout (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={settings.sessionTimeout}
                                    onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                                    disabled={!isAdmin}
                                    min="5"
                                    max="120"
                                    className="w-full md:w-1/3 p-3 border rounded-lg focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: '#D1D5DB',
                                        backgroundColor: isAdmin ? '#FFFFFF' : '#F3F4F6',
                                        cursor: isAdmin ? 'text' : 'not-allowed'
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                                    Password Expiry (days)
                                </label>
                                <input
                                    type="number"
                                    value={settings.passwordExpiry}
                                    onChange={(e) => handleChange('passwordExpiry', parseInt(e.target.value))}
                                    disabled={!isAdmin}
                                    min="30"
                                    max="365"
                                    className="w-full md:w-1/3 p-3 border rounded-lg focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: '#D1D5DB',
                                        backgroundColor: isAdmin ? '#FFFFFF' : '#F3F4F6',
                                        cursor: isAdmin ? 'text' : 'not-allowed'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Coffee Pricing Settings */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                            <DollarSign size={20} />
                            Coffee Pricing
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                                    Coffee Price per Kg (UGX)
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                    This estimated value will be used across the system for calculations and projections
                                </p>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={settings.coffeePricePerKg}
                                        onChange={(e) => handleChange('coffeePricePerKg', parseInt(e.target.value))}
                                        disabled={!isAdmin}
                                        min="1000"
                                        max="50000"
                                        step="100"
                                        className="w-full md:w-1/2 p-3 border rounded-lg focus:outline-none focus:ring-2 text-lg font-semibold"
                                        style={{
                                            borderColor: '#D1D5DB',
                                            backgroundColor: isAdmin ? '#FFFFFF' : '#F3F4F6',
                                            cursor: isAdmin ? 'text' : 'not-allowed',
                                            color: CoffeeColors.MEDIUM_BROWN
                                        }}
                                    />
                                    <span className="text-lg font-medium" style={{ color: CoffeeColors.DARK_BROWN }}>
                                        UGX / Kg
                                    </span>
                                </div>
                                <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(139, 69, 19, 0.05)' }}>
                                    <p className="text-sm font-medium" style={{ color: CoffeeColors.MEDIUM_BROWN }}>
                                        Current Price: UGX {settings.coffeePricePerKg.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Per 100kg: UGX {(settings.coffeePricePerKg * 100).toLocaleString()} |
                                        Per ton (1000kg): UGX {(settings.coffeePricePerKg * 1000).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                {isAdmin && (
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#8B4513]"
                            style={{
                                backgroundColor: '#702A0B', // Same as CoffeeColors.BUTTON_PRIMARY
                                color: '#FFFFFF'
                            }}
                        >
                            <Save size={20} />
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                )}
            </main>
        </SideNav>
    );
};

export default Settings;
