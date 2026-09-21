import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Save } from 'lucide-react';
import Modal from '../../components/settings/Modal';
import { getAuthHeaders } from '../../utils/authHeaders';

const API = `${import.meta.env.VITE_API_URL}/api/config/assets/`;

const empty = { asset_id: '', name: '', asset_type: 'equipment', location: '', purchase_value: '', current_value: '', condition: '' };

export default function AssetsSettings() {
  const [assets, setAssets] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

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
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between mb-4">
        <p className="text-sm text-gray-500">Farm equipment, vehicles, buildings</p>
        <button onClick={() => { setEditing(null); setForm(empty); setModalOpen(true); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-sm" style={{ backgroundColor: '#8B5A3C' }}>
          <Plus size={16} /> Add Asset
        </button>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="border-b text-left text-gray-500"><th className="py-2">ID</th><th>Name</th><th>Type</th><th>Location</th><th>Value</th></tr></thead>
        <tbody>
          {assets.map(a => (
            <tr key={a.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => { setEditing(a); setForm(a); setModalOpen(true); }}>
              <td className="py-2">{a.asset_id}</td><td>{a.name}</td><td>{a.asset_type}</td><td>{a.location || '—'}</td>
              <td>{a.current_value ? `UGX ${Number(a.current_value).toLocaleString()}` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

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
