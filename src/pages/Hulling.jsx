import React, { useState, useEffect, useCallback } from 'react';
import { SideNav } from '../components/SideNav';
import { ProcessingNav } from '../components/ProcessingNav';
import {
    Plus,
    Edit,
    Trash2,
    Loader2,
    RefreshCw,
    Wheat,
    TrendingUp
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

const Hulling = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockData = [
                {
                    id: 1,
                    lot_id: 'LOT-2025-001',
                    weight_before: '3000',
                    weight_after: '2400',
                    expecting_outturn: '80',
                    outturn: '80',
                    screen_size: '14/64',
                    activity: 'hulling',
                    custom_activity: '',
                    staff_id: 'STF-01',
                    date: '2025-12-13'
                },
                {
                    id: 2,
                    lot_id: 'LOT-2025-002',
                    weight_before: '2100',
                    weight_after: '1680',
                    expecting_outturn: '80',
                    outturn: '80',
                    screen_size: '13/64',
                    activity: 'hulling',
                    custom_activity: '',
                    staff_id: 'STF-02',
                    date: '2025-12-12'
                },
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

    // Average outturn percentage (use numeric outturn values when available)
    const avgEfficiency = records.length > 0
        ? (records.reduce((sum, r) => {
            const val = parseFloat(r.outturn || r.expecting_outturn || '0');
            return sum + (isNaN(val) ? 0 : val);
        }, 0) / records.length).toFixed(1)
        : '0';

    return (
        <SideNav>
            <main className="p-4 sm:p-6 md:p-8 pt-0">
                {/* Quick Navigation */}
                <ProcessingNav />

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: CoffeeColors.DARK_BROWN }}>
                            Hulling Operations
                        </h1>
                        <p className="text-gray-600 mt-1">Manage hulling processes and records</p>
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
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <KPICard
                        title="Total Operations"
                        value={records.length}
                        subtitle="Hulling records"
                        icon={Wheat}
                        loading={loading}
                    />
                    <KPICard
                        title="Average Efficiency"
                        value={`${avgEfficiency}%`}
                        subtitle="Overall performance"
                        icon={TrendingUp}
                        loading={loading}
                    />
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead style={{ backgroundColor: CoffeeColors.LIGHT_BG }}>
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-700">Lot ID</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-gray-700">Weight Before (kg)</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-gray-700">Weight After (kg)</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-gray-700">Outturn (%)</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-gray-700">Screen Size</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-gray-700">Activity</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-gray-700">Staff ID</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-gray-700">Date</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="px-3 py-6 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin inline-block" style={{ color: CoffeeColors.BUTTON_BROWN }} />
                                        </td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-3 py-6 text-center text-gray-500">No hulling records found</td>
                                    </tr>
                                ) : (
                                    records.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 font-medium text-gray-800 text-sm whitespace-nowrap">{record.lot_id}</td>
                                            <td className="px-3 py-2 text-center text-gray-700 text-sm whitespace-nowrap">{record.weight_before}</td>
                                            <td className="px-3 py-2 text-center text-gray-700 text-sm whitespace-nowrap">{record.weight_after}</td>
                                            <td className="px-3 py-2 text-center whitespace-nowrap">
                                                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-100 text-green-800">
                                                    {record.outturn ?? record.expecting_outturn ?? 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center text-gray-700 text-sm whitespace-nowrap">{record.screen_size || 'N/A'}</td>
                                            <td className="px-3 py-2 text-center text-gray-700 text-sm whitespace-nowrap">{record.activity || record.custom_activity || 'N/A'}</td>
                                            <td className="px-3 py-2 text-center text-gray-700 text-sm whitespace-nowrap">{record.staff_id || 'N/A'}</td>
                                            <td className="px-3 py-2 text-center text-gray-700 text-sm whitespace-nowrap">{record.date}</td>
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

export default Hulling;
