import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../components/settings/Modal';
import { getAuthHeaders } from '../../utils/authHeaders';
import { apiUrl } from '../../utils/apiBase';

const API = apiUrl('/api/suppliers/');

const CATEGORIES = [
  { value: 'inputs', label: 'Farm Inputs' },
  { value: 'equipment', label: 'Equipment & Machinery' },
  { value: 'services', label: 'Services' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' },
];

const empty = {
  name: '', category: 'inputs', contact_person: '', phone: '', email: '',
  address: '', district: '', notes: '', is_active: true,
};

export default function SuppliersSettings() {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`${API}?include_inactive=1`, { headers: getAuthHeaders() });
    const data = await res.json();
    setItems(data.results || data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name, category: s.category, contact_person: s.contact_person || '',
      phone: s.phone || '', email: s.email || '', address: s.address || '',
      district: s.district || '', notes: s.notes || '', is_active: s.is_active !== false,
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const url = editing ? `${API}${editing.supplier_id}/` : API;
    const method = editing ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setModalOpen(false);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Deactivate this supplier?')) return;
    await fetch(`${API}${id}/`, {
      method: 'PATCH',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: false }),
    });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-[#4A3423]">Suppliers</h2>
          <p className="text-sm text-gray-500">Vendors for inputs, equipment, fuel, and services — separate from coffee farmers</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#8B5A3C' }}>
          <Plus size={16} /> Add Supplier
        </button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Name</th><th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Contact</th><th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">District</th><th className="px-4 py-3 w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(s => (
              <tr key={s.supplier_id} className="border-t">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 capitalize">{s.category}</td>
                <td className="px-4 py-3">{s.contact_person || '—'}</td>
                <td className="px-4 py-3">{s.phone || '—'}</td>
                <td className="px-4 py-3">{s.district || '—'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(s)} className="text-blue-600"><Pencil size={16} /></button>
                  <button onClick={() => remove(s.supplier_id)} className="text-red-500"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No suppliers — run seed_suppliers or add one</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editing ? 'Edit Supplier' : 'New Supplier'} onClose={() => setModalOpen(false)}
        footer={<>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
          <button onClick={save} disabled={saving || !form.name.trim()} className="px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50" style={{ backgroundColor: '#8B5A3C' }}>{saving ? 'Saving...' : 'Save'}</button>
        </>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2"><label className="text-sm">Name *</label><input className="w-full border rounded-lg p-2 mt-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="text-sm">Category</label>
            <select className="w-full border rounded-lg p-2 mt-1" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div><label className="text-sm">Contact person</label><input className="w-full border rounded-lg p-2 mt-1" value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} /></div>
          <div><label className="text-sm">Phone</label><input className="w-full border rounded-lg p-2 mt-1" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div><label className="text-sm">Email</label><input className="w-full border rounded-lg p-2 mt-1" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div><label className="text-sm">District</label><input className="w-full border rounded-lg p-2 mt-1" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} /></div>
          <div className="sm:col-span-2"><label className="text-sm">Address</label><input className="w-full border rounded-lg p-2 mt-1" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
          <div className="sm:col-span-2"><label className="text-sm">Notes</label><textarea className="w-full border rounded-lg p-2 mt-1" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
        </div>
      </Modal>
    </div>
  );
}
