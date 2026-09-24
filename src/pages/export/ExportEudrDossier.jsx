import React, { useCallback, useEffect, useState } from 'react';
import { SideNav } from '../../components/SideNav';
import PrototypeBanner from '../../components/PrototypeBanner';
import { getAuthHeaders } from '../../utils/authHeaders';
import { Loader2, FileText, Upload, Plus } from 'lucide-react';

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
            <div className="bg-white rounded-xl border p-6 mb-6 text-sm space-y-4">
              <p className="text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3">{dossier.disclaimer}</p>
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-500">Supplier</span><p className="font-medium">{dossier.supplier?.name || '—'}</p></div>
                <div><span className="text-gray-500">GPS</span><p className="font-medium">{dossier.supplier?.gps || '—'}</p></div>
                <div><span className="text-gray-500">Intake</span><p className="font-medium">{dossier.intake?.weight_kg ? `${dossier.intake.weight_kg} kg` : '—'}</p></div>
                <div><span className="text-gray-500">Status</span><p className="font-medium capitalize">{dossier.compliance_status}</p></div>
              </div>

              {dossier.mass_balance && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-[#4A3423] mb-2">Mass balance</h3>
                  <p>Input: {dossier.mass_balance.input_kg ?? '—'} kg → Output: {dossier.mass_balance.output_kg ?? '—'} kg</p>
                  <p>Overall loss: {dossier.mass_balance.overall_loss_pct ?? '—'}%</p>
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
            </div>

            <div className="bg-white rounded-xl border p-6">
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
              <ul className="divide-y">
                {(dossier.documents || []).map(d => (
                  <li key={d.id} className="py-2 flex justify-between text-sm">
                    <span>{d.title} <span className="text-gray-400">({d.document_type})</span></span>
                    {d.file && (
                      <a
                        href={d.file.startsWith('http') ? d.file : `${import.meta.env.VITE_API_URL}${d.file.startsWith('/') ? '' : '/media/'}${d.file}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#8B5A3C]"
                      >View</a>
                    )}
                  </li>
                ))}
                {!dossier.documents?.length && <li className="py-4 text-gray-400 text-center">No documents uploaded yet</li>}
              </ul>
            </div>
          </>
        )}
      </main>
    </SideNav>
  );
}
