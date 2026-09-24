import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import Modal from '../../components/settings/Modal';
import { getAuthHeaders } from '../../utils/authHeaders';
import { apiUrl } from '../../utils/apiBase';
import { PageTableShell, StyledTable, StyledThead, StyledTh, StyledTbody, TableEmptyRow } from '../../components/PageTableShell';
import TableFilterBar from '../../components/TableFilterBar';
import { exportRowsCsv } from '../../utils/tableExport';

const API = apiUrl('/api/config/lookups/');

export default function SaleItemsSettings() {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ value: '', default_rate: '', unit_label: 'kg' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(i => String(i.label || i.value || '').toLowerCase().includes(q));
  }, [items, search]);

  const load = useCallback(async () => {
    const res = await fetch(`${API}?category=sale_item&active_only=1`, { headers: getAuthHeaders() });
    const data = await res.json();
    setItems(data.results || data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ value: '', default_rate: '', unit_label: 'kg' });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      value: item.label || item.value,
      default_rate: item.default_rate ?? '',
      unit_label: item.unit_label || 'kg',
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.value.trim()) return;
    setSaving(true);
    const payload = {
      category: 'sale_item',
      value: form.value.trim(),
      label: form.value.trim(),
      is_active: true,
      sort_order: editing ? editing.sort_order : items.length,
      default_rate: form.default_rate === '' ? null : Number(form.default_rate),
      unit_label: form.unit_label || 'kg',
    };
    const url = editing ? `${API}${editing.id}/` : API;
    const method = editing ? 'PATCH' : 'POST';
    await fetch(url, {
      method,
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setModalOpen(false);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this sale item?')) return;
    await fetch(`${API}${id}/`, { method: 'DELETE', headers: getAuthHeaders() });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold">Sale Items</h2>
          <p className="text-sm text-gray-500 mt-1">
            Products in the Sales dropdown. Set a default price per unit/kg — it auto-fills when recording a sale.
          </p>
        </div>
        <button type="button" onClick={openNew} className="flex items-center gap-1 px-4 py-2 rounded-xl text-white text-sm shrink-0 shadow-lg" style={{ backgroundColor: '#8B5A3C' }}>
          <Plus size={16} /> Add Sale Item
        </button>
      </div>

      <PageTableShell filters={
        <TableFilterBar
          filters={[{ key: 'search', label: 'Search', type: 'search', value: search, onChange: setSearch, placeholder: 'Item name...' }]}
          showClear={!!search}
          onClear={() => setSearch('')}
          onExport={() => exportRowsCsv('sale-items.csv', [
            { label: 'Item', get: r => r.label || r.value },
            { label: 'Default rate', get: r => r.default_rate },
            { label: 'Unit', get: r => r.unit_label },
          ], filtered)}
          exportDisabled={!filtered.length}
        />
      }>
        <StyledTable>
          <StyledThead>
            <tr>
              <StyledTh>Item</StyledTh>
              <StyledTh align="right">Default rate (UGX)</StyledTh>
              <StyledTh>Unit</StyledTh>
              <StyledTh align="center">Actions</StyledTh>
            </tr>
          </StyledThead>
          <StyledTbody>
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/80">
                <td className="px-4 py-3 font-medium">{item.label || item.value}</td>
                <td className="px-4 py-3 text-right">{item.default_rate ? Number(item.default_rate).toLocaleString() : '—'}</td>
                <td className="px-4 py-3">{item.unit_label || 'kg'}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button type="button" onClick={() => openEdit(item)} className="text-gray-500 hover:text-[#8B5A3C]"><Pencil size={16} /></button>
                    <button type="button" onClick={() => remove(item.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && <TableEmptyRow colSpan={4} message={items.length ? 'No items match search' : 'No sale items yet'} />}
          </StyledTbody>
        </StyledTable>
      </PageTableShell>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Sale Item' : 'Add Sale Item'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Item name *</label>
            <input className="w-full border rounded-lg px-3 py-2" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder="Green Coffee" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Default rate (UGX)</label>
              <input type="number" min="0" className="w-full border rounded-lg px-3 py-2" value={form.default_rate} onChange={e => setForm(f => ({ ...f, default_rate: e.target.value }))} placeholder="5000" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select className="w-full border rounded-lg px-3 py-2" value={form.unit_label} onChange={e => setForm(f => ({ ...f, unit_label: e.target.value }))}>
                <option value="kg">kg</option>
                <option value="unit">unit</option>
                <option value="bag">bag</option>
              </select>
            </div>
          </div>
          <button onClick={save} disabled={saving || !form.value.trim()} className="w-full py-2 rounded-lg text-white disabled:opacity-50" style={{ backgroundColor: '#8B5A3C' }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
