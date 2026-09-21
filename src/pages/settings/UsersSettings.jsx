import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../../components/settings/Modal';
import { getAuthHeaders } from '../../utils/authHeaders';

const API = `${import.meta.env.VITE_API_URL}/api/users/security/accounts/`;

const ROLES = [
  { value: 'manager', label: 'Farm Manager (web)' },
  { value: 'block_champion', label: 'Block Champion (mobile)' },
  { value: 'admin', label: 'Admin' },
  { value: 'superadmin', label: 'Super Admin' },
];

const emptyForm = { name: '', phone: '', pin: '', role: 'block_champion', is_active: true };

function parseApiError(data, status, rawText) {
  if (typeof data === 'string' && data.trim()) return data;
  if (data?.detail) return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
  const parts = [];
  if (data && typeof data === 'object') {
    for (const [key, val] of Object.entries(data)) {
      if (Array.isArray(val) && val[0]) parts.push(`${key}: ${val[0]}`);
      else if (typeof val === 'string') parts.push(val);
    }
  }
  if (parts.length) return parts.join(' · ');
  if (rawText && rawText.trim() && rawText.trim() !== '{}') return rawText.slice(0, 200);
  if (status === 405) return 'User creation is not enabled on the server yet — redeploy the API.';
  if (status >= 500) return 'Server error while creating user. Try again or use Django Admin.';
  return 'Could not create user. Check the phone is unique and PIN is 4 digits.';
}

export default function UsersSettings() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API, { headers: getAuthHeaders() });
      const data = await res.json();
      setUsers(data.results || data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateUser = async (id, payload) => {
    await fetch(`${API}${id}/`, {
      method: 'PATCH',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    load();
  };

  const createUser = async () => {
    setError('');
    if (!form.name.trim() || !form.phone.trim() || !form.pin.trim()) {
      setError('Name, phone, and PIN are required.');
      return;
    }
    if (!/^\d{4}$/.test(form.pin)) {
      setError('PIN must be exactly 4 digits.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          pin: form.pin,
          role: form.role,
          is_active: form.is_active,
        }),
      });
      const rawText = await res.text();
      let data = {};
      try { data = rawText ? JSON.parse(rawText) : {}; } catch { data = { detail: rawText }; }
      if (!res.ok) {
        setError(parseApiError(data, res.status, rawText));
        return;
      }
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async (id, name) => {
    if (!window.confirm(`Deactivate/delete user ${name || id}?`)) return;
    await fetch(`${API}${id}/`, { method: 'DELETE', headers: getAuthHeaders() });
    load();
  };

  const roleLabel = (role) => ROLES.find(r => r.value === role)?.label || role;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold">System users</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create login accounts for Farm Managers (web) and Block Champions (mobile). Same as Django Admin users.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setForm(emptyForm); setError(''); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
          style={{ backgroundColor: '#8B5A3C' }}
        >
          <Plus size={16} /> Add user
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading users…</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2">Name</th>
              <th>Phone (login)</th>
              <th>Role</th>
              <th>Active</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b">
                <td className="py-2 font-medium">{u.name || '—'}</td>
                <td>{u.phone}</td>
                <td>
                  <select
                    className="border rounded p-1 text-sm"
                    value={u.role}
                    onChange={e => updateUser(u.id, { role: e.target.value })}
                  >
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => updateUser(u.id, { is_active: !u.is_active })}
                    className={`px-2 py-0.5 rounded-full text-xs ${u.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {u.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td>
                  <button type="button" onClick={() => removeUser(u.id, u.name)} className="text-red-500 p-1">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr><td colSpan={5} className="py-8 text-center text-gray-400">No users yet — add a Block Champion or Manager</td></tr>
            )}
          </tbody>
        </table>
      )}

      <Modal
        open={modalOpen}
        title="Add system user"
        onClose={() => setModalOpen(false)}
        footer={(
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
            <button
              type="button"
              onClick={createUser}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50"
              style={{ backgroundColor: '#8B5A3C' }}
            >
              {saving ? 'Creating…' : 'Create user'}
            </button>
          </>
        )}
      >
        <div className="space-y-3">
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input className="w-full border rounded-lg p-2 mt-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Nakato" />
          </div>
          <div>
            <label className="text-sm font-medium">Phone (login ID)</label>
            <input className="w-full border rounded-lg p-2 mt-1" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0700123456" />
          </div>
          <div>
            <label className="text-sm font-medium">4-digit PIN</label>
            <input className="w-full border rounded-lg p-2 mt-1" value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))} placeholder="1234" maxLength={4} inputMode="numeric" />
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <select className="w-full border rounded-lg p-2 mt-1" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <p className="text-xs text-gray-500">
            Block Champions log in on mobile with phone + PIN. Managers use the web app. User will set security questions on first login.
          </p>
        </div>
      </Modal>
    </div>
  );
}
