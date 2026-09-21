import React, { useCallback, useEffect, useState } from 'react';
import { SideNav } from '../../components/SideNav';
import { getAuthHeaders } from '../../utils/authHeaders';
import { Loader2, FileSearch, Plus } from 'lucide-react';

const TRACE_API = `${import.meta.env.VITE_API_URL}/api/export/trace-records/`;
const HARVEST_API = `${import.meta.env.VITE_API_URL}/api/aggregation/farmer-harvest/`;

export default function ExportTraceReport() {
  const [records, setRecords] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [selected, setSelected] = useState('');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const h = getAuthHeaders();
    const [r, hv] = await Promise.all([
      fetch(TRACE_API, { headers: h }).then(res => res.json()),
      fetch(HARVEST_API, { headers: h }).then(res => res.json()),
    ]);
    setRecords(r.results || r || []);
    setHarvests(hv.results || hv || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    if (!selected) return;
    const res = await fetch(`${TRACE_API}from-harvest/`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ harvest_id: selected }),
    });
    const data = await res.json();
    setDetail(data);
    load();
  };

  return (
    <SideNav>
      <main className="p-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-[#4A3423] mb-1">Trace Report</h1>
        <p className="text-sm text-gray-500 mb-6">Harvest lineage for export compliance — field to bag.</p>

        <div className="bg-white rounded-xl border p-4 mb-6 flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium">Harvest</label>
            <select className="w-full border rounded-lg p-2 mt-1" value={selected} onChange={e => setSelected(e.target.value)}>
              <option value="">Select harvest</option>
              {harvests.map(h => <option key={h.harvest_id} value={h.harvest_id}>{h.harvest_id} — {h.name}</option>)}
            </select>
          </div>
          <button onClick={generate} disabled={!selected} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50" style={{ backgroundColor: '#8B5A3C' }}>
            <Plus size={16} /> Generate
          </button>
        </div>

        {detail && (
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><FileSearch size={18} /> {detail.record_id || detail.harvest_id}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Supplier</span><p className="font-medium">{detail.supplier_name || '—'}</p></div>
              <div><span className="text-gray-500">Coffee</span><p className="font-medium">{detail.coffee_type || '—'}</p></div>
              <div><span className="text-gray-500">GPS</span><p className="font-medium">{detail.origin_gps || '—'}</p></div>
              <div><span className="text-gray-500">Status</span><p className="font-medium capitalize">{detail.compliance_status}</p></div>
            </div>
            {detail.trace_data && (
              <pre className="mt-4 p-3 bg-gray-50 rounded-lg text-xs overflow-auto max-h-64">{JSON.stringify(detail.trace_data, null, 2)}</pre>
            )}
          </div>
        )}

        {loading ? <Loader2 className="animate-spin" /> : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr className="text-left text-gray-500">
                <th className="px-4 py-3">Record</th><th className="px-4 py-3">Harvest</th><th className="px-4 py-3">Supplier</th><th className="px-4 py-3">Status</th>
              </tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setDetail(r)}>
                    <td className="px-4 py-3">{r.record_id}</td>
                    <td className="px-4 py-3">{r.harvest_id}</td>
                    <td className="px-4 py-3">{r.supplier_name || '—'}</td>
                    <td className="px-4 py-3 capitalize">{r.compliance_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </SideNav>
  );
}
