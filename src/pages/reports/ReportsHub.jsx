import React, { useCallback, useEffect, useState } from 'react';
import { SideNav } from '../../components/SideNav';
import { getAuthHeaders } from '../../utils/authHeaders';
import { apiUrl } from '../../utils/apiBase';
import { Download, Loader2 } from 'lucide-react';
import { StyledTable, StyledThead, StyledTh, StyledTbody, TableEmptyRow } from '../../components/PageTableShell';

const BROWN = '#8B4513';
const DARK_BROWN = '#4A3423';

function toCsv(rows, columns) {
  const header = columns.map(c => c.label).join(',');
  const lines = rows.map(row =>
    columns.map(c => `"${String(c.get(row) ?? '').replace(/"/g, '""')}"`).join(',')
  );
  return [header, ...lines].join('\n');
}

function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

async function fetchAllPages(url, headers, params = {}) {
  const all = [];
  let page = 1;
  while (true) {
    const qs = new URLSearchParams({ ...params, page: String(page) });
    const res = await fetch(`${url}?${qs}`, { headers });
    if (!res.ok) break;
    const data = await res.json();
    const batch = data.results ?? (Array.isArray(data) ? data : []);
    all.push(...batch);
    if (!data.next || batch.length === 0) break;
    page += 1;
    if (page > 100) break;
  }
  return all;
}

