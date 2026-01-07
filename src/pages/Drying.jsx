import React, { useState, useEffect, useCallback } from 'react';
import { SideNav } from '../components/SideNav';
import { ProcessingNav } from '../components/ProcessingNav';
import { API_ENDPOINTS } from '../services/ApiConfig';
import {
    Plus,
    Loader2,
    RefreshCw,
    CloudRain,
    TrendingUp,
    AlertCircle,
    Edit,
    Trash2
} from 'lucide-react';

const KPICard = ({ title, value, subtitle, icon: Icon, loading }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium tracking-wide uppercase text-gray-600">{title}</h3>
            <Icon size={20} style={{ color: '#FFA500' }} />
        </div>
        {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#FFA500' }} />
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

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        processing_id: '',
        lot_id: '',
        date: '',
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
    const [submitSuccess, setSubmitSuccess] = useState(null);

    const fetchRecords = useCallback(async (url = API_ENDPOINTS.DRYING) => {
        setLoading(true);
        setError(null);
        try {
            // guard against event objects accidentally being passed
            if (url && typeof url === 'object' && url.target) return;

            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Token ${token}` : undefined
                }
            });

            if (!res.ok) {
                throw new Error(`${res.status} ${res.statusText}`);
            }

            const data = await res.json();
            const list = data.results || data || [];
            setRecords(list);
            setPagination({ count: data.count || list.length, next: data.next || null, previous: data.previous || null });
        } catch (err) {
            console.error('Error fetching drying records:', err);
            if (err.message && err.message.includes('404')) {
                setError('Drying endpoint not implemented on backend server. Please contact your backend administrator.');
            } else {
                setError(err.message || 'Error loading data');
            }
            setRecords([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const totalRecords = pagination.count;
    const avgMoisture = records.length ? (records.reduce((s, r) => s + (parseFloat(r.moisture_content) || 0), 0) / records.length).toFixed(2) : 0;
    const totalWeight = records.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);

    const openForm = () => {
        setFormData({
            processing_id: '',
            lot_id: '',
            date: '',
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
        setSubmitError(null);
        setSubmitSuccess(null);
        setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setSubmitError(null);
        setSubmitSuccess(null);
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const payload = {
                ...formData,
                moisture_content: formData.moisture_content === '' ? null : parseFloat(formData.moisture_content),
                weight: formData.weight === '' ? null : parseFloat(formData.weight),
                moisture_before: formData.moisture_before === '' ? null : parseFloat(formData.moisture_before),
                weight_before: formData.weight_before === '' ? null : parseFloat(formData.weight_before),
                days: formData.days === '' ? null : parseInt(formData.days, 10),
                moisture_deviation: formData.moisture_deviation === '' ? null : parseFloat(formData.moisture_deviation),
                rate_of_drying: formData.rate_of_drying === '' ? null : parseFloat(formData.rate_of_drying),
                rate_of_weightloss: formData.rate_of_weightloss === '' ? null : parseFloat(formData.rate_of_weightloss),
                outturn: formData.outturn === '' ? null : parseFloat(formData.outturn),
                outturn_deviation: formData.outturn_deviation === '' ? null : parseFloat(formData.outturn_deviation)
            };

            const res = await fetch(API_ENDPOINTS.DRYING, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Token ${token}` : undefined
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errBody = await res.text();
                throw new Error(`${res.status} ${res.statusText} - ${errBody}`);
            }

            setSubmitSuccess('Record created successfully');
            setShowForm(false);
            fetchRecords();
        } catch (err) {
            console.error('Error creating drying record:', err);
            setSubmitError(err.message || 'Failed to create record');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <SideNav>
            <main className="p-4 sm:p-6 md:p-8 pt-0">
                <ProcessingNav />

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#4A3423' }}>
                            <CloudRain size={32} style={{ color: '#FFA500' }} />
                            Drying
                        </h1>
                        <p className="text-gray-600 mt-1">Track drying operations and measurements</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => fetchRecords()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition"
                            style={{ backgroundColor: '#efebe9', color: '#4A3423' }}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={openForm}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg text-white hover:shadow-xl transition"
                            style={{ backgroundColor:  '#8B4513'}}
                        >
                            <Plus className="w-4 h-4" />
                            New Record
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
                    <KPICard title="Total Records" value={totalRecords} subtitle="Drying records" icon={CloudRain} loading={loading} />
                    <KPICard title="Average Moisture" value={`${avgMoisture}%`} subtitle="Mean moisture" icon={TrendingUp} loading={loading} />
                    <KPICard title="Total Weight" value={`${totalWeight.toLocaleString()} kg`} subtitle="Combined weight" icon={TrendingUp} loading={loading} />
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead style={{ backgroundColor: '#efebe9' }}>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Processing ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Lot ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Weight (kg)</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700">Moisture (%)</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Date</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Outturn</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Created At</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin inline-block" style={{ color: '#FFA500' }} />
                                        </td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">No drying records found</td>
                                    </tr>
                                ) : (
                                    records.map((record, index) => {
                                        const createdDate = record.created_at ? new Date(record.created_at).toLocaleDateString() : '-';
                                        return (
                                            <tr key={record.id || index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-800">{record.processing_id}</td>
                                                <td className="px-6 py-4 text-gray-700">{record.lot_id}</td>
                                                <td className="px-6 py-4 text-gray-700">{record.weight ? parseFloat(record.weight).toLocaleString() : '-'}</td>
                                                <td className="px-6 py-4 text-gray-700">{record.moisture_content ?? '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.date || '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{record.outturn ?? '-'}</td>
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

                    {(pagination.next || pagination.previous) && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-600">Total: {pagination.count} records</div>
                            <div className="flex gap-2">
                                <button onClick={() => fetchRecords(pagination.previous)} disabled={!pagination.previous || loading} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${pagination.previous && !loading ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                                    Previous
                                </button>
                                <button onClick={() => fetchRecords(pagination.next)} disabled={!pagination.next || loading} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${pagination.next && !loading ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal form */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
                            <h2 className="text-xl font-semibold mb-4">New Drying Record</h2>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="processing_id" value={formData.processing_id} onChange={handleChange} placeholder="Processing ID" className="input" />
                                <input name="lot_id" value={formData.lot_id} onChange={handleChange} placeholder="Lot ID" className="input" />
                                <input name="date" type="date" value={formData.date} onChange={handleChange} className="input" />
                                <input name="weather_condition" value={formData.weather_condition} onChange={handleChange} placeholder="Weather Condition" className="input" />
                                <input name="moisture_content" value={formData.moisture_content} onChange={handleChange} placeholder="Moisture (%)" className="input" />
                                <input name="weight" value={formData.weight} onChange={handleChange} placeholder="Weight (kg)" className="input" />
                                <input name="moisture_before" value={formData.moisture_before} onChange={handleChange} placeholder="Moisture Before (%)" className="input" />
                                <input name="weight_before" value={formData.weight_before} onChange={handleChange} placeholder="Weight Before (kg)" className="input" />
                                <input name="processing_type" value={formData.processing_type} onChange={handleChange} placeholder="Processing Type" className="input" />
                                <input name="type_of_coffee" value={formData.type_of_coffee} onChange={handleChange} placeholder="Type of Coffee" className="input" />
                                <input name="days" value={formData.days} onChange={handleChange} placeholder="Days" className="input" />
                                <input name="moisture_deviation" value={formData.moisture_deviation} onChange={handleChange} placeholder="Moisture Deviation" className="input" />
                                <input name="rate_of_drying" value={formData.rate_of_drying} onChange={handleChange} placeholder="Rate of Drying" className="input" />
                                <input name="rate_of_weightloss" value={formData.rate_of_weightloss} onChange={handleChange} placeholder="Rate of Weightloss" className="input" />
                                <input name="outturn" value={formData.outturn} onChange={handleChange} placeholder="Outturn" className="input" />
                                <input name="outturn_deviation" value={formData.outturn_deviation} onChange={handleChange} placeholder="Outturn Deviation" className="input" />

                                <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                                    <button type="submit" disabled={submitLoading} className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: '#FFA500' }}>
                                        {submitLoading ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                                {submitError && <div className="md:col-span-2 text-red-600">{submitError}</div>}
                                {submitSuccess && <div className="md:col-span-2 text-green-600">{submitSuccess}</div>}
                            </form>
                        </div>
                    </div>
                )}

            </main>
        </SideNav>
    );
};

export default Drying;
