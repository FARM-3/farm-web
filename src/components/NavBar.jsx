import React from 'react';
import { useNavigate } from 'react-router-dom'; // CRITICAL: Must be imported for navigation
import { LayoutDashboard, Wallet, LogOut } from 'lucide-react'; // Icons for navigation

const NAV_COLORS = {
    bg: '#702A0B', // Dark Reddish Brown
    text: '#FFFFFF',
    hover: '#B8A072', // Mid-tone Gold/Brown for hover
};

function NavBar() {
    // CRITICAL: Must be called inside the component function
    const navigate = useNavigate();

    // Placeholder function for future logout logic
    const handleLogout = () => {
        // In a real app, this would clear authentication state
        console.log("Logging out...");
        navigate('/'); // Navigate back to the login page
    };

    return (
        // Fixed Navbar spanning the full width
        <nav 
            className="fixed top-0 left-0 w-full shadow-lg z-50 p-4"
            style={{ backgroundColor: NAV_COLORS.bg, color: NAV_COLORS.text }}
        >
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                
                {/* Logo / Home Button */}
                <button
                    onClick={() => navigate('/wage-entry')}
                    className="flex items-center space-x-2 text-xl font-bold transition-colors hover:text-gray-300"
                >
                    <LayoutDashboard className="w-6 h-6" />
                    <span>Rugyeyo Financial Management</span>
                </button>

                {/* Navigation Links */}
                <div className="flex items-center space-x-6">
                    
                    {/* Wages Link (Current Page) */}
                    <button
                        onClick={() => navigate('/wages')}
                        className="flex items-center space-x-1 text-sm font-medium py-1 px-3 rounded-full transition-colors"
                        style={{ backgroundColor: NAV_COLORS.hover, color: NAV_COLORS.bg }}
                    >
                        <Wallet className="w-4 h-4" />
                        <span>Wages</span>
                    </button>

                    {/* Placeholder for Dashboard Link */}
                    <button
                        onClick={() => navigate('/expenses')}
                        className="flex items-center space-x-1 text-sm font-medium transition-colors hover:text-gray-300"
                    >
                        <span>Expenses</span>
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-1 text-sm font-medium transition-colors hover:text-red-300"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
