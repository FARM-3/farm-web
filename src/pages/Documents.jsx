import React, { useCallback, useEffect, useState } from 'react';
import { SideNav } from '../components/SideNav';
import Modal from '../components/settings/Modal';
import { getAuthHeaders } from '../utils/authHeaders';
import { Plus, Trash2, Eye, Paperclip, X } from 'lucide-react';

const API = `${import.meta.env.VITE_API_URL}/api/config/documents/`;

const empty = {
  title: '', doc_type: 'certificate', issuer: '', reference_no: '',
  issue_date: '', expiry_date: '', notes: '', status: 'active',
};

function authOnly() {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function isImage(url) {
  return /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url || '');
}

function isPdf(url) {
  return /\.pdf(\?|$)/i.test(url || '');
}

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(API, { headers: getAuthHeaders() });
    const data = await res.json();
    setDocs(data.results || data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const doc_id = `DOC-${Date.now().toString().slice(-8)}`;
      const formData = new FormData();
      formData.append('doc_id', doc_id);
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v != null) formData.append(k, v);
      });
      if (file) formData.append('file', file);

      await fetch(API, {
        method: 'POST',
        headers: authOnly(),
        body: formData,
      });
      setModalOpen(false);
      setForm(empty);
      setFile(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this document record?')) return;
    await fetch(`${API}${id}/`, { method: 'DELETE', headers: getAuthHeaders() });
    load();
  };

  const statusColor = {
    active: 'text-green-700 bg-green-50',
    expired: 'text-red-700 bg-red-50',
    pending: 'text-yellow-700 bg-yellow-50',
  };

  return (
    <SideNav>
      <main className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#4A3423]">Documents</h1>
            <p className="text-sm text-gray-500">Licences, certificates, contracts — attach files for audit trail</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
            style={{ backgroundColor: '#8B5A3C' }}
          >
            <Plus size={16} /> Add Document
          </button>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Issuer</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {docs.map(d => (
                <tr key={d.id} className="border-t hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium">{d.title}</td>
                  <td className="px-4 py-3 capitalize">{d.doc_type}</td>
                  <td className="px-4 py-3">{d.issuer || '—'}</td>
                  <td className="px-4 py-3">{d.expiry_date || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[d.status] || ''}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {d.file_url ? (
                      <button
                        type="button"
                        onClick={() => setPreview(d)}
                        className="inline-flex items-center gap-1.5 text-[#8B5A3C] hover:underline text-xs font-medium"
                      >
                        <Paperclip size={14} />
                        {d.file_name || 'View'}
                        <Eye size={14} className="opacity-60" />
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">No file</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => remove(d.id)} className="text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!docs.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    No documents yet — run seed or add your licences
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add document modal */}
        <Modal
          open={modalOpen}
          title="Add Document"
          onClose={() => { setModalOpen(false); setFile(null); }}
          footer={(
            <>
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button
                onClick={save}
                disabled={!form.title.trim() || saving}
                className="px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50"
                style={{ backgroundColor: '#8B5A3C' }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          )}
        >
          <div className="space-y-3">
            <div>
              <label className="text-sm">Title</label>
              <input className="w-full border rounded-lg p-2 mt-1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm">Type</label>
              <select className="w-full border rounded-lg p-2 mt-1" value={form.doc_type} onChange={e => setForm(f => ({ ...f, doc_type: e.target.value }))}>
                {['license', 'certificate', 'contract', 'audit', 'other'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm">Issuer</label>
              <input className="w-full border rounded-lg p-2 mt-1" value={form.issuer} onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Issue date</label>
                <input type="date" className="w-full border rounded-lg p-2 mt-1" value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm">Expiry date</label>
                <input type="date" className="w-full border rounded-lg p-2 mt-1" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm">Reference no.</label>
              <input className="w-full border rounded-lg p-2 mt-1" value={form.reference_no} onChange={e => setForm(f => ({ ...f, reference_no: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm">Attach file (PDF, image)</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.gif"
                className="w-full border rounded-lg p-2 mt-1 text-sm"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
              {file && <p className="text-xs text-gray-500 mt-1">{file.name} ({Math.round(file.size / 1024)} KB)</p>}
            </div>
            <div>
              <label className="text-sm">Notes</label>
              <textarea className="w-full border rounded-lg p-2 mt-1" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
        </Modal>

        {/* File preview modal */}
        {preview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div>
                  <h3 className="font-semibold text-[#4A3423]">{preview.title}</h3>
                  <p className="text-xs text-gray-500">{preview.file_name || preview.reference_no}</p>
                </div>
                <button onClick={() => setPreview(null)} className="p-1 rounded hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 min-h-[320px]">
                {isImage(preview.file_url) ? (
                  <img src={preview.file_url} alt={preview.title} className="max-w-full mx-auto rounded border" />
                ) : isPdf(preview.file_url) ? (
                  <iframe
                    title={preview.title}
                    src={preview.file_url}
                    className="w-full h-[480px] border rounded"
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-3">Preview not available for this file type.</p>
                    <a
                      href={preview.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#8B5A3C] underline text-sm"
                    >
                      Open file in new tab
                    </a>
                  </div>
                )}
              </div>
              <div className="px-4 py-3 border-t flex justify-end gap-2">
                <a
                  href={preview.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border rounded-lg text-sm"
                >
                  Download
                </a>
                <button
                  onClick={() => setPreview(null)}
                  className="px-4 py-2 rounded-lg text-white text-sm"
                  style={{ backgroundColor: '#8B5A3C' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </SideNav>
  );
}
