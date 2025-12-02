import React, { useState, useEffect } from 'react';
import { SideNav } from '../components/SideNav';
import { ProcessingNav } from '../components/ProcessingNav';
import { API_ENDPOINTS } from '../services/ApiConfig';
import {
    Plus,
    Edit,
    Trash2,
    Loader2,
    RefreshCw,
    Droplet,
    CheckCircle,
    Activity,
    AlertCircle
} from 'lucide-react';

const CoffeeColors = {
    DARK_BROWN: '#4A3423',
    BUTTON_BROWN: '#4682B4',
    LIGHT_BG: '#efebe9',
};

const KPICard = ({ title, value, subtitle, icon: Icon, loading }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium tracking-wide uppercase text-gray-600">
                {title}
            </h3>
            <Icon size={20} style={{ color: '#4682B4' }} />
        </div>
        {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#4682B4' }} />
        ) : (
            <div className="mt-2">
                <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{value}</p>
                {subtitle && <p className="mt-3 text-xs text-gray-600">{subtitle}</p>}
            </div>
        )}
    </div>
);

const Washing = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null
    });

    const fetchRecords = async (url = API_ENDPOINTS.WASHING) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            setRecords(data.results || []);
            setPagination({
                count: data.count || 0,
                next: data.next,
                previous: data.previous
            });
        } catch (error) {
            console.error('Error fetching washing records:', error);
            setError(error.message);
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    // Since washing schema doesn't have end_date or days, all records are considered active
    const activeCount = records.length;
    const totalWeight = records.reduce((sum, r) => sum + (parseFloat(r.weight) || 0), 0);

    return (
        <SideNav>
            <main className="p-4 sm:p-6 md:p-8 pt-0">
                <ProcessingNav />

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: CoffeeColors.DARK_BROWN }}>
                            <Droplet size={32} style={{ color: CoffeeColors.BUTTON_BROWN }} />
                            Washing Process
                        </h1>
                        <p className="text-gray-600 mt-1">Monitor washing operations and water quality</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchRecords}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition"
                            style={{ backgroundColor: CoffeeColors.LIGHT_BG, color: CoffeeColors.DARK_BROWN }}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg text-white hover:shadow-xl transition"
                            style={{ backgroundColor: CoffeeColors.BUTTON_BROWN }}
                        >
                            <Plus className="w-4 h-4" />
                            New Batch
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <div>
                            <p className="text-red-800 font-medium">Error loading data</p>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <KPICard
                        title="Total Batches"
                        value={pagination.count}
                        subtitle="All washing records"
                        icon={Droplet}
                        loading={loading}
                    />
                    <KPICard
                        title="Active Batches"
                        value={activeCount}
                        subtitle="Currently washing"
                        icon={Activity}
                        loading={loading}
                    />
                    <KPICard
                        title="Total Weight"
                        value={`${totalWeight.toLocaleString()} kg`}
                        subtitle="Combined weight"
                        icon={CheckCircle}
                        loading={loading}
                    />
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead style={{ backgroundColor: CoffeeColors.LIGHT_BG }}>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Processing ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Grade</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Weight (kg)</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Date</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Created At</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin inline-block" style={{ color: CoffeeColors.BUTTON_BROWN }} />
                                        </td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No washing records found</td>
                                    </tr>
                                ) : (
                                    records.map((record, index) => {
                                        const createdDate = new Date(record.created_at).toLocaleDateString();
                                        return (
                                            <tr key={record.processing_id || index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-800">{record.processing_id}</td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                                        {record.grade}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">{parseFloat(record.weight).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.date}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{createdDate}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button className="p-1 hover:bg-blue-50 rounded">
                                                            <Edit className="w-4 h-4 text-blue-600" />
                                                        </button>
                                                        <button className="p-1 hover:bg-red-50 rounded">
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {(pagination.next || pagination.previous) && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Total: {pagination.count} records
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => fetchRecords(pagination.previous)}
                                    disabled={!pagination.previous || loading}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                        pagination.previous && !loading
                                            ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => fetchRecords(pagination.next)}
                                    disabled={!pagination.next || loading}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                        pagination.next && !loading
                                            ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </SideNav>
    );
};

export default Washing;
