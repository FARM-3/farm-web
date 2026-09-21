import React, { useCallback, useEffect, useState } from 'react';
import { SideNav } from '../components/SideNav';
import { getAuthHeaders } from '../utils/authHeaders';
import { Loader2, Sprout, Filter } from 'lucide-react';

const API = `${import.meta.env.VITE_API_URL}/api/field-ops/block-activities/`;
const BLOCKS_API = `${import.meta.env.VITE_API_URL}/api/blocks/`;

export default function BlockActivities() {
  const [logs, setLogs] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [blockFilter, setBlockFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const h = getAuthHeaders();
    const url = blockFilter ? `${API}?block_id=${encodeURIComponent(blockFilter)}` : API;
    const [l, b] = await Promise.all([
      fetch(url, { headers: h }).then(r => r.json()),
      fetch(BLOCKS_API, { headers: h }).then(r => r.json()),
    ]);
    setLogs(l.results || l || []);
    setBlocks(b.results || b || []);
    setLoading(false);
  }, [blockFilter]);

  useEffect(() => { load(); }, [load]);

  const typeColor = {
    practice: 'bg-green-50 text-green-800',
    input: 'bg-blue-50 text-blue-800',
    scouting: 'bg-yellow-50 text-yellow-800',
    maintenance: 'bg-gray-100 text-gray-700',
  };

  return (
    <SideNav>
      <main className="p-6">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#4A3423]">Block Activities</h1>
            <p className="text-sm text-gray-500 mt-1">
              Practices, fertilizer & pesticide applications logged per block — feeds into Trace Report
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={blockFilter}
              onChange={e => setBlockFilter(e.target.value)}
            >
              <option value="">All blocks</option>
              {blocks.map(b => (
                <option key={b.block_id} value={b.block_id}>{b.block_id}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#8B5A3C]" /></div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Block</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Activity / Input</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">By</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-t hover:bg-gray-50/50">
                    <td className="px-4 py-3 whitespace-nowrap">{log.activity_date}</td>
                    <td className="px-4 py-3 font-medium">{log.block_id}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${typeColor[log.log_type] || ''}`}>
                        {log.log_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{log.title}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {log.log_type === 'input' && log.input_name && (
                        <span>{log.input_name}{log.quantity ? ` — ${log.quantity} ${log.unit || ''}` : ''}</span>
                      )}
                      {log.log_type === 'practice' && log.practices?.length > 0 && (
                        <span>{log.practices.join(', ')}</span>
                      )}
                      {log.notes && <p className="text-xs text-gray-400 mt-0.5">{log.notes}</p>}
                    </td>
                    <td className="px-4 py-3">{log.reported_by_display || '—'}</td>
                  </tr>
                ))}
                {!logs.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      <Sprout className="mx-auto mb-2 opacity-40" size={32} />
                      No block activities yet — log from mobile Field Ops
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </SideNav>
  );
}
