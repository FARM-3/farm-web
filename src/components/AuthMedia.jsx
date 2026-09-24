import React, { useEffect, useState } from 'react';
import { getAuthHeaders } from '../utils/authHeaders';
import { getApiBaseUrl } from '../utils/apiBase';

/** Fetch authenticated media (photos) and display as blob URL. */
export default function AuthMedia({ url, alt = 'Attachment', className = '', linkLabel = 'View full size' }) {
  const [blobUrl, setBlobUrl] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!url) return undefined;
    let objectUrl = '';
    let cancelled = false;

    const fullUrl = url.startsWith('http') ? url : `${getApiBaseUrl()}${url}`;

    fetch(fullUrl, { headers: getAuthHeaders() })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load media');
        return res.blob();
      })
      .then(blob => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setFailed(false);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (!url) return <span className="text-gray-400">—</span>;
  if (failed) return <span className="text-xs text-gray-400">Photo unavailable</span>;
  if (!blobUrl) return <span className="text-xs text-gray-400">Loading…</span>;

  return (
    <div>
      {linkLabel ? (
        <a href={blobUrl} target="_blank" rel="noreferrer" className="text-xs text-[#8B4513] font-medium block mb-1">
          {linkLabel}
        </a>
      ) : null}
      <img src={blobUrl} alt={alt} className={className || 'max-h-24 rounded border object-cover'} />
    </div>
  );
}
