import React, { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { getAuthHeaders } from '../utils/authHeaders';

/** Download CSV template + upload filled file for staff or wages bulk import. */
export default function ExcelImportButton({ entityType, onComplete }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const base = `${import.meta.env.VITE_API_URL}/api/${entityType}`;

  const downloadTemplate = () => {
    window.open(`${base}/import-template/`, '_blank');
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const res = await fetch(`${base}/bulk-import/`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    const data = await res.json();
    setUploading(false);
    fileRef.current.value = '';
    if (onComplete) onComplete(data);
    else alert(`Imported ${data.created || 0} records${data.errors?.length ? ` (${data.errors.length} errors)` : ''}`);
  };

  return (
    <div className="flex gap-2">
      <button type="button" onClick={downloadTemplate} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">
        <Download size={16} /> Template
      </button>
      <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 cursor-pointer">
        <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload CSV'}
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={upload} disabled={uploading} />
      </label>
    </div>
  );
}
