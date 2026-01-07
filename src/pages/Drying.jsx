import React, { useState, useEffect, useCallback } from 'react';
import { SideNav } from '../components/SideNav';
import { ProcessingNav } from '../components/ProcessingNav';
import {
    Plus,
    Edit,
    Trash2,
    Loader2,
    RefreshCw,
    Wind,
    Thermometer
} from 'lucide-react';

const CoffeeColors = {
    DARK_BROWN: '#4A3423',
    BUTTON_BROWN: '#8B4513',
    LIGHT_BG: '#efebe9',
};

const KPICard = ({ title, value, subtitle, icon: Icon, loading }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium tracking-wide uppercase text-gray-600">{title}</h3>
            <Icon size={20} style={{ color: '#8B5A3C' }} />
        </div>
        {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B5A3C' }} />
        ) : (
            <div className="mt-2">
                <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{value}</p>
                {subtitle && <p className="mt-3 text-xs text-gray-600">{subtitle}</p>}
            </div>
        )}
    </div>
);

const Drying = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockData = [
                { id: 1, harvest_id: 'H-2024-001', start_date: '2024-01-17', duration: '7 days', moisture_level: '12%', status: 'In Progress' },
                { id: 2, harvest_id: 'H-2024-002', start_date: '2024-01-15', duration: '10 days', moisture_level: '11%', status: 'Completed' },
            ];
            setRecords(mockData);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    return (
        <SideNav>
            <main className="p-4 sm:p-6 md:p-8 pt-0">
                {/* Quick Navigation */}
                <ProcessingNav />

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: CoffeeColors.DARK_BROWN }}>
                            Drying Management
                        </h1>
                        <p className="text-gray-600 mt-1">Track and manage drying processes</p>
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
                            New Drying Batch
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <KPICard
                        title="Active Batches"
                        value={records.filter(r => r.status === 'In Progress').length}
                        subtitle="Currently drying"
                        icon={Wind}
                        loading={loading}
                    />
                    <KPICard
                        title="Completed Batches"
                        value={records.filter(r => r.status === 'Completed').length}
                        subtitle="Finished drying"
                        icon={Thermometer}
                        loading={loading}
                    />
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead style={{ backgroundColor: CoffeeColors.LIGHT_BG }}>
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-700">Harvest ID</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-gray-700">Start Date</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-gray-700">Duration</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-gray-700">Moisture Level</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-gray-700">Status</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-3 py-6 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin inline-block" style={{ color: CoffeeColors.BUTTON_BROWN }} />
                                        </td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-3 py-6 text-center text-gray-500">No drying records found</td>
                                    </tr>
                                ) : (
                                    records.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 font-medium text-gray-800 text-sm whitespace-nowrap">{record.harvest_id}</td>
                                            <td className="px-3 py-2 text-center text-gray-700 text-sm whitespace-nowrap">{record.start_date}</td>
                                            <td className="px-3 py-2 text-center text-gray-700 text-sm whitespace-nowrap">{record.duration}</td>
                                            <td className="px-3 py-2 text-center text-gray-700 text-sm whitespace-nowrap">{record.moisture_level}</td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                                                    record.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button className="p-1 hover:bg-blue-50 rounded"><Edit className="w-4 h-4 text-blue-600" /></button>
                                                    <button className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-600" /></button>
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

export default Drying;
