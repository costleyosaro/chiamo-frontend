// src/services/api.js
import axios from "axios";

// ✅ RUNTIME URL DETECTION - Cannot fail!
const isLocalhost = window.location.hostname === "localhost" 
                 || window.location.hostname === "127.0.0.1";

const BASE_URL = isLocalhost
  ? "http://127.0.0.1:8000/api/"
  : "https://web-production-04707.up.railway.app/api/";

console.log("🌐 API Base URL:", BASE_URL);
console.log("🏠 Is Localhost:", isLocalhost);

const API = axios.create({
  baseURL: BASE_URL,
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

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      shouldSkipAuth(originalRequest.url)
    ) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;
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