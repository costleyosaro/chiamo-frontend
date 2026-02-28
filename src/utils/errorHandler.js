
export const handleApiError = (error, context = '') => {
  // Don't log timeout errors as errors, just warnings
  if (error.code === 'ECONNABORTED') {
    console.warn(`⏰ ${context} request timeout - this is normal for slow connections`);
    return { type: 'timeout', message: 'Request timeout' };
  }
  
  if (error.response?.status === 404) {
    console.warn(`📝 ${context} endpoint not found - feature may not be implemented yet`);
    return { type: 'not_found', message: 'Feature not available yet' };
  }
  
  if (error.code === 'ERR_NETWORK') {
    console.warn(`🌐 ${context} network error`);
    return { type: 'network', message: 'Network error' };
  }
  
  console.error(`❌ ${context} error:`, error.message);
  return { type: 'error', message: error.message };
};