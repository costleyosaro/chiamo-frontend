import API from "../services/api";

export async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  try {
    const res = await API.post("/auth/refresh/", { refresh });
    const newAccess = res.data.access;
    if (newAccess) {
      localStorage.setItem("access", newAccess);
      API.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
      console.log("🔁 Access token refreshed");
      return newAccess;
    }
  } catch (err) {
    console.warn("❌ Token refresh failed:", err.message);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
  }
  return null;
}
