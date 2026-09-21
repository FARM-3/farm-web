export function getAuthHeaders() {
  const token =
    localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}
