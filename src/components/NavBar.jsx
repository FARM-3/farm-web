import React from 'react';
import { useNavigate } from 'react-router-dom';

const CUSTOM_COLORS = {
    headerBg: '#702A0B',
};

const NavBar = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };
    return (
        <nav className="fixed top-0 left-0 w-full p-4 shadow-xl z-10 font-sans" style={{ backgroundColor: CUSTOM_COLORS.headerBg }}>
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <div className="text-white text-xl font-bold flex items-center">
                    <span className="mr-2">💰</span> Rugyeyo Farm Management
                </div>
                <div>
                    <a href="/wages" className="text-white opacity-80 hover:opacity-100 mx-3 transition-opacity">Wage Records</a>
                    {/* <a href="/wage-entry" className="text-white opacity-80 hover:opacity-100 mx-3 transition-opacity">Wage Entry</a> */}
                    {/* <a href="/expense-entry" className="text-white opacity-80 hover:opacity-100 mx-3 transition-opacity">Expense Entry</a> */}
                    <button onClick={handleLogout} className="text-white opacity-80 hover:opacity-100 mx-3 transition-opacity">Logout</button>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;