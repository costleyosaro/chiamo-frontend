// src/App.jsx
import React from "react";

// Components & Pages
import PreHomePage from "./pages/PreHomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProductGalleryPage from "./pages/ProductGalleryPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

function App() {
  return (
    <div className="app-container">
      {/* Public pages only. Protected routes are handled in main.jsx */}
      <PreHomePage />
      <SignUpPage />
      <LoginPage />
      <ProductGalleryPage />
      <ForgotPasswordPage />
      <ResetPasswordPage />
      <AboutPage />
      <ContactPage />
      <PrivacyPolicyPage />
    </div>
  );
}

export default App;
