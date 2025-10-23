import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Home, DollarSign, ShoppingBag, Users, Settings, LogOut, Menu, X, Bell, UserCircle,
    RefreshCw, Calendar, ArrowUp, ArrowDown, Edit, Trash2, Search, Filter, Plus, ChevronsDown, Loader2
} from 'lucide-react'; // Added Plus icon for 'Record New Staff'
import { SideNav } from '../components/SideNav';

// --- Global Styles & Constants (Consistent with other pages) ---
const CoffeeColors = {
    SCREEN_BG: '#FFF8F6', ACTIVE_LINK_BG: '#efebe9', ACTIVE_LINK_TEXT: '#783A1E', DARK_BROWN: '#4A3423', MEDIUM_BROWN: '#795548', BUTTON_BROWN: '#795548', GRAY_TEXT: '#8D8D8D', SUCCESS_GREEN: '#34A853', ERROR_RED: '#EA4335',
};

// IMPORTANT: Assuming Staff API Endpoint
const STAFF_API_ENDPOINT = 'https://api-3181.onrender.com/api/staff/'; // Placeholder API endpoint


// --- Helper Components (Re-using patterns from previous pages) ---

const NavLink = ({ to, icon: Icon, children, currentPath }) => {
    const isActive = currentPath === to;
    return (
        <a
            href={to}
            className={`flex items-center p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                    ? 'font-semibold shadow-inner'
                    : 'hover:bg-gray-100'
            }`}
            style={{
                backgroundColor: isActive ? CoffeeColors.ACTIVE_LINK_BG : 'transparent',
                color: isActive ? CoffeeColors.ACTIVE_LINK_TEXT : CoffeeColors.GRAY_TEXT
            }}
        >
            <Icon className="w-5 h-5 mr-3" />
            <span className="text-sm">{children}</span>
        </a>
    );
};

const MenuButton = ({ onClick, isOpen }) => (
    <button
        onClick={onClick}
        className="p-2 rounded-full md:hidden transition-all duration-300"
        style={{ color: CoffeeColors.ACTIVE_LINK_TEXT, backgroundColor: CoffeeColors.ACTIVE_LINK_BG }}
    >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
);





// Data Structure for Table Headers
const TABLE_HEADERS = [
    { key: 'staff_id', label: 'Staff Id', type: 'string' },
    { key: 'first_name', label: 'First Name', type: 'string' },
    { key: 'last_name', label: 'Last Name', type: 'string' },
    { key: 'gender', label: 'Gender', type: 'string' },
    { key: 'nin', label: 'NIN', type: 'string' },
    { key: 'district', label: 'District', type: 'string' },
    { key: 'date_hired', label: 'Date hired', type: 'date' },
];


