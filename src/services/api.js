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
  timeout: 15000, // 15 second timeout
});

const getAccessToken = () => localStorage.getItem("access");
const getRefreshToken = () => localStorage.getItem("refresh");

const saveAccessToken = (token) => {
  localStorage.setItem("access", token);       
  API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

const skipAuthEndpoints = ["token/", "signup/", "login/", "register/"];
const shouldSkipAuth = (url) =>
  skipAuthEndpoints.some((endpoint) => url.includes(endpoint));

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

// Response interceptor for token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors gracefully
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
      console.error('🚫 Backend server is not reachable:', BASE_URL);
      return Promise.reject(error);
    }

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
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
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
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

export default API;