import React from 'react';
import { Download, Filter, X } from 'lucide-react';

/**
 * Labeled filter row — each control has its own category label (not one generic dropdown).
 */
export default function TableFilterBar({
  filters = [],
  onExport,
  exportLabel = 'Export CSV',
  exportDisabled = false,
  onClear,
  showClear = false,
  children,
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Filter size={16} className="text-gray-400 mb-2 hidden sm:block" />
      {filters.map(f => (
        <div key={f.key} className="min-w-[120px]">
          <label className="text-xs text-gray-500 block mb-0.5">{f.label}</label>
          {f.type === 'select' ? (
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full bg-white shadow-sm"
              value={f.value || ''}
              onChange={e => f.onChange(e.target.value)}
            >
              <option value="">{f.placeholder || `All ${f.label.toLowerCase()}`}</option>
              {(f.options || []).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : f.type === 'date' ? (
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full bg-white shadow-sm"
              value={f.value || ''}
              onChange={e => f.onChange(e.target.value)}
            />
          ) : (
            <input
              type="search"
              placeholder={f.placeholder || `Search ${f.label.toLowerCase()}...`}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full bg-white shadow-sm"
              value={f.value || ''}
              onChange={e => f.onChange(e.target.value)}
            />
          )}
        </div>
      ))}
      {children}
      {showClear && onClear && (
        <button type="button" onClick={onClear} className="flex items-center gap-1 text-xs text-[#8B4513] px-2 py-2 mb-0.5">
          <X size={14} /> Clear
        </button>
      )}
      {onExport && (
        <button
          type="button"
          onClick={onExport}
          disabled={exportDisabled}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white disabled:opacity-40 shadow-lg hover:shadow-xl transition ml-auto"
          style={{ backgroundColor: '#8B4513' }}
        >
          <Download size={16} /> {exportLabel}
        </button>
      )}
    </div>
  );
}
