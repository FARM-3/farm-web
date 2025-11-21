import React, { useState, useEffect, useCallback } from 'react';
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
    ClipboardCheck
} from 'lucide-react';

const CoffeeColors = {
    SCREEN_BG: '#FFF8F6',
    DARK_BROWN: '#4A3423',
    BUTTON_BROWN: '#8B4513',
    LIGHT_BG: '#efebe9',
};

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
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            // Simulated data - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockData = [
                {
                    id: 1,
                    harvest_id: 'H-2024-001',
                    farmer_name: 'John Doe',
                    quality_grade: 'Grade A',
                    moisture_content: '12%',
                    defects: 'None',
                    passed: true,
                    date: '2024-01-15',
                    inspector: 'Jane Smith'
                },
                {
                    id: 2,
                    harvest_id: 'H-2024-002',
                    farmer_name: 'Mary Johnson',
                    quality_grade: 'Grade B',
                    moisture_content: '14%',
                    defects: 'Minor',
                    passed: true,
                    date: '2024-01-14',
                    inspector: 'John Brown'
                },
            ];

            setRecords(mockData);
        } catch (error) {
            console.error('Error fetching quality control records:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const filteredRecords = records.filter(record =>
        record.harvest_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.farmer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        totalInspections: records.length,
        passed: records.filter(r => r.passed).length,
        failed: records.filter(r => !r.passed).length,
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
                        <p className="text-gray-600 mt-1">Manage quality inspections and records</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchRecords}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition"
                            style={{ backgroundColor: CoffeeColors.LIGHT_BG, color: CoffeeColors.DARK_BROWN }}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg text-white transition hover:shadow-xl"
                            style={{ backgroundColor: CoffeeColors.BUTTON_BROWN }}
                        >
                            <Plus className="w-4 h-4" />
                            New Inspection
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <KPICard
                        title="Total Inspections"
                        value={stats.totalInspections}
                        subtitle="All quality checks"
                        icon={ClipboardCheck}
                        loading={loading}
                    />
                    <KPICard
                        title="Passed"
                        value={stats.passed}
                        subtitle="Quality approved"
                        icon={CheckCircle}
                        loading={loading}
                    />
                    <KPICard
                        title="Failed"
                        value={stats.failed}
                        subtitle="Needs attention"
                        icon={XCircle}
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

                {/* Records Table */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead style={{ backgroundColor: CoffeeColors.LIGHT_BG }}>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Harvest ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Farmer Name
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Quality Grade
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Moisture
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Defects
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Inspector
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin inline-block" style={{ color: CoffeeColors.BUTTON_BROWN }} />
                                            <p className="mt-2 text-gray-600">Loading records...</p>
                                        </td>
                                    </tr>
                                ) : filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                                            No quality control records found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                                                {record.harvest_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                                {record.farmer_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {record.quality_grade}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700">
                                                {record.moisture_content}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700">
                                                {record.defects}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span
                                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        record.passed
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {record.passed ? 'Passed' : 'Failed'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700">
                                                {record.date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700">
                                                {record.inspector}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button className="p-1 hover:bg-blue-50 rounded transition-colors">
                                                        <Edit className="w-4 h-4 text-blue-600" />
                                                    </button>
                                                    <button className="p-1 hover:bg-red-50 rounded transition-colors">
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

export default QualityControl;
