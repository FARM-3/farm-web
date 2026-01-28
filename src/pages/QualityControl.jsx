import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SideNav } from '../components/SideNav';
import { ProcessingNav } from '../components/ProcessingNav';
import {
    Plus,
    Edit,
    Trash2,
    Loader2,
    RefreshCw,
    Search,
    CheckCircle,
    XCircle,
    TrendingUp,
    Package,
    Award,
    Medal,
    Trophy
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';

const CoffeeColors = {
    SCREEN_BG: '#FFF8F6',
    DARK_BROWN: '#4A3423',
    BUTTON_BROWN: '#8B4513',
    LIGHT_BG: '#efebe9',
};

import { API_ENDPOINTS } from '../services/ApiConfig';

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
            </div>
        ) : (
            <div className="mt-2">
                <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{value}</p>
                {subtitle && <p className="mt-3 text-xs text-gray-600">{subtitle}</p>}
            </div>
        )}
    </div>
);

const QualityControl = () => {
    const [activeTab, setActiveTab] = useState('ripeness'); // 'ripeness' or 'floating'
    const [ripenessRecords, setRipenessRecords] = useState([]);
    const [floatingRecords, setFloatingRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [ripenessSummary, setRipenessSummary] = useState(null);
    const [floatingSummary, setFloatingSummary] = useState(null);
    const [harvestData, setHarvestData] = useState([]);

    // Fetch harvest data to map harvest IDs to farmer names
    const fetchHarvestData = useCallback(async () => {
        try {
            const response = await fetch(API_ENDPOINTS.HARVESTS);
            const data = await response.json();

            // Handle paginated response
            const harvestRecords = data.results || data;

            // Debug: check data structure
            if (harvestRecords && harvestRecords.length > 0) {
                console.log('Harvest Data Sample:', JSON.stringify(harvestRecords[0], null, 2));
                console.log('Available fields:', Object.keys(harvestRecords[0]));
            }

            setHarvestData(Array.isArray(harvestRecords) ? harvestRecords : []);
        } catch (error) {
            console.error('Error fetching harvest data:', error);
            setHarvestData([]);
        }
    }, []);

    const fetchRipenessData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch ripeness records
            // Fetch ripeness records (log URL and status for debugging)
            console.log('Fetching ripeness from:', API_ENDPOINTS.RIPENESS);
            console.log('Fetching ripeness summary from:', API_ENDPOINTS.RIPENESS_SUMMARY);

            const [ripenessRes, summaryRes] = await Promise.all([
                fetch(API_ENDPOINTS.RIPENESS),
                fetch(API_ENDPOINTS.RIPENESS_SUMMARY)
            ]);

            console.log('Ripeness response status:', ripenessRes.status, 'OK:', ripenessRes.ok);
            console.log('Ripeness summary response status:', summaryRes.status, 'OK:', summaryRes.ok);

            let ripenessData;
            if (ripenessRes.ok) {
                ripenessData = await ripenessRes.json();
            } else {
                const text = await ripenessRes.text().catch(() => 'no body');
                console.error('Ripeness fetch failed:', ripenessRes.status, text);
                ripenessData = { results: [] };
            }

            let summaryData;
            if (summaryRes.ok) {
                summaryData = await summaryRes.json();
            } else {
                const text = await summaryRes.text().catch(() => 'no body');
                console.error('Ripeness summary fetch failed:', summaryRes.status, text);
                summaryData = null;
            }

            // Handle paginated response if needed
            const records = ripenessData.results || ripenessData;
            console.log('Fetched ripeness records count:', Array.isArray(records) ? records.length : 0);
            if (Array.isArray(records) && records.length > 0) {
                console.log('Sample ripeness record:', records[0]);
                console.log('Ripeness record fields:', Object.keys(records[0]));
            }
            setRipenessRecords(Array.isArray(records) ? records : []);
            console.log('Ripeness summary data:', summaryData);
            setRipenessSummary(summaryData);
        } catch (error) {
            console.error('Error fetching ripeness data:', error);
            setRipenessRecords([]);
            setRipenessSummary(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFloatingData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch floating records
            const [floatingRes, summaryRes] = await Promise.all([
                fetch(API_ENDPOINTS.FLOATING),
                fetch(API_ENDPOINTS.FLOATING_SUMMARY)
            ]);

            const floatingData = await floatingRes.json();
            const summaryData = await summaryRes.json();

            // Handle paginated response
            const records = floatingData.results || floatingData;
            setFloatingRecords(Array.isArray(records) ? records : []);
            setFloatingSummary(summaryData);
        } catch (error) {
            console.error('Error fetching floating data:', error);
            setFloatingRecords([]);
            setFloatingSummary(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch harvest data on mount
    useEffect(() => {
        fetchHarvestData();
    }, [fetchHarvestData]);

    useEffect(() => {
        if (activeTab === 'ripeness') {
            fetchRipenessData();
        } else {
            fetchFloatingData();
        }
    }, [activeTab, fetchRipenessData, fetchFloatingData]);

    const handleRefresh = () => {
        if (activeTab === 'ripeness') {
            fetchRipenessData();
        } else {
            fetchFloatingData();
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;

        try {
            const endpoint = type === 'ripeness'
                ? `${API_ENDPOINTS.RIPENESS}${id}/`
                : `${API_ENDPOINTS.FLOATING}${id}/`;

            await fetch(endpoint, { method: 'DELETE' });
            handleRefresh();
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };

    // Helper to get farmer name from harvest_id
    const getFarmerName = useCallback((harvestId) => {
        if (!harvestId && typeof harvestId !== 'number') return '';
        const hid = String(harvestId).trim();

        // Try exact matches on common id fields
        let harvest = harvestData.find(h => String(h.harvest_id || h.harvestId || h.id || '').trim() === hid);

        // Fallback: case-insensitive match or contains
        if (!harvest) {
            const hidLower = hid.toLowerCase();
            harvest = harvestData.find(h => {
                const candidates = [h.harvest_id, h.harvestId, h.id, h.worker_name, h.farmer_name, h.farmer];
                return candidates.some(c => c && String(c).toLowerCase().includes(hidLower));
            });
        }

        // Try multiple possible field names for farmer/worker name
        const name = harvest?.worker_name || harvest?.farmer_name || harvest?.farmerName || harvest?.farmer;
        return name || hid;
    }, [harvestData]);

    // Diagnostic: log mapping between ripeness records and harvestData to find missing names
    useEffect(() => {
        if (!ripenessRecords || ripenessRecords.length === 0) return;
        ripenessRecords.forEach(rec => {
            const hid = String(rec.harvest_id || rec.harvest || rec.id || '').trim();
            const mapped = getFarmerName(hid);
            if (!mapped || mapped === hid) {
                console.warn('QC: No farmer name for harvest id', hid, 'mapped->', mapped);
                console.log('QC: Nearby harvestData ids sample:', harvestData.slice(0, 8).map(h => ({ id: h.harvest_id || h.harvestId || h.id, worker: h.worker_name || h.farmer_name })));
            } else {
                console.log('QC: Mapped harvest', hid, '->', mapped);
            }
        });
    }, [ripenessRecords, harvestData, getFarmerName]);

    const filteredRipenessRecords = ripenessRecords.filter(record => {
        const hid = (record.harvest_id || '').toString().toLowerCase();
        const fname = (getFarmerName(record.harvest_id) || '').toString().toLowerCase();
        const term = searchTerm.toLowerCase();
        return hid.includes(term) || fname.includes(term);
    });

    console.log('Render: ripenessRecords length=', ripenessRecords.length, 'filteredRipenessRecords length=', filteredRipenessRecords.length);

    const filteredFloatingRecords = floatingRecords.filter(record => {
        const hid = (record.harvest_id || '').toString().toLowerCase();
        const grade = (record.grade || '').toString().toLowerCase();
        const fname = (getFarmerName(record.harvest_id) || '').toString().toLowerCase();
        const term = searchTerm.toLowerCase();
        return hid.includes(term) || grade.includes(term) || fname.includes(term);
    });

    // Calculate farmer leaderboard from ripeness records
    const farmerLeaderboard = useMemo(() => {
        if (!ripenessRecords || ripenessRecords.length === 0) return [];

        // Create a map of harvest_id to farmer/worker name
        const harvestToFarmer = {};
        harvestData.forEach(harvest => {
            // Try multiple possible field names for farmer/worker name
            const farmerName = harvest.worker_name || harvest.farmer_name || harvest.farmerName || harvest.farmer || harvest.harvest_id;
            harvestToFarmer[harvest.harvest_id] = farmerName;
        });

        // Group by farmer name
        const farmerScores = {};

        ripenessRecords.forEach(record => {
            const farmerName = harvestToFarmer[record.harvest_id] || record.harvest_id;

            if (!farmerScores[farmerName]) {
                farmerScores[farmerName] = {
                    farmer: farmerName,
                    totalScore: 0,
                    count: 0
                };
            }
            farmerScores[farmerName].totalScore += parseFloat(record.ripeness_score || 0);
            farmerScores[farmerName].count += 1;
        });

        // Calculate average and sort
        const leaderboard = Object.values(farmerScores)
            .map(farmer => ({
                farmer: farmer.farmer,
                avgScore: (farmer.totalScore / farmer.count).toFixed(2),
                tests: farmer.count
            }))
            .sort((a, b) => parseFloat(b.avgScore) - parseFloat(a.avgScore))
            .slice(0, 10); // Top 10 farmers

        return leaderboard;
    }, [ripenessRecords, harvestData]);

    // Colors for leaderboard bars
    const getBarColor = (index) => {
        if (index === 0) return '#FFD700'; // Gold
        if (index === 1) return '#C0C0C0'; // Silver
        if (index === 2) return '#CD7F32'; // Bronze
        return '#8B4513'; // Brown for others
    };

    return (
        <SideNav>
            <main className="p-4 sm:p-6 md:p-8 pt-0">
                {/* Quick Navigation */}
                <ProcessingNav />

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: CoffeeColors.DARK_BROWN }}>
                            Quality Control
                        </h1>
                        <p className="text-gray-600 mt-1">Manage ripeness and floating tests</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition"
                            style={{ backgroundColor: CoffeeColors.LIGHT_BG, color: CoffeeColors.DARK_BROWN }}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mb-6 bg-white rounded-2xl shadow-lg p-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('ripeness')}
                            className={`flex-1 px-4 py-2.5 rounded-xl transition-all font-medium ${
                                activeTab === 'ripeness' ? 'shadow-md' : 'hover:bg-gray-50'
                            }`}
                            style={{
                                backgroundColor: activeTab === 'ripeness' ? '#8B4513' : 'transparent',
                                color: activeTab === 'ripeness' ? '#FFFFFF' : '#4A3423',
                            }}
                        >
                            Ripeness Score
                        </button>
                        <button
                            onClick={() => setActiveTab('floating')}
                            className={`flex-1 px-4 py-2.5 rounded-xl transition-all font-medium ${
                                activeTab === 'floating' ? 'shadow-md' : 'hover:bg-gray-50'
                            }`}
                            style={{
                                backgroundColor: activeTab === 'floating' ? '#8B4513' : 'transparent',
                                color: activeTab === 'floating' ? '#FFFFFF' : '#4A3423',
                            }}
                        >
                            Floating Tests
                        </button>
                    </div>
                </div>

                {/* Ripeness Tab Content */}
                {activeTab === 'ripeness' && (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
                            <KPICard
                                title="Total Tests"
                                value={ripenessSummary?.total_tests || 0}
                                subtitle="Ripeness tests"
                                icon={CheckCircle}
                                loading={loading}
                            />
                            <KPICard
                                title="Avg. Ripeness"
                                value={(typeof ripenessSummary?.average_ripeness_score !== 'undefined' && ripenessSummary?.average_ripeness_score !== null)
                                    ? Number(ripenessSummary.average_ripeness_score).toFixed(2)
                                    : '0.00'}
                                subtitle="Average score"
                                icon={TrendingUp}
                                loading={loading}
                            />
                            <KPICard
                                title="Passing Tests"
                                value={ripenessSummary?.passing_tests || 0}
                                subtitle="Quality approved"
                                icon={CheckCircle}
                                loading={loading}
                            />
                            <KPICard
                                title="Pass Rate"
                                value={ripenessSummary?.pass_rate || '0%'}
                                subtitle="Overall performance"
                                icon={TrendingUp}
                                loading={loading}
                            />
                        </div>

                        {/* Search Bar */}
                        <div className="mb-6 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by Harvest ID or Farmer Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-offset-0 outline-none shadow-lg"
                            />
                        </div>

                        {/* Ripeness Records Table */}
                        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead style={{ backgroundColor: CoffeeColors.LIGHT_BG }}>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Harvest ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Farmer Name</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Date</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Sample Size</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Red Cherries</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Ripeness Score</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-12 text-center">
                                                    <Loader2 className="w-8 h-8 animate-spin inline-block" style={{ color: CoffeeColors.BUTTON_BROWN }} />
                                                    <p className="mt-2 text-gray-600">Loading records...</p>
                                                </td>
                                            </tr>
                                        ) : filteredRipenessRecords.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                    No ripeness tests found
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredRipenessRecords.map((record, idx) => (
                                                <tr key={record.harvest_id || `ripeness-${idx}`} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-medium text-gray-800">{record.harvest_id || record.harvest || record.id}</td>
                                                    <td className="px-6 py-4 text-gray-700">{getFarmerName(record.harvest_id)}</td>
                                                    <td className="px-6 py-4 text-center text-gray-700">{record.date}</td>
                                                    <td className="px-6 py-4 text-center text-gray-700">{record.sample_size}</td>
                                                    <td className="px-6 py-4 text-center text-gray-700">{record.no_of_redcherry}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                            parseFloat(record.ripeness_score) >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {record.ripeness_score}%
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button className="p-1 hover:bg-blue-50 rounded"><Edit className="w-4 h-4 text-blue-600" /></button>
                                                            <button onClick={() => handleDelete(record.harvest_id, 'ripeness')} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-600" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* Floating Tab Content */}
                {activeTab === 'floating' && (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            <KPICard
                                title="Total Tests"
                                value={floatingSummary?.overall?.total_tests || 0}
                                subtitle="Floating tests"
                                icon={Package}
                                loading={loading}
                            />
                            <KPICard
                                title="Total Weight"
                                value={`${floatingSummary?.overall?.total_weight?.toFixed(2) || '0.00'} kg`}
                                subtitle="Combined weight"
                                icon={TrendingUp}
                                loading={loading}
                            />
                        </div>

                        {/* Grade Summary Cards */}
                        {floatingSummary?.by_grade && floatingSummary.by_grade.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                {floatingSummary.by_grade.map((grade, idx) => (
                                    <div key={grade.grade || `grade-${idx}`} className="bg-white p-4 rounded-xl shadow-lg">
                                        <h3 className="text-lg font-bold mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                                            Grade {grade.grade}
                                        </h3>
                                        <div className="space-y-1 text-sm">
                                            <p className="text-gray-600">Count: <span className="font-semibold text-gray-800">{grade.count}</span></p>
                                            <p className="text-gray-600">Total Weight: <span className="font-semibold text-gray-800">{Number(grade.total_weight || 0).toFixed(2)} kg</span></p>
                                            <p className="text-gray-600">Avg Weight: <span className="font-semibold text-gray-800">{Number(grade.avg_weight || 0).toFixed(2)} kg</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Search Bar */}
                        <div className="mb-6 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by Harvest ID, Farmer Name or Grade..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-offset-0 outline-none shadow-lg"
                            />
                        </div>

                        {/* Floating Records Table */}
                        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead style={{ backgroundColor: CoffeeColors.LIGHT_BG }}>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Grade ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Harvest ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Farmer Name</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Grade</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Weight (kg)</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Date</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Ripeness Score</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-12 text-center">
                                                    <Loader2 className="w-8 h-8 animate-spin inline-block" style={{ color: CoffeeColors.BUTTON_BROWN }} />
                                                    <p className="mt-2 text-gray-600">Loading records...</p>
                                                </td>
                                            </tr>
                                        ) : filteredFloatingRecords.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                                    No floating tests found
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredFloatingRecords.map((record, idx) => (
                                                <tr key={record.grade_id || `floating-${idx}`} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-medium text-gray-800">{record.grade_id}</td>
                                                    <td className="px-6 py-4 text-gray-700">{record.harvest_id || record.harvest || record.id}</td>
                                                    <td className="px-6 py-4 text-gray-700">{getFarmerName(record.harvest_id)}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 whitespace-nowrap">
                                                            Grade {record.grade}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-semibold text-gray-800">{Number(record.weight || 0).toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-center text-gray-700">{record.date}</td>
                                                    <td className="px-6 py-4 text-center text-gray-700">{record.ripeness_score}%</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button className="p-1 hover:bg-blue-50 rounded"><Edit className="w-4 h-4 text-blue-600" /></button>
                                                            <button onClick={() => handleDelete(record.grade_id, 'floating')} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-600" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </SideNav>
    );
};

export default QualityControl;
