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
    Package,
    Archive,
    AlertCircle,
    QrCode,
    Printer
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

    // Form state for creating new bagging records
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        lot_id: '',
        weight: '',
        moisture_content: '',
        no_of_bags: '',
        date: new Date().toISOString().slice(0, 10),
        outturn: '',
        expected_outturn: '',
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(null);

    const fetchRecords = useCallback(async (url) => {
        setLoading(true);
        setError(null);
        try {
            // Prevent a click event object from being used as the URL when this
            // function is attached directly as an event handler (onClick={fetchRecords}).
            const fetchUrl = (typeof url === 'string' && url) ? url : API_ENDPOINTS.BAGGING;

            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const response = await fetch(fetchUrl, {
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
            setError(err.message || 'Failed to load bagging records');
            setRecords([]);
            setPagination({ count: 0, next: null, previous: null });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    // Form input change handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSubmitError(null);
    };

    // Submit new bagging record to the API
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setSubmitError(null);
        try {
            // Basic validation
            if (!formData.lot_id) throw new Error('Lot ID is required');
            if (formData.no_of_bags === '' || formData.no_of_bags == null) throw new Error('No. of bags is required');

            const payload = {
                ...formData,
                no_of_bags: formData.no_of_bags !== '' ? parseInt(formData.no_of_bags, 10) : null,
                weight: formData.weight !== '' ? formData.weight : null,
                outturn: formData.outturn !== '' ? formData.outturn : null,
                expected_outturn: formData.expected_outturn !== '' ? formData.expected_outturn : null,
            };

            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const res = await fetch(API_ENDPOINTS.BAGGING, {
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

            const created = await res.json();
            setSubmitSuccess('Record created successfully');
            setShowForm(false);
            setFormData({
                lot_id: '',
                weight: '',
                moisture_content: '',
                no_of_bags: '',
                date: new Date().toISOString().slice(0, 10),
                outturn: '',
                expected_outturn: '',
            });

            // Refresh list
            fetchRecords();
        } catch (err) {
            console.error('Error creating bagging record:', err);
            setSubmitError(err.message || 'Failed to create record');
        } finally {
            setSubmitLoading(false);
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setSubmitError(null);
        setSubmitSuccess(null);
    };

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
                        <p className="text-gray-600 mt-1">Monitor bagging — QR labels auto-generate and sync to inventory</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => fetchRecords()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition"
                            style={{ backgroundColor: CoffeeColors.LIGHT_BG, color: CoffeeColors.DARK_BROWN }}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={() => { setShowForm(true); setSubmitError(null); setSubmitSuccess(null); }}
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

                {/* Modal form for creating a new bagging record */}
                {showForm && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="absolute inset-0 bg-black opacity-40" onClick={closeForm} />
                        <div className="bg-white rounded-xl shadow-lg p-6 z-10 w-full max-w-2xl">
                            <h2 className="text-xl font-semibold mb-4">New Bagging Record</h2>
                            {submitError && <div className="mb-3 text-sm text-red-600">{submitError}</div>}
                            {submitSuccess && <div className="mb-3 text-sm text-green-600">{submitSuccess}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-600">Lot ID</label>
                                        <input name="lot_id" value={formData.lot_id} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Weight</label>
                                        <input name="weight" value={formData.weight} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Moisture Content</label>
                                        <input name="moisture_content" value={formData.moisture_content} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">No. of Bags</label>
                                        <input name="no_of_bags" type="number" value={formData.no_of_bags} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Outturn</label>
                                        <input name="outturn" value={formData.outturn} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Expected Outturn</label>
                                        <input name="expected_outturn" value={formData.expected_outturn} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Date</label>
                                        <input name="date" type="date" value={formData.date} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2" />
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end gap-3">
                                    <button type="button" onClick={closeForm} className="px-4 py-2 rounded border">Cancel</button>
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
                                        <td colSpan="6" className="px-3 py-6 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin inline-block" style={{ color: CoffeeColors.BUTTON_BROWN }} />
                                        </td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center text-gray-500">No bagging records found</td>
                                        <td colSpan="6" className="px-3 py-6 text-center text-gray-500">No bagging records found</td>
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
                                                <td className="px-6 py-4 text-center text-gray-700">
                                                    {record.id ? (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="text-xs font-mono">{record.qr_code || `LOT:${record.lot_id}`}</span>
                                                            <a
                                                                href={`${API_ENDPOINTS.BAGGING}${record.id}/qr-image/`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 text-xs text-[#8B4513] hover:underline"
                                                                title="Print label"
                                                            >
                                                                <QrCode className="w-3 h-3" />
                                                                <Printer className="w-3 h-3" />
                                                                Label
                                                            </a>
                                                        </div>
                                                    ) : (record.qr_code || '-')}
                                                </td>
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
