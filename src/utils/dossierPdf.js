import { jsPDF } from 'jspdf';

function line(doc, y, text, opts = {}) {
  const { size = 10, bold = false, indent = 14 } = opts;
  doc.setFontSize(size);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  const lines = doc.splitTextToSize(String(text ?? ''), 180 - indent);
  doc.text(lines, indent, y);
  return y + lines.length * (size * 0.45) + 2;
}

/** Generate a printable PDF due-diligence pack from dossier JSON. */
export function downloadDossierPdf(dossier) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = 16;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Export Due-Diligence Pack', 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Harvest: ${dossier.harvest_id || '—'}`, 14, y);
  y += 6;
  doc.setTextColor(120, 80, 20);
  doc.text('Prototype — not certified EU DDS submission', 14, y);
  doc.setTextColor(0, 0, 0);
  y += 10;

  y = line(doc, y, 'Supplier & origin', { bold: true, size: 12 });
  y = line(doc, y, `Supplier: ${dossier.supplier?.name || '—'}`);
  y = line(doc, y, `GPS: ${dossier.supplier?.gps || '—'}`);
  y = line(doc, y, `Location: ${dossier.supplier?.location || '—'}`);
  y = line(doc, y, `Coffee: ${dossier.supplier?.coffee_type || '—'}`);
  y = line(doc, y, `Intake: ${dossier.intake?.weight_kg ?? '—'} kg${dossier.intake?.date ? ` · ${dossier.intake.date}` : ''}`);
  y += 4;

  y = line(doc, y, 'Mass balance', { bold: true, size: 12 });
  const mb = dossier.mass_balance || {};
  y = line(doc, y, `Input: ${mb.input_kg ?? '—'} kg → Output: ${mb.output_kg ?? '—'} kg`);
  y = line(doc, y, `Overall loss: ${mb.overall_loss_pct ?? '—'}%`);
  y += 4;

  y = line(doc, y, 'Chain of custody', { bold: true, size: 12 });
  (dossier.chain_of_custody || []).forEach(s => {
    y = line(doc, y, `• ${s.name} — ${s.status}${s.date ? ` (${s.date})` : ''}`, { indent: 18 });
    if (y > 270) { doc.addPage(); y = 16; }
  });
  if (!(dossier.chain_of_custody || []).length) y = line(doc, y, 'No chain steps recorded yet.', { indent: 18 });
  y += 4;

  y = line(doc, y, 'Grade lineage', { bold: true, size: 12 });
  const grades = dossier.lineage?.grades || [];
  if (grades.length) {
    grades.forEach(g => {
      y = line(doc, y, `• ${g.grade || g.grade_id} — ${g.weight_kg ?? g.weight ?? '—'} kg`, { indent: 18 });
      if (y > 270) { doc.addPage(); y = 16; }
    });
  } else {
    y = line(doc, y, 'No QC grade records yet — complete Quality Control to populate.', { indent: 18 });
  }
  y += 4;

  y = line(doc, y, 'Field history', { bold: true, size: 12 });
  const fh = dossier.field_history || {};
  if (fh.plot) {
    y = line(doc, y, `Farmer plot: ${fh.plot.coffee_variety || '—'} · ${fh.plot.number_of_trees ?? '—'} trees`, { indent: 18 });
    y = line(doc, y, `Fertilizers: ${fh.plot.fertilizers || '—'}`, { indent: 18 });
    y = line(doc, y, `Pesticides: ${fh.plot.pesticide || '—'}`, { indent: 18 });
  }
  (fh.inputs_summary || []).slice(0, 8).forEach(inp => {
    y = line(doc, y, `• Input: ${inp.input}${inp.date ? ` (${inp.date})` : ''}`, { indent: 18 });
  });
  (fh.practices_summary || []).slice(0, 8).forEach(p => {
    y = line(doc, y, `• Practice: ${p.title}${p.date ? ` (${p.date})` : ''}`, { indent: 18 });
  });
  (fh.block_activities || []).slice(0, 8).forEach(a => {
    y = line(doc, y, `• ${a.activity_date}: ${a.title} (${a.log_type})`, { indent: 18 });
  });
  if (!fh.plot && !(fh.inputs_summary || []).length && !(fh.block_activities || []).length) {
    y = line(doc, y, 'No field records linked to this harvest yet.', { indent: 18 });
  }
  y += 4;

  y = line(doc, y, 'Supporting documents', { bold: true, size: 12 });
  (dossier.documents || []).forEach(d => {
    y = line(doc, y, `• ${d.title} (${d.document_type})`, { indent: 18 });
  });
  if (!(dossier.documents || []).length) y = line(doc, y, 'No documents uploaded.', { indent: 18 });

  doc.save(`export-dossier-${dossier.harvest_id || 'pack'}.pdf`);
}
