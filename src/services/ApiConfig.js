/**
 * Centralized API Configuration
 *
 * This file provides a single source of truth for all API endpoints.
 * Instead of hardcoding API URLs throughout the codebase, import this file
 * and use the getApiUrl() function.
 *
 * Usage:
 * import { getApiUrl } from '../services/ApiConfig';
 *
 * const url = getApiUrl('expenses');  // Returns: http://192.168.1.95:8000/api/expenses/
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://142.93.94.236:8000';

/**
 * Get full API URL for an endpoint
 * @param {string} endpoint - The endpoint path (e.g., 'expenses', 'sales', 'staff')
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}/api/${endpoint}/`;
};

/**
 * Get API base URL (without /api path)
 * @returns {string} Base API URL
 */
export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

/**
 * Predefined API endpoints for easy access
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/users/login/`,
  LOGOUT: `${API_BASE_URL}/api/users/logout/`,
  USER_ME: `${API_BASE_URL}/api/users/me/`,

  // Security Questions endpoints
  RANDOM_SECURITY_QUESTIONS: `${API_BASE_URL}/api/users/random-security-questions/`,
  SETUP_SECURITY_ANSWERS: `${API_BASE_URL}/api/users/setup-security-answers/`,
  USER_SECURITY_QUESTIONS: `${API_BASE_URL}/api/users/user-security-questions/`,
  VERIFY_ANSWERS_RESET_PIN: `${API_BASE_URL}/api/users/verify-answers-reset-pin/`,

  // Expenses endpoints
  EXPENSES: getApiUrl('expenses'),

  // Sales endpoints
  SALES: getApiUrl('sales'),

  // Staff endpoints
  STAFF: getApiUrl('staff'),

  // Wages endpoints
  WAGES: getApiUrl('wages'),

  // Aggregation endpoints
  FARMER_HARVEST: `${API_BASE_URL}/api/aggregation/farmer-harvest/`,

  // Harvest endpoints
  HARVESTS: `${API_BASE_URL}/api/harvests/`,

  // Ripeness Score endpoints
  RIPENESS: `${API_BASE_URL}/api/processing/ripeness/`,
  RIPENESS_SUMMARY: `${API_BASE_URL}/api/processing/ripeness/summary/`,

  // Floating endpoints (if needed)
  FLOATING: `${API_BASE_URL}/api/processing/floating/`,
  FLOATING_SUMMARY: `${API_BASE_URL}/api/processing/floating/summary/`,
};

/**
 * Get current API configuration
 * @returns {object} Configuration object
 */
export const getApiConfig = () => {
  return {
    baseUrl: API_BASE_URL,
    endpoints: API_ENDPOINTS,
  };
};

export default API_ENDPOINTS;
