import React, { useCallback, useEffect, useState } from 'react';
import { SideNav } from '../../components/SideNav';
import PrototypeBanner from '../../components/PrototypeBanner';
import { getAuthHeaders } from '../../utils/authHeaders';
import { Loader2, FileText, Upload, Plus, Download, FileDown } from 'lucide-react';
import { PageTableShell, StyledTable, StyledThead, StyledTh, StyledTbody } from '../../components/PageTableShell';
import { downloadDossierPdf } from '../../utils/dossierPdf';

const DOSSIER_API = `${import.meta.env.VITE_API_URL}/api/export/trace-records/eudr-dossier/`;
const DOCS_API = `${import.meta.env.VITE_API_URL}/api/export/compliance-documents/`;
const HARVEST_API = `${import.meta.env.VITE_API_URL}/api/aggregation/farmer-harvest/`;

export default function ExportEudrDossier() {
  const [harvests, setHarvests] = useState([]);
  const [selected, setSelected] = useState('');
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [docForm, setDocForm] = useState({ title: '', document_type: 'other', notes: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(HARVEST_API, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => setHarvests(d.results || d || []));
  }, []);

  const loadDossier = useCallback(async () => {
    if (!selected) return;
    setLoading(true);
    const res = await fetch(`${DOSSIER_API}?harvest_id=${encodeURIComponent(selected)}`, { headers: getAuthHeaders() });
    const data = await res.json();
    setDossier(res.ok ? data : null);
    setLoading(false);
  }, [selected]);

  const downloadJson = () => {
    if (!dossier) return;
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `export-dossier-${dossier.harvest_id || 'pack'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const uploadDoc = async (e) => {
    e.preventDefault();
    if (!selected || !docForm.title.trim()) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('harvest_id', selected);
    fd.append('title', docForm.title.trim());
    fd.append('document_type', docForm.document_type);
    fd.append('notes', docForm.notes);
    const fileInput = e.target.querySelector('input[type=file]');
    if (fileInput?.files?.[0]) fd.append('file', fileInput.files[0]);
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    await fetch(DOCS_API, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    setUploading(false);
    setDocForm({ title: '', document_type: 'other', notes: '' });
    loadDossier();
  };

  return (
    <SideNav>
      <main className="p-6 max-w-4xl">
        <PrototypeBanner title="Prototype EUDR due-diligence pack — not certified EU DDS submission." />
        <h1 className="text-2xl font-bold text-[#4A3423] mb-1">Export Dossier</h1>
        <p className="text-sm text-gray-500 mb-6">Due-diligence pack: origin, chain of custody, mass balance, supporting documents.</p>

        <div className="bg-white rounded-xl border p-4 mb-6 flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium">Harvest</label>
            <select className="w-full border rounded-lg p-2 mt-1" value={selected} onChange={e => setSelected(e.target.value)}>
              <option value="">Select harvest</option>
              {harvests.map(h => <option key={h.harvest_id} value={h.harvest_id}>{h.harvest_id} — {h.name}</option>)}
            </select>
          </div>
          <button onClick={loadDossier} disabled={!selected || loading} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50" style={{ backgroundColor: '#8B5A3C' }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            Generate dossier
          </button>
        </div>

        {dossier && (
          <>
            <div className="flex flex-wrap justify-end gap-2 mb-3">
              <button type="button" onClick={() => downloadDossierPdf(dossier)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white shadow-lg hover:shadow-xl transition" style={{ backgroundColor: '#8B4513' }}>
                <FileDown size={16} /> Download PDF
              </button>
              <button type="button" onClick={downloadJson} className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm text-[#4A3423] shadow-sm hover:shadow-md transition">
                <Download size={16} /> Download JSON
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border p-6 mb-6 text-sm space-y-4">
              <p className="text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3">{dossier.disclaimer}</p>
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-500">Supplier</span><p className="font-medium">{dossier.supplier?.name || '—'}</p></div>
                <div><span className="text-gray-500">GPS</span><p className="font-medium">{dossier.supplier?.gps || '—'}</p></div>
                <div><span className="text-gray-500">Coffee type</span><p className="font-medium">{dossier.supplier?.coffee_type || '—'}</p></div>
                <div><span className="text-gray-500">Location</span><p className="font-medium">{dossier.supplier?.location || '—'}</p></div>
                <div><span className="text-gray-500">Intake</span><p className="font-medium">{dossier.intake?.weight_kg ? `${dossier.intake.weight_kg} kg` : '—'}{dossier.intake?.date ? ` · ${dossier.intake.date}` : ''}</p></div>
                <div><span className="text-gray-500">Status</span><p className="font-medium capitalize">{dossier.compliance_status}</p></div>
              </div>

              {dossier.mass_balance && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-[#4A3423] mb-2">Mass balance</h3>
                  <p>Input: {dossier.mass_balance.input_kg ?? '—'} kg → Output: {dossier.mass_balance.output_kg ?? '—'} kg</p>
                  <p>Overall loss: {dossier.mass_balance.overall_loss_pct ?? '—'}%</p>
                  {dossier.mass_balance.balance_ok != null && (
                    <p className={dossier.mass_balance.balance_ok ? 'text-green-700' : 'text-amber-700'}>
                      Balance check: {dossier.mass_balance.balance_ok ? 'Within expected range' : 'Review recommended'}
                    </p>
                  )}
                  {(dossier.mass_balance.stages || []).length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-gray-600">
                      {dossier.mass_balance.stages.map((s, i) => (
                        <li key={i}>{s.stage}: {s.input_kg ?? '—'} kg → {s.output_kg ?? '—'} kg{s.loss_pct != null ? ` (${s.loss_pct}% loss)` : ''}</li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{dossier.mass_balance.note}</p>
                </div>
              )}

              {dossier.chain_of_custody?.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-[#4A3423] mb-2">Chain of custody</h3>
                  <ul className="space-y-1">
                    {dossier.chain_of_custody.map((s, i) => (
                      <li key={i}>{s.name} — <span className="capitalize">{s.status}</span>{s.date ? ` (${s.date})` : ''}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold text-[#4A3423] mb-2">Grade lineage</h3>
                {dossier.lineage?.grades?.length > 0 ? (
                  <ul className="space-y-1 text-xs">
                    {dossier.lineage.grades.map((g, i) => (
                      <li key={i}>{g.grade || g.grade_id} — {g.weight_kg ?? g.weight ?? '—'} kg{g.floating_date ? ` · ${g.floating_date}` : ''}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400">No QC grade records yet — complete Quality Control (floating/ripeness) to populate lineage for this harvest.</p>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-[#4A3423] mb-2">
                  Field history
                  {dossier.field_history?.block_id ? ` (Block ${dossier.field_history.block_id})` : dossier.field_history?.source === 'farmer_registration' ? ' (Farmer plot)' : ''}
                </h3>
                {dossier.field_history?.plot && (
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div><span className="text-gray-500">Variety</span><p>{dossier.field_history.plot.coffee_variety || '—'}</p></div>
                    <div><span className="text-gray-500">Trees</span><p>{dossier.field_history.plot.number_of_trees ?? '—'}</p></div>
                    <div className="col-span-2"><span className="text-gray-500">Location</span><p>{dossier.field_history.plot.location || '—'}</p></div>
                  </div>
                )}
                {dossier.field_history?.inputs_summary?.length > 0 ? (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Inputs ({dossier.field_history.inputs_summary.length})</p>
                    <ul className="space-y-1 text-xs">
                      {dossier.field_history.inputs_summary.slice(0, 8).map((inp, i) => (
                        <li key={i}>{inp.date || 'Registered'}: {inp.input}{inp.quantity ? ` (${inp.quantity} ${inp.unit})` : ''}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {dossier.field_history?.practices_summary?.length > 0 ? (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Practices ({dossier.field_history.practices_summary.length})</p>
                    <ul className="space-y-1 text-xs">
                      {dossier.field_history.practices_summary.slice(0, 8).map((p, i) => (
                        <li key={i}>{p.date || '—'}: {p.title}{(p.practices || []).length ? ` — ${p.practices.join(', ')}` : ''}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {dossier.field_history?.block_activities?.length > 0 && (
                  <p className="text-xs text-gray-500 mb-1">{dossier.field_history.block_activities.length} field activity log(s)</p>
                )}
                {dossier.field_history?.surveillance_reports?.length > 0 && (
                  <p className="text-xs text-gray-500">{dossier.field_history.surveillance_reports.length} surveillance report(s)</p>
                )}
                {!dossier.field_history?.plot
                  && !(dossier.field_history?.inputs_summary || []).length
                  && !(dossier.field_history?.block_activities || []).length
                  && !(dossier.field_history?.practices_summary || []).length && (
                  <p className="text-xs text-gray-400">No field records linked — register the farmer plot, link a block, or log field activities.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border p-6">
              <h3 className="font-semibold text-[#4A3423] mb-4 flex items-center gap-2"><Upload size={18} /> Supporting documents</h3>
              <form onSubmit={uploadDoc} className="space-y-3 mb-6">
                <input className="w-full border rounded-lg p-2" placeholder="Document title" value={docForm.title} onChange={e => setDocForm(f => ({ ...f, title: e.target.value }))} required />
                <select className="w-full border rounded-lg p-2" value={docForm.document_type} onChange={e => setDocForm(f => ({ ...f, document_type: e.target.value }))}>
                  <option value="land_title">Land title / tenure</option>
                  <option value="permit">Permit / licence</option>
                  <option value="photo_plot">Plot / geolocation photo</option>
                  <option value="contract">Purchase contract</option>
                  <option value="other">Other</option>
                </select>
                <input type="file" className="w-full text-sm" />
                <textarea className="w-full border rounded-lg p-2" placeholder="Notes" value={docForm.notes} onChange={e => setDocForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
                <button type="submit" disabled={uploading} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#8B5A3C' }}>
                  <Plus size={16} /> {uploading ? 'Uploading…' : 'Add document'}
                </button>
              </form>
              <PageTableShell>
                <StyledTable>
                  <StyledThead>
                    <tr>
                      <StyledTh>Title</StyledTh>
                      <StyledTh>Type</StyledTh>
                      <StyledTh align="center">File</StyledTh>
                    </tr>
                  </StyledThead>
                  <StyledTbody>
                    {(dossier.documents || []).map(d => (
                      <tr key={d.id} className="hover:bg-gray-50/80">
                        <td className="px-4 py-3 font-medium">{d.title}</td>
                        <td className="px-4 py-3 capitalize">{d.document_type?.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-center">
                          {d.file ? (
                            <a
                              href={d.file.startsWith('http') ? d.file : `${import.meta.env.VITE_API_URL}${d.file.startsWith('/') ? '' : '/media/'}${d.file}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#8B5A3C] text-sm hover:underline"
                            >View</a>
                          ) : '—'}
                        </td>
                      </tr>
                    ))}
                    {!dossier.documents?.length && (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">No documents uploaded yet</td></tr>
                    )}
                  </StyledTbody>
                </StyledTable>
              </PageTableShell>
            </div>
          </>
        )}
      </main>
    </SideNav>
  );
}
