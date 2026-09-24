import React, { useCallback, useEffect, useState } from 'react';
import { SideNav } from '../components/SideNav';
import Modal from '../components/settings/Modal';
import { getAuthHeaders } from '../utils/authHeaders';
import { apiUrl } from '../utils/apiBase';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

const API = apiUrl('/api/config/trainings/');

const empty = {
  title: '', topic: '', trainer: '', location: '',
  start_date: new Date().toISOString().slice(0, 10), end_date: '',
  attendees: 0, status: 'scheduled', notes: '',
};

const STATUS_STYLES = {
  scheduled: 'bg-blue-50 text-blue-800',
  completed: 'bg-green-50 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

export default function Trainings() {
  const [records, setRecords] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const load = useCallback(async () => {
    const res = await fetch(API, { headers: getAuthHeaders() });
    const data = await res.json();
    setRecords(data.results || data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const training_id = `TRN-${Date.now().toString().slice(-8)}`;
    await fetch(API, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, training_id, attendees: Number(form.attendees) || 0 }),
    });
    setModalOpen(false);
    setForm(empty);
    load();
  };

  const markComplete = async (record) => {
    await fetch(`${API}${record.id}/`, {
      method: 'PATCH',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this training record?')) return;
    await fetch(`${API}${id}/`, { method: 'DELETE', headers: getAuthHeaders() });
    load();
  };

  return (
    <SideNav>
      <main className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#4A3423]">Training</h1>
            <p className="text-sm text-gray-500">Extension sessions for farmers and staff — mark complete when done</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#8B5A3C' }}>
            <Plus size={16} /> Schedule Training
          </button>
        </div>
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr className="text-left text-gray-500">
              <th className="px-4 py-3">Title</th><th className="px-4 py-3">Topic</th><th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Trainer</th><th className="px-4 py-3">Attendees</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 w-28">Actions</th>
            </tr></thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3">{r.topic || '—'}</td>
                  <td className="px-4 py-3">{r.start_date}</td>
                  <td className="px-4 py-3">{r.trainer || '—'}</td>
                  <td className="px-4 py-3">{r.attendees ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${STATUS_STYLES[r.status] || ''}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 flex gap-2 items-center">
                    {r.status !== 'completed' && (
                      <button onClick={() => markComplete(r)} title="Mark complete" className="text-green-700 hover:text-green-900">
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button onClick={() => remove(r.id)} className="text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {!records.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No trainings scheduled — run seed_demo_all or add one</td></tr>}
            </tbody>
          </table>
        </div>

        <Modal open={modalOpen} title="Schedule Training" onClose={() => setModalOpen(false)}
          footer={<><button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
            <button onClick={save} disabled={!form.title.trim()} className="px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50" style={{ backgroundColor: '#8B5A3C' }}>Save</button></>}>
          {['title', 'topic', 'trainer', 'location'].map(k => (
            <div key={k} className="mb-3"><label className="text-sm capitalize">{k}</label>
              <input className="w-full border rounded-lg p-2 mt-1" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>
          ))}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-sm">Start date</label><input type="date" className="w-full border rounded-lg p-2 mt-1" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></div>
            <div><label className="text-sm">End date</label><input type="date" className="w-full border rounded-lg p-2 mt-1" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></div>
          </div>
          <div className="mb-3"><label className="text-sm">Expected attendees</label><input type="number" className="w-full border rounded-lg p-2 mt-1" value={form.attendees} onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))} /></div>
        </Modal>
      </main>
    </SideNav>
  );
}
