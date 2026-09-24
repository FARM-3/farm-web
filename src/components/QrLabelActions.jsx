import React, { useCallback, useEffect, useState } from 'react';
import { Download, Printer, QrCode, Loader2, Eye, X } from 'lucide-react';
import { getAuthHeaders } from '../utils/authHeaders';

export default function QrLabelActions({ qrImageUrl, label, payload, compact = false }) {
  const [busy, setBusy] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchBlob = useCallback(async () => {
    const res = await fetch(qrImageUrl, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Could not load QR image');
    return res.blob();
  }, [qrImageUrl]);

  const openPreview = async () => {
    if (!qrImageUrl || previewLoading) return;
    setPreviewLoading(true);
    setPreviewOpen(true);
    try {
      const blob = await fetchBlob();
      const url = URL.createObjectURL(blob);
      setPreviewSrc(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch {
      setPreviewOpen(false);
      window.alert('Could not load QR preview — check you are signed in.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewSrc(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return '';
    });
  };

  useEffect(() => () => {
    if (previewSrc) URL.revokeObjectURL(previewSrc);
  }, [previewSrc]);

  const download = async () => {
    if (!qrImageUrl || busy) return;
    setBusy(true);
    try {
      const blob = await fetchBlob();
      const safe = (label || payload || 'qr').replace(/[^\w.-]+/g, '_');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${safe}-qr.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.alert('Download failed — check you are signed in.');
    } finally {
      setBusy(false);
    }
  };

  const printLabel = async () => {
    if (!qrImageUrl || busy) return;
    setBusy(true);
    try {
      const blob = await fetchBlob();
      const url = URL.createObjectURL(blob);
      const w = window.open('', '_blank', 'width=420,height=520');
      if (!w) {
        URL.revokeObjectURL(url);
        return;
      }
      const title = label || payload || 'QR Label';
      w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>
        body{font-family:system-ui,sans-serif;text-align:center;padding:24px}
        img{width:240px;height:240px}.code{font-family:monospace;font-size:14px;margin-top:12px;word-break:break-all}
        .name{font-size:18px;font-weight:700;margin-bottom:8px}</style></head><body>
        <div class="name">${title}</div><img src="${url}" alt="QR" onload="setTimeout(function(){window.print()},300)"/>
        ${payload ? `<div class="code">${payload}</div>` : ''}</body></html>`);
      w.document.close();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      window.alert('Print failed — check you are signed in.');
    } finally {
      setBusy(false);
    }
  };

  if (!qrImageUrl) return null;

  const previewModal = previewOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={closePreview}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-3">
          <div className="text-left">
            <h3 className="font-bold text-[#4A3423]">{label || 'QR label'}</h3>
            <p className="text-xs font-mono text-gray-500 mt-1">{payload}</p>
          </div>
          <button type="button" onClick={closePreview} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <p className="text-xs text-gray-500 mb-4">Point your phone camera here to scan</p>
        {previewLoading ? (
          <Loader2 className="animate-spin mx-auto text-[#8B4513]" size={32} />
        ) : previewSrc ? (
          <img src={previewSrc} alt="QR code" className="w-56 h-56 mx-auto object-contain border rounded-xl" />
        ) : null}
        <div className="flex justify-center gap-3 mt-4">
          <button type="button" onClick={download} disabled={busy} className="text-xs text-[#8B4513] flex items-center gap-1"><Download size={14} /> Download</button>
          <button type="button" onClick={printLabel} disabled={busy} className="text-xs text-[#8B4513] flex items-center gap-1"><Printer size={14} /> Print</button>
        </div>
      </div>
    </div>
  );

  const actions = (
    <>
      <button type="button" onClick={openPreview} disabled={previewLoading} className="inline-flex items-center gap-1 text-xs text-[#8B4513] hover:underline" title="Preview & scan">
        {previewLoading ? <Loader2 size={12} className="animate-spin" /> : <Eye size={12} />} Preview
      </button>
      <button type="button" onClick={download} disabled={busy} className="inline-flex items-center gap-1 text-xs text-[#8B4513] hover:underline disabled:opacity-50">
        {busy ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} Download
      </button>
      <button type="button" onClick={printLabel} disabled={busy} className="inline-flex items-center gap-1 text-xs text-[#8B4513] hover:underline disabled:opacity-50">
        <Printer size={12} /> Print
      </button>
    </>
  );

  if (compact) {
    return (
      <>
        <div className="flex flex-col items-center gap-1">
          <button type="button" onClick={openPreview} className="inline-flex items-center gap-1 text-xs font-mono text-[#8B4513] hover:underline" title="Preview & scan">
            <QrCode size={12} /> {payload}
          </button>
          <div className="flex gap-2">{actions}</div>
        </div>
        {previewModal}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <button type="button" onClick={openPreview} className="inline-flex items-center gap-1 text-xs font-mono text-[#8B4513] hover:underline">
          <QrCode size={12} /> {payload}
        </button>
        <div className="flex gap-2 flex-wrap justify-center">{actions}</div>
      </div>
      {previewModal}
    </>
  );
}
