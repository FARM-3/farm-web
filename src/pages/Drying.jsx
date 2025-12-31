import React, { useState, useEffect, useCallback } from 'react';
import { SideNav } from '../components/SideNav';
import { ProcessingNav } from '../components/ProcessingNav';
import { API_ENDPOINTS } from '../services/ApiConfig';
import {
    Plus,
    Edit,
    Trash2,
    Loader2,
    RefreshCw,
    Wind,
    Thermometer,
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

const Drying = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });

    // Form state for creating a drying record
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        processing_id: '',
        lot_id: '',
        date: new Date().toISOString().slice(0, 10),
        weather_condition: '',
        moisture_content: '',
        weight: '',
        moisture_before: '',
        weight_before: '',
        processing_type: '',
        type_of_coffee: '',
        days: '',
        moisture_deviation: '',
        rate_of_drying: '',
        rate_of_weightloss: '',
        outturn: '',
        outturn_deviation: ''
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const fetchRecords = useCallback(async (url = API_ENDPOINTS.DRYING) => {
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
            setRecords(data.results || data);
            setPagination({
                count: data.count || (Array.isArray(data) ? data.length : 0),
                next: data.next || null,
                previous: data.previous || null
            });
        } catch (err) {
            console.error('Error fetching drying records:', err);
            if (err.message.includes('404')) {
                setError('Drying endpoint not implemented on backend server. Please contact your backend administrator.');
            } else {
                setError(err.message || 'Failed to load drying records');
            }
            setRecords([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSubmitError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setSubmitError(null);
        try {
            // Basic validation
            if (!formData.processing_id) throw new Error('Processing ID is required');

            const payload = {
                ...formData,
                days: formData.days !== '' ? parseInt(formData.days, 10) : null,
            };

            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const res = await fetch(API_ENDPOINTS.DRYING, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Token ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`${res.status} ${res.statusText} - ${errText}`);
            }

            await res.json();
            setShowForm(false);
            setFormData({
                processing_id: '',
                lot_id: '',
                date: new Date().toISOString().slice(0, 10),
                weather_condition: '',
                moisture_content: '',
                weight: '',
                moisture_before: '',
                weight_before: '',
                processing_type: '',
                type_of_coffee: '',
                days: '',
                moisture_deviation: '',
                rate_of_drying: '',
                rate_of_weightloss: '',
                outturn: '',
                outturn_deviation: ''
            });
            fetchRecords();
        } catch (err) {
            console.error('Error creating drying record:', err);
            setSubmitError(err.message || 'Failed to create drying record');
        } finally {
            setSubmitLoading(false);
        }
    };

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
                        title="Total Records"
                        value={pagination.count}
                        subtitle="All drying records"
                        icon={Wind}
                        loading={loading}
                    />
                    <KPICard
                        title="Average Moisture"
                        value={`${(records.reduce((s, r) => s + (parseFloat(r.moisture_content) || 0), 0) / (records.length || 1)).toFixed(1)}%`}
                        subtitle="Avg moisture content"
                        icon={Thermometer}
                        loading={loading}
                    />
                    <KPICard
                        title="Total Weight"
                        value={`${records.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0).toLocaleString()} kg`}
                        subtitle="Combined weight"
                        icon={Thermometer}
                        loading={loading}
                    />
                </div>

                {/* Modal form for creating new drying record */}
                {showForm && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowForm(false)} />
                        <div className="bg-white rounded-xl shadow-lg p-6 z-10 w-full max-w-3xl">
                            <h2 className="text-xl font-semibold mb-4">New Drying Record</h2>
                            {submitError && <div className="mb-3 text-sm text-red-600">{submitError}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-600">Processing ID</label>
                                        <input name="processing_id" value={formData.processing_id} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Lot ID</label>
                                        <input name="lot_id" value={formData.lot_id} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Date</label>
                                        <input name="date" type="date" value={formData.date} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Weather Condition</label>
                                        <input name="weather_condition" value={formData.weather_condition} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Moisture Content</label>
                                        <input name="moisture_content" value={formData.moisture_content} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Weight</label>
                                        <input name="weight" value={formData.weight} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Moisture Before</label>
                                        <input name="moisture_before" value={formData.moisture_before} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Weight Before</label>
                                        <input name="weight_before" value={formData.weight_before} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Processing Type</label>
                                        <input name="processing_type" value={formData.processing_type} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Type of Coffee</label>
                                        <input name="type_of_coffee" value={formData.type_of_coffee} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Days</label>
                                        <input name="days" type="number" value={formData.days} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Moisture Deviation</label>
                                        <input name="moisture_deviation" value={formData.moisture_deviation} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Rate of Drying</label>
                                        <input name="rate_of_drying" value={formData.rate_of_drying} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Rate of Weightloss</label>
                                        <input name="rate_of_weightloss" value={formData.rate_of_weightloss} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Outturn</label>
                                        <input name="outturn" value={formData.outturn} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Outturn Deviation</label>
                                        <input name="outturn_deviation" value={formData.outturn_deviation} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded border">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded text-white" style={{ backgroundColor: CoffeeColors.BUTTON_BROWN }} disabled={submitLoading}>{submitLoading ? 'Saving...' : 'Save'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead style={{ backgroundColor: CoffeeColors.LIGHT_BG }}>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Processing ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Lot ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Date</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Weather</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Moisture</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Weight</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Moisture Before</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Weight Before</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Processing Type</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Coffee Type</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Days</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Moisture Dev.</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Rate Drying</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Rate WLoss</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Outturn</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Outturn Dev.</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Created At</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="17" className="px-6 py-12 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin inline-block" style={{ color: CoffeeColors.BUTTON_BROWN }} />
                                        </td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan="17" className="px-6 py-12 text-center text-gray-500">No drying records found</td>
                                    </tr>
                                ) : (
                                    records.map((record, index) => {
                                        const createdDate = record.created_at ? new Date(record.created_at).toLocaleString() : '';
                                        return (
                                            <tr key={record.processing_id || record.id || index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-800">{record.processing_id}</td>
                                                <td className="px-6 py-4 text-gray-700">{record.lot_id || 'N/A'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.date}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.weather_condition || '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.moisture_content || '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.weight != null ? parseFloat(record.weight).toLocaleString() : '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.moisture_before || '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.weight_before != null ? record.weight_before : '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.processing_type || '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.type_of_coffee || '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.days != null ? record.days : '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.moisture_deviation || '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.rate_of_drying || '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.rate_of_weightloss || '-'}</td>
                                                <td className="px-6 py-4 text-center font-semibold text-gray-800">{record.outturn != null ? record.outturn : '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.outturn_deviation || '-'}</td>
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
            </main>
        </SideNav>
    );
};

export default Drying;
