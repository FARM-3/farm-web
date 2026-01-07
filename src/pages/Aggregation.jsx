import { useState, useEffect, useCallback } from 'react';
import { SideNav } from '../components/SideNav';
import { Users, TrendingUp, Coffee, Loader2, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { onHarvestRecorded } from '../utils/autoExpenseCreation';

// API Endpoints - Uses .env configuration
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
                                <p className="text-xs font-semibold text-gray-500 uppercase">Coffee Type</p>
                                <p className="text-sm text-gray-800">{harvest.coffee_type || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Weight on Delivery</p>
                                <p className="text-sm text-gray-800">{harvest.weight_on_delivery ? `${harvest.weight_on_delivery} kg` : 'N/A'}</p>
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
                                <p className="text-xs font-semibold text-gray-500 uppercase">Price per KG</p>
                                <p className="text-sm text-gray-800">{harvest.price_per_kg ? `UGX ${Number(harvest.price_per_kg).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0, useGrouping: true })}` : 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Amount Paid</p>
                                <p className="text-sm text-gray-800">{harvest.amount_paid || 'N/A'}</p>
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
            const rawHarvests = Array.isArray(harvestsData) ? harvestsData : (harvestsData.results || []);

            // Debug: log raw sizes and a sample raw harvest so we can refine matching
            console.log('Aggregation: raw harvests fetched=', rawHarvests.length, 'farmers fetched=', normalizedFarmers.length);
            if (rawHarvests.length > 0) {
                console.log('Sample raw harvest record:', rawHarvests[0]);
                console.log('Raw harvest fields:', Object.keys(rawHarvests[0] || {}));
            }

            // Build farmer lookup maps so we can strictly match harvest records to registered farmers
            const farmerMapByName = {};
            const farmerMapById = {};
            normalizedFarmers.forEach(farmer => {
                const fullName = `${farmer.first_name || ''} ${farmer.last_name || ''}`.trim().toLowerCase();
                if (fullName) farmerMapByName[fullName] = farmer;
                if (farmer.farmer_id) farmerMapById[String(farmer.farmer_id)] = farmer;
                if (farmer.id) farmerMapById[String(farmer.id)] = farmer;
            });

            // Strictly filter raw harvests to only include farmer-harvest records.
            // Strategy (in order):
            // 1. If the record explicitly marks itself as a farmer harvest (common keys)
            // 2. If the record has a name/farmer_name that matches a registered farmer
            // 3. If the record has a farmer_id that matches a registered farmer
            // This excludes production/worker harvests that have block_id/worker_name and don't map to a farmer.
            const farmerHarvests = rawHarvests.filter(h => {
                // explicit flags that some APIs use
                const explicitFarmer = (h.source && String(h.source).toLowerCase().includes('farmer')) ||
                    (h.harvest_type && String(h.harvest_type).toLowerCase().includes('farmer')) ||
                    (h.type && String(h.type).toLowerCase().includes('farmer'));
                if (explicitFarmer) return true;

                // try match by name
                const name = (h.name || h.farmer_name || `${h.first_name || ''} ${h.last_name || ''}`.trim()).trim().toLowerCase();
                if (name) {
                    if (farmerMapByName[name]) return true;

                    // Relaxed matching: check if any registered farmer's first or last name appears in the harvest name
                    const nameTokens = name.split(/\s+/).filter(Boolean);
                    for (const f of normalizedFarmers) {
                        const fFull = `${f.first_name || ''} ${f.last_name || ''}`.trim().toLowerCase();
                        if (!fFull) continue;
                        // exact contains or token match
                        if (fFull === name || name === fFull) return true;
                        if (nameTokens.some(tok => tok && (fFull.includes(tok) || tok.includes((fFull.split(' ')[0] || '').toLowerCase())))) return true;
                    }
                }

                // try match by id
                const fid = h.farmer_id || h.farmerId || h.farmer || h.owner_id;
                if (fid && farmerMapById[String(fid)]) return true;

                // otherwise exclude (likely production/worker harvest)
                return false;
            });

            // Debug: show filtering results
            console.log('Aggregation: rawHarvests=', rawHarvests.length, 'farmerHarvests(filtered)=', farmerHarvests.length);

            // If nothing matched, print helpful diagnostics to assist refining the filter
            if (farmerHarvests.length === 0 && rawHarvests.length > 0) {
                const r = rawHarvests[0];
                console.log('No farmer-harvests matched. First raw harvest name fields:', {
                    name: r.name, farmer_name: r.farmer_name, first_name: r.first_name, last_name: r.last_name
                });
                console.log('Registered farmer names:', normalizedFarmers.map(f => `${f.first_name || ''} ${f.last_name || ''}`));
            }

            // Debug: Log a sample of filtered harvest record to see their structure
            if (farmerHarvests.length > 0) {
                console.log('Sample filtered harvest record:', farmerHarvests[0]);
                console.log('Harvest fields:', Object.keys(farmerHarvests[0]));
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
                                            Coffee Type  
                                              </th>
                                        <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-center">
                                            Weight on Delivery 
                                        </th>
                                        
                                        <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-center">
                                            Location of Delivery
                                        </th>
                                        <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-center">
                                            Actions
                                        </th>
                                        <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-center">
                                            
                
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
