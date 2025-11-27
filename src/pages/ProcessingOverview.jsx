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
    Wheat
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
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('harvest_id'); // 'harvest_id' or 'farmer_name'
    const [trackingResult, setTrackingResult] = useState(null);
    const [searching, setSearching] = useState(false);
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

    useEffect(() => {
        fetchProcessingData();
    }, [fetchProcessingData]);

    const handleTrackHarvest = async () => {
        if (!searchTerm.trim()) return;

        setSearching(true);
        setTrackingResult(null);

        try {
            // Simulated tracking - replace with actual API call
            // Example: fetch(`${API_BASE_URL}/processing/track/${searchType}/${searchTerm}`)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock result - replace with actual data
            const mockResult = {
                harvest_id: searchType === 'harvest_id' ? searchTerm : 'H-2024-001',
                farmer_name: searchType === 'farmer_name' ? searchTerm : 'John Doe',
                current_stage: 'Drying',
                stages: [
                    { name: 'Quality Control', status: 'completed', date: '2024-01-15' },
                    { name: 'Processing Type Selection', status: 'completed', date: '2024-01-16' },
                    { name: 'Drying', status: 'in_progress', date: '2024-01-17' },
                    { name: 'Hulling', status: 'pending', date: null },
                    { name: 'Bagging', status: 'pending', date: null },
                ]
            };

            setTrackingResult(mockResult);
        } catch (error) {
            console.error('Error tracking harvest:', error);
            setTrackingResult({ error: 'Harvest not found or error occurred' });
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
                        Enter a Harvest ID or Farmer Name to track the processing stage
                    </p>

                    {/* Search Input */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-offset-0 focus:ring-brown-500 outline-none"
                        >
                            <option value="harvest_id">Harvest ID</option>
                            <option value="farmer_name">Farmer Name</option>
                        </select>
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Enter ${searchType === 'harvest_id' ? 'Harvest ID' : 'Farmer Name'}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleTrackHarvest()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-offset-0 focus:ring-brown-500 outline-none"
                            />
                        </div>
                        <button
                            onClick={handleTrackHarvest}
                            disabled={searching || !searchTerm.trim()}
                            className="px-6 py-2 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: CoffeeColors.BUTTON_BROWN }}
                        >
                            {searching ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                    Searching...
                                </>
                            ) : (
                                'Track'
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
