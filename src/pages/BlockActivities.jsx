import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SideNav } from '../components/SideNav';
import { getAuthHeaders } from '../utils/authHeaders';
import AuthMedia from '../components/AuthMedia';
import { Loader2, Sprout, Filter, Eye, X, Download } from 'lucide-react';

const API = `${import.meta.env.VITE_API_URL}/api/field-ops/block-activities/`;
const BLOCKS_API = `${import.meta.env.VITE_API_URL}/api/blocks/`;

const LOG_TYPES = [
  { value: '', label: 'All types' },
  { value: 'practice', label: 'Practice' },
  { value: 'input', label: 'Input' },
  { value: 'scouting', label: 'Scouting' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'other', label: 'Other' },
];

const SCOPES = [
  { value: '', label: 'All locations' },
  { value: 'block', label: 'Block-specific' },
  { value: 'farm', label: 'Whole farm' },
  { value: 'nursery', label: 'Nursery' },
  { value: 'processing', label: 'Processing area' },
  { value: 'other', label: 'Other location' },
];

function exportCsv(rows) {
  const headers = ['Date', 'Block', 'Type', 'Title', 'Details', 'Reported By', 'Notes'];
  const lines = rows.map(log => [
    log.activity_date,
    log.block_id,
    log.log_type,
    log.title,
    log.log_type === 'input' ? `${log.input_name || ''} ${log.quantity || ''} ${log.unit || ''}`.trim() : (log.practices || []).join('; '),
    log.reported_by_display || '',
    log.notes || '',
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
  const blob = new Blob([[headers.join(','), ...lines].join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `block-activities-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

export default function BlockActivities() {
  const [logs, setLogs] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [blockFilter, setBlockFilter] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const h = getAuthHeaders();
    const params = new URLSearchParams();
    if (blockFilter) params.set('block_id', blockFilter);
    if (scopeFilter) params.set('activity_scope', scopeFilter);
    if (logTypeFilter) params.set('log_type', logTypeFilter);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    const url = params.toString() ? `${API}?${params}` : API;
    const [l, b] = await Promise.all([
      fetch(url, { headers: h }).then(r => r.json()),
      fetch(BLOCKS_API, { headers: h }).then(r => r.json()),
    ]);
    setLogs(l.results || l || []);
    setBlocks(b.results || b || []);
    setLoading(false);
  }, [blockFilter, scopeFilter, logTypeFilter, dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  const typeColor = useMemo(() => ({
    practice: 'bg-green-50 text-green-800',
    input: 'bg-blue-50 text-blue-800',
    scouting: 'bg-yellow-50 text-yellow-800',
    maintenance: 'bg-gray-100 text-gray-700',
  }), []);

  return (
    <SideNav>
      <main className="p-6">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#4A3423]">Field Activities</h1>
            <p className="text-sm text-gray-500 mt-1">
              Farm operations on blocks or anywhere on the estate — feeds into Trace Report
            </p>
          </div>
          <button
            onClick={() => exportCsv(logs)}
            disabled={!logs.length}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm text-[#4A3423] disabled:opacity-40"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-white border rounded-xl">
          <Filter size={16} className="text-gray-400" />
          <select className="border rounded-lg px-3 py-2 text-sm" value={blockFilter} onChange={e => setBlockFilter(e.target.value)}>
            <option value="">All blocks</option>
            {blocks.map(b => <option key={b.block_id} value={b.block_id}>{b.block_id}</option>)}
          </select>
          <select className="border rounded-lg px-3 py-2 text-sm" value={scopeFilter} onChange={e => setScopeFilter(e.target.value)}>
            {SCOPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className="border rounded-lg px-3 py-2 text-sm" value={logTypeFilter} onChange={e => setLogTypeFilter(e.target.value)}>
            {LOG_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="From date" />
          <span className="text-gray-400 text-sm">to</span>
          <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} title="To date" />
          {(blockFilter || scopeFilter || logTypeFilter || dateFrom || dateTo) && (
            <button className="text-xs text-[#8B4513]" onClick={() => { setBlockFilter(''); setScopeFilter(''); setLogTypeFilter(''); setDateFrom(''); setDateTo(''); }}>
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#8B5A3C]" /></div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Activity / Input</th>
                  <th className="px-4 py-3">By</th>
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-t hover:bg-gray-50/50">
                    <td className="px-4 py-3 whitespace-nowrap">{log.activity_date}</td>
                    <td className="px-4 py-3 font-medium">
                      {log.block_id || log.location_label || (log.activity_scope === 'farm' ? 'Whole farm' : '—')}
                      {log.location_label && log.block_id ? ` · ${log.location_label}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${typeColor[log.log_type] || ''}`}>{log.log_type}</span>
                    </td>
                    <td className="px-4 py-3 font-medium max-w-xs truncate">{log.title}</td>
                    <td className="px-4 py-3">{log.reported_by_display || '—'}</td>
                    <td className="px-4 py-3">
                      {log.has_photo || log.photo_url ? (
                        <AuthMedia url={log.photo_url} alt="Activity photo" className="h-10 w-10 rounded object-cover border" linkLabel="" />
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDetail(log)} className="flex items-center gap-1 text-xs text-[#8B4513] font-medium">
                        <Eye size={14} /> Details
                      </button>
                    </td>
                  </tr>
                ))}
                {!logs.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      <Sprout className="mx-auto mb-2 opacity-40" size={32} />
                      No block activities match your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {detail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start p-5 border-b">
                <div>
                  <h2 className="text-lg font-bold text-[#4A3423]">{detail.title}</h2>
                  <p className="text-sm text-gray-500">{detail.block_id} · {detail.activity_date}</p>
                </div>
                <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <p><span className="font-medium">Type:</span> <span className="capitalize">{detail.log_type}</span></p>
                <p><span className="font-medium">Reported by:</span> {detail.reported_by_display || '—'}</p>
                {detail.log_type === 'input' && (
                  <p><span className="font-medium">Input:</span> {detail.input_name} {detail.quantity ? `— ${detail.quantity} ${detail.unit || ''}` : ''}</p>
                )}
                {detail.practices?.length > 0 && (
                  <p><span className="font-medium">Practices:</span> {detail.practices.join(', ')}</p>
                )}
                {detail.notes && <p><span className="font-medium">Notes:</span> {detail.notes}</p>}
                {detail.description && <p><span className="font-medium">Description:</span> {detail.description}</p>}
                {(detail.has_photo || detail.photo_url) && (
                  <div>
                    <p className="font-medium mb-2">Photo</p>
                    <AuthMedia url={detail.photo_url} alt="Activity evidence" className="max-h-48 rounded-lg border object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </SideNav>
  );
}
