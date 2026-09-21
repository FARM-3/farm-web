import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

const defaults = {
  companyName: 'FARM FMIS', companyEmail: 'info@farm-demo.com',
  companyPhone: '+256 700 000 000', companyAddress: 'Kampala, Uganda',
  currency: 'UGX', timezone: 'Africa/Kampala',
};

export default function CompanySettings() {
  const [form, setForm] = useState(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('appSettings') || '{}');
      setForm({ ...defaults, ...s });
    } catch { /* ignore */ }
  }, []);

  const save = () => {
    localStorage.setItem('appSettings', JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const field = (key, label) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input className="w-full border rounded-lg p-2.5" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold mb-4">Company</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field('companyName', 'Name')}
        {field('companyEmail', 'Email')}
        {field('companyPhone', 'Phone')}
        {field('companyAddress', 'Address')}
      </div>
      <button onClick={save} className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#8B5A3C' }}>
        <Save size={16} /> {saved ? 'Saved!' : 'Save Company'}
      </button>
    </div>
  );
}
