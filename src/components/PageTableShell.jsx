import React from 'react';

/** Shared table chrome matching Sales / Expenses pages */
export const TABLE_HEAD_CLASS = 'px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap';
export const TABLE_HEAD_STYLE = { backgroundColor: '#efebe9', color: '#4A3423' };
export const TABLE_BODY_CLASS = 'bg-white/80 divide-y divide-gray-100 text-sm text-[#4A3423]';

export function PageTableShell({ filters, children, footer, className = '' }) {
  return (
    <div className={`w-full shadow-xl rounded-2xl bg-white transition-all duration-300 overflow-hidden ${className}`}>
      {filters && (
        <div className="px-4 py-3 border-b border-gray-100 bg-white">{filters}</div>
      )}
      <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="min-w-full inline-block align-middle">{children}</div>
      </div>
      {footer}
    </div>
  );
}

export function StyledTable({ children, minWidth }) {
  return (
    <table className={`min-w-full divide-y divide-gray-100 ${minWidth ? '' : 'w-full'}`} style={minWidth ? { minWidth } : undefined}>
      {children}
    </table>
  );
}

export function StyledThead({ children }) {
  return (
    <thead className="sticky top-0 z-10" style={TABLE_HEAD_STYLE}>
      {children}
    </thead>
  );
}

export function StyledTh({ children, align = 'left', className = '' }) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th className={`${TABLE_HEAD_CLASS} ${alignClass} ${className}`} scope="col">
      {children}
    </th>
  );
}

export function StyledTbody({ children }) {
  return <tbody className={TABLE_BODY_CLASS}>{children}</tbody>;
}

export function TableEmptyRow({ colSpan, message, icon: Icon }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-gray-400">
        {Icon && <Icon className="mx-auto mb-2 opacity-40" size={32} />}
        {message}
      </td>
    </tr>
  );
}
