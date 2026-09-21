import React, { useCallback, useEffect, useState } from 'react';
import { SideNav } from '../../components/SideNav';
import { getAuthHeaders } from '../../utils/authHeaders';
import { Loader2, Plus, RefreshCw, Warehouse } from 'lucide-react';

const API = `${import.meta.env.VITE_API_URL}/api/export/inventory/`;
const SYNC_API = `${API}sync-from-bagging/`;

export default function ExportInventory() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API, { headers: getAuthHeaders() });
      const data = await res.json();
      setLots(data.results || data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const syncFromBagging = async () => {
    setSyncing(true);
    await fetch(SYNC_API, { method: 'POST', headers: getAuthHeaders() });
    setSyncing(false);
    load();
  };

  const statusColor = (s) => ({ in_stock: 'bg-green-100 text-green-800', dispatched: 'bg-blue-100 text-blue-800', sold: 'bg-gray-100 text-gray-600' }[s] || 'bg-yellow-100 text-yellow-800');

  return (
    <SideNav>
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#4A3423]">Inventory</h1>
            <p className="text-sm text-gray-500">Stock lots from processing bagging</p>
          </div>
          <button onClick={syncFromBagging} disabled={syncing} className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} /> Sync from Bagging
          </button>
        </div>

        {loading ? <Loader2 className="animate-spin" /> : (
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr className="text-left text-gray-500">
                <th className="px-4 py-3">Lot</th><th className="px-4 py-3">Coffee</th><th className="px-4 py-3">Kg</th>
                <th className="px-4 py-3">Bags</th><th className="px-4 py-3">Moisture</th><th className="px-4 py-3">Status</th>
              </tr></thead>
              <tbody>
                {lots.map(l => (
                  <tr key={l.id || l.lot_id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{l.lot_id}</td>
                    <td className="px-4 py-3">{l.coffee_type || '—'}</td>
                    <td className="px-4 py-3">{Number(l.total_kg).toLocaleString()}</td>
                    <td className="px-4 py-3">{l.bags}</td>
                    <td className="px-4 py-3">{l.moisture_pct ? `${l.moisture_pct}%` : '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${statusColor(l.status)}`}>{l.status?.replace('_', ' ')}</span></td>
                  </tr>
                ))}
                {!lots.length && <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400"><Warehouse className="mx-auto mb-2" />No lots — sync from bagging to populate</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </SideNav>
  );
}
