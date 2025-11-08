import { useState, useEffect, useCallback } from 'react';
import { SideNav } from '../components/SideNav';
import { Users, TrendingUp, Coffee, Loader2, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';

// API Endpoints
const API_BASE_URL = 'http://142.93.94.236:8000/api';
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
                                <p className="text-xs font-semibold text-gray-500 uppercase">Weight on Delivery</p>
                                <p className="text-sm text-gray-800">{harvest.weight_on_delivery ? `${harvest.weight_on_delivery} kg` : 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Weight After Floating</p>
                                <p className="text-sm text-gray-800">{harvest.weight_after_floating ? `${harvest.weight_after_floating} kg` : 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Grade</p>
                                <p className="text-sm text-gray-800">{harvest.grade || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Cherry Color</p>
                                <p className="text-sm text-gray-800">{harvest.cherry_color || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Stage</p>
                                <p className="text-sm text-gray-800">{harvest.stage || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Amount Paid</p>
                                <p className="text-sm text-gray-800">{harvest.amount_paid ? `UGX ${Number(harvest.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0, useGrouping: true })}` : 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Paid By</p>
                                <p className="text-sm text-gray-800">{harvest.paid_by || 'N/A'}</p>
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
            const [farmersRes, harvestsRes] = await Promise.all([
                fetch(FARMERS_API).catch(() => ({ ok: false })),
                fetch(FARMER_HARVEST_API).catch(() => ({ ok: false }))
            ]);

            const farmersData = farmersRes.ok ? await farmersRes.json() : { results: [] };
            const harvestsData = harvestsRes.ok ? await harvestsRes.json() : { results: [] };

            // Normalize data
            const normalizedFarmers = Array.isArray(farmersData) ? farmersData : (farmersData.results || []);
            const normalizedHarvests = Array.isArray(harvestsData) ? harvestsData : (harvestsData.results || []);

            // Debug: Log sample records to see their structure
            if (normalizedHarvests.length > 0) {
                console.log('Sample harvest record:', normalizedHarvests[0]);
                console.log('Harvest fields:', Object.keys(normalizedHarvests[0]));
            }
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

            // Create a farmer lookup map by name for quick access
            const farmerMapByName = {};
            normalizedFarmers.forEach(farmer => {
                const fullName = `${farmer.first_name || ''} ${farmer.last_name || ''}`.trim().toLowerCase();
                farmerMapByName[fullName] = farmer;
            });

            // Enrich harvest records with farmer details
            const enrichedHarvests = normalizedHarvests.map(harvest => {
                // The API returns 'harvest_id' and 'name' (farmer's name)
                const harvestId = harvest.harvest_id || harvest.id;
                const farmerName = harvest.name || 'Unknown Farmer';

                // Try to find the farmer by matching the name
                const farmer = farmerMapByName[farmerName.toLowerCase()];

                return {
                    ...harvest,
                    harvest_id: harvestId,
                    farmer_id: farmer?.farmer_id || 'N/A',
                    farmer_name: farmerName,
                    farmer_village: farmer?.village,
                    farmer_details: farmer
                };
            });

            // Sort by latest record creation first (using timestamp fields)
            normalizedFarmers.sort((a, b) => {
                const dateA = a.created_at || a.timestamp || a.date_created || a.updated_at || a.date_of_birth || 0;
                const dateB = b.created_at || b.timestamp || b.date_created || b.updated_at || b.date_of_birth || 0;
                return new Date(dateB) - new Date(dateA);
            });
            enrichedHarvests.sort((a, b) => {
                const dateA = a.date_of_delivery || '';
                const dateB = b.date_of_delivery || '';
                return dateA.localeCompare(dateB);
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

    // Calculate KPIs
    const calculateKPIs = () => {
        const totalFarmers = farmers.length;

        // Calculate weekly harvests (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyHarvests = harvests.filter(h => {
            const deliveryDate = new Date(h.date_of_delivery);
            return deliveryDate >= oneWeekAgo;
        }).length;

        // Count red cherry harvests
        const redCherryHarvests = harvests.filter(h =>
            h.cherry_color && h.cherry_color.toLowerCase().includes('red')
        ).length;

        return { totalFarmers, weeklyHarvests, redCherryHarvests };
    };

    const kpis = calculateKPIs();

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
                        value={kpis.totalFarmers}
                        subtitle="All registered farmers"
                        icon={Users}
                        loading={loading}
                    />
                    <KPICard
                        title="Farmer Harvests (Weekly)"
                        value={kpis.weeklyHarvests}
                        subtitle="Last 7 days"
                        icon={TrendingUp}
                        loading={loading}
                    />
                    <KPICard
                        title="Red Cherry Harvests"
                        value={kpis.redCherryHarvests}
                        subtitle="Total red cherry deliveries"
                        icon={Coffee}
                        loading={loading}
                    />
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
                                            Actions
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
                                        <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-center">
                                            Actions
                                        </th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs">
                            {loading ? (
                                <tr className="h-24">
                                    <td colSpan="4" className="text-center py-6 text-gray-600">
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
                                        <td colSpan="4" className="text-center py-6 text-gray-500 italic">
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
