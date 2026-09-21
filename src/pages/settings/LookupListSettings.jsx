import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../../components/settings/Modal';
import { getAuthHeaders } from '../../utils/authHeaders';

const API = `${import.meta.env.VITE_API_URL}/api/config/lookups/`;

/** Reusable list with independent add/delete — one item at a time. */
export default function LookupListSettings({ category, title, description, addLabel = 'Add Item' }) {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`${API}?category=${category}&active_only=1`, { headers: getAuthHeaders() });
    const data = await res.json();
    setItems(data.results || data || []);
  }, [category]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!value.trim()) return;
    setSaving(true);
    await fetch(API, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, value: value.trim(), label: value.trim(), is_active: true, sort_order: items.length }),
    });
    setSaving(false);
    setValue('');
    setModalOpen(false);
    load();
  };

  const remove = async (id) => {
    await fetch(`${API}${id}/`, { method: 'DELETE', headers: getAuthHeaders() });
    load();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-sm shrink-0" style={{ backgroundColor: '#8B5A3C' }}>
          <Plus size={16} /> {addLabel}
        </button>
      </div>
      <ul className="divide-y border rounded-lg">
        {items.map(item => (
          <li key={item.id} className="flex justify-between items-center px-4 py-2.5 text-sm">
            <span>{item.label || item.value}</span>
            <button onClick={() => remove(item.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
          </li>
        ))}
        {!items.length && <li className="px-4 py-8 text-center text-gray-400 text-sm">No items yet — click {addLabel}</li>}
      </ul>

      <Modal open={modalOpen} title={addLabel} onClose={() => setModalOpen(false)}
        footer={<><button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
          <button onClick={save} disabled={saving || !value.trim()} className="px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50" style={{ backgroundColor: '#8B5A3C' }}>{saving ? 'Saving...' : 'Save'}</button></>}>
        <label className="text-sm font-medium">Name</label>
        <input className="w-full border rounded-lg p-2 mt-1" value={value} onChange={e => setValue(e.target.value)} placeholder="Enter value" autoFocus />
      </Modal>
    </div>
  );
}
