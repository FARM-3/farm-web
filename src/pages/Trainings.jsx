import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SideNav } from '../components/SideNav';
import Modal from '../components/settings/Modal';
import { getAuthHeaders } from '../utils/authHeaders';
import { apiUrl } from '../utils/apiBase';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { PageTableShell, StyledTable, StyledThead, StyledTh, StyledTbody, TableEmptyRow } from '../components/PageTableShell';
import TableFilterBar from '../components/TableFilterBar';
import { exportRowsCsv } from '../utils/tableExport';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => records.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return [r.title, r.topic, r.trainer, r.location].some(v => String(v || '').toLowerCase().includes(q));
    }
    return true;
  }), [records, search, statusFilter]);

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
        <PageTableShell filters={
          <TableFilterBar
            filters={[
              { key: 'search', label: 'Search', type: 'search', value: search, onChange: setSearch, placeholder: 'Title, topic, trainer...' },
              { key: 'status', label: 'Status', type: 'select', value: statusFilter, onChange: setStatusFilter, options: [
                { value: 'scheduled', label: 'Scheduled' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' },
              ]},
            ]}
            showClear={!!(search || statusFilter)}
            onClear={() => { setSearch(''); setStatusFilter(''); }}
            onExport={() => exportRowsCsv('trainings.csv', [
              { label: 'Title', get: r => r.title }, { label: 'Topic', get: r => r.topic },
              { label: 'Date', get: r => r.start_date }, { label: 'Trainer', get: r => r.trainer },
              { label: 'Status', get: r => r.status },
            ], filtered)}
            exportDisabled={!filtered.length}
          />
        }>
          <StyledTable>
            <StyledThead>
              <tr>
                <StyledTh>Title</StyledTh>
                <StyledTh>Topic</StyledTh>
                <StyledTh>Date</StyledTh>
                <StyledTh>Trainer</StyledTh>
                <StyledTh align="center">Attendees</StyledTh>
                <StyledTh>Status</StyledTh>
                <StyledTh align="center">Actions</StyledTh>
              </tr>
            </StyledThead>
            <StyledTbody>
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3">{r.topic || '—'}</td>
                  <td className="px-4 py-3">{r.start_date}</td>
                  <td className="px-4 py-3">{r.trainer || '—'}</td>
                  <td className="px-4 py-3 text-center">{r.attendees ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${STATUS_STYLES[r.status] || ''}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2 items-center">
                      {r.status !== 'completed' && (
                        <button type="button" onClick={() => markComplete(r)} title="Mark complete" className="text-green-700 hover:text-green-900">
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button type="button" onClick={() => remove(r.id)} className="text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && <TableEmptyRow colSpan={7} message={records.length ? 'No trainings match filters' : 'No trainings scheduled — run seed_demo_all or add one'} />}
            </StyledTbody>
          </StyledTable>
        </PageTableShell>

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
