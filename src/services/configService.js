import { getAuthHeaders } from '../utils/authHeaders';

const API_URL = import.meta.env.VITE_API_URL;

export const CONFIG_CATEGORIES = [
  { key: 'coffee_type', label: 'Coffee Types', description: 'Types used on harvest and export forms' },
  { key: 'coffee_variety', label: 'Coffee Varieties', description: 'Varieties on farmer registration' },
  { key: 'fertilizer', label: 'Fertilizers', description: 'Fertilizer options for farmer profiles' },
  { key: 'pesticide', label: 'Pesticides', description: 'Pesticide options (include "None")' },
  { key: 'standard_practice', label: 'Standard Practices', description: 'Farming practices checklist' },
  { key: 'seedling_type', label: 'Seedling Types', description: 'Seedling variety codes' },
  { key: 'grade', label: 'Grades', description: 'Coffee quality grades' },
  { key: 'spacing', label: 'Tree Spacing', description: 'Plant spacing options' },
  { key: 'sale_item', label: 'Sale Items', description: 'Products in Sales dropdown (use Settings → Sale Items)' },
];

export async function fetchGroupedLookups() {
  const res = await fetch(`${API_URL}/api/config/lookups/grouped/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load configuration');
  return res.json();
}

export async function bulkReplaceCategory(category, options) {
  const res = await fetch(`${API_URL}/api/config/lookups/bulk-replace/`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ category, options }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to save configuration');
  }
  return res.json();
}
