// src/services/api.js
import axios from "axios";

// ✅ RUNTIME URL DETECTION - Cannot fail!    
const isLocalhost = window.location.hostname === "localhost"
                 || window.location.hostname === "127.0.0.1";

const BASE_URL = isLocalhost
  ? "http://127.0.0.1:8000/api/"
  : "https://web-production-04707.up.railway.app/api/";

console.log("🌐 Is Localhost:", isLocalhost);
console.log("🔗 API Base URL:", BASE_URL);

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, 
});

const getAccessToken = () => localStorage.getItem("access");
const getRefreshToken = () => localStorage.getItem("refresh");

const saveAccessToken = (token) => {
  localStorage.setItem("access", token);       
  API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// ✅ FIXED: Updated skipAuthEndpoints with correct paths
const skipAuthEndpoints = [
  "token/", 
  "signup/", 
  "login/", 
  "register/",
  "customers/forgot-password/",
  "customers/verify-otp/",
  "customers/reset-password/"
];

const shouldSkipAuth = (url) =>
  skipAuthEndpoints.some((endpoint) => url.includes(endpoint));

// ✅ FIXED: Check if user is authenticated
const isAuthenticated = () => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  return !!(accessToken || refreshToken);
};

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken && !shouldSkipAuth(config.url)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {  
  refreshSubscribers.push(callback);
};

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token found");

  try {
    const res = await axios.post(`${BASE_URL}token/refresh/`, { refresh });
    const newToken = res.data.access;
    saveAccessToken(newToken);
    return newToken;
  } catch (error) {
    // Clear invalid tokens
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    delete API.defaults.headers.common["Authorization"];
    throw error;
  }
}

// ✅ FIXED: Enhanced response interceptor with better error handling
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors gracefully
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
      console.error('🚫 Backend server is not reachable:', BASE_URL);
      return Promise.reject(error);
    }

    // ✅ FIXED: Better 401 handling - check if we should even try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip auth refresh for endpoints that don't need authentication
      if (shouldSkipAuth(originalRequest.url)) {
        return Promise.reject(error);
      }

      // Check if we have a refresh token before trying to refresh
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.log("No refresh token available, clearing auth state");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        delete API.defaults.headers.common["Authorization"];
        
        // Only redirect if not already on auth pages
        const currentPath = window.location.pathname;
        const authPages = ['/login', '/register', '/forgot-password', '/'];
        if (!authPages.includes(currentPath)) {
          console.log("Redirecting to login due to missing refresh token");
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, wait for it to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(API(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        onRefreshed(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);
        
        // Clear all auth data
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        delete API.defaults.headers.common["Authorization"];
        
        // Only redirect if not already on auth pages
        const currentPath = window.location.pathname;
        const authPages = ['/login', '/register', '/forgot-password', '/'];
        if (!authPages.includes(currentPath)) {
          console.log("Redirecting to login due to refresh failure");
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ✅ ADDED: Helper function to clear auth state
export const clearAuthState = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  delete API.defaults.headers.common["Authorization"];
  isRefreshing = false;
  refreshSubscribers = [];
};

// ✅ ADDED: Helper function to check authentication status
export const checkAuthStatus = () => {
  return isAuthenticated();
};

export default API;