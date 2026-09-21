import React, { useEffect, useState } from 'react';
import { getAuthHeaders } from '../../utils/authHeaders';

const API = `${import.meta.env.VITE_API_URL}/api/users/security/accounts/`;

export default function UsersSettings() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(API, { headers: getAuthHeaders() }).then(r => r.json()).then(d => setUsers(d.results || d || []));
  }, []);

  const updateRole = async (id, role) => {
    await fetch(`${API}${id}/`, { method: 'PATCH', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
    const res = await fetch(API, { headers: getAuthHeaders() });
    setUsers((await res.json()).results || []);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold mb-4">Users</h2>
      <table className="w-full text-sm">
        <thead><tr className="border-b text-left text-gray-500"><th className="py-2">Name</th><th>Phone</th><th>Role</th><th>Active</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b">
              <td className="py-2">{u.name || '—'}</td>
              <td>{u.phone}</td>
              <td>
                <select className="border rounded p-1" value={u.role} onChange={e => updateRole(u.id, e.target.value)}>
                  {['manager', 'block_champion', 'admin', 'superadmin'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </td>
              <td>{u.is_active ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
