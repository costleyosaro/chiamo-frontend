// src/main.jsx
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";


// Styles
import "./main.css";
import "./index.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Context Providers
import { OrdersProvider } from "./pages/OrdersContext";
import { CartProvider } from "./pages/CartContext";
import { SmartListProvider } from "./pages/SmartListContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

// Layout & Route Guard
import PrivateRoute from "./PrivateRoute";
import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import PreHomePage from "./pages/PreHomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import CartPage from "./pages/CartPage";
import Cart from "./pages/Cart";
import ProfilePage from "./pages/ProfilePage";
import AllProducts from "./pages/AllProducts";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import ProductGalleryPage from "./pages/ProductGalleryPage";

// ✅ Newly added supporting pages
import EditProfile from "./pages/EditProfile";
import Addresses from "./pages/Addresses";
import Notifications from "./pages/Notifications";
import Payments from "./pages/Payments";
import Support from "./pages/Support";
import { Toaster } from "react-hot-toast";

import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";


// ✅ Import Splash Screen
import SplashScreen from "./components/SplashScreen";

// ✅ Main App Wrapper with Splash Logic
function MainApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 4000); // fade at 4s
    const hideTimer = setTimeout(() => setShowSplash(false), 5000); // hide at 5s
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (showSplash) {
    return (
      <div className={`splash-wrapper ${fadeOut ? "fade-out" : "fade-in"}`}>
        <SplashScreen />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="bottom-center" reverseOrder={false} /> {/* ✅ Toast provider */}
      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/" element={<PreHomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/product-gallery" element={<ProductGalleryPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/about-us" element={<AboutPage />} />
        <Route path="/contact-us" element={<ContactPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

        {/* 🔒 Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="home" element={<HomePage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="cart" element={<Cart />} />
          <Route path="cart-page" element={<CartPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="all-products" element={<AllProducts />} />
          <Route path="order-history/:orderId" element={<OrderHistoryPage />} />

          {/* ✅ New Profile-related pages */}
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="addresses" element={<Addresses />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="payments" element={<Payments />} />
          <Route path="support" element={<Support />} />
        </Route>

        {/* 🧭 Fallback */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

// ✅ Wrap with Providers
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <OrdersProvider>
        <CartProvider>
          <SmartListProvider>
            <ThemeProvider>
              <MainApp />
            </ThemeProvider>
          </SmartListProvider>
        </CartProvider>
      </OrdersProvider>
    </AuthProvider>
  </React.StrictMode>
);
