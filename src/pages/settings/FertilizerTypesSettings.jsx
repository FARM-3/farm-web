import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../components/settings/Modal';
import { getAuthHeaders } from '../../utils/authHeaders';
import { apiUrl } from '../../utils/apiBase';

const API = apiUrl('/api/config/fertilizer-types/');

export default function FertilizerTypesSettings() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', sub_types: [{ name: '' }] });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}?active_only=1&_=${Date.now()}`, { headers: getAuthHeaders() });
      const data = await res.json();
      setTypes(data.results || data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', description: '', sub_types: [{ name: '' }] });
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name,
      description: t.description || '',
      sub_types: t.sub_types?.length ? t.sub_types.map(s => ({ name: s.name })) : [{ name: '' }],
    });
    setModalOpen(true);
  };

  const addSubType = () => setForm(f => ({ ...f, sub_types: [...f.sub_types, { name: '' }] }));
  const removeSubType = (i) => setForm(f => ({ ...f, sub_types: f.sub_types.filter((_, idx) => idx !== i) }));
  const updateSub = (i, val) => setForm(f => ({
    ...f,
    sub_types: f.sub_types.map((s, idx) => idx === i ? { name: val } : s),
  }));

  const save = async () => {
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      is_active: true,
      sub_types: form.sub_types.filter(s => s.name.trim()).map((s, i) => ({
        name: s.name.trim(), sort_order: i, is_active: true,
      })),
    };
    const url = editing ? `${API}${editing.id}/` : API;
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) {
      const err = await res.text();
      alert(`Could not save: ${err}`);
      setSaving(false);
      return;
    }
    setSaving(false);
    setModalOpen(false);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this fertilizer type and all sub-types?')) return;
    await fetch(`${API}${id}/`, { method: 'DELETE', headers: getAuthHeaders() });
    load();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Fertilizer Types</h2>
          <p className="text-sm text-gray-500">
            Top-level types (Organic, Inorganic, Mixed) with nested products — used on mobile block activities.
          </p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#8B5A3C' }}>
          <Plus size={16} /> New Type
        </button>
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : (
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-gray-500">
            <th className="py-2">Type</th><th>Sub-types (products)</th><th className="w-24">Actions</th>
          </tr></thead>
          <tbody>
            {types.map(t => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="py-3 font-medium">{t.name}</td>
                <td className="text-gray-600">{(t.sub_types || []).map(s => s.name).join(', ') || '—'}</td>
                <td className="flex gap-2 py-3">
                  <button onClick={() => openEdit(t)} className="text-gray-500 hover:text-[#8B5A3C]"><Pencil size={16} /></button>
                  <button onClick={() => remove(t.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {!types.length && <tr><td colSpan={3} className="py-8 text-center text-gray-400">No fertilizer types yet</td></tr>}
          </tbody>
        </table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Fertilizer Type' : 'New Fertilizer Type'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type name *</label>
            <input className="w-full border rounded-lg px-3 py-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Organic" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input className="w-full border rounded-lg px-3 py-2" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Sub-types (products)</label>
              <button type="button" onClick={addSubType} className="text-xs text-[#8B5A3C]">+ Add sub-type</button>
            </div>
            {form.sub_types.map((s, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input className="flex-1 border rounded-lg px-3 py-2 text-sm" value={s.name} onChange={e => updateSub(i, e.target.value)} placeholder="e.g. Bird Droppings" />
                {form.sub_types.length > 1 && (
                  <button type="button" onClick={() => removeSubType(i)} className="text-red-500"><Trash2 size={16} /></button>
                )}
              </div>
            ))}
          </div>
          <button onClick={save} disabled={saving || !form.name.trim()} className="w-full py-2 rounded-lg text-white disabled:opacity-50" style={{ backgroundColor: '#8B5A3C' }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
