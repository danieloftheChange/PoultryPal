/**
 * API Configuration
 * Centralized API URL configuration for the application
 */

// Get the API base URL from environment variables
// Falls back to localhost if not defined
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Remove trailing /api/v1 if present to get base URL
const API_BASE = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - The API endpoint (e.g., '/user/signup', '/batch')
 * @returns The full API URL
 *
 * @example
 * getApiUrl('/user/signup') // 'http://localhost:3000/api/v1/user/signup'
 * getApiUrl('/batch/123') // 'http://localhost:3000/api/v1/batch/123'
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE}:3000/api/v1/${cleanEndpoint}`;
};

/**
 * API base URL (without /api/v1)
 * Use this when you need to construct custom URLs
 */
export const API_URL_BASE = `${API_BASE}:3000`;

/**
 * API version path
 */
export const API_VERSION = '/api/v1';

/**
 * Full API base URL (with /api/v1)
 */
export const API_URL = `${API_URL_BASE}${API_VERSION}`;

export default {
  getApiUrl,
  API_URL,
  API_URL_BASE,
  API_VERSION,
};
