import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { getAuthHeaders } from '../../utils/authHeaders';

const API = `${import.meta.env.VITE_API_URL}/api/setprice/`;

export default function PricingSettings() {
  const [production, setProduction] = useState(5000);
  const [farmer, setFarmer] = useState(4500);
  const [priceId, setPriceId] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(API, { headers: getAuthHeaders() }).then(r => r.json()).then(data => {
      if (data?.length) {
        setProduction(parseInt(data[0].production_kgPrice) || 5000);
        setFarmer(parseInt(data[0].farmer_kgPrice) || 4500);
        setPriceId(data[0].id);
      }
    }).catch(() => {});
  }, []);

  const save = async () => {
    const body = { production_kgPrice: String(production), farmer_kgPrice: String(farmer) };
    const url = priceId ? `${API}${priceId}/` : API;
    await fetch(url, { method: priceId ? 'PUT' : 'POST', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold mb-2">Pricing</h2>
      <p className="text-sm text-gray-500 mb-4">Set default pay rates used when recording harvests on mobile.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
          <label className="block text-sm font-medium mb-1">Worker harvest price (UGX/kg)</label>
          <p className="text-xs text-gray-600 mb-2">Paid to <strong>estate workers</strong> for cherry picked on your own blocks. Used in mobile <em>Production Harvest</em> forms.</p>
          <input type="number" className="w-full border rounded-lg p-2.5 bg-white" value={production} onChange={e => setProduction(+e.target.value)} />
        </div>
        <div className="p-4 rounded-lg bg-green-50 border border-green-100">
          <label className="block text-sm font-medium mb-1">Farmer price (UGX/kg)</label>
          <p className="text-xs text-gray-600 mb-2">Paid to <strong>outgrower farmers</strong> when they deliver cherry at aggregation. Pre-fills mobile <em>Aggregation Harvest</em> payment amount.</p>
          <input type="number" className="w-full border rounded-lg p-2.5 bg-white" value={farmer} onChange={e => setFarmer(+e.target.value)} />
        </div>
      </div>
      <button onClick={save} className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#8B5A3C' }}>
        <Save size={16} /> {saved ? 'Saved!' : 'Save Pricing'}
      </button>
    </div>
  );
}
