/**
 * API Client Configuration
 * Routes all API requests to the standard AgriMate backend service (/api).
 */
export const API_BASE = '/api';

export function apiUrl(endpoint: string): string {
  const clean = endpoint.replace(/^\/?(api\/)?/, '');
  return `${API_BASE}/${clean}`;
}
