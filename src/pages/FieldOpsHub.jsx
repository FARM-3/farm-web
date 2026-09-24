import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { getAuthHeaders } from '../utils/authHeaders';
import AuthMedia from '../components/AuthMedia';
import QrLabelActions from '../components/QrLabelActions';
import {
  PageTableShell, StyledTable, StyledThead, StyledTh, StyledTbody, TableEmptyRow,
} from '../components/PageTableShell';
import { apiUrl } from '../utils/apiBase';
import { Loader2, Sprout, Filter, Eye, X, Download, MapPin, RefreshCw } from 'lucide-react';

const ACTIVITIES_API = apiUrl('/api/field-ops/block-activities/');
const BLOCKS_API = apiUrl('/api/blocks/');

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

const TABS = [
  { id: 'activities', label: 'Field Activities', icon: Sprout },
  { id: 'blocks', label: 'Blocks', icon: MapPin },
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
  a.download = `field-activities-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

function ActivitiesTab() {
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
    const url = params.toString() ? `${ACTIVITIES_API}?${params}` : ACTIVITIES_API;
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

  const filters = (
    <div className="flex flex-wrap items-center gap-2">
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
        <button type="button" className="text-xs text-[#8B4513]" onClick={() => { setBlockFilter(''); setScopeFilter(''); setLogTypeFilter(''); setDateFrom(''); setDateTo(''); }}>
          Clear filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() => exportCsv(logs)}
          disabled={!logs.length}
          className="flex items-center gap-2 px-3 py-2 border rounded-xl text-sm text-[#4A3423] disabled:opacity-40 shadow-sm hover:shadow-md transition"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#8B5A3C]" /></div>
      ) : (
        <PageTableShell filters={filters}>
          <StyledTable>
            <StyledThead>
              <tr>
                <StyledTh>Date</StyledTh>
                <StyledTh>Location</StyledTh>
                <StyledTh>Type</StyledTh>
                <StyledTh>Activity / Input</StyledTh>
                <StyledTh>By</StyledTh>
                <StyledTh align="center">Photo</StyledTh>
                <StyledTh align="center">Actions</StyledTh>
              </tr>
            </StyledThead>
            <StyledTbody>
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/80">
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
                  <td className="px-4 py-3 text-center">
                    {log.has_photo || log.photo_url ? (
                      <AuthMedia url={log.photo_url} alt="Activity photo" className="h-10 w-10 rounded object-cover border mx-auto" linkLabel="" />
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button type="button" onClick={() => setDetail(log)} className="inline-flex items-center gap-1 text-xs text-[#8B4513] font-medium">
                      <Eye size={14} /> Details
                    </button>
                  </td>
                </tr>
              ))}
              {!logs.length && <TableEmptyRow colSpan={7} message="No field activities match your filters" icon={Sprout} />}
            </StyledTbody>
          </StyledTable>
        </PageTableShell>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start p-5 border-b">
              <div>
                <h2 className="text-lg font-bold text-[#4A3423]">{detail.title}</h2>
                <p className="text-sm text-gray-500">{detail.block_id || detail.location_label} · {detail.activity_date}</p>
              </div>
              <button type="button" onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
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
    </>
  );
}

function BlocksTab() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(BLOCKS_API, { headers: getAuthHeaders() });
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

  const openProfile = async (blockId) => {
    setProfileLoading(true);
    setProfile(null);
    try {
      const res = await fetch(`${BLOCKS_API}${encodeURIComponent(blockId)}/profile/`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) setProfile(data);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm hover:bg-gray-50 shadow-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#8B5A3C]" /></div>
      ) : (
        <PageTableShell>
          <StyledTable minWidth="1100px">
            <StyledThead>
              <tr>
                <StyledTh>Block ID</StyledTh>
                <StyledTh>Coffee type</StyledTh>
                <StyledTh align="center">Trees</StyledTh>
                <StyledTh>Date planted</StyledTh>
                <StyledTh>Seedlings</StyledTh>
                <StyledTh>Fertilizers</StyledTh>
                <StyledTh>Pesticides</StyledTh>
                <StyledTh>GAP practices</StyledTh>
                <StyledTh align="center">QR label</StyledTh>
                <StyledTh align="center">Actions</StyledTh>
              </tr>
            </StyledThead>
            <StyledTbody>
              {blocks.map(b => {
                const payload = `BLOCK:${b.block_id}`;
                const qrUrl = `${BLOCKS_API}${encodeURIComponent(b.block_id)}/qr-image/`;
                return (
                  <tr key={b.block_id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 font-semibold">{b.block_id}</td>
                    <td className="px-4 py-3">{b.type_of_coffee || '—'}</td>
                    <td className="px-4 py-3 text-center">{b.no_of_trees ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{b.date_planted || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="block">{b.type_of_seedling || '—'}</span>
                      <span className="text-xs text-gray-400">{b.source_of_seedling}</span>
                    </td>
                    <td className="px-4 py-3">{b.fertilizer_names || b.fertilizers || '—'}</td>
                    <td className="px-4 py-3">{b.pesticides_list || b.use_pesticides || '—'}</td>
                    <td className="px-4 py-3">{b.standard_practices || '—'}</td>
                    <td className="px-4 py-3">
                      <QrLabelActions qrImageUrl={qrUrl} label={`Block ${b.block_id}`} payload={payload} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button type="button" onClick={() => openProfile(b.block_id)} className="inline-flex items-center gap-1 text-xs text-[#8B4513] font-medium">
                        <Eye size={14} /> Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!blocks.length && <TableEmptyRow colSpan={10} message="No blocks registered yet — add blocks from the mobile app" icon={MapPin} />}
            </StyledTbody>
          </StyledTable>
        </PageTableShell>
      )}

      {(profile || profileLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start p-5 border-b">
              <div>
                <h2 className="text-lg font-bold text-[#4A3423]">
                  {profile?.block_id ? `Block ${profile.block_id}` : 'Block profile'}
                </h2>
                <p className="text-sm text-gray-500">Scan payload: BLOCK:{profile?.block_id || '…'}</p>
              </div>
              <button type="button" onClick={() => setProfile(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            {profileLoading ? (
              <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#8B5A3C]" /></div>
            ) : profile && (
              <div className="p-5 space-y-4 text-sm">
                {profile.block && (
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="text-gray-500">Trees</span><p className="font-medium">{profile.block.no_of_trees}</p></div>
                    <div><span className="text-gray-500">Coffee</span><p className="font-medium">{profile.block.type_of_coffee}</p></div>
                    <div><span className="text-gray-500">Planted</span><p className="font-medium">{profile.block.date_planted}</p></div>
                    <div><span className="text-gray-500">Seedling</span><p className="font-medium">{profile.block.type_of_seedling}</p></div>
                    <div className="col-span-2"><span className="text-gray-500">GAP practices</span><p className="font-medium">{profile.block.standard_practices || '—'}</p></div>
                    <div className="col-span-2"><span className="text-gray-500">Fertilizers</span><p className="font-medium">{profile.block.fertilizer_names || profile.block.fertilizers || '—'}</p></div>
                    <div className="col-span-2"><span className="text-gray-500">Pesticides</span><p className="font-medium">{profile.block.pesticides_list || profile.block.use_pesticides || '—'}</p></div>
                  </div>
                )}
                {profile.field_history?.block_activities?.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-[#4A3423] mb-2">Recent activities ({profile.activity_count})</h3>
                    <ul className="space-y-2 max-h-40 overflow-y-auto">
                      {profile.field_history.block_activities.slice(0, 8).map(a => (
                        <li key={a.log_id} className="text-xs border rounded-lg p-2">
                          <span className="font-medium">{a.activity_date}</span> · {a.title}
                          <span className="text-gray-400 capitalize"> ({a.log_type})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {profile.harvests?.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-[#4A3423] mb-2">Harvests from this block</h3>
                    <ul className="space-y-1 text-xs">
                      {profile.harvests.slice(0, 6).map(h => (
                        <li key={h.harvest_id}>{h.harvest_id} — {h.weight_on_delivery} kg · {h.date_of_delivery}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="border-t pt-4 flex justify-center">
                  <QrLabelActions
                    qrImageUrl={`${BLOCKS_API}${encodeURIComponent(profile.block_id)}/qr-image/`}
                    label={`Block ${profile.block_id}`}
                    payload={`BLOCK:${profile.block_id}`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function FieldOpsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'blocks' ? 'blocks' : 'activities';

  const setTab = (id) => {
    if (id === 'blocks') setSearchParams({ tab: 'blocks' });
    else setSearchParams({});
  };

  return (
    <SideNav>
      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#4A3423]">Field Operations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Farm-wide activities and block registry — QR labels link to full block history when scanned
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === id ? 'shadow-md text-white' : 'hover:bg-gray-100 text-[#4A3423]'
              }`}
              style={tab === id ? { backgroundColor: '#8B4513' } : undefined}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {tab === 'activities' ? <ActivitiesTab /> : <BlocksTab />}
      </main>
    </SideNav>
  );
}
