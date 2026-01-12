import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { ProcessingNav } from '../components/ProcessingNav';
import { API_ENDPOINTS } from '../services/ApiConfig';
import {
    Plus,
    Edit,
    Trash2,
    Loader2,
    RefreshCw,
    Settings,
    Coffee,
    Droplet,
    Sun,
    Sparkles
} from 'lucide-react';

const CoffeeColors = {
    DARK_BROWN: '#4A3423',
    BUTTON_BROWN: '#8B4513',
    LIGHT_BG: '#efebe9',
};

// Horizontal Bar Chart Component
export const ProcessingTypeChart = ({ data }) => {
    const maxWeight = Math.max(...data.map(d => d.weight), 1);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-1" style={{ color: CoffeeColors.DARK_BROWN }}>
                Processing Type Distribution
            </h2>
            <p className="text-sm mb-6" style={{ color: '#666' }}>
                Total weight processed by method (in kilograms)
            </p>

            <div className="space-y-4">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <div className="w-40 flex items-center gap-2">
                            <item.icon size={20} style={{ color: item.color }} />
                            <span className="text-sm font-medium" style={{ color: CoffeeColors.DARK_BROWN }}>
                                {item.name}
                            </span>
                        </div>
                        <div className="flex-1 relative">
                            <div className="h-10 bg-gray-100 rounded-lg overflow-hidden">
                                <div
                                    className="h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-500"
                                    style={{
                                        width: `${(item.weight / maxWeight) * 100}%`,
                                        backgroundColor: item.color,
                                        minWidth: item.weight > 0 ? '80px' : '0'
                                    }}
                                >
                                    {item.weight > 0 && (
                                        <span className="text-sm font-bold text-white">
                                            {item.weight.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProcessingType = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('fermenting');
    const [allRecords, setAllRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    const processingTypes = [
        {
            id: 'fermenting',
            icon: Sparkles,
            title: 'Fermenting',
            description: 'Manage fermenting process and records',
            path: '/processing/fermenting',
            bgColor: '#8B4513',
            weight: 1250.50 // TODO: Replace with actual data from API
        },
        {
            id: 'natural',
            icon: Sun,
            title: 'Natural Sundrying',
            description: 'Track natural sundrying operations',
            path: '/processing/natural-sundrying',
            bgColor: '#FFA500',
            weight: 875.25 // TODO: Replace with actual data from API
        },
        {
            id: 'washing',
            icon: Droplet,
            title: 'Washing',
            description: 'Monitor washing process and quality',
            path: '/processing/washing',
            bgColor: '#4682B4',
            weight: 1450.75 // TODO: Replace with actual data from API
        }
    ];

    // Prepare data for the chart
    const chartData = processingTypes.map(type => ({
        name: type.title,
        weight: type.weight,
        color: type.bgColor,
        icon: type.icon
    }));

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            // Get auth token
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

            // Fetch data from all three processing endpoints
            const [fermentingRes, sundryingRes, washingRes] = await Promise.all([
                fetch(API_ENDPOINTS.FERMENTING, { headers }),
                fetch(API_ENDPOINTS.NATURAL_SUNDRYING, { headers }),
                fetch(API_ENDPOINTS.WASHING, { headers })
            ]);

            const [fermentingData, sundryingData, washingData] = await Promise.all([
                fermentingRes.ok ? fermentingRes.json() : { results: [] },
                sundryingRes.ok ? sundryingRes.json() : { results: [] },
                washingRes.ok ? washingRes.json() : { results: [] }
            ]);

            // Normalize data structure (handle both paginated and non-paginated responses)
            const fermentingRecords = (Array.isArray(fermentingData) ? fermentingData : fermentingData.results || []).map(record => ({
                ...record,
                processing_type: 'fermenting'
            }));

            const sundryingRecords = (Array.isArray(sundryingData) ? sundryingData : sundryingData.results || []).map(record => ({
                ...record,
                processing_type: 'natural'
            }));

            const washingRecords = (Array.isArray(washingData) ? washingData : washingData.results || []).map(record => ({
                ...record,
                processing_type: 'washing'
            }));

            // Combine all records
            const allData = [...fermentingRecords, ...sundryingRecords, ...washingRecords];

            console.log('Processing Type Data:', {
                fermenting: fermentingRecords.length,
                sundrying: sundryingRecords.length,
                washing: washingRecords.length,
                total: allData.length
            });

            setAllRecords(allData);
        } catch (error) {
            console.error('Error fetching processing records:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    // Filter records based on active tab
    const filteredRecords = allRecords.filter(record => record.processing_type === activeTab);

    return (
        <SideNav>
            <main className="p-4 sm:p-6 md:p-8 pt-0">
                {/* Quick Navigation */}
                <ProcessingNav />

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: CoffeeColors.DARK_BROWN }}>
                            Processing Type
                        </h1>
                        <p className="text-gray-600 mt-1">Select processing method and view distribution</p>
                    </div>
                    <button
                        onClick={fetchRecords}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition"
                        style={{ backgroundColor: CoffeeColors.LIGHT_BG, color: CoffeeColors.DARK_BROWN }}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Horizontal Bar Chart */}
                <div className="mb-8">
                    <ProcessingTypeChart data={chartData} />
                </div>

                {/* Tab Navigation - Similar to Quality Control */}
                <div className="mb-6">
                    <div className="flex gap-3">
                        {processingTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setActiveTab(type.id)}
                                className={`px-6 py-2 rounded-xl shadow-lg transition flex items-center gap-2 ${
                                    activeTab === type.id ? 'shadow-xl' : ''
                                }`}
                                style={{
                                    backgroundColor: activeTab === type.id ? type.bgColor : CoffeeColors.LIGHT_BG,
                                    color: activeTab === type.id ? '#FFFFFF' : CoffeeColors.DARK_BROWN
                                }}
                            >
                                <type.icon size={18} />
                                {type.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dynamic Table Based on Active Tab */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="p-4 border-b" style={{ backgroundColor: CoffeeColors.LIGHT_BG }}>
                        <h3 className="text-lg font-bold" style={{ color: CoffeeColors.DARK_BROWN }}>
                            {processingTypes.find(t => t.id === activeTab)?.title} Records
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead style={{ backgroundColor: CoffeeColors.LIGHT_BG }}>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Processing ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Grade/Batch</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-700">Weight (kg)</th>
                                    {activeTab === 'fermenting' && (
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Days</th>
                                    )}
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={activeTab === 'fermenting' ? "6" : "5"} className="px-6 py-12 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin inline-block" style={{ color: CoffeeColors.BUTTON_BROWN }} />
                                        </td>
                                    </tr>
                                ) : filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={activeTab === 'fermenting' ? "6" : "5"} className="px-6 py-12 text-center text-gray-500">
                                            No {processingTypes.find(t => t.id === activeTab)?.title.toLowerCase()} records found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-800">
                                                {record.processing_id || record.id || ''}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                {record.is_batch ?
                                                    `Batch: ${record.grade}` :
                                                    record.grade_ids && record.grade_ids.length > 0 ?
                                                        record.grade_ids.join(', ') :
                                                        record.grade || ''}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                {record.start_date || record.date || record.created_at ?
                                                    new Date(record.start_date || record.date || record.created_at).toLocaleDateString() : ''}
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-700">
                                                {record.weight ? Number(record.weight).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                                            </td>
                                            {activeTab === 'fermenting' && (
                                                <td className="px-6 py-4 text-center text-gray-700">
                                                    {record.days || ''}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button className="p-1 hover:bg-blue-50 rounded transition-colors" title="Edit">
                                                        <Edit className="w-4 h-4 text-blue-600" />
                                                    </button>
                                                    <button className="p-1 hover:bg-red-50 rounded transition-colors" title="Delete">
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </SideNav>
    );
};

export default ProcessingType;
