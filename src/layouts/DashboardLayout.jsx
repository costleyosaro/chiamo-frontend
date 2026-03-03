// src/layouts/DashboardLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      {/* Main Content - Outlet renders child routes (HomePage, OrdersPage, etc.) */}
      <main className="dashboard-content">
        <Outlet />
      </main>

      {/* Bottom Navigation - Shows on all protected pages */}
      <BottomNav />
    </div>
  );
}