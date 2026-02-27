// src/utils/apiHelpers.js
import API from '../services/api';

// Safe API call wrapper
export const safeApiCall = async (endpoint, options = {}) => {
  try {
    const response = await API.get(endpoint, options);
    return { success: true, data: response.data, error: null };
  } catch (error) {
    console.warn(`API call failed for ${endpoint}:`, error.message);
    
    if (error.response?.status === 404) {
      return { success: false, data: null, error: 'Endpoint not found', isNotFound: true };
    }
    
    if (error.code === 'ECONNABORTED') {
      return { success: false, data: null, error: 'Request timeout', isTimeout: true };
    }
    
    if (error.code === 'ERR_NETWORK') {
      return { success: false, data: null, error: 'Network error', isNetworkError: true };
    }
    
    return { success: false, data: null, error: error.message };
  }
};

// Check if endpoint exists
export const checkEndpointExists = async (endpoint) => {
  try {
    await API.head(endpoint);
    return true;
  } catch (error) {
    return false;
  }
};