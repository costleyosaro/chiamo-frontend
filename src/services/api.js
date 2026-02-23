// src/services/api.js
import axios from "axios";

// ✅ Create the axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/",
})
// =============================
// 🔹 TOKEN MANAGEMENT HELPERS
// =============================
const getAccessToken = () => localStorage.getItem("access");
const getRefreshToken = () => localStorage.getItem("refresh");

const saveAccessToken = (token) => {
  localStorage.setItem("access", token);
  API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// =============================
// 🔹 SKIP AUTH ENDPOINTS
// =============================
const skipAuthEndpoints = ["token/", "signup/", "login/", "register/"];
const shouldSkipAuth = (url) =>
  skipAuthEndpoints.some((endpoint) => url.includes(endpoint));

// =============================
// 🔹 REQUEST INTERCEPTOR
// =============================
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

// =============================
// 🔹 REFRESH TOKEN HANDLING
// =============================
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

// ✅ Function to refresh access token
async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new Error("No refresh token found");
  }

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/"}/token/refresh/`,
      { refresh }  // ← Send the refresh token!
    );
    const newAccess = res.data.access;
    if (newAccess) {
      saveAccessToken(newAccess);
      console.log("🔁 Access token refreshed");
      return newAccess;
    }
    throw new Error("Invalid refresh response");
  } catch (err) {
    console.warn("❌ Token refresh failed:", err.message);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
    throw err;
  }
}

// =============================
// 🔹 RESPONSE INTERCEPTOR
// =============================
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip if request already retried or not an auth error
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      shouldSkipAuth(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    // Mark request as retried
    originalRequest._retry = true;

    // Handle multiple requests during refresh
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(API(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      onRefreshed(newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return API(originalRequest);
    } catch (err) {
      isRefreshing = false;
      return Promise.reject(err);
    }
  }
);

export default API;
