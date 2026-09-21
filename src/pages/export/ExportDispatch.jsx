import React, { useCallback, useEffect, useState } from 'react';
import { SideNav } from '../../components/SideNav';
import Modal from '../../components/settings/Modal';
import { getAuthHeaders } from '../../utils/authHeaders';
import { Loader2, Plus, Truck } from 'lucide-react';

const DISPATCH_API = `${import.meta.env.VITE_API_URL}/api/export/dispatch/`;
const LOTS_API = `${import.meta.env.VITE_API_URL}/api/export/inventory/`;
const CUSTOMERS_API = `${import.meta.env.VITE_API_URL}/api/customers/`;

const empty = { lot: '', buyer_name: '', buyer_contact: '', quantity_kg: '', bags: '', vehicle: '', driver: '', destination: '', dispatch_date: new Date().toISOString().slice(0, 10) };

export default function ExportDispatch() {
  const [dispatches, setDispatches] = useState([]);
  const [lots, setLots] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const load = useCallback(async () => {
    setLoading(true);
    const h = getAuthHeaders();
    const [d, l, c] = await Promise.all([
      fetch(DISPATCH_API, { headers: h }).then(r => r.json()),
      fetch(LOTS_API, { headers: h }).then(r => r.json()),
      fetch(CUSTOMERS_API, { headers: h }).then(r => r.json()),
    ]);
    setDispatches(d.results || d || []);
    setLots((l.results || l || []).filter(x => x.status === 'in_stock'));
    setCustomers(c.results || c || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const lot = lots.find(x => x.id === +form.lot);
    const dispatch_id = `DSP-${Date.now().toString().slice(-8)}`;
    await fetch(DISPATCH_API, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, lot: +form.lot, dispatch_id, quantity_kg: form.quantity_kg || lot?.total_kg, bags: form.bags || lot?.bags }),
    });
    setModalOpen(false);
    setForm(empty);
    load();
  };

  const statusColor = { pending: 'bg-yellow-100 text-yellow-800', in_transit: 'bg-blue-100 text-blue-800', delivered: 'bg-green-100 text-green-800' };

  return (
    <SideNav>
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#4A3423]">Dispatch</h1>
            <p className="text-sm text-gray-500">Shipment notes linked to inventory lots</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#8B5A3C' }}>
            <Plus size={16} /> New Dispatch
          </button>
        </div>

        {loading ? <Loader2 className="animate-spin" /> : (
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr className="text-left text-gray-500">
                <th className="px-4 py-3">ID</th><th className="px-4 py-3">Lot</th><th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Kg</th><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th>
              </tr></thead>
              <tbody>
                {dispatches.map(d => (
                  <tr key={d.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{d.dispatch_id}</td>
                    <td className="px-4 py-3">{d.lot_id_display || d.lot}</td>
                    <td className="px-4 py-3">{d.buyer_name}</td>
                    <td className="px-4 py-3">{Number(d.quantity_kg).toLocaleString()}</td>
                    <td className="px-4 py-3">{d.vehicle || '—'}</td>
                    <td className="px-4 py-3">{d.dispatch_date}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[d.status] || ''}`}>{d.status}</span></td>
                  </tr>
                ))}
                {!dispatches.length && <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400"><Truck className="mx-auto mb-2" />No dispatches yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        <Modal open={modalOpen} title="New Dispatch" onClose={() => setModalOpen(false)}
          footer={<><button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
            <button onClick={save} className="px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#8B5A3C' }}>Save Dispatch</button></>}>
          <label className="text-sm font-medium">Lot</label>
          <select className="w-full border rounded-lg p-2 mb-3 mt-1" value={form.lot} onChange={e => setForm(f => ({ ...f, lot: e.target.value }))}>
            <option value="">Select lot</option>
            {lots.map(l => <option key={l.id} value={l.id}>{l.lot_id} — {l.total_kg} kg</option>)}
          </select>
          <label className="text-sm font-medium">Buyer</label>
          <select className="w-full border rounded-lg p-2 mb-3 mt-1" value={form.buyer_name} onChange={e => {
            const c = customers.find(x => x.name === e.target.value);
            setForm(f => ({ ...f, buyer_name: e.target.value, buyer_contact: c?.phone || '' }));
          }}>
            <option value="">Select customer</option>
            {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            {['vehicle', 'driver', 'destination', 'dispatch_date'].map(k => (
              <div key={k}><label className="text-sm capitalize">{k.replace('_', ' ')}</label>
                <input type={k.includes('date') ? 'date' : 'text'} className="w-full border rounded-lg p-2 mt-1" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>
            ))}
          </div>
        </Modal>
      </main>
    </SideNav>
  );
}
