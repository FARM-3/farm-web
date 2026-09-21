import React, { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../../components/settings/Modal';
import { getAuthHeaders } from '../../utils/authHeaders';

const API = `${import.meta.env.VITE_API_URL}/api/customers/`;

export default function CustomersSettings() {
  const [customers, setCustomers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', organisation: '', phone: '', email: '', city: '' });

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
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between mb-4">
        <div><p className="text-sm text-gray-500">Buyers for sales and dispatch — add each independently</p></div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-sm" style={{ backgroundColor: '#8B5A3C' }}><Plus size={16} /> Add</button>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="border-b text-left text-gray-500"><th className="py-2">ID</th><th>Name</th><th>Phone</th><th>City</th></tr></thead>
        <tbody>{customers.map(c => (
          <tr key={c.id} className="border-b"><td className="py-2">{c.customer_id}</td><td>{c.name}</td><td>{c.phone || '—'}</td><td>{c.city || '—'}</td></tr>
        ))}</tbody>
      </table>
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