const REPORTS = [
  {
    id: 'sales',
    title: 'Sales',
    description: 'Sales transactions with amounts and payment methods',
    fetchUrl: apiUrl('/api/sales/'),
    filename: 'sales-report.csv',
    dateFilter: true,
    extraFilters: [
      { param: 'item', label: 'Item', optionsKey: 'saleItems', rowField: 'item' },
      { param: 'method_of_payment', label: 'Payment method', optionsKey: 'paymentMethods', rowField: 'method_of_payment' },
      { param: 'status', label: 'Status', optionsKey: 'saleStatuses', rowField: 'status' },
    ],
    columns: [
      { key: 'date', label: 'Date', get: r => r.date_of_payment || '' },
      { key: 'customer', label: 'Customer', get: r => `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.customer_name || 'ΓÇö' },
      { key: 'item', label: 'Item', get: r => r.item || 'ΓÇö' },
      { key: 'qty', label: 'Qty', get: r => r.quantity ?? 'ΓÇö' },
      { key: 'rate', label: 'Rate', get: r => r.rate ?? 'ΓÇö' },
      { key: 'amount', label: 'Amount', get: r => r.amount ?? r.total_amount ?? 'ΓÇö' },
      { key: 'payment', label: 'Payment', get: r => r.method_of_payment || 'ΓÇö' },
      { key: 'status', label: 'Status', get: r => r.status || 'ΓÇö' },
    ],
  },
  {
    id: 'expenses',
    title: 'Expenses',
    description: 'Farm expenses by category and date',
    fetchUrl: apiUrl('/api/expenses/'),
    filename: 'expenses-report.csv',
    dateFilter: true,
    extraFilters: [
      { param: 'category', label: 'Category', optionsKey: 'expenseCategories', rowField: 'category' },
      { param: 'supplier', label: 'Supplier', optionsKey: 'expenseSuppliers', rowField: 'supplier' },
    ],
    columns: [
      { key: 'date', label: 'Date', get: r => r.date || 'ΓÇö' },
      { key: 'name', label: 'Name', get: r => r.expense_name || 'ΓÇö' },
      { key: 'category', label: 'Category', get: r => r.category || 'ΓÇö' },
      { key: 'amount', label: 'Amount', get: r => r.amount ?? 'ΓÇö' },
      { key: 'supplier', label: 'Supplier', get: r => r.supplier || 'ΓÇö' },
      { key: 'location', label: 'Location', get: r => r.location || 'ΓÇö' },
    ],
  },
  {
    id: 'wages',
    title: 'Wages',
    description: 'Staff wage payments',
    fetchUrl: apiUrl('/api/wages/'),
    filename: 'wages-report.csv',
    dateFilter: true,
    extraFilters: [
      { param: 'staff_id', label: 'Staff member', optionsKey: 'staffOptions', rowField: 'staff_id' },
    ],
    columns: [
      { key: 'date', label: 'Date', get: r => r.date_of_payment || 'ΓÇö' },
      { key: 'staff', label: 'Staff', get: r => r.employee_name || r.staff_full_name || 'ΓÇö' },
      { key: 'staff_id', label: 'Staff ID', get: r => r.staff_id || 'ΓÇö' },
      { key: 'amount', label: 'Amount paid', get: r => r.amount_paid ?? 'ΓÇö' },
      { key: 'days', label: 'Days missed', get: r => r.days_missed ?? 'ΓÇö' },
    ],
  },
  {
    id: 'harvest',
    title: 'Harvest',
    description: 'Farmer harvest deliveries',
    fetchUrl: apiUrl('/api/aggregation/farmer-harvest/'),
    filename: 'harvest-report.csv',
    dateFilter: true,
    extraFilters: [
      { param: 'coffee_type', label: 'Coffee type', optionsKey: 'coffeeTypes' },
      { param: 'location_of_delivery', label: 'Delivery location', optionsKey: 'harvestLocations' },
    ],
    columns: [
      { key: 'id', label: 'Harvest ID', get: r => r.harvest_id || 'ΓÇö' },
      { key: 'date', label: 'Date', get: r => r.date_of_delivery || 'ΓÇö' },
      { key: 'farmer', label: 'Farmer', get: r => r.name || 'ΓÇö' },
      { key: 'type', label: 'Coffee type', get: r => r.coffee_type || 'ΓÇö' },
      { key: 'weight', label: 'Weight (kg)', get: r => r.weight_on_delivery ?? 'ΓÇö' },
      { key: 'location', label: 'Location', get: r => r.location_of_delivery || 'ΓÇö' },
      { key: 'paid', label: 'Amount paid', get: r => r.amount_paid ?? 'ΓÇö' },
    ],
  },
  {
    id: 'block-activities',
    title: 'Block Activities',
    description: 'Field practices and input applications per block',
    fetchUrl: apiUrl('/api/field-ops/block-activities/'),
    filename: 'block-activities-report.csv',
    dateFilter: true,
    extraFilters: [
      { param: 'block_id', label: 'Block', optionsKey: 'blocks' },
      { param: 'log_type', label: 'Activity type', optionsKey: 'logTypes' },
    ],
    columns: [
      { key: 'date', label: 'Date', get: r => r.activity_date || 'ΓÇö' },
      { key: 'block', label: 'Block', get: r => r.block_id || 'ΓÇö' },
      { key: 'type', label: 'Type', get: r => r.log_type || 'ΓÇö' },
      { key: 'title', label: 'Title', get: r => r.title || 'ΓÇö' },
      { key: 'by', label: 'By', get: r => r.reported_by_display || 'ΓÇö' },
    ],
  },
  {
    id: 'surveillance',
    title: 'Surveillance',
    description: 'Farm surveillance entries from mobile',
    fetchUrl: apiUrl('/api/field-ops/surveillance/'),
    filename: 'surveillance-report.csv',
    dateFilter: true,
    extraFilters: [
      { param: 'block_id', label: 'Block', optionsKey: 'blocks' },
      { param: 'severity', label: 'Severity', optionsKey: 'severities' },
      { param: 'status', label: 'Status', optionsKey: 'survStatuses' },
    ],
    columns: [
      { key: 'date', label: 'Date', get: r => (r.created_at || '').slice(0, 10) || 'ΓÇö' },
      { key: 'block', label: 'Block', get: r => r.block_id || 'ΓÇö' },
      { key: 'title', label: 'Title', get: r => r.title || 'ΓÇö' },
      { key: 'severity', label: 'Severity', get: r => r.severity || 'ΓÇö' },
      { key: 'status', label: 'Status', get: r => r.status || 'ΓÇö' },
      { key: 'issue', label: 'Issue type', get: r => r.issue_type || 'ΓÇö' },
    ],
  },
  {
    id: 'customers',
    title: 'Customers',
    description: 'Registered customers',
    fetchUrl: apiUrl('/api/customers/'),
    filename: 'customers-report.csv',
    dateFilter: false,
    extraFilters: [
      { param: 'search', label: 'Search name', optionsKey: null, type: 'text' },
    ],
    columns: [
      { key: 'name', label: 'Name', get: r => r.name || 'ΓÇö' },
      { key: 'phone', label: 'Phone', get: r => r.phone || 'ΓÇö' },
      { key: 'email', label: 'Email', get: r => r.email || 'ΓÇö' },
      { key: 'city', label: 'City', get: r => r.city || 'ΓÇö' },
      { key: 'country', label: 'Country', get: r => r.country || 'ΓÇö' },
    ],
  },
  {
    id: 'staff',
    title: 'Staff',
    description: 'Staff register',
    fetchUrl: apiUrl('/api/staff/'),
    filename: 'staff-report.csv',
    dateFilter: false,
    extraFilters: [
      { param: 'employment_type', label: 'Employment type', optionsKey: 'employmentTypes' },
      { param: 'district', label: 'District', optionsKey: 'districts' },
    ],
    columns: [
      { key: 'id', label: 'Staff ID', get: r => r.staff_id || 'ΓÇö' },
      { key: 'name', label: 'Name', get: r => r.full_name || `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'ΓÇö' },
      { key: 'role', label: 'Employment', get: r => r.employment_type || 'ΓÇö' },
      { key: 'district', label: 'District', get: r => r.district || 'ΓÇö' },
      { key: 'salary', label: 'Monthly salary', get: r => r.monthly_salary ?? 'ΓÇö' },
      { key: 'active', label: 'Active', get: r => (r.is_active ? 'Yes' : 'No') },
    ],
  },
  {
    id: 'processing',
    title: 'Processing',
    description: 'Processing batch groupings',
    fetchUrl: apiUrl('/api/processing/batch/'),
    filename: 'processing-batches.csv',
    dateFilter: true,
    extraFilters: [],
    columns: [
      { key: 'id', label: 'Batch ID', get: r => r.batch_id || r.id || 'ΓÇö' },
      { key: 'grades', label: 'Grade IDs', get: r => (Array.isArray(r.grade_ids) ? r.grade_ids.join(', ') : r.grade_ids) || 'ΓÇö' },
      { key: 'created_by', label: 'Created by', get: r => r.created_by || 'ΓÇö' },
      { key: 'date', label: 'Created', get: r => (r.created_at || '').slice(0, 10) || 'ΓÇö' },
      { key: 'notes', label: 'Notes', get: r => r.notes || 'ΓÇö' },
    ],
  },
  {
    id: 'export-inventory',
    title: 'Export Inventory',
    description: 'Bagged coffee inventory ledger',
    fetchUrl: apiUrl('/api/export/inventory/'),
    filename: 'export-inventory.csv',
    dateFilter: false,
    extraFilters: [
      { param: 'status', label: 'Status', optionsKey: 'lotStatuses' },
      { param: 'grade', label: 'Grade', optionsKey: 'lotGrades' },
      { param: 'coffee_type', label: 'Coffee type', optionsKey: 'coffeeTypes' },
      { param: 'warehouse', label: 'Warehouse', optionsKey: 'warehouses' },
    ],
    columns: [
      { key: 'lot', label: 'Lot', get: r => r.lot_id || 'ΓÇö' },
      { key: 'grade', label: 'Grade', get: r => r.grade || 'ΓÇö' },
      { key: 'type', label: 'Coffee type', get: r => r.coffee_type || 'ΓÇö' },
      { key: 'kg', label: 'Total kg', get: r => r.total_kg ?? 'ΓÇö' },
      { key: 'bags', label: 'Bags', get: r => r.bags ?? 'ΓÇö' },
      { key: 'warehouse', label: 'Warehouse', get: r => r.warehouse_name || 'ΓÇö' },
      { key: 'status', label: 'Status', get: r => r.status || 'ΓÇö' },
    ],
  },
];

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function mergeOptions(staticOpts, rowValues) {
  const map = new Map();
  (staticOpts || []).forEach(o => {
    if (o?.value) map.set(String(o.value), o.label || o.value);
  });
  (rowValues || []).filter(Boolean).forEach(v => {
    const s = String(v);
    if (!map.has(s)) map.set(s, s);
  });
  return [...map.entries()].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
}

