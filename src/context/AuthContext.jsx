// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 👤 Fetch logged-in user profile
  const fetchUser = async () => {
    try {
      const res = await API.get("/customers/profile/");
      setUser(res.data);
      localStorage.setItem("auth_user", JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      console.warn("⚠️ fetchUser failed:", err);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Refresh user (called after login)
  const refreshUser = async () => {
    try {
      const res = await API.get("/customers/profile/");
      setUser(res.data);
      localStorage.setItem("auth_user", JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      console.error("refreshUser failed:", err);
      setUser(null);
      throw err;
    }
  };

  // 🚀 Load user on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // 🚪 Logout — clean everything
  const logout = () => {
    const user = localStorage.getItem("auth_user");
    const id = user ? JSON.parse(user)?.id : null;

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("auth_user");
    if (id) localStorage.removeItem(`theme-${id}`);
    localStorage.removeItem("theme-guest");

    delete API.defaults.headers.common["Authorization"];

    setUser(null);
    console.log("🧹 Cleared user and theme data on logout");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
