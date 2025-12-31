import React, { useState, useEffect, useCallback } from 'react';
import { SideNav } from '../components/SideNav';
import { ProcessingNav } from '../components/ProcessingNav';
import { getApiUrl } from '../services/ApiConfig';
import {
    Plus,
    Edit,
    Trash2,
    Loader2,
    RefreshCw,
    Package,
    Archive,
    AlertCircle
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

const Bagging = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });

    const fetchRecords = useCallback(async (url = getApiUrl('bagging')) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Token ${token}` } : {})
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const items = data.results || data;
            setRecords(items);
            setPagination({
                count: data.count || (Array.isArray(items) ? items.length : 0),
                next: data.next || null,
                previous: data.previous || null
            });
        } catch (err) {
            console.error('Error fetching bagging records:', err);
            setError(err.message);
            setRecords([]);
            setPagination({ count: 0, next: null, previous: null });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const totalBags = records.reduce((sum, r) => sum + (parseInt(r.no_of_bags, 10) || 0), 0);

    return (
        <SideNav>
            <main className="p-4 sm:p-6 md:p-8 pt-0">
                {/* Quick Navigation */}
                <ProcessingNav />

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: CoffeeColors.DARK_BROWN }}>
                            Bagging Operations
                        </h1>
                        <p className="text-gray-600 mt-1">Monitor bagging and inventory</p>
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
                            New Bagging Record
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <KPICard
                        title="Total Bags"
                        value={totalBags}
                        subtitle="All bagged coffee"
                        icon={Package}
                        loading={loading}
                    />
                    <KPICard
                        title="Total Records"
                        value={pagination.count}
                        subtitle="Bagging operations"
                        icon={Archive}
                        loading={loading}
                    />
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead style={{ backgroundColor: CoffeeColors.LIGHT_BG }}>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Lot ID</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Weight</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Moisture</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">No. of Bags</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Outturn</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Expected Outturn</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">QR Code</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Created At</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin inline-block" style={{ color: CoffeeColors.BUTTON_BROWN }} />
                                        </td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center text-gray-500">No bagging records found</td>
                                    </tr>
                                ) : (
                                    records.map((record, index) => {
                                        const createdDate = record.created_at ? new Date(record.created_at).toLocaleString() : (record.date || '');
                                        return (
                                            <tr key={record.id || record.lot_id || index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-800">{record.lot_id || 'N/A'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.weight != null ? parseFloat(record.weight).toLocaleString() : '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.moisture_content || '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.no_of_bags != null ? record.no_of_bags : 'N/A'}</td>
                                                <td className="px-6 py-4 text-center font-semibold text-gray-800">{record.outturn != null ? parseFloat(record.outturn).toLocaleString() : '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.expected_outturn != null ? parseFloat(record.expected_outturn).toLocaleString() : '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.qr_code || '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{createdDate}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button className="p-1 hover:bg-blue-50 rounded"><Edit className="w-4 h-4 text-blue-600" /></button>
                                                        <button className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-600" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </SideNav>
    );
};

export default Bagging;