function ReportPanel({ report, filterOptions, searchTerm }) {
  const { title, description, columns, fetchUrl, filename, dateFilter, extraFilters = [] } = report;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filters, setFilters] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFilter && dateFrom) params.date_from = dateFrom;
      if (dateFilter && dateTo) params.date_to = dateTo;
      extraFilters.forEach(f => {
        const val = filters[f.param];
        if (val) params[f.param] = val;
      });
      const data = await fetchAllPages(fetchUrl, getAuthHeaders(), params);
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [fetchUrl, dateFrom, dateTo, dateFilter, extraFilters, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const q = searchTerm.trim().toLowerCase();
  const filtered = q
    ? rows.filter(row => columns.some(c => String(c.get(row) ?? '').toLowerCase().includes(q)))
    : rows;

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b" style={{ backgroundColor: '#efebe9' }}>
        <h2 className="text-lg font-bold" style={{ color: DARK_BROWN }}>{title} Report</h2>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>

      <div className="px-5 py-3 border-b flex flex-wrap gap-2 items-end bg-gray-50">
        {dateFilter && (
          <>
            <div>
              <label className="text-xs text-gray-500 block mb-0.5">From</label>
              <input type="date" className="border rounded-lg px-2 py-1.5 text-sm bg-white" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-0.5">To</label>
              <input type="date" className="border rounded-lg px-2 py-1.5 text-sm bg-white" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </>
        )}
        {extraFilters.map(f => {
          const staticOpts = f.optionsKey ? (filterOptions[f.optionsKey] || []) : [];
          const rowField = f.rowField || f.param;
          const rowVals = f.optionsKey && rows.length ? rows.map(r => r[rowField]).filter(Boolean) : [];
          const options = f.optionsKey ? mergeOptions(staticOpts, rowVals) : [];
          const selectDisabled = Boolean(f.optionsKey && !options.length);

          return (
            <div key={f.param}>
              <label className="text-xs text-gray-500 block mb-0.5">{f.label}</label>
              {f.type === 'text' || !f.optionsKey ? (
                <input
                  type="text"
                  className="border rounded-lg px-2 py-1.5 text-sm bg-white min-w-[140px] text-[#4A3423]"
                  value={filters[f.param] || ''}
                  onChange={e => setFilters(prev => ({ ...prev, [f.param]: e.target.value }))}
                  placeholder={`Filter ${f.label.toLowerCase()}...`}
                />
              ) : (
                <select
                  className="border rounded-lg px-2 py-1.5 text-sm bg-white min-w-[140px] text-[#4A3423] disabled:opacity-60"
                  value={filters[f.param] || ''}
                  disabled={selectDisabled}
                  onChange={e => setFilters(prev => ({ ...prev, [f.param]: e.target.value }))}
                >
                  <option value="">All {f.label.toLowerCase()}</option>
                  {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
        <button onClick={load} className="px-3 py-1.5 text-sm border rounded-lg bg-white hover:bg-gray-100">Apply filters</button>
        <button
          onClick={() => downloadCsv(filename, toCsv(filtered, columns))}
          disabled={!filtered.length}
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg text-white disabled:opacity-40 ml-auto"
          style={{ backgroundColor: BROWN }}
        >
          <Download size={14} /> Export CSV ({filtered.length})
        </button>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin" style={{ color: BROWN }} /></div>
      ) : (
        <div className="overflow-x-auto">
          <StyledTable>
            <StyledThead>
              <tr>
                {columns.map(c => <StyledTh key={c.key}>{c.label}</StyledTh>)}
              </tr>
            </StyledThead>
            <StyledTbody>
              {filtered.slice(0, 100).map((row, i) => (
                <tr key={row.id || row.harvest_id || row.staff_id || i} className="hover:bg-gray-50/80">
                  {columns.map(c => <td key={c.key} className="px-4 py-3">{c.get(row)}</td>)}
                </tr>
              ))}
              {!filtered.length && <TableEmptyRow colSpan={columns.length} message="No records match your filters" />}
              {filtered.length > 100 && (
                <tr><td colSpan={columns.length} className="px-4 py-2 text-gray-400 italic text-xs">Showing first 100 of {filtered.length} — export CSV for full list</td></tr>
              )}
            </StyledTbody>
          </StyledTable>
        </div>
      )}
    </div>
  );
}

export default function ReportsHub() {
  const [activeTab, setActiveTab] = useState(REPORTS[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({});
  const activeReport = REPORTS.find(r => r.id === activeTab) || REPORTS[0];

  useEffect(() => {
    async function loadOptions() {
      const headers = getAuthHeaders();
      try {
        const [grouped, staff, blocks, warehouses, expenses, harvests, inventory, sales] = await Promise.all([
          fetch(apiUrl('/api/config/lookups/grouped/'), { headers }).then(r => r.json()).catch(() => ({})),
          fetchAllPages(apiUrl('/api/staff/'), headers),
          fetchAllPages(apiUrl('/api/blocks/'), headers),
          fetchAllPages(apiUrl('/api/export/warehouses/'), headers).catch(() => []),
          fetchAllPages(apiUrl('/api/expenses/'), headers),
          fetchAllPages(apiUrl('/api/aggregation/farmer-harvest/'), headers),
          fetchAllPages(apiUrl('/api/export/inventory/'), headers),
          fetchAllPages(apiUrl('/api/sales/'), headers),
        ]);

        const saleItems = mergeOptions(
          (grouped.sale_item || []).map(o => ({ value: o.value || o.label, label: o.label || o.value })),
          sales.map(s => s.item),
        );
        const expenseCategories = mergeOptions(
          (grouped.expense_category || []).map(o => ({ value: o.value || o.label, label: o.label || o.value })),
          expenses.map(e => e.category),
        );
        const coffeeTypes = uniqueSorted([
          ...(grouped.coffee_type || []).map(o => o.value || o.label),
          ...harvests.map(h => h.coffee_type),
          ...inventory.map(l => l.coffee_type),
        ]).map(v => ({ value: v, label: v }));

        setFilterOptions({
          saleItems,
          expenseCategories,
          expenseSuppliers: uniqueSorted(expenses.map(e => e.supplier)).map(v => ({ value: v, label: v })),
          paymentMethods: mergeOptions(
            uniqueSorted(['Cash', 'Bank Transfer', 'Mobile Money', 'Cheque', 'Credit Card']).map(v => ({ value: v, label: v })),
            sales.map(s => s.method_of_payment || s.payment_method),
          ),
          saleStatuses: mergeOptions(
            [{ value: 'paid', label: 'Paid' }, { value: 'pending', label: 'Pending' }, { value: 'partial', label: 'Partial' }],
            sales.map(s => s.status),
          ),
          staffOptions: staff.map(s => ({
            value: s.staff_id,
            label: s.full_name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.staff_id,
          })),
          coffeeTypes,
          harvestLocations: uniqueSorted(harvests.map(h => h.location_of_delivery)).map(v => ({ value: v, label: v })),
          blocks: blocks.map(b => ({ value: b.block_id || b.id, label: b.block_id || b.name || b.id })),
          logTypes: [
            { value: 'practice', label: 'Practice' },
            { value: 'input', label: 'Input' },
            { value: 'scouting', label: 'Scouting' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'other', label: 'Other' },
          ],
          severities: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'critical', label: 'Critical' },
          ],
          survStatuses: [
            { value: 'open', label: 'Open' },
            { value: 'investigating', label: 'Investigating' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' },
          ],
          employmentTypes: uniqueSorted(staff.map(s => s.employment_type).filter(Boolean)).map(v => ({ value: v, label: v })),
          districts: uniqueSorted(staff.map(s => s.district).filter(Boolean)).map(v => ({ value: v, label: v })),
          lotStatuses: uniqueSorted(inventory.map(l => l.status).filter(Boolean)).map(v => ({ value: v, label: v.replace(/_/g, ' ') })),
          lotGrades: uniqueSorted(inventory.map(l => l.grade).filter(Boolean)).map(v => ({ value: v, label: v })),
          warehouses: (warehouses || []).map(w => ({ value: String(w.id), label: w.name || w.code || w.id })),
        });
      } catch (e) {
        console.warn('[Reports] Could not load filter options', e);
      }
    }
    loadOptions();
  }, []);

  return (
    <SideNav>
      <main className="p-4 sm:p-6 md:p-8 pt-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: DARK_BROWN }}>Reports</h1>
          <p className="text-gray-600 mt-1">Select a report, apply filters, and export</p>
        </div>

        <div className="mb-6 bg-white rounded-2xl shadow-lg p-2">
          <div className="flex flex-wrap gap-2">
            {REPORTS.map(report => {
              const isActive = activeTab === report.id;
              return (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => { setActiveTab(report.id); setSearchTerm(''); }}
                  className={`px-4 py-2.5 rounded-xl transition-all font-medium text-sm whitespace-nowrap ${isActive ? 'shadow-md' : 'hover:bg-gray-50'}`}
                  style={{ backgroundColor: isActive ? BROWN : 'transparent', color: isActive ? '#FFFFFF' : DARK_BROWN }}
                >
                  {report.title}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder={`Search within ${activeReport.title.toLowerCase()} report...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-xl text-sm outline-none"
          />
        </div>

        <ReportPanel key={activeTab} report={activeReport} filterOptions={filterOptions} searchTerm={searchTerm} />
      </main>
    </SideNav>
  );
}
