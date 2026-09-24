/**
 * API base URL for all web requests.
 * - Local dev: set VITE_API_URL=http://127.0.0.1:8000 in .env (run Django with 0.0.0.0:8000)
 * - Production: VITE_API_URL=https://your-api.onrender.com
 * - Empty in dev falls back to Vite /api proxy → local Django
 */
export function getApiBaseUrl() {
  const configured = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  if (configured) return configured;
  if (import.meta.env.DEV) return '';
  return 'https://farm-api-uvor.onrender.com';
}

export function apiUrl(path) {
  const base = getApiBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
