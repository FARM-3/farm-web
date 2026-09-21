import React, { useCallback, useEffect, useState } from 'react';
import { SideNav } from '../components/SideNav';
import { getAuthHeaders } from '../utils/authHeaders';
import { API_ENDPOINTS } from '../services/ApiConfig';
import { Loader2, MapPin, RefreshCw } from 'lucide-react';

export default function Blocks() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_ENDPOINTS.BLOCKS, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setBlocks(data.results || data || []);
    } catch (err) {
      setError(err.message || 'Failed to load blocks');
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SideNav>
      <main className="p-6">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#4A3423]">Farm Blocks</h1>
            <p className="text-sm text-gray-500 mt-1">
              Block registry synced from mobile — trees, coffee type, inputs and practices per block
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#8B5A3C]" /></div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3">Block ID</th>
                  <th className="px-4 py-3">Coffee type</th>
                  <th className="px-4 py-3">Trees</th>
                  <th className="px-4 py-3">Date planted</th>
                  <th className="px-4 py-3">Seedlings</th>
                  <th className="px-4 py-3">Fertilizers</th>
                  <th className="px-4 py-3">Pesticides</th>
                  <th className="px-4 py-3">GAP practices</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map(b => (
                  <tr key={b.block_id} className="border-t hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-semibold text-[#4A3423]">{b.block_id}</td>
                    <td className="px-4 py-3">{b.type_of_coffee || '—'}</td>
                    <td className="px-4 py-3">{b.no_of_trees ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{b.date_planted || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="block">{b.type_of_seedling || '—'}</span>
                      <span className="text-xs text-gray-400">{b.source_of_seedling}</span>
                    </td>
                    <td className="px-4 py-3">{b.fertilizer_names || b.fertilizers || '—'}</td>
                    <td className="px-4 py-3">{b.pesticides_list || b.use_pesticides || '—'}</td>
                    <td className="px-4 py-3">{b.standard_practices || '—'}</td>
                  </tr>
                ))}
                {!blocks.length && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                      <MapPin className="mx-auto mb-2 opacity-40" size={32} />
                      No blocks registered yet — add blocks from the mobile app
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
