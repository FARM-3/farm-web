import React, { useState, useEffect, useCallback } from 'react';
import { SideNav } from '../components/SideNav';
import { ProcessingNav } from '../components/ProcessingNav';
import { API_ENDPOINTS } from '../services/ApiConfig';
import Modal from '../components/settings/Modal';
import {
    Plus, Edit, Trash2, Loader2, RefreshCw, Wheat, TrendingUp, AlertCircle,
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

const emptyForm = {
    lot_id: '',
    weight_before: '',
    weight_after: '',
    expecting_outturn: '',
    outturn: '',
    screen_size: '',
    staff_id: '',
    date: new Date().toISOString().slice(0, 10),
};

function authHeaders() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

const Hulling = () => {
    const [records, setRecords] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(API_ENDPOINTS.HULLING, { headers: authHeaders() });
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            const data = await res.json();
            setRecords(data.results || data || []);
        } catch (err) {
            setError(err.message || 'Failed to load hulling records');
            setRecords([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    useEffect(() => {
        fetch(API_ENDPOINTS.STAFF, { headers: authHeaders() })
            .then(res => res.json())
            .then(data => setStaffList(data.results || data || []))
            .catch(() => setStaffList([]));
    }, []);

    const avgEfficiency = records.length > 0
        ? (records.reduce((sum, r) => sum + (parseFloat(r.outturn || r.expecting_outturn) || 0), 0) / records.length).toFixed(1)
        : '0';

    const createRecord = async () => {
        setFormError('');
        if (!form.lot_id.trim() || !form.weight_before) {
            setFormError('Lot ID and weight before are required.');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                lot_id: form.lot_id.trim(),
                weight_before: form.weight_before,
                weight_after: form.weight_after || null,
                expecting_outturn: form.expecting_outturn || null,
                outturn: form.outturn || null,
                screen_size: form.screen_size,
                staff_id: form.staff_id,
                activity: 'hulling',
                date: form.date,
            };
            const res = await fetch(API_ENDPOINTS.HULLING, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const msg = data.detail || data.lot_id?.[0] || JSON.stringify(data);
                setFormError(typeof msg === 'string' ? msg : 'Could not save record.');
                return;
            }
            setModalOpen(false);
            setForm(emptyForm);
            fetchRecords();
        } finally {
            setSaving(false);
        }
    };

    const deleteRecord = async (id) => {
        if (!window.confirm('Delete this hulling record?')) return;
        await fetch(`${API_ENDPOINTS.HULLING}${id}/`, { method: 'DELETE', headers: authHeaders() });
        fetchRecords();
    };

    return (
        <SideNav>
            <main className="p-4 sm:p-6 md:p-8 pt-0">
                <ProcessingNav />

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: CoffeeColors.DARK_BROWN }}>Hulling Operations</h1>
                        <p className="text-gray-600 mt-1">Optional step after drying — removes parchment before bagging. Not all lots are hulled on-site.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={fetchRecords} className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg" style={{ backgroundColor: CoffeeColors.LIGHT_BG, color: CoffeeColors.DARK_BROWN }}>
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                        </button>
                        <button onClick={() => { setForm(emptyForm); setFormError(''); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg text-white" style={{ backgroundColor: CoffeeColors.BUTTON_BROWN }}>
                            <Plus className="w-4 h-4" /> New Record
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <KPICard title="Total Operations" value={records.length} subtitle="Hulling records" icon={Wheat} loading={loading} />
                    <KPICard title="Average Outturn" value={`${avgEfficiency}%`} subtitle="Overall performance" icon={TrendingUp} loading={loading} />
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead style={{ backgroundColor: CoffeeColors.LIGHT_BG }}>
                                <tr>
                                    {['Lot ID', 'Weight Before', 'Weight After', 'Outturn %', 'Screen Size', 'Staff', 'Date', 'Actions'].map(h => (
                                        <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-700">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={8} className="py-8 text-center"><Loader2 className="w-8 h-8 animate-spin inline-block" style={{ color: CoffeeColors.BUTTON_BROWN }} /></td></tr>
                                ) : records.length === 0 ? (
                                    <tr><td colSpan={8} className="py-8 text-center text-gray-500">No hulling records yet</td></tr>
                                ) : records.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 font-medium text-sm">{r.lot_id}</td>
                                        <td className="px-3 py-2 text-sm">{r.weight_before} kg</td>
                                        <td className="px-3 py-2 text-sm">{r.weight_after ?? '—'} kg</td>
                                        <td className="px-3 py-2 text-sm"><span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs">{r.outturn ?? r.expecting_outturn ?? '—'}%</span></td>
                                        <td className="px-3 py-2 text-sm">{r.screen_size || '—'}</td>
                                        <td className="px-3 py-2 text-sm">{r.staff_id || '—'}</td>
                                        <td className="px-3 py-2 text-sm">{r.date}</td>
                                        <td className="px-3 py-2">
                                            <button onClick={() => deleteRecord(r.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-600" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Modal
                    open={modalOpen}
                    title="New hulling record"
                    onClose={() => setModalOpen(false)}
                    footer={(
                        <>
                            <button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                            <button onClick={createRecord} disabled={saving} className="px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50" style={{ backgroundColor: CoffeeColors.BUTTON_BROWN }}>
                                {saving ? 'Saving…' : 'Save record'}
                            </button>
                        </>
                    )}
                >
                    <div className="space-y-3">
                        {formError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{formError}</p>}
                        {[
                            ['lot_id', 'Lot ID', 'W12'],
                            ['weight_before', 'Weight before (kg)', '3000'],
                            ['weight_after', 'Weight after (kg)', '2400'],
                            ['outturn', 'Outturn (%)', '80'],
                            ['screen_size', 'Screen size', '14/64'],
                        ].map(([key, label, ph]) => (
                            <div key={key}>
                                <label className="text-sm font-medium">{label}</label>
                                <input className="w-full border rounded-lg p-2 mt-1" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} />
                            </div>
                        ))}
                        <div>
                            <label className="text-sm font-medium">Staff member</label>
                            <select
                                className="w-full border rounded-lg p-2 mt-1"
                                value={form.staff_id}
                                onChange={e => setForm(f => ({ ...f, staff_id: e.target.value }))}
                            >
                                <option value="">Select staff member</option>
                                {staffList.map(s => (
                                    <option key={s.staff_id || s.id} value={s.staff_id || s.id}>
                                        {s.staff_id || s.id} — {[s.first_name, s.last_name].filter(Boolean).join(' ') || s.full_name || s.name || 'Staff'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Date</label>
                            <input type="date" className="w-full border rounded-lg p-2 mt-1" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                        </div>
                    </div>
                </Modal>
            </main>
        </SideNav>
    );
};

export default Hulling;
