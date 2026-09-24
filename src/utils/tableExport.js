/** CSV export helper for table pages */
export function exportRowsCsv(filename, columns, rows) {
  const header = columns.map(c => c.label).join(',');
  const lines = rows.map(row =>
    columns.map(c => `"${String(c.get(row) ?? '').replace(/"/g, '""')}"`).join(',')
  );
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort();
}
