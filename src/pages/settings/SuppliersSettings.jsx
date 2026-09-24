import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../components/settings/Modal';
import { getAuthHeaders } from '../../utils/authHeaders';
import { apiUrl } from '../../utils/apiBase';
import { PageTableShell, StyledTable, StyledThead, StyledTh, StyledTbody, TableEmptyRow } from '../../components/PageTableShell';
import TableFilterBar from '../../components/TableFilterBar';
import { exportRowsCsv } from '../../utils/tableExport';

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
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filtered = useMemo(() => items.filter(s => {
    if (categoryFilter && s.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return [s.name, s.contact_person, s.phone, s.district].some(v => String(v || '').toLowerCase().includes(q));
    }
    return true;
  }), [items, search, categoryFilter]);

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
          <h1 className="text-2xl font-bold text-[#4A3423]">Suppliers</h1>
          <p className="text-sm text-gray-500">Vendors for inputs, equipment, fuel, and services — separate from coffee farmers</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#8B5A3C' }}>
          <Plus size={16} /> Add Supplier
        </button>
      </div>
      <PageTableShell filters={
        <TableFilterBar
          filters={[
            { key: 'search', label: 'Search', type: 'search', value: search, onChange: setSearch, placeholder: 'Name, contact, district...' },
            { key: 'category', label: 'Category', type: 'select', value: categoryFilter, onChange: setCategoryFilter, options: CATEGORIES.map(c => ({ value: c.value, label: c.label })) },
          ]}
          showClear={!!(search || categoryFilter)}
          onClear={() => { setSearch(''); setCategoryFilter(''); }}
          onExport={() => exportRowsCsv('suppliers.csv', [
            { label: 'Name', get: r => r.name },
            { label: 'Category', get: r => r.category },
            { label: 'Contact', get: r => r.contact_person },
            { label: 'Phone', get: r => r.phone },
            { label: 'District', get: r => r.district },
          ], filtered)}
          exportDisabled={!filtered.length}
        />
      }>
        <StyledTable>
          <StyledThead>
            <tr>
              <StyledTh>Name</StyledTh>
              <StyledTh>Category</StyledTh>
              <StyledTh>Contact</StyledTh>
              <StyledTh>Phone</StyledTh>
              <StyledTh>District</StyledTh>
              <StyledTh align="center">Actions</StyledTh>
            </tr>
          </StyledThead>
          <StyledTbody>
            {filtered.map(s => (
              <tr key={s.supplier_id} className="hover:bg-gray-50/80">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 capitalize">{s.category}</td>
                <td className="px-4 py-3">{s.contact_person || '—'}</td>
                <td className="px-4 py-3">{s.phone || '—'}</td>
                <td className="px-4 py-3">{s.district || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button type="button" onClick={() => openEdit(s)} className="text-blue-600"><Pencil size={16} /></button>
                    <button type="button" onClick={() => remove(s.supplier_id)} className="text-red-500"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && <TableEmptyRow colSpan={6} message={items.length ? 'No suppliers match filters' : 'No suppliers — run seed_suppliers or add one'} />}
          </StyledTbody>
        </StyledTable>
      </PageTableShell>

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
