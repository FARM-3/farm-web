import React, { useCallback, useEffect, useState } from 'react';
import { SideNav } from '../../components/SideNav';
import { getAuthHeaders } from '../../utils/authHeaders';
import { Loader2, RefreshCw, Warehouse } from 'lucide-react';
import { PageTableShell, StyledTable, StyledThead, StyledTh, StyledTbody, TableEmptyRow } from '../../components/PageTableShell';
import QrLabelActions from '../../components/QrLabelActions';
import { API_ENDPOINTS } from '../../services/ApiConfig';
import TableFilterBar from '../../components/TableFilterBar';
import { exportRowsCsv } from '../../utils/tableExport';

const API = `${import.meta.env.VITE_API_URL}/api/export/inventory/`;
const SYNC_API = `${API}sync-from-bagging/`;

export default function ExportInventory() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  const displayedLots = lots.filter(l => {
    if (gradeFilter && l.grade !== gradeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return [l.lot_id, l.source_harvest_id, l.coffee_type, l.grade].some(v => String(v || '').toLowerCase().includes(q));
    }
    return true;
  });
  const gradeOptions = [...new Set(lots.map(l => l.grade).filter(Boolean))].sort();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `${API}?status=${statusFilter}` : API;
      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      setLots(data.results || data || []);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const syncFromBagging = async () => {
    setSyncing(true);
    await fetch(SYNC_API, { method: 'POST', headers: getAuthHeaders() });
    setSyncing(false);
    load();
  };

  const statusColor = (s) => ({
    in_stock: 'bg-green-100 text-green-800',
    reserved: 'bg-amber-100 text-amber-800',
    dispatched: 'bg-blue-100 text-blue-800',
    sold: 'bg-gray-100 text-gray-600',
  }[s] || 'bg-yellow-100 text-yellow-800');

  return (
    <SideNav>
      <main className="p-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-bold text-[#4A3423]">Inventory</h1>
            <p className="text-sm text-gray-500">Live stock — auto-synced when bagging is saved</p>
          </div>
          <button onClick={syncFromBagging} disabled={syncing} className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm hover:bg-gray-50" title="Backfill older bagging records">
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} /> Backfill sync
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          {['', 'in_stock', 'reserved', 'dispatched', 'sold'].map(s => (
            <button
              key={s || 'all'}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs border ${statusFilter === s ? 'bg-[#8B5A3C] text-white border-[#8B5A3C]' : 'bg-white text-gray-600'}`}
            >
              {s ? s.replace('_', ' ') : 'All'}
            </button>
          ))}
        </div>

        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#8B5A3C]" /></div> : (
          <PageTableShell filters={
            <TableFilterBar
              filters={[
                { key: 'search', label: 'Search', type: 'search', value: search, onChange: setSearch, placeholder: 'Lot, harvest, grade...' },
                { key: 'grade', label: 'Grade', type: 'select', value: gradeFilter, onChange: setGradeFilter, options: gradeOptions.map(g => ({ value: g, label: g })) },
              ]}
              showClear={!!(search || gradeFilter)}
              onClear={() => { setSearch(''); setGradeFilter(''); }}
              onExport={() => exportRowsCsv('inventory.csv', [
                { label: 'Lot', get: r => r.lot_id }, { label: 'Harvest', get: r => r.source_harvest_id },
                { label: 'Coffee', get: r => r.coffee_type }, { label: 'Grade', get: r => r.grade },
                { label: 'Kg', get: r => r.total_kg }, { label: 'Bags', get: r => r.bags }, { label: 'Status', get: r => r.status },
              ], displayedLots)}
              exportDisabled={!displayedLots.length}
            />
          }>
            <StyledTable minWidth="900px">
              <StyledThead>
                <tr>
                  <StyledTh>Lot</StyledTh>
                  <StyledTh>Harvest</StyledTh>
                  <StyledTh>Coffee / Grade</StyledTh>
                  <StyledTh align="right">Kg</StyledTh>
                  <StyledTh align="center">Bags</StyledTh>
                  <StyledTh align="center">Moisture</StyledTh>
                  <StyledTh>Warehouse</StyledTh>
                  <StyledTh align="center">QR label</StyledTh>
                  <StyledTh>Status</StyledTh>
                </tr>
              </StyledThead>
              <StyledTbody>
                {displayedLots.map(l => {
                  const payload = l.qr_code || (l.lot_id ? `LOT:${l.lot_id}` : '');
                  const baggingQrUrl = l.bagging_id ? `${API_ENDPOINTS.BAGGING}${l.bagging_id}/qr-image/` : null;
                  return (
                    <tr key={l.id || l.lot_id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 font-medium">{l.lot_id}</td>
                      <td className="px-4 py-3 text-gray-600">{l.source_harvest_id || '—'}</td>
                      <td className="px-4 py-3">{l.coffee_type || '—'}{l.grade ? ` · ${l.grade}` : ''}</td>
                      <td className="px-4 py-3 text-right">{Number(l.total_kg).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">{l.bags}</td>
                      <td className="px-4 py-3 text-center">{l.moisture_pct ? `${l.moisture_pct}%` : '—'}</td>
                      <td className="px-4 py-3">{l.warehouse_name || '—'}</td>
                      <td className="px-4 py-3">
                        {baggingQrUrl ? (
                          <QrLabelActions qrImageUrl={baggingQrUrl} label={`Lot ${l.lot_id}`} payload={payload} compact />
                        ) : payload ? (
                          <span className="text-xs font-mono text-gray-500">{payload}</span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${statusColor(l.status)}`}>{l.status?.replace('_', ' ')}</span></td>
                    </tr>
                  );
                })}
                {!displayedLots.length && <TableEmptyRow colSpan={9} message={lots.length ? 'No lots match filters' : 'No lots — save a bagging record to auto-populate'} icon={Warehouse} />}
              </StyledTbody>
            </StyledTable>
          </PageTableShell>
        )}
      </main>
    </SideNav>
  );
}
