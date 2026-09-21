import React, { useCallback, useEffect, useState } from 'react';
import { SideNav } from '../../components/SideNav';
import PrototypeBanner from '../../components/PrototypeBanner';
import { API_ENDPOINTS } from '../../services/ApiConfig';
import { getAuthHeaders } from '../../utils/authHeaders';
import { Loader2, FileText, Search, Download } from 'lucide-react';

const CoffeeColors = { DARK_BROWN: '#4A3423', BUTTON_BROWN: '#8B4513' };

const ExportDossier = () => {
  const [harvestOptions, setHarvestOptions] = useState([]);
  const [selectedHarvest, setSelectedHarvest] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [dossier, setDossier] = useState(null);

  const fetchHarvestOptions = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const headers = getAuthHeaders();
      const [hRes, fRes] = await Promise.all([
        fetch(API_ENDPOINTS.HARVESTS, { headers }),
        fetch(API_ENDPOINTS.FARMER_HARVEST, { headers }),
      ]);
      const hData = await hRes.json();
      const fData = await fRes.json();
      const regular = (hData.results || hData || []).map((h) => ({
        value: h.harvest_id,
        label: `${h.harvest_id} — ${h.worker_name || 'Estate'}`,
      }));
      const farmer = (fData.results || fData || []).map((h) => ({
        value: h.harvest_id,
        label: `${h.harvest_id} — ${h.name || h.farmer_name || 'Farmer'}`,
      }));
      setHarvestOptions([...regular, ...farmer]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    fetchHarvestOptions();
  }, [fetchHarvestOptions]);

  const generateDossier = async () => {
    if (!selectedHarvest) return;
    setLoading(true);
    setDossier(null);
    try {
      const res = await fetch(`${API_ENDPOINTS.HARVEST_TRACKING}${selectedHarvest}/`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Trace not found');
      const data = await res.json();
      setDossier({
        harvest_id: data.harvest_id,
        generated_at: new Date().toISOString().split('T')[0],
        supplier: {
          name: data.farmer_name,
          type: data.source_type === 'estate' ? 'Estate production' : 'Registered farmer',
          location: data.source?.location,
          gps: data.source?.gps_coordinates,
          coffee_type: data.source?.coffee_type,
        },
        intake: {
          weight_kg: data.source?.harvest_weight,
          date: data.source?.delivery_date,
        },
        processing: data.stages || [],
        loss_summary: data.loss_summary,
        lineage: data.lineage,
        compliance_notes: [
          'Geolocation: GPS point captured at delivery (plot polygon mapping — planned extension).',
          'Chain of custody: harvest ID linked through QC, processing, drying, and bagging.',
          'EUDR due diligence: this dossier is a prototype export evidence pack — not a certified DDS submission.',
          'Recommended next step: formal plot registration and national traceability warehouse integration.',
        ],
      });
    } catch (e) {
      console.error(e);
      setDossier({ error: 'Could not build dossier for this harvest. Ensure demo data is seeded.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <SideNav>
      <main className="p-4 sm:p-6 md:p-8 pt-0">
        <PrototypeBanner title="Export Compliance Dossier — Prototype (EUDR-ready roadmap)" />

        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold" style={{ color: CoffeeColors.DARK_BROWN }}>
            Export Compliance Dossier
          </h1>
          {dossier && !dossier.error && (
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white print:hidden"
              style={{ backgroundColor: CoffeeColors.BUTTON_BROWN }}
            >
              <Download size={16} /> Export / Print
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 print:hidden">
          <p className="text-sm text-gray-600 mb-4">
            Select a harvest to generate a prototype due-diligence dossier from live operational records.
          </p>
          <div className="flex flex-wrap gap-3">
            <select
              className="flex-1 min-w-[200px] border border-gray-300 rounded-xl px-4 py-2"
              value={selectedHarvest}
              onChange={(e) => setSelectedHarvest(e.target.value)}
              disabled={loadingOptions}
            >
              <option value="">Select harvest…</option>
              {harvestOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={generateDossier}
              disabled={!selectedHarvest || loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-white disabled:opacity-50"
              style={{ backgroundColor: CoffeeColors.BUTTON_BROWN }}
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Search size={16} />}
              Generate Dossier
            </button>
          </div>
        </div>

        {dossier?.error && (
          <div className="bg-red-50 text-red-800 px-4 py-3 rounded-xl">{dossier.error}</div>
        )}

        {dossier && !dossier.error && (
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6" id="dossier-content">
            <div className="border-b pb-4">
              <div className="flex items-center gap-2 text-amber-800 text-sm font-medium mb-2">
                <FileText size={18} /> Prototype Export Evidence Pack
              </div>
              <h2 className="text-2xl font-bold" style={{ color: CoffeeColors.DARK_BROWN }}>
                Coffee Lot Due Diligence Dossier
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Harvest: <strong>{dossier.harvest_id}</strong> · Generated: {dossier.generated_at}
              </p>
            </div>

            <section>
              <h3 className="text-lg font-bold mb-3" style={{ color: CoffeeColors.DARK_BROWN }}>1. Supplier / Origin</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <p><span className="text-gray-500">Name:</span> <strong>{dossier.supplier.name}</strong></p>
                <p><span className="text-gray-500">Type:</span> {dossier.supplier.type}</p>
                <p><span className="text-gray-500">Coffee type:</span> {dossier.supplier.coffee_type || '—'}</p>
                <p><span className="text-gray-500">Location:</span> {dossier.supplier.location || '—'}</p>
                <p className="sm:col-span-2">
                  <span className="text-gray-500">GPS coordinates:</span>{' '}
                  {dossier.supplier.gps || 'Not recorded — plot mapping planned'}
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-3" style={{ color: CoffeeColors.DARK_BROWN }}>2. Intake Record</h3>
              <p className="text-sm">
                Weight: <strong>{dossier.intake.weight_kg ?? '—'} kg</strong> · Date: {dossier.intake.date || '—'}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-3" style={{ color: CoffeeColors.DARK_BROWN }}>3. Processing Chain of Custody</h3>
              <ul className="space-y-2">
                {(dossier.processing || []).map((s, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        s.status === 'completed' ? 'bg-green-500' : s.status === 'in_progress' ? 'bg-amber-500' : 'bg-gray-300'
                      }`}
                    />
                    <span className="font-medium">{s.name}</span>
                    <span className="text-gray-500 capitalize">{s.status?.replace('_', ' ')}</span>
                    {s.date && <span className="text-gray-400">· {s.date}</span>}
                  </li>
                ))}
              </ul>
            </section>

            {dossier.loss_summary?.stages?.length > 0 && (
              <section>
                <h3 className="text-lg font-bold mb-3" style={{ color: CoffeeColors.DARK_BROWN }}>4. Mass Balance / Loss</h3>
                <p className="text-sm mb-2">
                  Overall loss: <strong>{dossier.loss_summary.overall_loss_pct ?? '—'}%</strong>
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {dossier.loss_summary.stages.map((s, i) => (
                    <li key={i}>{s.stage}: {s.input_kg} kg → {s.output_kg} kg ({s.loss_pct ?? '—'}% loss)</li>
                  ))}
                </ul>
              </section>
            )}

            {dossier.lineage?.bagging?.length > 0 && (
              <section>
                <h3 className="text-lg font-bold mb-3" style={{ color: CoffeeColors.DARK_BROWN }}>5. Bagged Output</h3>
                <ul className="text-sm space-y-1">
                  {dossier.lineage.bagging.map((b, i) => (
                    <li key={i}>
                      Lot {b.lot_id}: {b.weight_kg} kg, {b.bags} bags, moisture {b.moisture}%
                      {b.qr_code && ` · QR: ${b.qr_code}`}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h3 className="text-lg font-bold mb-3" style={{ color: CoffeeColors.DARK_BROWN }}>6. Compliance Notes (Prototype)</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {dossier.compliance_notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </main>
    </SideNav>
  );
};

export default ExportDossier;
