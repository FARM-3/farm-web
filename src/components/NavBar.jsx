import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CUSTOM_COLORS = {
    headerBg: '#702A0B',
};

const NavBar = () => {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        // Confirm logout
        const confirmLogout = window.confirm('Are you sure you want to logout?');

        if (!confirmLogout) return;

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

            // Navigate to landing/login page
            navigate('/', { replace: true });

        } catch (error) {
            console.error('Logout error:', error);

            // Even if API call fails, clear local data and redirect
            localStorage.clear();
            sessionStorage.clear();
            navigate('/', { replace: true });
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
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
    );
};

export default NavBar;