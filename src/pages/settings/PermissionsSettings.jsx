import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { getAuthHeaders } from '../../utils/authHeaders';

const API = `${import.meta.env.VITE_API_URL}/api/users/security/permissions/`;
const ROLES = ['manager', 'block_champion', 'admin', 'superadmin'];
const MODULES = ['dashboard', 'sales', 'wages', 'expenses', 'staff', 'aggregation', 'harvest', 'processing', 'inventory', 'dispatch', 'export', 'settings', 'tasks'];

export default function PermissionsSettings() {
  const [perms, setPerms] = useState([]);
  const [role, setRole] = useState('manager');

  useEffect(() => {
    fetch(API, { headers: getAuthHeaders() }).then(r => r.json()).then(d => setPerms(d.results || d || []));
  }, []);

  const forRole = MODULES.map(mod => {
    const existing = perms.find(p => p.role === role && p.module === mod);
    return existing || { role, module: mod, can_view: true, can_create: false, can_edit: false, can_delete: false };
  });

  const toggle = async (mod, field) => {
    const existing = perms.find(p => p.role === role && p.module === mod);
    const payload = { ...(existing || { role, module: mod, can_view: true, can_create: false, can_edit: false, can_delete: false }), [field]: !(existing?.[field]) };
    const url = existing ? `${API}${existing.id}/` : API;
    await fetch(url, { method: existing ? 'PATCH' : 'POST', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const res = await fetch(API, { headers: getAuthHeaders() });
    setPerms((await res.json()).results || []);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold mb-4">Permissions</h2>
      <select className="border rounded-lg p-2 mb-4" value={role} onChange={e => setRole(e.target.value)}>
        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <table className="w-full text-sm">
        <thead><tr className="border-b text-left text-gray-500"><th className="py-2">Module</th><th>View</th><th>Create</th><th>Edit</th><th>Delete</th></tr></thead>
        <tbody>
          {forRole.map(p => (
            <tr key={p.module} className="border-b">
              <td className="py-2 capitalize">{p.module}</td>
              {['can_view', 'can_create', 'can_edit', 'can_delete'].map(f => (
                <td key={f}><input type="checkbox" checked={!!p[f]} onChange={() => toggle(p.module, f)} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
