import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SideNav } from '../../components/SideNav';
import Modal from '../../components/settings/Modal';
import { getAuthHeaders } from '../../utils/authHeaders';
import { Loader2, Plus, Truck, FileText } from 'lucide-react';
import { PageTableShell, StyledTable, StyledThead, StyledTh, StyledTbody, TableEmptyRow } from '../../components/PageTableShell';
import TableFilterBar from '../../components/TableFilterBar';
import { exportRowsCsv } from '../../utils/tableExport';

const API_BASE = import.meta.env.VITE_API_URL;
const DISPATCH_API = `${API_BASE}/api/export/dispatch/`;
const LOTS_API = `${API_BASE}/api/export/inventory/`;
const CUSTOMERS_API = `${API_BASE}/api/customers/`;
const SALES_API = `${API_BASE}/api/sales/`;

const empty = {
  lot: '', sale: '', buyer_name: '', buyer_contact: '',
  quantity_kg: '', bags: '', vehicle: '', driver: '', destination: '',
  dispatch_date: new Date().toISOString().slice(0, 10), proof_notes: '',
};

export default function ExportDispatch() {
  const [dispatches, setDispatches] = useState([]);
  const [lots, setLots] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => dispatches.filter(d => {
    if (statusFilter && d.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return [d.dispatch_id, d.buyer_name, d.lot_id_display, d.vehicle].some(v => String(v || '').toLowerCase().includes(q));
    }
    return true;
  }), [dispatches, search, statusFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    const h = getAuthHeaders();
    const [d, l, c, s] = await Promise.all([
      fetch(DISPATCH_API, { headers: h }).then(r => r.json()),
      fetch(LOTS_API, { headers: h }).then(r => r.json()),
      fetch(CUSTOMERS_API, { headers: h }).then(r => r.json()),
      fetch(SALES_API, { headers: h }).then(r => r.json()),
    ]);
    setDispatches(d.results || d || []);
    setLots((l.results || l || []).filter(x => x.status === 'in_stock' || x.status === 'reserved'));
    setCustomers(c.results || c || []);
    setSales(s.results || s || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const selectedLot = lots.find(x => String(x.id) === String(form.lot));

  const onLotChange = (lotId) => {
    const lot = lots.find(x => String(x.id) === String(lotId));
    setForm(f => ({
      ...f,
      lot: lotId,
      quantity_kg: lot ? String(lot.total_kg) : '',
      bags: lot ? String(lot.bags) : '',
    }));
  };

  const save = async () => {
    const lot = selectedLot;
    const dispatch_id = `DSP-${Date.now().toString().slice(-8)}`;
    const payload = {
      ...form,
      lot: +form.lot,
      dispatch_id,
      sale: form.sale ? +form.sale : null,
      quantity_kg: form.quantity_kg || lot?.total_kg,
      bags: form.bags || lot?.bags,
    };
    await fetch(DISPATCH_API, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setModalOpen(false);
    setForm(empty);
    load();
  };

  const pdfUrl = (id) => `${DISPATCH_API}${id}/pdf/`;

  const statusColor = { pending: 'bg-yellow-100 text-yellow-800', in_transit: 'bg-blue-100 text-blue-800', delivered: 'bg-green-100 text-green-800' };

  return (
    <SideNav>
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#4A3423]">Dispatch</h1>
            <p className="text-sm text-gray-500">Shipment notes — partial dispatch supported, links to sales</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#8B5A3C' }}>
            <Plus size={16} /> New Dispatch
          </button>
        </div>

        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#8B5A3C]" /></div> : (
          <PageTableShell filters={
            <TableFilterBar
              filters={[
                { key: 'search', label: 'Search', type: 'search', value: search, onChange: setSearch, placeholder: 'Dispatch ID, buyer, lot...' },
                { key: 'status', label: 'Status', type: 'select', value: statusFilter, onChange: setStatusFilter, options: [
                  { value: 'pending', label: 'Pending' }, { value: 'in_transit', label: 'In transit' }, { value: 'delivered', label: 'Delivered' },
                ]},
              ]}
              showClear={!!(search || statusFilter)}
              onClear={() => { setSearch(''); setStatusFilter(''); }}
              onExport={() => exportRowsCsv('dispatch.csv', [
                { label: 'ID', get: r => r.dispatch_id }, { label: 'Lot', get: r => r.lot_id_display || r.lot },
                { label: 'Buyer', get: r => r.buyer_name }, { label: 'Kg', get: r => r.quantity_kg },
                { label: 'Date', get: r => r.dispatch_date }, { label: 'Status', get: r => r.status },
              ], filtered)}
              exportDisabled={!filtered.length}
            />
          }>
            <StyledTable minWidth="900px">
              <StyledThead>
                <tr>
                  <StyledTh>ID</StyledTh>
                  <StyledTh>Lot</StyledTh>
                  <StyledTh>Buyer</StyledTh>
                  <StyledTh>Sale</StyledTh>
                  <StyledTh align="right">Kg</StyledTh>
                  <StyledTh>Vehicle</StyledTh>
                  <StyledTh>Date</StyledTh>
                  <StyledTh>Status</StyledTh>
                  <StyledTh>Note</StyledTh>
                </tr>
              </StyledThead>
              <StyledTbody>
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 font-medium">
                      <a href={pdfUrl(d.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#8B5A3C] hover:underline">
                        <FileText size={14} /> {d.dispatch_id}
                      </a>
                    </td>
                    <td className="px-4 py-3">{d.lot_id_display || d.lot}</td>
                    <td className="px-4 py-3">{d.buyer_name}</td>
                    <td className="px-4 py-3 text-gray-600">{d.sale_display || '—'}</td>
                    <td className="px-4 py-3">{Number(d.quantity_kg).toLocaleString()}</td>
                    <td className="px-4 py-3">{d.vehicle || '—'}</td>
                    <td className="px-4 py-3">{d.dispatch_date}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[d.status] || ''}`}>{d.status}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate" title={d.proof_notes}>{d.proof_notes || '—'}</td>
                  </tr>
                ))}
                {!filtered.length && <TableEmptyRow colSpan={9} message={dispatches.length ? 'No dispatches match filters' : 'No dispatches yet'} icon={Truck} />}
              </StyledTbody>
            </StyledTable>
          </PageTableShell>
        )}

        <Modal open={modalOpen} title="New Dispatch" onClose={() => setModalOpen(false)}
          footer={<><button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
            <button onClick={save} disabled={!form.lot || !form.buyer_name} className="px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50" style={{ backgroundColor: '#8B5A3C' }}>Save Dispatch</button></>}>
          <label className="text-sm font-medium">Lot (in stock)</label>
          <select className="w-full border rounded-lg p-2 mb-3 mt-1" value={form.lot} onChange={e => onLotChange(e.target.value)}>
            <option value="">Select lot</option>
            {lots.map(l => <option key={l.id} value={l.id}>{l.lot_id} — {l.total_kg} kg ({l.bags} bags)</option>)}
          </select>

          {selectedLot && (
            <p className="text-xs text-gray-500 mb-3">Available: {selectedLot.total_kg} kg / {selectedLot.bags} bags — enter less for partial dispatch</p>
          )}

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-sm font-medium">Quantity (kg)</label>
              <input type="number" className="w-full border rounded-lg p-2 mt-1" value={form.quantity_kg} onChange={e => setForm(f => ({ ...f, quantity_kg: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Bags</label>
              <input type="number" className="w-full border rounded-lg p-2 mt-1" value={form.bags} onChange={e => setForm(f => ({ ...f, bags: e.target.value }))} />
            </div>
          </div>

          <label className="text-sm font-medium">Link to sale (optional)</label>
          <select className="w-full border rounded-lg p-2 mb-3 mt-1" value={form.sale} onChange={e => {
            const sale = sales.find(x => String(x.id) === e.target.value);
            setForm(f => ({
              ...f,
              sale: e.target.value,
              buyer_name: sale?.customer_name || f.buyer_name,
            }));
          }}>
            <option value="">No sale link</option>
            {sales.map(s => <option key={s.id} value={s.id}>{s.customer_name || s.first_name} — {s.item} ({s.total_amount})</option>)}
          </select>

          <label className="text-sm font-medium">Buyer</label>
          <select className="w-full border rounded-lg p-2 mb-3 mt-1" value={form.buyer_name} onChange={e => {
            const c = customers.find(x => x.name === e.target.value);
            setForm(f => ({ ...f, buyer_name: e.target.value, buyer_contact: c?.phone || '' }));
          }}>
            <option value="">Select customer</option>
            {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>

          <label className="text-sm font-medium">Gate proof notes</label>
          <textarea className="w-full border rounded-lg p-2 mb-3 mt-1" rows={2} placeholder="Signature ref, photo note, etc." value={form.proof_notes} onChange={e => setForm(f => ({ ...f, proof_notes: e.target.value }))} />

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
