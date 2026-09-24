import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../../components/settings/Modal';
import { getAuthHeaders } from '../../utils/authHeaders';
import { apiUrl } from '../../utils/apiBase';
import { PageTableShell, StyledTable, StyledThead, StyledTh, StyledTbody, TableEmptyRow } from '../../components/PageTableShell';
import TableFilterBar from '../../components/TableFilterBar';
import { exportRowsCsv } from '../../utils/tableExport';

const API = apiUrl('/api/config/lookups/');

/** Reusable list with independent add/delete — one item at a time. */
export default function LookupListSettings({ category, title, description, addLabel = 'Add Item' }) {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(i => String(i.label || i.value || '').toLowerCase().includes(q));
  }, [items, search]);

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
      <PageTableShell filters={
        <TableFilterBar
          filters={[{ key: 'search', label: 'Search', type: 'search', value: search, onChange: setSearch }]}
          showClear={!!search}
          onClear={() => setSearch('')}
          onExport={() => exportRowsCsv(`${category}-list.csv`, [{ label: 'Value', get: r => r.label || r.value }], filtered)}
          exportDisabled={!filtered.length}
        />
      }>
        <StyledTable>
          <StyledThead>
            <tr><StyledTh>Value</StyledTh><StyledTh align="center">Actions</StyledTh></tr>
          </StyledThead>
          <StyledTbody>
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/80">
                <td className="px-4 py-3">{item.label || item.value}</td>
                <td className="px-4 py-3 text-center">
                  <button type="button" onClick={() => remove(item.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {!filtered.length && <TableEmptyRow colSpan={2} message={items.length ? 'No items match search' : `No items yet — click ${addLabel}`} />}
          </StyledTbody>
        </StyledTable>
      </PageTableShell>

      <Modal open={modalOpen} title={addLabel} onClose={() => setModalOpen(false)}
        footer={<><button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
          <button onClick={save} disabled={saving || !value.trim()} className="px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50" style={{ backgroundColor: '#8B5A3C' }}>{saving ? 'Saving...' : 'Save'}</button></>}>
        <label className="text-sm font-medium">Name</label>
        <input className="w-full border rounded-lg p-2 mt-1" value={value} onChange={e => setValue(e.target.value)} placeholder="Enter value" autoFocus />
      </Modal>
    </div>
  );
}
