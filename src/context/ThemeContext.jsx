// src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);

  // 🔍 helper → get logged-in user ID
  const getUserId = () => {
    try {
      const raw = localStorage.getItem("auth_user");
      if (!raw) return null;
      const user = JSON.parse(raw);
      return user?.id || null;
    } catch {
      return null;
    }
  };

  // build per-user key
  const getThemeKey = () => {
    const id = getUserId();
    return id ? `theme-${id}` : "theme-guest";
  };

  // load from localStorage first
  useEffect(() => {
    const stored = localStorage.getItem(getThemeKey());
    if (stored) {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  // fetch from backend if logged in
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      setLoading(false);
      return;
    }
    API.get("/customers/theme/")
      .then((res) => {
        const userTheme = res.data?.theme;
        if (userTheme) {
          setTheme(userTheme);
          document.documentElement.setAttribute("data-theme", userTheme);
          localStorage.setItem(getThemeKey(), userTheme);
        }
      })
      .catch((err) => console.warn("⚠️ Theme fetch failed:", err.message))
      .finally(() => setLoading(false));
  }, []);

  // toggle theme and sync to backend
  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem(getThemeKey(), newTheme);

    const token = localStorage.getItem("access");
    if (token) {
      try {
        await API.patch("/customers/theme/", { theme: newTheme });
        console.log("✅ Theme updated on backend:", newTheme);
      } catch (err) {
        console.warn("⚠️ Theme update failed:", err.message);
      }
    }
  };

  // Debug helper (optional)
  useEffect(() => {
    console.log("🧠 Using theme key:", getThemeKey());
    console.log("🎨 Current theme:", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
