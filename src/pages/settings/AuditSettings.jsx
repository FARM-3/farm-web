import React, { useEffect, useState } from 'react';
import { getAuthHeaders } from '../../utils/authHeaders';

const API = `${import.meta.env.VITE_API_URL}/api/activities/activities/`;
const LOGIN_API = `${import.meta.env.VITE_API_URL}/api/users/security/login-audit/`;

export default function AuditSettings() {
  const [tab, setTab] = useState('activity');
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const url = tab === 'login' ? LOGIN_API : API;
    fetch(url, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => setRows(d.results || d || []))
      .catch(() => setRows([]));
  }, [tab]);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold mb-4">Audit Logs</h2>
      <div className="flex gap-2 mb-4">
        {['activity', 'login'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-full text-sm ${tab === t ? 'bg-[#8B5A3C] text-white' : 'border'}`}>
            {t === 'activity' ? 'Changes' : 'Logins'}
          </button>
        ))}
      </div>
      <table className="w-full text-sm">
        <thead><tr className="border-b text-left text-gray-500">
          {tab === 'login' ? <><th className="py-2">Phone</th><th>User</th><th>Status</th><th>Time</th></>
            : <><th className="py-2">Action</th><th>Object</th><th>User</th><th>Time</th></>}
        </tr></thead>
        <tbody>
          {rows.slice(0, 50).map((r, i) => (
            <tr key={r.id || i} className="border-b">
              {tab === 'login' ? (
                <><td className="py-2">{r.phone}</td><td>{r.user_name || '—'}</td>
                  <td><span className={r.success ? 'text-green-600' : 'text-red-600'}>{r.success ? 'OK' : 'Failed'}</span></td>
                  <td>{new Date(r.timestamp).toLocaleString()}</td></>
              ) : (
                <><td className="py-2 capitalize">{r.action}</td><td>{r.object_repr || r.object_id}</td>
                  <td>{r.user || '—'}</td><td>{new Date(r.timestamp).toLocaleString()}</td></>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
