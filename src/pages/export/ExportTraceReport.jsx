import React, { useCallback, useEffect, useState } from 'react';
import { SideNav } from '../../components/SideNav';
import { getAuthHeaders } from '../../utils/authHeaders';
import { Loader2, FileSearch, Plus, AlertCircle, CheckCircle2, Circle, SkipForward } from 'lucide-react';

const TRACE_API = `${import.meta.env.VITE_API_URL}/api/export/trace-records/`;
const HARVEST_API = `${import.meta.env.VITE_API_URL}/api/aggregation/farmer-harvest/`;

const STAGE_STATUS = {
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  in_progress: { label: 'In progress', color: 'bg-amber-100 text-amber-800', icon: Loader2 },
  skipped: { label: 'Skipped (optional)', color: 'bg-gray-100 text-gray-600', icon: SkipForward },
  pending: { label: 'Pending', color: 'bg-gray-50 text-gray-400', icon: Circle },
};

function StageTimeline({ stages }) {
  if (!stages?.length) return null;
  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-semibold text-[#4A3423] mb-1">Processing timeline</h3>
      <p className="text-xs text-gray-500 mb-4">
        Standard order: QC → Processing → Drying → Hulling (optional) → Bagging. Some suppliers skip hulling and bag parchment or pre-hulled coffee directly.
      </p>
      <ol className="space-y-2">
        {stages.map((stage, i) => {
          const meta = STAGE_STATUS[stage.status] || STAGE_STATUS.pending;
          const Icon = meta.icon;
          return (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8B5A3C] text-white text-xs flex items-center justify-center font-semibold">{i + 1}</span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{stage.name}</span>
                  {stage.optional && <span className="text-xs text-gray-400">(optional)</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${meta.color}`}>
                    <Icon size={12} className="inline mr-1" />{meta.label}
                  </span>
                  {stage.date && <span className="text-xs text-gray-400">{stage.date}</span>}
                </div>
                {stage.note && <p className="text-xs text-gray-500 mt-0.5">{stage.note}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function ExportTraceReport() {
  const [records, setRecords] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [selected, setSelected] = useState('');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

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
    setGenerating(true);
    setError('');
    try {
      const res = await fetch(`${TRACE_API}from-harvest/`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ harvest_id: selected }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.detail || data.error || data.message || `Generate failed (${res.status})`;
        setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        return;
      }
      setDetail(data);
      await load();
    } catch (err) {
      setError(err.message || 'Could not generate trace report');
    } finally {
      setGenerating(false);
    }
  };

  const traceData = detail?.trace_data || detail;

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
          <button onClick={generate} disabled={!selected || generating} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50" style={{ backgroundColor: '#8B5A3C' }}>
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-700">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {detail && (
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><FileSearch size={18} /> {detail.record_id || detail.harvest_id}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Supplier</span><p className="font-medium">{detail.supplier_name || traceData?.farmer_name || '—'}</p></div>
              <div><span className="text-gray-500">Coffee</span><p className="font-medium">{detail.coffee_type || '—'}</p></div>
              <div><span className="text-gray-500">GPS</span><p className="font-medium">{detail.origin_gps || '—'}</p></div>
              <div><span className="text-gray-500">Status</span><p className="font-medium capitalize">{detail.compliance_status}</p></div>
              <div><span className="text-gray-500">Current stage</span><p className="font-medium">{traceData?.current_stage || '—'}</p></div>
              <div><span className="text-gray-500">Output weight</span><p className="font-medium">{detail.total_kg != null ? `${detail.total_kg} kg` : '—'}</p></div>
            </div>

            <StageTimeline stages={traceData?.stages} />

            {traceData?.field_history && (
              <div className="mt-6 border-t pt-4">
                <h3 className="font-semibold text-[#4A3423] mb-3">Field history (block)</h3>
                {traceData.field_history.practices_summary?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase mb-2">Practices</p>
                    <ul className="space-y-1 text-sm">
                      {traceData.field_history.practices_summary.map((p, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-gray-400">{p.date}</span>
                          <span>{p.practices?.join(', ') || p.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {traceData.field_history.inputs_summary?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase mb-2">Inputs applied</p>
                    <ul className="space-y-1 text-sm">
                      {traceData.field_history.inputs_summary.map((inp, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-gray-400">{inp.date}</span>
                          <span>{inp.input} ({inp.type}){inp.quantity ? ` — ${inp.quantity} ${inp.unit || ''}` : ''}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {traceData.field_history.surveillance_reports?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-2">Surveillance notes</p>
                    <ul className="space-y-2 text-sm">
                      {traceData.field_history.surveillance_reports.map((s, i) => (
                        <li key={i} className="p-2 bg-amber-50 rounded border border-amber-100">
                          <span className="font-medium capitalize">{s.severity}</span> — {s.title}
                          <p className="text-xs text-gray-600 mt-0.5">{s.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {traceData && (
              <details className="mt-4">
                <summary className="text-xs text-gray-500 cursor-pointer">Full trace JSON</summary>
                <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs overflow-auto max-h-64">{JSON.stringify(traceData, null, 2)}</pre>
              </details>
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
                  <tr key={r.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => { setDetail(r); setError(''); }}>
                    <td className="px-4 py-3">{r.record_id}</td>
                    <td className="px-4 py-3">{r.harvest_id}</td>
                    <td className="px-4 py-3">{r.supplier_name || '—'}</td>
                    <td className="px-4 py-3 capitalize">{r.compliance_status}</td>
                  </tr>
                ))}
                {!records.length && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No trace records yet — select a harvest and click Generate</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </SideNav>
  );
}
