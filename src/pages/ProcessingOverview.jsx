import React, { useState, useEffect, useCallback } from 'react';
import { SideNav } from '../components/SideNav';
import { ProcessingNav } from '../components/ProcessingNav';
import {
    TrendingUp,
    Package,
    Clock,
    CheckCircle,
    Search,
    Loader2,
    RefreshCw,
    Wind,
    Wheat,
    Droplet,
    Sun,
    Sparkles
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
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { API_ENDPOINTS } from '../services/ApiConfig';
import { ProcessingTypeChart } from './ProcessingType';

const CoffeeColors = {
    SCREEN_BG: '#FFF8F6',
    DARK_BROWN: '#4A3423',
    MEDIUM_BROWN: '#795548',
    BUTTON_BROWN: '#8B4513',
    LIGHT_BG: '#efebe9',
};

const COLORS = ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F4A460'];

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

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
                <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{value}</p>
                {subtitle && (
                    <div className="mt-3 text-xs">
                        <p style={{ color: '#666' }}>{subtitle}</p>
                    </div>
                )}
            </div>
        )}
    </div>
);

const ProcessingOverview = () => {
    const [loading, setLoading] = useState(true);
    const [selectedHarvest, setSelectedHarvest] = useState('');
    const [harvestOptions, setHarvestOptions] = useState([]);
    const [trackingResult, setTrackingResult] = useState(null);
    const [searching, setSearching] = useState(false);
    const [loadingHarvests, setLoadingHarvests] = useState(false);
    const [processingData, setProcessingData] = useState({
        totalBatches: 0,
        inProgress: 0,
        completed: 0,
        avgProcessingTime: 0,
    });

    const fetchProcessingData = useCallback(async () => {
        setLoading(true);
        try {
            // Simulated data - replace with actual API calls
            // In production, fetch from your processing endpoints
            await new Promise(resolve => setTimeout(resolve, 1000));

            setProcessingData({
                totalBatches: 45,
                inProgress: 12,
                completed: 33,
                avgProcessingTime: 14, // days
            });
        } catch (error) {
            console.error('Error fetching processing data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchHarvestOptions = useCallback(async () => {
        setLoadingHarvests(true);
        try {
            const token = localStorage.getItem('authToken');

            // Fetch from both regular harvests and farmer-harvest aggregation endpoints
            const [harvestsResponse, farmerHarvestsResponse] = await Promise.all([
                fetch(API_ENDPOINTS.HARVESTS, {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                }),
                fetch(API_ENDPOINTS.FARMER_HARVEST, {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                })
            ]);

            const [harvestsData, farmerHarvestsData] = await Promise.all([
                harvestsResponse.json(),
                farmerHarvestsResponse.json()
            ]);

            // Handle paginated responses
            const regularHarvests = harvestsData.results || harvestsData;
            const farmerHarvests = farmerHarvestsData.results || farmerHarvestsData;

            // Debug: Log the structure of farmer harvests data
            console.log('Farmer harvests data structure:', farmerHarvests?.[0] || 'No data');

            // Create options for dropdown with both harvest ID and farmer name
            const regularOptions = (regularHarvests || []).map(harvest => ({
                value: harvest.harvest_id,
                label: `${harvest.harvest_id} - ${harvest.worker_name || harvest.farmer_name || 'Unknown Farmer'}`,
                farmerName: harvest.worker_name || harvest.farmer_name || 'Unknown Farmer',
                harvestId: harvest.harvest_id,
                source: 'harvests'
            }));

            // Create options from farmer-harvest aggregation data
            // Try multiple possible field names for farmer name
            const farmerOptions = (farmerHarvests || []).map(harvest => {
                const farmerName = harvest.farmer_name || harvest.worker_name || harvest.farmerName || harvest.name || harvest.farmer || 'Unknown Farmer';
                const harvestId = harvest.harvest_id || harvest.id || harvest.harvestId;

                return {
                    value: harvestId,
                    label: `${harvestId} - ${farmerName}`,
                    farmerName: farmerName,
                    harvestId: harvestId,
                    source: 'aggregation'
                };
            });

            // Combine and deduplicate options (remove duplicates based on harvest_id)
            const combinedOptions = [...regularOptions, ...farmerOptions];
            const uniqueOptions = combinedOptions.filter((option, index, self) =>
                index === self.findIndex(o => o.value === option.value)
            );

            setHarvestOptions(uniqueOptions);
        } catch (error) {
            console.error('Error fetching harvest options:', error);
            setHarvestOptions([]);
        } finally {
            setLoadingHarvests(false);
        }
    }, []);

    useEffect(() => {
        fetchProcessingData();
        fetchHarvestOptions();
    }, [fetchProcessingData, fetchHarvestOptions]);

    const handleTrackHarvest = async () => {
        if (!selectedHarvest) return;

        setSearching(true);
        setTrackingResult(null);

        try {
            const token = localStorage.getItem('authToken');

            // Try to fetch tracking data from the backend
            const response = await fetch(`${API_ENDPOINTS.HARVEST_TRACKING}${selectedHarvest}/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            // Find the selected harvest details
            const selectedOption = harvestOptions.find(option => option.value === selectedHarvest);

            if (response.ok) {
                // If backend endpoint exists, use real data
                const data = await response.json();

                const trackingResult = {
                    harvest_id: data.harvest_id || selectedHarvest,
                    farmer_name: data.farmer_name || selectedOption?.farmerName || 'Unknown Farmer',
                    current_stage: data.current_stage || 'Not Started',
                    stages: data.stages || [
                        { name: 'Quality Control', status: data.quality_control_completed ? 'completed' : 'pending', date: data.quality_control_date },
                        { name: 'Processing Type Selection', status: data.processing_type_selected ? 'completed' : 'pending', date: data.processing_type_date },
                        { name: 'Drying', status: data.drying_completed ? 'completed' : data.drying_started ? 'in_progress' : 'pending', date: data.drying_date },
                        { name: 'Hulling', status: data.hulling_completed ? 'completed' : data.hulling_started ? 'in_progress' : 'pending', date: data.hulling_date },
                        { name: 'Bagging', status: data.bagging_completed ? 'completed' : data.bagging_started ? 'in_progress' : 'pending', date: data.bagging_date },
                    ]
                };

                setTrackingResult(trackingResult);
            } else if (response.status === 404) {
                // If tracking endpoint doesn't exist, show mock data with a note
                console.warn('Tracking endpoint not available, showing sample data');

                const mockResult = {
                    harvest_id: selectedHarvest,
                    farmer_name: selectedOption?.farmerName || 'Unknown Farmer',
                    current_stage: 'Drying',
                    stages: [
                        { name: 'Quality Control', status: 'completed', date: '2024-01-15' },
                        { name: 'Processing Type Selection', status: 'completed', date: '2024-01-16' },
                        { name: 'Drying', status: 'in_progress', date: '2024-01-17' },
                        { name: 'Hulling', status: 'pending', date: null },
                        { name: 'Bagging', status: 'pending', date: null },
                    ],
                    note: 'Note: Real-time tracking data not available. Showing sample processing stages.'
                };

                setTrackingResult(mockResult);
            } else {
                throw new Error(`Failed to fetch tracking data: ${response.status}`);
            }
        } catch (error) {
            console.error('Error tracking harvest:', error);

            // Fallback: show basic info even if tracking fails
            const selectedOption = harvestOptions.find(option => option.value === selectedHarvest);
            setTrackingResult({
                harvest_id: selectedHarvest,
                farmer_name: selectedOption?.farmerName || 'Unknown Farmer',
                current_stage: 'Unknown',
                stages: [],
                error: 'Unable to load processing stages. Harvest found but tracking data unavailable.'
            });
        } finally {
            setSearching(false);
        }
    };

    // Chart data
    const stageDistribution = [
        { name: 'Quality Control', value: 8 },
        { name: 'Drying', value: 15 },
        { name: 'Hulling', value: 12 },
        { name: 'Bagging', value: 10 },
    ];

    const weeklyProcessing = [
        { day: 'Mon', batches: 4 },
        { day: 'Tue', batches: 6 },
        { day: 'Wed', batches: 8 },
        { day: 'Thu', batches: 5 },
        { day: 'Fri', batches: 7 },
        { day: 'Sat', batches: 3 },
        { day: 'Sun', batches: 2 },
    ];

    return (
        <SideNav>
            <main className="p-4 sm:p-6 md:p-8 pt-0">
                {/* Quick Navigation */}
                <ProcessingNav />

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold" style={{ color: CoffeeColors.DARK_BROWN }}>
                        Processing Overview
                    </h1>
                    <button
                        onClick={fetchProcessingData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50"
                        style={{ backgroundColor: CoffeeColors.BUTTON_BROWN, color: '#FFFFFF' }}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <KPICard
                        title="Total Batches"
                        value={processingData.totalBatches}
                        subtitle="All processing batches"
                        icon={Package}
                        loading={loading}
                    />
                    <KPICard
                        title="In Progress"
                        value={processingData.inProgress}
                        subtitle="Currently processing"
                        icon={Clock}
                        loading={loading}
                    />
                    <KPICard
                        title="Completed"
                        value={processingData.completed}
                        subtitle="Finished batches"
                        icon={CheckCircle}
                        loading={loading}
                    />
                    <KPICard
                        title="Avg. Processing Time"
                        value={`${processingData.avgProcessingTime} days`}
                        subtitle="From start to finish"
                        icon={TrendingUp}
                        loading={loading}
                    />
                </div>

                {/* Harvest Tracking Section */}
                <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4" style={{ color: CoffeeColors.DARK_BROWN }}>
                        Track Harvest Stage
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Select a harvest from the database (including farmer harvests from aggregation) to track its processing stage
                    </p>

                    {/* Harvest Selection */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <select
                                value={selectedHarvest}
                                onChange={(e) => setSelectedHarvest(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-offset-0 focus:ring-brown-500 outline-none"
                                disabled={loadingHarvests}
                            >
                                <option value="">
                                    {loadingHarvests ? 'Loading harvests...' : 'Select a harvest...'}
                                </option>
                                {harvestOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleTrackHarvest}
                            disabled={searching || !selectedHarvest}
                            className="px-6 py-2 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: CoffeeColors.BUTTON_BROWN }}
                        >
                            {searching ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                    Tracking...
                                </>
                            ) : (
                                'Track Harvest'
                            )}
                        </button>
                    </div>

                    {/* Tracking Result */}
                    {trackingResult && (
                        <div className="mt-6">
                            {trackingResult.error ? (
                                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl">
                                    {trackingResult.error}
                                </div>
                            ) : (
                                <div className="border border-gray-200 rounded-xl p-6">
                                    {trackingResult.note && (
                                        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-xl mb-6">
                                            {trackingResult.note}
                                        </div>
                                    )}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold mb-2" style={{ color: CoffeeColors.DARK_BROWN }}>
                                            Harvest Details
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Harvest ID</p>
                                                <p className="font-semibold">{trackingResult.harvest_id}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Farmer Name</p>
                                                <p className="font-semibold">{trackingResult.farmer_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Current Stage</p>
                                                <p className="font-semibold text-green-600">{trackingResult.current_stage}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stage Timeline */}
                                    <div>
                                        <h3 className="text-lg font-bold mb-4" style={{ color: CoffeeColors.DARK_BROWN }}>
                                            Processing Stages
                                        </h3>
                                        <div className="space-y-4">
                                            {trackingResult.stages.map((stage, index) => (
                                                <div key={index} className="flex items-center gap-4">
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                            stage.status === 'completed'
                                                                ? 'bg-green-500'
                                                                : stage.status === 'in_progress'
                                                                ? 'bg-yellow-500'
                                                                : 'bg-gray-300'
                                                        }`}
                                                    >
                                                        {stage.status === 'completed' && (
                                                            <CheckCircle className="w-5 h-5 text-white" />
                                                        )}
                                                        {stage.status === 'in_progress' && (
                                                            <Clock className="w-5 h-5 text-white" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold">{stage.name}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {stage.date || 'Not started'} • {' '}
                                                            <span
                                                                className={`capitalize ${
                                                                    stage.status === 'completed'
                                                                        ? 'text-green-600'
                                                                        : stage.status === 'in_progress'
                                                                        ? 'text-yellow-600'
                                                                        : 'text-gray-500'
                                                                }`}
                                                            >
                                                                {stage.status.replace('_', ' ')}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Processing Type Distribution Chart */}
                <div className="mb-8">
                    <ProcessingTypeChart data={[
                        { name: 'Fermenting', weight: 1250.50, color: '#8B4513', icon: Sparkles },
                        { name: 'Natural Sundrying', weight: 875.25, color: '#FFA500', icon: Sun },
                        { name: 'Washing', weight: 1450.75, color: '#4682B4', icon: Droplet }
                    ]} />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Bar Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-bold mb-4" style={{ color: CoffeeColors.DARK_BROWN }}>
                            Weekly Processing Activity
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={weeklyProcessing}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="batches" fill="#8B4513" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-bold mb-4" style={{ color: CoffeeColors.DARK_BROWN }}>
                            Stage Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stageDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {stageDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </main>
        </SideNav>
    );
};

export default ProcessingOverview;
