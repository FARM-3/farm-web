import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../components/settings/Modal';
import { getAuthHeaders } from '../../utils/authHeaders';
import { apiUrl } from '../../utils/apiBase';

const API = apiUrl('/api/config/coffee-types/');

export default function CoffeeTypesSettings() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', sub_types: [{ name: '', code: '' }] });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API, { headers: getAuthHeaders() });
      const data = await res.json();
      setTypes(data.results || data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', description: '', sub_types: [{ name: '', code: '' }] });
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name,
      description: t.description || '',
      sub_types: t.sub_types?.length ? t.sub_types.map(s => ({ name: s.name, code: s.code || '' })) : [{ name: '', code: '' }],
    });
    setModalOpen(true);
  };

  const addSubType = () => setForm(f => ({ ...f, sub_types: [...f.sub_types, { name: '', code: '' }] }));
  const removeSubType = (i) => setForm(f => ({ ...f, sub_types: f.sub_types.filter((_, idx) => idx !== i) }));
  const updateSub = (i, key, val) => setForm(f => ({
    ...f,
    sub_types: f.sub_types.map((s, idx) => idx === i ? { ...s, [key]: val } : s),
  }));

  const save = async () => {
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      is_active: true,
      sub_types: form.sub_types.filter(s => s.name.trim()).map((s, i) => ({
        name: s.name.trim(), code: s.code.trim(), sort_order: i, is_active: true,
      })),
    };
    const url = editing ? `${API}${editing.id}/` : API;
    const method = editing ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSaving(false);
    setModalOpen(false);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this coffee type?')) return;
    await fetch(`${API}${id}/`, { method: 'DELETE', headers: getAuthHeaders() });
    load();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Coffee Types</h2>
          <p className="text-sm text-gray-500">
            Processing hierarchy for batches (e.g. Arabica → Washed). Not the same as Coffee Varieties under Lookups, which are species on farmer registration.
          </p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#8B5A3C' }}>
          <Plus size={16} /> New Type
        </button>
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : (
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-gray-500">
            <th className="py-2">Type</th><th>Sub-types</th><th className="w-24">Actions</th>
          </tr></thead>
          <tbody>
            {types.map(t => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="py-3 font-medium">{t.name}</td>
                <td className="text-gray-600">{(t.sub_types || []).map(s => s.name).join(', ') || '—'}</td>
                <td className="flex gap-2 py-3">
                  <button onClick={() => openEdit(t)} className="p-1 text-gray-500 hover:text-blue-600"><Pencil size={16} /></button>
                  <button onClick={() => remove(t.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {!types.length && <tr><td colSpan={3} className="py-8 text-center text-gray-400">No coffee types yet</td></tr>}
          </tbody>
        </table>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Edit Coffee Type' : 'Add Coffee Type'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
            <button onClick={save} disabled={saving || !form.name.trim()} className="px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50" style={{ backgroundColor: '#8B5A3C' }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <label className="block text-sm font-medium mb-1">Type Name</label>
        <input className="w-full border rounded-lg p-2 mb-4" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Arabica" />

        <label className="block text-sm font-medium mb-1">Description</label>
        <input className="w-full border rounded-lg p-2 mb-4" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Sub-types</span>
          <button type="button" onClick={addSubType} className="text-sm text-[#8B5A3C]">+ Add Sub-type</button>
        </div>
        {form.sub_types.map((s, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input className="flex-1 border rounded-lg p-2 text-sm" placeholder="Name" value={s.name} onChange={e => updateSub(i, 'name', e.target.value)} />
            <input className="w-24 border rounded-lg p-2 text-sm" placeholder="Code" value={s.code} onChange={e => updateSub(i, 'code', e.target.value)} />
            {form.sub_types.length > 1 && (
              <button type="button" onClick={() => removeSubType(i)} className="text-red-500 px-2">×</button>
            )}
          </div>
        ))}
      </Modal>
    </div>
  );
}