function StaffPage() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGender, setFilterGender] = useState(''); // New state for gender filter
    const navigate = useNavigate();

    // Sorting state
    const [sortConfig, setSortConfig] = useState({ key: 'staff_id', direction: 'ascending' });

    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Mock Staff Data to match the image, as API might not provide exact data
    const MOCK_STAFF_DATA = [
        { id: 1, staff_id: 'N/A', first_name: 'Billy', last_name: 'Banks', gender: 'Male', nin: 'CM004GDT777G88', district: 'Wakiso', date_hired: '2023-06-15' },
        { id: 2, staff_id: 'RF002', first_name: 'Ivan', last_name: 'Koreta', gender: 'Male', nin: 'CM00566674632A', district: 'Wakiso', date_hired: '2024-11-20' },
        { id: 3, staff_id: 'RF003', first_name: 'Jackson', last_name: 'Ssemengo', gender: 'Male', nin: 'CM004673H7645F', district: 'Wakiso', date_hired: '2024-05-07' },
        { id: 4, staff_id: 'RF004', first_name: 'Justine', last_name: 'Natasha', gender: 'Female', nin: 'CF003674F7894A', district: 'Wakiso', date_hired: '2024-10-16' },
        { id: 5, staff_id: 'RF005', first_name: 'Agnes', last_name: 'Nalubega', gender: 'Female', nin: 'CF003675N876B', district: 'Mpigi', date_hired: '2023-03-22' },
        { id: 6, staff_id: 'RF006', first_name: 'Peter', last_name: 'Mwesigye', gender: 'Male', nin: 'CM004678P1234C', district: 'Mbarara', date_hired: '2024-01-10' },
    ];

    // Data Fetcher
    const fetchStaff = useCallback(async (retries = 3) => {
        setLoading(true);
        setError(null);

        console.log('--- Staff Fetch Started ---');
        try {
            // Attempt to fetch from API
            const response = await fetch(STAFF_API_ENDPOINT);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const normalized = Array.isArray(data)
                ? data
                : Array.isArray(data?.results)
                    ? data.results
                    : [];
            setStaff(normalized);
            console.log('Staff Data fetched successfully from API. Total records:', normalized.length);
        } catch (err) {
            console.warn(`API fetch failed, using mock data for visual consistency: ${err.message}`);
            setError("Could not load data from API. Displaying mock data.");
            setStaff(MOCK_STAFF_DATA); // Fallback to mock data
        } finally {
            setLoading(false);
        }
    }, []);


    // Initial data fetch on component mount
    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    // Filtering logic
    const filteredStaff = useMemo(() => {
        let currentStaff = staff;

        if (searchTerm) {
            currentStaff = currentStaff.filter(s =>
                s.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.staff_id?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterGender) {
            currentStaff = currentStaff.filter(s => s.gender?.toLowerCase() === filterGender.toLowerCase());
        }

        return currentStaff;
    }, [staff, searchTerm, filterGender]);


    // Sorting logic
    const sortedStaff = useMemo(() => {
        const base = Array.isArray(filteredStaff) ? filteredStaff : [];
        let sortableItems = [...base];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                const headerType = TABLE_HEADERS.find(h => h.key === sortConfig.key)?.type;

                // Handle date sorting
                if (headerType === 'date') {
                    const dateA = new Date(aValue);
                    const dateB = new Date(bValue);
                    return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
                }

                // Default string sorting
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
    }, [filteredStaff, sortConfig]);

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

    // Handle delete staff member
    const handleDeleteStaff = async () => {
        if (!staffToDelete) return;

        setDeleting(true);
        try {
            // Placeholder for API call
            console.log(`Simulating DELETE for staff ID: ${staffToDelete.id}`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
            
            setStaff(prevStaff => prevStaff.filter(s => s.id !== staffToDelete.id));
            setShowDeleteModal(false);
            setStaffToDelete(null);
            console.log(`Staff ${staffToDelete.first_name} deleted successfully.`);
        } catch (error) {
            console.error('Error deleting staff:', error);
            setError('Failed to delete staff member.');
        } finally {
            setDeleting(false);
        }
    };

    // Handle edit staff member
    const handleEditStaff = (staffMember) => {
        // Navigate to a staff entry/edit page with staff data
        navigate('/staff-entry', { state: { editStaff: staffMember } });
    };

    const renderTableContent = () => {
        if (loading) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-gray-600">
                        <Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-accent-btn" />
                        Loading staff records...
                    </td>
                </tr>
            );
        }

        if (error && staff.length === 0) { // Show error only if no data at all
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-red-600 font-medium">
                        {error}
                    </td>
                </tr>
            );
        }

        if (sortedStaff.length === 0) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length + 1} className="text-center py-6 text-gray-500 italic">
                        No staff records found matching your criteria.
                    </td>
                </tr>
            );
        }

        return sortedStaff.map((staffMember, index) => (
            <tr key={staffMember.id || index} className="border-b transition-colors duration-150 hover:bg-gray-50">
                <td className="px-6 py-3 text-left font-medium text-gray-800">{staffMember.staff_id || 'N/A'}</td>
                <td className="px-6 py-3 text-left text-gray-600">{staffMember.first_name || 'N/A'}</td>
                <td className="px-6 py-3 text-left text-gray-600">{staffMember.last_name || 'N/A'}</td>
                <td className="px-6 py-3 text-left text-gray-600">{staffMember.gender || '-'}</td>
                <td className="px-6 py-3 text-left text-gray-600">{staffMember.nin || '-'}</td>
                <td className="px-6 py-3 text-left text-gray-600">{staffMember.district || '-'}</td>
                <td className="px-6 py-3 text-right text-gray-600">{staffMember.date_hired || 'N/A'}</td>
                <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                        <button
                            onClick={() => handleEditStaff(staffMember)}
                            className="text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                            title="Edit Staff Member"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                setStaffToDelete(staffMember);
                                setShowDeleteModal(true);
                            }}
                            className="text-error hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete Staff Member"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </tr>
        ));
    };

    return (
        <SideNav>
            <main className="p-4 sm:p-6 md:p-8 pt-0">

                {/* Top Action Bar */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-text-default mb-4 md:mb-0">
                        Staff Details
                    </h1>
                    <div className="flex space-x-3 mt-4 md:mt-0">
                        <button
                            onClick={() => navigate('/staffRegistration')}
                            className="py-2 px-4 shadow-xl rounded-xl"
                            style={{ backgroundColor: '#795548', color: '#FFFFFF', border: 'none' }}
                        >
                            Record New Staff
                        </button>
                        <button
                            onClick={() => alert('Exporting to Excel is not yet implemented.')}
                            className="py-2 px-4 shadow-xl rounded-xl"
                            style={{ backgroundColor: '#efebe9', color: '#783A1E', border: 'none' }}
                        >
                            Export to Excel
                        </button>
                    </div>
                </div>

                {/* Search, Filter, Refresh Bar */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-stretch sm:items-center p-4 rounded-lg bg-white shadow-md">
                    
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by staff name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition"
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative w-full sm:w-48">
                        <select
                            value={filterGender}
                            onChange={(e) => setFilterGender(e.target.value)}
                            className="appearance-none w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition"
                        >
                            <option value="">Filter by Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        <ChevronsDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={() => fetchStaff()}
                        disabled={loading}
                        className="py-2 px-4 shadow-xl rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#efebe9', color: '#783A1E', border: 'none' }}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </button>
                </div>

                {/* Staff Records Table Container */}
                <div className="mt-8">
                    <div className="w-full bg-white shadow-xl rounded-2xl overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="sticky top-0 z-10" style={{ backgroundColor: '#efebe9', color: '#4A3423' }}>
                                <tr>
                                    {TABLE_HEADERS.map((header) => (
                                        <th
                                            key={header.key}
                                            className="px-6 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-accent-btn/90 transition-colors duration-150"
                                            onClick={() => requestSort(header.key)}
                                            scope="col"
                                        >
                                            <div className={`flex items-center ${header.type === 'number' ? 'justify-end' : 'justify-start'}`}>
                                                {header.label}
                                                {getSortIcon(header.key)}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {renderTableContent()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && staffToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4 text-text-default">
                            Confirm Deletion
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete staff member: **{staffToDelete.first_name} {staffToDelete.last_name}**? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setStaffToDelete(null);
                                }}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteStaff}
                                disabled={deleting}
                                className="px-4 py-2 text-white rounded-lg transition-colors flex items-center shadow-md"
                                style={{ backgroundColor: '#D32F2F' }}
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Permanently'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SideNav>
    );
}

export default StaffPage;
