import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Save } from 'lucide-react';
import Modal from '../../components/settings/Modal';
import { getAuthHeaders } from '../../utils/authHeaders';
import { PageTableShell, StyledTable, StyledThead, StyledTh, StyledTbody, TableEmptyRow } from '../../components/PageTableShell';
import TableFilterBar from '../../components/TableFilterBar';
import { exportRowsCsv, uniqueSorted } from '../../utils/tableExport';

const API = `${import.meta.env.VITE_API_URL}/api/config/assets/`;

const empty = { asset_id: '', name: '', asset_type: 'equipment', location: '', purchase_value: '', current_value: '', condition: '' };

export default function AssetsSettings() {
  const [assets, setAssets] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const typeOptions = useMemo(() => uniqueSorted(assets.map(a => a.asset_type)), [assets]);
  const filtered = useMemo(() => assets.filter(a => {
    if (typeFilter && a.asset_type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return [a.name, a.asset_id, a.location].some(v => String(v || '').toLowerCase().includes(q));
    }
    return true;
  }), [assets, search, typeFilter]);

  const load = useCallback(async () => {
    const res = await fetch(API, { headers: getAuthHeaders() });
    const data = await res.json();
    setAssets(data.results || data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const payload = { ...form, purchase_value: form.purchase_value || null, current_value: form.current_value || null, is_active: true };
    if (!payload.asset_id) payload.asset_id = `AST-${Date.now().toString().slice(-6)}`;
    const url = editing ? `${API}${editing.id}/` : API;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setModalOpen(false);
    load();
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <p className="text-sm text-gray-500">Farm equipment, vehicles, buildings</p>
        <button type="button" onClick={() => { setEditing(null); setForm(empty); setModalOpen(true); }} className="flex items-center gap-1 px-4 py-2 rounded-xl text-white text-sm shadow-lg hover:shadow-xl transition" style={{ backgroundColor: '#8B5A3C' }}>
          <Plus size={16} /> Add Asset
        </button>
      </div>
      <PageTableShell filters={
        <TableFilterBar
          filters={[
            { key: 'search', label: 'Search', type: 'search', value: search, onChange: setSearch, placeholder: 'Name, ID, location...' },
            { key: 'type', label: 'Asset type', type: 'select', value: typeFilter, onChange: setTypeFilter, options: typeOptions.map(t => ({ value: t, label: t })) },
          ]}
          showClear={!!(search || typeFilter)}
          onClear={() => { setSearch(''); setTypeFilter(''); }}
          onExport={() => exportRowsCsv('assets.csv', [
            { label: 'ID', get: r => r.asset_id }, { label: 'Name', get: r => r.name },
            { label: 'Type', get: r => r.asset_type }, { label: 'Location', get: r => r.location },
            { label: 'Value', get: r => r.current_value },
          ], filtered)}
          exportDisabled={!filtered.length}
        />
      }>
        <StyledTable>
          <StyledThead>
            <tr>
              <StyledTh>ID</StyledTh>
              <StyledTh>Name</StyledTh>
              <StyledTh>Type</StyledTh>
              <StyledTh>Location</StyledTh>
              <StyledTh align="right">Value</StyledTh>
            </tr>
          </StyledThead>
          <StyledTbody>
            {filtered.map(a => (
              <tr key={a.id} className="hover:bg-gray-50/80 cursor-pointer" onClick={() => { setEditing(a); setForm(a); setModalOpen(true); }}>
                <td className="px-4 py-3">{a.asset_id}</td>
                <td className="px-4 py-3 font-medium">{a.name}</td>
                <td className="px-4 py-3 capitalize">{a.asset_type}</td>
                <td className="px-4 py-3">{a.location || '—'}</td>
                <td className="px-4 py-3 text-right">{a.current_value ? `UGX ${Number(a.current_value).toLocaleString()}` : '—'}</td>
              </tr>
            ))}
            {!filtered.length && <TableEmptyRow colSpan={5} message={assets.length ? 'No assets match filters' : 'No assets registered yet'} />}
          </StyledTbody>
        </StyledTable>
      </PageTableShell>

      <Modal open={modalOpen} title={editing ? 'Edit Asset' : 'Add Asset'} onClose={() => setModalOpen(false)}
        footer={<><button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
          <button onClick={save} className="px-4 py-2 rounded-lg text-white text-sm flex items-center gap-1" style={{ backgroundColor: '#8B5A3C' }}><Save size={14} /> Save</button></>}>
        {['name', 'asset_type', 'location', 'condition'].map(k => (
          <div key={k} className="mb-3">
            <label className="text-sm capitalize">{k.replace('_', ' ')}</label>
            <input className="w-full border rounded-lg p-2 mt-1" value={form[k] || ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-sm">Purchase value</label><input type="number" className="w-full border rounded-lg p-2 mt-1" value={form.purchase_value || ''} onChange={e => setForm(f => ({ ...f, purchase_value: e.target.value }))} /></div>
          <div><label className="text-sm">Current value</label><input type="number" className="w-full border rounded-lg p-2 mt-1" value={form.current_value || ''} onChange={e => setForm(f => ({ ...f, current_value: e.target.value }))} /></div>
        </div>
      </Modal>
    </div>
  );
}
