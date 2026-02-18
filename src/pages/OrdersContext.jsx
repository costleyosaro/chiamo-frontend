// src/pages/OrdersContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext"; // ✅ Import AuthContext

const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const { user } = useAuth(); // ✅ Get current user from AuthContext
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOrderIds, setNewOrderIds] = useState([]); // 🆕 Track recently placed orders

  // 📦 Fetch orders for the current user
  const fetchOrders = async (activeUser = user) => {
    if (!activeUser) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await API.get("/orders/user-orders/");
      const fetchedOrders = Array.isArray(res.data) ? res.data : [];
      setOrders(fetchedOrders);

      // 💾 Cache orders locally per user
      localStorage.setItem(`orders_${activeUser.id}`, JSON.stringify(fetchedOrders));
    } catch (err) {
      console.error("fetchOrders failed:", err);
      const cached = localStorage.getItem(`orders_${activeUser?.id}`);
      if (cached) setOrders(JSON.parse(cached));
      else setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Re-fetch orders whenever user logs in/out
  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const saved = localStorage.getItem(`orders_${user.id}`);
    if (saved) setOrders(JSON.parse(saved));

    fetchOrders(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // ✅ Re-run when user changes

  // 🧾 Place a new order (and mark it as "NEW")
  const placeOrder = async (cartData) => {
    try {
      const res = await API.post("/orders/checkout/", cartData);
      const newOrder = res.data;

      setOrders((prev) => [newOrder, ...prev]);
      setNewOrderIds((prev) => [...prev, newOrder.id]);

      // 💾 Update cache
      if (user)
        localStorage.setItem(`orders_${user.id}`, JSON.stringify([newOrder, ...orders]));

      return newOrder;
    } catch (err) {
      console.error("placeOrder failed:", err);
      throw err;
    }
  };

  // 🕓 Mark an order as viewed (removes “NEW” tag after refresh)
  const markOrderAsViewed = (orderId) => {
    setNewOrderIds((prev) => prev.filter((id) => id !== orderId));
  };

  // 📊 Count for badges
  const totalOrdersCount = orders.length;
  const newOrdersCount = newOrderIds.length;

  return (
    <OrdersContext.Provider
      value={{
        user,
        orders,
        loading,
        fetchOrders,
        placeOrder,
        markOrderAsViewed,
        totalOrdersCount,
        newOrdersCount,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrdersContext);
}
