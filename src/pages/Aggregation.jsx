import { useState, useEffect, useCallback } from 'react';
import { SideNav } from '../components/SideNav';
import { Users, TrendingUp, Coffee, Loader2, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { onHarvestRecorded } from '../utils/autoExpenseCreation';

// API Endpoints - They use .env configuration
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;
const FARMERS_API = `${API_BASE_URL}/aggregation/farmer/`;
const FARMER_HARVEST_API = `${API_BASE_URL}/aggregation/farmer-harvest/`;

// Coffee Colors
const CoffeeColors = {
    SCREEN_BG: '#FFF8F6',
    ACTIVE_LINK_BG: '#efebe9',
    ACTIVE_LINK_TEXT: '#783A1E',
    DARK_BROWN: '#4A3423',
    MEDIUM_BROWN: '#795548',
    BUTTON_BROWN: '#795548',
    GRAY_TEXT: '#8D8D8D',
    SUCCESS_GREEN: '#34A853',
    ERROR_RED: '#EA4335',
};

// Format date helper
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// KPI Card Component
const KPICard = ({ title, value, subtitle, icon: Icon, loading }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium tracking-wide uppercase" style={{ color: '#666' }}>
                {title}
            </h3>
            <Icon size={20} style={{ color: '#8B5A3C' }} />
        </div>
        {loading ? (
            <div className="flex items-center gap-2 mt-2">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B5A3C' }} />
                <span className="text-sm" style={{ color: '#888' }}>Loading...</span>
            </div>
        ) : (
            <div className="mt-2">
                <div className="flex flex-col gap-1">
                    <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{value}</p>
                </div>
                {subtitle && (
                    <div className="mt-3 text-xs">
                        <p style={{ color: '#666' }}>{subtitle}</p>
                    </div>
                )}
            </div>
        )}
    </div>
);

// Expandable Row Component for Farmers
const ExpandableFarmerRow = ({ farmer, isExpanded, onToggle }) => {
    // Use timestamp fields: created_at, timestamp, date_created, or updated_at
    const recordDate = farmer.created_at || farmer.timestamp || farmer.date_created || farmer.updated_at || farmer.date_of_birth;

    return (
        <>
            <tr className="border-b border-gray-100 transition-colors duration-150 hover:bg-light-coffee-brown/40">
                <td className="px-6 py-3 text-left font-medium text-gray-800">{farmer.farmer_id || 'N/A'}</td>
                <td className="px-6 py-3 text-left text-gray-600">
                    {farmer.first_name} {farmer.last_name}
                </td>
                <td className="px-6 py-3 text-center text-gray-600">{formatDate(recordDate)}</td>
                <td className="px-6 py-3 text-center">
                    <button
                        onClick={onToggle}
                        className="text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-gray-50 transition-colors relative group"
                        title="View Details"
                    >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                            View Details
                        </span>
                    </button>
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-gray-50">
                    <td colSpan="4" className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Gender</p>
                                <p className="text-sm text-gray-800">{farmer.gender || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">NIN</p>
                                <p className="text-sm text-gray-800">{farmer.nin || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Contact</p>
                                <p className="text-sm text-gray-800">{farmer.contact || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                                <p className="text-sm text-gray-800">{farmer.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Farmer Type</p>
                                <p className="text-sm text-gray-800">{farmer.farmer_type || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Started Farming Year</p>
                                <p className="text-sm text-gray-800">{farmer.started_coffee_farming_year || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">District</p>
                                <p className="text-sm text-gray-800">{farmer.district || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Sub County</p>
                                <p className="text-sm text-gray-800">{farmer.sub_county || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Parish</p>
                                <p className="text-sm text-gray-800">{farmer.parish || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Village</p>
                                <p className="text-sm text-gray-800">{farmer.village || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Coffee Variety</p>
                                <p className="text-sm text-gray-800">{farmer.coffee_variety || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Number of Trees</p>
                                <p className="text-sm text-gray-800">{farmer.number_of_trees || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Land Ownership</p>
                                <p className="text-sm text-gray-800">{farmer.land_ownership || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">GPS Coordinates</p>
                                <p className="text-sm text-gray-800">{farmer.gps_coordinates || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Nearest Landmark</p>
                                <p className="text-sm text-gray-800">{farmer.nearest_landmark || 'N/A'}</p>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

// Expandable Row Component for Farmer Harvest
const ExpandableHarvestRow = ({ harvest, isExpanded, onToggle }) => {
    // Use the enriched data from the harvest record
    const harvestId = harvest.harvest_id || harvest.id || 'Unknown ID';
    const farmerName = harvest.farmer_name || harvest.name || 'Unknown Farmer';

    return (
        <>
            <tr className="border-b border-gray-100 transition-colors duration-150 hover:bg-light-coffee-brown/40">
                <td className="px-6 py-3 text-left font-medium text-gray-800">{harvestId}</td>
                <td className="px-6 py-3 text-left text-gray-600">{farmerName}</td>
                <td className="px-6 py-3 text-center text-gray-600">{formatDate(harvest.date_of_delivery)}</td>
                <td className="px-6 py-3 text-right text-gray-800 font-semibold">
                    {harvest.weight_on_delivery ? Number(harvest.weight_on_delivery).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'} kg
                </td>
                <td className="px-6 py-3 text-center">
                    <button
                        onClick={onToggle}
                        className="text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-gray-50 transition-colors relative group"
                        title="View Details"
                    >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                            View Details
                        </span>
                    </button>
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-gray-50">
                    <td colSpan="5" className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Price per kg</p>
                                <p className="text-sm text-gray-800 font-semibold">
                                    {harvest.price_per_kg ? `UGX ${Number(harvest.price_per_kg).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Amount Paid</p>
                                <p className="text-sm text-gray-800 font-semibold">
                                    {harvest.amount_paid ? `UGX ${Number(harvest.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Coffee Type</p>
                                <p className="text-sm text-gray-800">{harvest.coffee_type || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Location of Delivery</p>
                                <p className="text-sm text-gray-800">{harvest.location_of_delivery || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">GPS Coordinates Delivery</p>
                                <p className="text-sm text-gray-800">{harvest.gps_coordinates_delivery || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Paid By</p>
                                <p className="text-sm text-gray-800">{harvest.paid_by || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Number of Bags</p>
                                <p className="text-sm text-gray-800">{harvest.no_of_bags || 'N/A'}</p>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

// Main Aggregation Component
const AggregationPage = () => {
    const [activeTab, setActiveTab] = useState('farmers'); // 'farmers' or 'harvest'
    const [farmers, setFarmers] = useState([]);
    const [harvests, setHarvests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});

    // Fetch data from API
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Helper function to fetch all pages of paginated data
            const fetchAllPages = async (url) => {
                let allResults = [];
                let nextUrl = url;

                // Get auth token from localStorage OR sessionStorage (try multiple keys for compatibility)
                const token = localStorage.getItem('authToken') ||
                             localStorage.getItem('token') ||
                             sessionStorage.getItem('authToken') ||
                             sessionStorage.getItem('token');

                const headers = {
                    'Content-Type': 'application/json',
                };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                while (nextUrl) {
                    const response = await fetch(nextUrl, { headers }).catch(() => ({ ok: false }));
                    if (!response.ok) break;

                    const data = await response.json();

                    // Handle both paginated and non-paginated responses
                    if (Array.isArray(data)) {
                        allResults = allResults.concat(data);
                        break; // No pagination
                    } else {
                        allResults = allResults.concat(data.results || []);
                        nextUrl = data.next; // Move to next page
                    }
                }

                return allResults;
            };

            // Fetch all pages for both endpoints
            const [normalizedFarmers, rawHarvests] = await Promise.all([
                fetchAllPages(FARMERS_API),
                fetchAllPages(FARMER_HARVEST_API)
            ]);

            // Debug: log raw sizes and a sample raw harvest so we can refine matching
            console.log('Aggregation: farmer-harvest records fetched=', rawHarvests.length, 'farmers fetched=', normalizedFarmers.length);
            if (rawHarvests.length > 0) {
                console.log('Sample farmer-harvest record:', rawHarvests[0]);
                console.log('Farmer-harvest fields:', Object.keys(rawHarvests[0] || {}));
            }

            // Build farmer lookup map for enriching harvest records
            const farmerMapByName = {};
            const farmerMapById = {};
            normalizedFarmers.forEach(farmer => {
                const fullName = `${farmer.first_name || ''} ${farmer.last_name || ''}`.trim().toLowerCase();
                if (fullName) farmerMapByName[fullName] = farmer;
                if (farmer.farmer_id) farmerMapById[String(farmer.farmer_id)] = farmer;
                if (farmer.id) farmerMapById[String(farmer.id)] = farmer;
            });

            // Since we're fetching from /api/aggregation/farmer-harvest/, ALL records are farmer harvests
            // No filtering needed - just use all the records as-is
            const farmerHarvests = rawHarvests;

            console.log('Aggregation: Total farmer-harvest records to display=', farmerHarvests.length);

            if (normalizedFarmers.length > 0) {
                console.log('Sample farmer record:', normalizedFarmers[0]);
                const farmerFields = Object.keys(normalizedFarmers[0]);
                console.log('Farmer fields:', farmerFields);
                console.log('🔍 All farmer fields with values:', normalizedFarmers[0]);

                // Find all date-related fields
                const dateFields = farmerFields.filter(field =>
                    field.includes('date') || field.includes('time') || field.includes('created') || field.includes('updated')
                );
                console.log('📅 Date-related fields:', dateFields);
                dateFields.forEach(field => {
                    console.log(`  - ${field}:`, normalizedFarmers[0][field]);
                });
            }

            // Enrich harvest records with farmer details
            const enrichedHarvests = await Promise.all(farmerHarvests.map(async harvest => {
                // The API returns 'harvest_id' and 'name' (farmer's name)
                const harvestId = harvest.harvest_id || harvest.id;

                // Try to find the farmer by matching the name (several possible name fields)
                const farmerName = (harvest.name || harvest.farmer_name || `${harvest.first_name || ''} ${harvest.last_name || ''}`.trim()).toLowerCase();
                const farmer = farmerMapByName[farmerName] || null;

                // NOTE: We intentionally do NOT auto-create expenses here during aggregation fetch.
                // Auto-expense creation should happen at the point of harvest creation/confirmation
                // (e.g. in the Harvest page or server-side) to avoid duplicate side-effects when
                // multiple pages fetch the same harvest records.

                return {
                    ...harvest,
                    harvest_id: harvestId,
                    farmer_id: farmer?.farmer_id || harvest.farmer_id || 'N/A',
                    farmer_name: farmer ? `${farmer.first_name || ''} ${farmer.last_name || ''}`.trim() : (harvest.name || harvest.farmer_name || 'Unknown Farmer'),
                    farmer_village: farmer?.village || harvest.village,
                    farmer_details: farmer
                };
            }));

            // Sort by latest record creation first (using timestamp fields)
            normalizedFarmers.sort((a, b) => {
                const dateA = a.created_at || a.timestamp || a.date_created || a.updated_at || a.date_of_birth || 0;
                const dateB = b.created_at || b.timestamp || b.date_created || b.updated_at || b.date_of_birth || 0;
                return new Date(dateB) - new Date(dateA);
            });
            enrichedHarvests.sort((a, b) => {
                const dateA = new Date(a.date_of_delivery || '');
                const dateB = new Date(b.date_of_delivery || '');
                return dateB - dateA;
            });

            setFarmers(normalizedFarmers);
            setHarvests(enrichedHarvests);
        } catch (err) {
            console.error('Error fetching aggregation data:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Calculate KPIs and monthly harvest data
    const calculateKPIs = () => {
        const totalFarmers = farmers.length;

        // Total farmer harvest records (we consider `harvests` already filtered/enriched to farmer-harvests)
        const totalFarmerHarvests = harvests.length;

        // Total weight delivered across all farmer harvest records
        const totalWeightDelivered = harvests.reduce((sum, h) => {
            const w = parseFloat(h.weight_on_delivery || h.weight || h.weight_kg || 0);
            return sum + (isNaN(w) ? 0 : w);
        }, 0);

        // Calculate monthly harvest weights (last 6 months)
        const monthlyData = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        harvests.forEach(h => {
            const deliveryDate = new Date(h.date_of_delivery);
            if (!isNaN(deliveryDate)) {
                const monthKey = `${months[deliveryDate.getMonth()]}`;
                const weight = parseFloat(h.weight_on_delivery || h.weight || h.weight_kg || 0);
                monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (isNaN(weight) ? 0 : weight);
            }
        });

        // Get last 6 months
        const currentMonth = new Date().getMonth();
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            const monthName = months[monthIndex];
            last6Months.push({
                label: monthName,
                weight: monthlyData[monthName] || 0
            });
        }

        return { totalFarmers, totalFarmerHarvests, totalWeightDelivered, monthlyHarvests: last6Months };
    };

    const kpis = calculateKPIs();
    const maxMonthlyWeight = Math.max(...kpis.monthlyHarvests.map(m => m.weight), 1);

    // Toggle row expansion
    const toggleRow = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <SideNav>
            <main className="p-4 sm:p-6 md:p-8 pt-0">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold" style={{ color: '#3D2817' }}>
                        Aggregation Overview
                    </h1>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50"
                        style={{ backgroundColor: '#8B4513', color: '#FFFFFF' }}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <KPICard
                        title="Total Farmers Registered"
                        value={Number(kpis.totalFarmers || 0).toLocaleString('en-US')}
                        subtitle="All registered farmers"
                        icon={Users}
                        loading={loading}
                    />
                    <KPICard
                        title="Total Farmers' Harvest Received"
                        value={Number(kpis.totalFarmerHarvests || 0).toLocaleString('en-US')}
                        subtitle="Total farmer harvest records"
                        icon={TrendingUp}
                        loading={loading}
                    />
                    <KPICard
                        title="Total Weight Delivered"
                        value={`${Number(kpis.totalWeightDelivered || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`}
                        subtitle="Sum of weights from farmer harvest records"
                        icon={Coffee}
                        loading={loading}
                    />
                </div>

                {/* Monthly Harvest Chart */}
                <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
                    <h2 className="text-xl font-bold mb-1" style={{ color: CoffeeColors.DARK_BROWN }}>
                        Monthly Harvest Weight (Last 6 Months)
                    </h2>
                    <p className="text-sm mb-6" style={{ color: '#666' }}>
                        Total weight delivered per month in kilograms
                    </p>

                    {/* Chart */}
                    <div className="relative h-64 flex items-end justify-around px-6 py-6" style={{ borderBottom: '2px solid #E0E0E0', borderLeft: '2px solid #E0E0E0' }}>
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs" style={{ color: '#666' }}>
                            <span>{maxMonthlyWeight.toFixed(0)} kg</span>
                            <span>{(maxMonthlyWeight * 0.75).toFixed(0)} kg</span>
                            <span>{(maxMonthlyWeight * 0.5).toFixed(0)} kg</span>
                            <span>{(maxMonthlyWeight * 0.25).toFixed(0)} kg</span>
                            <span>0 kg</span>
                        </div>

                        {/* Bars */}
                        {kpis.monthlyHarvests.map((data, index) => (
                            <div key={index} className="flex flex-col items-center gap-2 flex-1 max-w-[80px]">
                                <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                                    <div
                                        className="rounded-t transition-all hover:opacity-80 cursor-pointer relative group"
                                        style={{
                                            height: `${(data.weight / maxMonthlyWeight) * 100}%`,
                                            width: '60%',
                                            backgroundColor: '#8B4513',
                                            minHeight: data.weight > 0 ? '4px' : '0px'
                                        }}
                                    >
                                        {/* Tooltip on hover */}
                                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                            {data.weight.toFixed(2)} kg
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs font-medium" style={{ color: '#666' }}>{data.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Toggle Buttons */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setActiveTab('farmers')}
                        className={`px-6 py-2 rounded-xl shadow-lg transition ${
                            activeTab === 'farmers'
                                ? 'shadow-xl'
                                : ''
                        }`}
                        style={{
                            backgroundColor: activeTab === 'farmers' ? '#8B4513' : CoffeeColors.ACTIVE_LINK_BG,
                            color: activeTab === 'farmers' ? '#FFFFFF' : CoffeeColors.ACTIVE_LINK_TEXT
                        }}
                    >
                        Farmer Records
                    </button>
                    <button
                        onClick={() => setActiveTab('harvest')}
                        className={`px-6 py-2 rounded-xl shadow-lg transition ${
                            activeTab === 'harvest'
                                ? 'shadow-xl'
                                : ''
                        }`}
                        style={{
                            backgroundColor: activeTab === 'harvest' ? '#8B4513' : CoffeeColors.ACTIVE_LINK_BG,
                            color: activeTab === 'harvest' ? '#FFFFFF' : CoffeeColors.ACTIVE_LINK_TEXT
                        }}
                    >
                        Farmer Harvest
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700">
                        {error}
                    </div>
                )}

                {/* Table Section */}
                <div className="w-full bg-white shadow-xl rounded-2xl overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="sticky top-0 z-10" style={{ backgroundColor: '#efebe9', color: '#4A3423' }}>
                            <tr>
                                {activeTab === 'farmers' ? (
                                    <>
                                        <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-left">
                                            Farmer ID
                                        </th>
                                        <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-left">
                                            Farmer Name
                                        </th>
                                        <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-center">
                                            Date Recorded
                                        </th>
                                        <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-center">
                                            Details
                                        </th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-left">
                                            Harvest ID
                                        </th>
                                        <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-left">
                                            Farmer Name
                                        </th>
                                        <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-center">
                                            Date Delivered
                                        </th>
                                        <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-right">
                                            Weight (kg)
                                        </th>
                                        <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-center">
                                            Details
                                        </th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs">
                            {loading ? (
                                <tr className="h-24">
                                    <td colSpan={activeTab === 'farmers' ? "4" : "5"} className="text-center py-6 text-gray-600">
                                        <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" style={{ color: CoffeeColors.MEDIUM_BROWN }} />
                                        Loading records...
                                    </td>
                                </tr>
                            ) : activeTab === 'farmers' ? (
                                farmers.length > 0 ? (
                                    farmers.map((farmer) => (
                                        <ExpandableFarmerRow
                                            key={farmer.farmer_id}
                                            farmer={farmer}
                                            isExpanded={expandedRows[farmer.farmer_id]}
                                            onToggle={() => toggleRow(farmer.farmer_id)}
                                        />
                                    ))
                                ) : (
                                    <tr className="h-24">
                                        <td colSpan="4" className="text-center py-6 text-gray-500 italic">
                                            No farmer records found.
                                        </td>
                                    </tr>
                                )
                            ) : (
                                harvests.length > 0 ? (
                                    harvests.map((harvest, index) => (
                                        <ExpandableHarvestRow
                                            key={harvest.harvest_id || harvest.id || index}
                                            harvest={harvest}
                                            isExpanded={expandedRows[harvest.harvest_id || harvest.id || index]}
                                            onToggle={() => toggleRow(harvest.harvest_id || harvest.id || index)}
                                        />
                                    ))
                                ) : (
                                    <tr className="h-24">
                                        <td colSpan="5" className="text-center py-6 text-gray-500 italic">
                                            No harvest records found.
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </SideNav>
    );
};

export default AggregationPage;
