import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../../components/settings/Modal';
import { getAuthHeaders } from '../../utils/authHeaders';
import { PageTableShell, StyledTable, StyledThead, StyledTh, StyledTbody, TableEmptyRow } from '../../components/PageTableShell';
import TableFilterBar from '../../components/TableFilterBar';
import { exportRowsCsv, uniqueSorted } from '../../utils/tableExport';

const API = `${import.meta.env.VITE_API_URL}/api/customers/`;

export default function CustomersSettings() {
  const [customers, setCustomers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', organisation: '', phone: '', email: '', city: '' });
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  const cityOptions = useMemo(() => uniqueSorted(customers.map(c => c.city)), [customers]);
  const filtered = useMemo(() => customers.filter(c => {
    if (cityFilter && c.city !== cityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return [c.name, c.phone, c.customer_id, c.organisation].some(v => String(v || '').toLowerCase().includes(q));
    }
    return true;
  }), [customers, search, cityFilter]);

  const load = useCallback(async () => {
    const res = await fetch(API, { headers: getAuthHeaders() });
    const data = await res.json();
    setCustomers(data.results || data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    await fetch(API, { method: 'POST', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setModalOpen(false);
    setForm({ name: '', organisation: '', phone: '', email: '', city: '' });
    load();
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div><p className="text-sm text-gray-500">Buyers for sales and dispatch — add each independently</p></div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1 px-4 py-2 rounded-xl text-white text-sm shadow-lg hover:shadow-xl transition" style={{ backgroundColor: '#8B5A3C' }}><Plus size={16} /> Add Customer</button>
      </div>
      <PageTableShell filters={
        <TableFilterBar
          filters={[
            { key: 'search', label: 'Search', type: 'search', value: search, onChange: setSearch, placeholder: 'Name, phone, ID...' },
            { key: 'city', label: 'City', type: 'select', value: cityFilter, onChange: setCityFilter, options: cityOptions.map(c => ({ value: c, label: c })) },
          ]}
          showClear={!!(search || cityFilter)}
          onClear={() => { setSearch(''); setCityFilter(''); }}
          onExport={() => exportRowsCsv('customers.csv', [
            { label: 'ID', get: r => r.customer_id },
            { label: 'Name', get: r => r.name },
            { label: 'Phone', get: r => r.phone },
            { label: 'City', get: r => r.city },
          ], filtered)}
          exportDisabled={!filtered.length}
        />
      }>
        <StyledTable>
          <StyledThead>
            <tr>
              <StyledTh>ID</StyledTh>
              <StyledTh>Name</StyledTh>
              <StyledTh>Phone</StyledTh>
              <StyledTh>City</StyledTh>
            </tr>
          </StyledThead>
          <StyledTbody>
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50/80">
                <td className="px-4 py-3">{c.customer_id}</td>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.phone || '—'}</td>
                <td className="px-4 py-3">{c.city || '—'}</td>
              </tr>
            ))}
            {!filtered.length && <TableEmptyRow colSpan={4} message={customers.length ? 'No customers match filters' : 'No customers yet — add your first buyer'} />}
          </StyledTbody>
        </StyledTable>
      </PageTableShell>
      <Modal open={modalOpen} title="Add Customer" onClose={() => setModalOpen(false)}
        footer={<><button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
          <button onClick={save} className="px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#8B5A3C' }}>Save</button></>}>
        {['name', 'organisation', 'phone', 'email', 'city'].map(k => (
          <div key={k} className="mb-3"><label className="text-sm capitalize">{k}</label>
            <input className="w-full border rounded-lg p-2 mt-1" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>
        ))}
      </Modal>
    </div>
  );
}
