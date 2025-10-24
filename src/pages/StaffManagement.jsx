import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Users, UserPlus, Loader2, ArrowUp, ArrowDown, Search } from 'lucide-react';
import SideNav from '../components/SideNav.jsx';

// API endpoint for staff
const STAFF_API_ENDPOINT = 'https://api-3181.onrender.com/api/staff/';

// Coffee Theme Colors from Login.jsx
const CoffeeColors = {
    SCREEN_BG: '#FFF8F6',
    LIGHT_BG: '#FEEFEA',
    DARK_BROWN: '#4A3423',
    BUTTON_BROWN: '#8B4513',
    MEDIUM_BROWN: '#795548',
    LIGHT_BROWN: '#BCAAA4',
    WHITE: '#FFFFFF',
    GRAY_TEXT: '#8D8D8D',
    ERROR_RED: '#D32F2F',
    SUCCESS_GREEN: '#4CAF50',
};

const customTailwindConfig = {
    theme: {
        extend: {
            colors: {
                'app-bg': CoffeeColors.SCREEN_BG,
                'accent-header': CoffeeColors.LIGHT_BG,
                'accent-btn': CoffeeColors.BUTTON_BROWN,
                'text-default': CoffeeColors.DARK_BROWN,
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        }
    }
};

// Inject custom Tailwind config
const styleScript = document.createElement('script');
styleScript.innerHTML = `tailwind.config = ${JSON.stringify(customTailwindConfig)}`;
document.head.appendChild(styleScript);

const ActionButton = ({ children, onClick, className, style, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        style={{ ...style, backgroundColor: CoffeeColors.BUTTON_BROWN }}
    >
        {children}
    </button>
);

function StaffManagement() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Sorting state
    const [sortConfig, setSortConfig] = useState({ key: 'first_name', direction: 'ascending' });

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

    // Sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);


    // Live data fetcher with retry logic
    const fetchStaff = useCallback(async (retries = 3) => {
        setLoading(true);
        setError(null);

        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(STAFF_API_ENDPOINT);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                // Normalize API response to always be an array
                const normalized = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.results)
                        ? data.results
                        : [];

                setStaff(normalized);
                setError(null);
                setLoading(false);
                return;

            } catch (err) {
                console.error(`Attempt ${i + 1} failed to fetch staff:`, err);
                if (i === retries - 1) {
                    setError(`Network error. Please check your connection and try again.`);
                    setStaff([]);
                    setLoading(false);
                    return;
                }
                // Exponential backoff delay
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }
    }, []);

    // Initial data fetch on component mount
    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    // Sorting logic
    const sortedStaff = React.useMemo(() => {
        const base = Array.isArray(staff) ? staff : [];
        let sortableItems = [...base];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                // Handle number sorting
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    if (aValue < bValue) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (aValue > bValue) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                }

                // Default string/date sorting
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [staff, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return null;
        }
        if (sortConfig.direction === 'ascending') {
            return <ArrowUp className="w-3 h-3 ml-1" />;
        }
        return <ArrowDown className="w-3 h-3 ml-1" />;
    };


    const renderTableContent = () => {
        if (loading) {
            return (
                <tr className='h-24'>
                    <td colSpan={8} className="text-center py-6 text-gray-600">
                        <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" style={{ color: CoffeeColors.DARK_BROWN }} />
                        Loading staff records...
                    </td>
                </tr>
            );
        }

        if (error) {
            return (
                <tr className='h-24'>
                    <td colSpan={8} className="text-center py-6 text-red-600 font-medium">
                        {error}
                    </td>
                </tr>
            );
        }

        if (sortedStaff.length === 0) {
            return (
                <tr className='h-24'>
                    <td colSpan={8} className="text-center py-6 text-gray-500 italic">
                        No staff records found. Click "Refresh" to try again.
                    </td>
                </tr>
            );
        }

        return sortedStaff.map((member, index) => (
            <tr key={member.id || index} className="border-b transition-colors duration-150 hover:bg-white/50">
                <td className="px-6 py-3 text-left font-medium text-gray-800">{member.staff_id || member.id || 'N/A'}</td>
                <td className="px-6 py-3 text-left font-medium text-gray-800">{member.first_name || 'N/A'}</td>
                <td className="px-6 py-3 text-left text-gray-600">{member.last_name || 'N/A'}</td>
                <td className="px-6 py-3 text-center text-gray-700">{member.gender || 'N/A'}</td>
                <td className="px-6 py-3 text-left text-gray-700">{member.nin || 'N/A'}</td>
                <td className="px-6 py-3 text-left text-gray-700">{member.district || 'N/A'}</td>
                <td className="px-6 py-3 text-right text-gray-500">{member.date_hired || 'N/A'}</td>
            </tr>
        ));
    };

    return (
        <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            {/* Main Content Area */}
            <div className="min-h-screen flex flex-col items-center pt-24 md:pt-32 pb-10 font-sans"
                  style={{ backgroundColor: CoffeeColors.SCREEN_BG }}>

                {/* Header and Action Bar */}
                <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 mb-6 flex justify-between items-center">
                    <h1 className="text-4xl font-extrabold" style={{ color: CoffeeColors.DARK_BROWN }}>
                        Staff Management
                    </h1>
                    <div className="flex space-x-4">
                        <ActionButton onClick={() => fetchStaff()} disabled={loading} className="py-2 px-4 shadow-xl">
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh Data
                        </ActionButton>
                        <ActionButton onClick={() => navigate('/staff-registration')} className="py-2 px-4 shadow-xl">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Register New Staff
                        </ActionButton>
                    </div>
                </div>

                {/* Staff Records Table Container */}
                <div
                    className="max-w-7xl w-full mx-4 p-4 sm:p-8 shadow-2xl rounded-2xl overflow-x-auto transition-all duration-300"
                    style={{ backgroundColor: '#F5EEDC', border: '1px solid #B8A072' }}
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="sticky top-0 z-10" style={{ backgroundColor: '#B8A072' }}>
                                <tr>
                                    <th
                                        key="id"
                                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                        onClick={() => requestSort('id')}
                                        scope="col"
                                    >
                                        <div className="flex items-center justify-start">
                                            Staff ID
                                            {getSortIcon('id')}
                                        </div>
                                    </th>
                                    <th
                                        key="first_name"
                                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                        onClick={() => requestSort('first_name')}
                                        scope="col"
                                    >
                                        <div className="flex items-center justify-start">
                                            First Name
                                            {getSortIcon('first_name')}
                                        </div>
                                    </th>
                                    <th
                                        key="last_name"
                                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                        onClick={() => requestSort('last_name')}
                                        scope="col"
                                    >
                                        <div className="flex items-center justify-start">
                                            Last Name
                                            {getSortIcon('last_name')}
                                        </div>
                                    </th>
                                    <th
                                        key="gender"
                                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                        onClick={() => requestSort('gender')}
                                        scope="col"
                                    >
                                        <div className="flex items-center justify-center">
                                            Gender
                                            {getSortIcon('gender')}
                                        </div>
                                    </th>
                                    <th
                                        key="nin"
                                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                        onClick={() => requestSort('nin')}
                                        scope="col"
                                    >
                                        <div className="flex items-center justify-start">
                                            NIN
                                            {getSortIcon('nin')}
                                        </div>
                                    </th>
                                    <th
                                        key="district"
                                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                        onClick={() => requestSort('district')}
                                        scope="col"
                                    >
                                        <div className="flex items-center justify-start">
                                            District
                                            {getSortIcon('district')}
                                        </div>
                                    </th>
                                    <th
                                        key="date_hired"
                                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 text-white hover:bg-opacity-80"
                                        onClick={() => requestSort('date_hired')}
                                        scope="col"
                                    >
                                        <div className="flex items-center justify-end">
                                            Date Hired
                                            {getSortIcon('date_hired')}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/70 divide-y divide-gray-200" style={{ color: CoffeeColors.DARK_BROWN }}>
                                {renderTableContent()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SideNav>
    );
}

export default StaffManagement;
