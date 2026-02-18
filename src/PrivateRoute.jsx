// src/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access"); // check for access token
  return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
