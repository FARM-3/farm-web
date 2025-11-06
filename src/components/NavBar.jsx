import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Coffee Theme Colors (matching login page) ---
const CoffeeColors = {
  SCREEN_BG: '#8B4513',
  LIGHT_BG: '#8FBC8F',
  DARK_BROWN: '#4A3423',
  BUTTON_BROWN: '#8B4513',
  MEDIUM_BROWN: '#795548',
  LIGHT_BROWN: '#BCAAA4',
  WHITE: '#FFFFFF',
  GRAY_TEXT: '#666666',
  LIGHT_GRAY_BG: '#f0ead6',
  ERROR_RED: '#D32F2F',
  SUCCESS_GREEN: '#4CAF50',
  PALE_GREEN: '#E8F5E9',
};

const CUSTOM_COLORS = {
    headerBg: '#702A0B',
};

const NavBar = () => {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const handleLogout = async () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        setShowLogoutConfirm(false);
        setIsLoggingOut(true);

        try {
            // Get the auth token from localStorage
            const token = localStorage.getItem('authToken');

            // Call Django logout API
            if (token) {
                await fetch('http://localhost:8000/api/users/logout/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`,
                    },
                    credentials: 'include',
                });
            }

            // Clear all authentication data from localStorage
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('userPhone');
            localStorage.removeItem('userRole');

            // Clear everything if needed
            // localStorage.clear();

            // Also clear sessionStorage
            sessionStorage.clear();

            // Redirect immediately without showing success message
            navigate('/', { replace: true });
            window.location.reload();

        } catch (error) {
            console.error('Logout error:', error);

            // Even if API call fails, clear local data and redirect immediately
            localStorage.clear();
            sessionStorage.clear();
            navigate('/', { replace: true });
            window.location.reload();
        } finally {
            setIsLoggingOut(false);
        }
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <>
            <nav
                className="fixed top-0 left-0 w-full p-4 shadow-xl z-10 font-sans"
                style={{ backgroundColor: CUSTOM_COLORS.headerBg }}
            >
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <div className="text-white text-xl font-bold flex items-center">
                        <span className="mr-2 text-3xl">💰</span> Rugyeyo Farm Management
                    </div>
                    <div className="flex items-center">
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="text-white hover:text-gray-200 px-4 py-2 rounded transition-colors disabled:opacity-50"
                        >
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '40px 35px',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                        maxWidth: '450px',
                        width: '95%',
                        textAlign: 'center',
                    }}>
                        <h3 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: 'white',
                            marginBottom: '10px',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                        }}>Confirm Logout</h3>

                        <p style={{
                            fontSize: '16px',
                            color: 'rgba(255, 255, 255, 0.9)',
                            marginBottom: '30px',
                        }}>
                            Are you sure you want to log out?
                        </p>

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button
                                onClick={cancelLogout}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmLogout}
                                disabled={isLoggingOut}
                                style={{
                                    background: '#795548',
                                    border: 'none',
                                    color: '#FFFFFF',
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                                    opacity: isLoggingOut ? 0.6 : 1,
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoggingOut) {
                                        e.target.style.background = '#6d4c41';
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isLoggingOut) {
                                        e.target.style.background = '#795548';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Message Modal */}
            {showSuccessMessage && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '40px 35px',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                        maxWidth: '450px',
                        width: '95%',
                        textAlign: 'center',
                    }}>
                        <div style={{
                            fontSize: '48px',
                            marginBottom: '20px',
                        }}>
                            ✅
                        </div>
                        <h3 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: 'white',
                            marginBottom: '10px',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                        }}>Successfully Logged Out</h3>

                        <p style={{
                            fontSize: '16px',
                            color: 'rgba(255, 255, 255, 0.9)',
                            marginBottom: '30px',
                        }}>
                            You have been securely logged out of your account.
                        </p>

                        <button
                            style={{
                                background: '#4CAF50',
                                border: 'none',
                                color: '#FFFFFF',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#45a049';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#4CAF50';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            Continue to Login
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default NavBar;