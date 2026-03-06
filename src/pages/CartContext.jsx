// src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const notificationContext = useNotifications();
  const { createOrderNotification, createCartReminder } = notificationContext || {};

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const normalizeItem = (item) => {
    const product = item.product || {};
    const image =
      (product.image &&
        (typeof product.image === "string" ? product.image : product.image.url)) ||
      item.image ||
      null;

    const price = parseFloat(product.price ?? item.price ?? 0) || 0;

    return {
      id: item.id,
      productId: product.id ?? item.product_id ?? item.product ?? null,
      slug: product.slug ?? item.slug ?? null,
      name: product.name ?? item.product ?? item.name ?? "Unnamed product",
      image,
      price,
      quantity: item.quantity ?? 1,
      raw: item,
    };
  };

  const fetchCart = useCallback(
    async (activeUser = user) => {
      if (!activeUser) {
        setCart([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await API.get("/orders/cart/");
        const data = res.data ?? {};
        let items = [];

        if (Array.isArray(data)) items = data;
        else if (Array.isArray(data.items)) items = data.items;
        else if (Array.isArray(data.cart?.items)) items = data.cart.items;
        else if (Array.isArray(data.results)) items = data.results;

        const normalized = items.map(normalizeItem);
        setCart(normalized);

        localStorage.setItem(`cart_${activeUser.id}`, JSON.stringify(normalized));
      } catch (err) {
        console.error("fetchCart failed:", err);
        if (activeUser?.id) {
          const saved = localStorage.getItem(`cart_${activeUser.id}`);
          if (saved) {
            try {
              setCart(JSON.parse(saved));
            } catch (parseErr) {
              console.error("Failed to parse saved cart:", parseErr);
              setCart([]);
            }
          } else {
            setCart([]);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    (async () => {
      if (authLoading) return;
      if (user) {
        const saved = localStorage.getItem(`cart_${user.id}`);
        if (saved) {
          try {
            setCart(JSON.parse(saved));
          } catch (parseErr) {
            console.error("Failed to parse saved cart:", parseErr);
            setCart([]);
          }
        }
        await fetchCart(user);
      } else {
        setCart([]);
        setLoading(false);
      }
    })();
  }, [user, authLoading, fetchCart]);

  useEffect(() => {
    if (user && cartCount > 0 && createCartReminder && typeof createCartReminder === 'function') {
      if (cartCount >= 3) {
        const lastReminderTime = localStorage.getItem(`cart_reminder_${user.id}`);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        if (!lastReminderTime || (now - parseInt(lastReminderTime)) > oneHour) {
          try {
            createCartReminder(cartCount);
            localStorage.setItem(`cart_reminder_${user.id}`, now.toString());
          } catch (error) {
            console.error("Failed to create cart reminder:", error);
          }
        }
      }
    }
  }, [cartCount, user, createCartReminder]);

  const addToCart = async (productIdentifier, quantity = 1, productName = "") => {
    if (!user) throw new Error("You must be logged in to add items to cart");
    
    try {
      const payload = { product_id: productIdentifier, quantity };
      await API.post("/orders/cart/add/", payload);
      await fetchCart(user);
      
      const namePart = productName ? ` ${productName}` : "";
      const successMessage = `Added ${quantity}${namePart} to cart successfully`;
      
      if (createCartReminder && typeof createCartReminder === 'function' && productName) {
        setTimeout(() => {
          try {
            const newCartCount = cartCount + quantity;
            if (newCartCount >= 2) {
              createCartReminder(newCartCount);
            }
          } catch (error) {
            console.error("Failed to create cart notification:", error);
          }
        }, 1000);
      }
      
      return successMessage;
    } catch (err) {
      console.error("addToCart failed:", err);
      throw err;
    }
  };

  const updateQty = async (productIdentifier, quantity) => {
    if (!user) throw new Error("You must be logged in to update cart");
    try {
      const payload = { product_id: productIdentifier, quantity };
      await API.put("/orders/cart/update/", payload);
      await fetchCart(user);
      return true;
    } catch (err) {
      console.error("updateQty failed:", err);
      throw err;
    }
  };

  const removeFromCart = async (productIdentifier) => {
    if (!user) throw new Error("You must be logged in to remove items");
    try {
      const payload = { product_id: productIdentifier };
      await API.post("/orders/cart/remove/", payload);
      await fetchCart(user);
      return true;
    } catch (err) {
      console.error("removeFromCart failed:", err);
      throw err;
    }
  };

  // ✅ FIXED: Clear local state FIRST, then try backend
  const clearCart = async () => {
    if (!user) throw new Error("You must be logged in to clear cart");

    // ✅ Step 1: Immediately clear local state (optimistic)
    setCart([]);
    localStorage.removeItem(`cart_${user.id}`);
    localStorage.removeItem(`cart_reminder_${user.id}`);

    // ✅ Step 2: Then try clearing on the backend (non-blocking)
    try {
      await API.post("/orders/cart/clear/");
    } catch (err) {
      console.warn("Backend cart clear failed (cart already cleared locally):", err.message);
      // Don't throw — local cart is already empty, which is what the user sees.
      // The backend cart will sync on next fetchCart anyway,
      // and after checkout the backend cart should already be empty.
    }

    return true;
  };

  const checkout = async () => {
    if (!user) throw new Error("You must be logged in to checkout");
    
    try {
      const res = await API.post("/orders/checkout/");
      
      if (res.data && createOrderNotification && typeof createOrderNotification === 'function') {
        const orderId = res.data.order_id || res.data.id || res.data.order?.id;
        const orderTotal = res.data.total || res.data.order?.total || 
                          cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (orderId) {
          try {
            createOrderNotification(orderId, 'placed', orderTotal);
            localStorage.removeItem(`cart_reminder_${user.id}`);
          } catch (error) {
            console.error("Failed to create order notification:", error);
          }
        }
      }

      // ✅ Clear local cart immediately after successful checkout
      setCart([]);
      localStorage.removeItem(`cart_${user.id}`);
      localStorage.removeItem(`cart_reminder_${user.id}`);
      
      return res.data;
    } catch (err) {
      console.error("checkout failed:", err);
      throw err;
    }
  };

  const notifyOrderUpdate = (orderId, event = 'placed', orderTotal = null) => {
    if (createOrderNotification && typeof createOrderNotification === 'function') {
      try {
        createOrderNotification(orderId, event, orderTotal);
      } catch (error) {
        console.error("Failed to create order update notification:", error);
      }
    } else {
      console.warn("createOrderNotification function not available");
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const testNotifications = () => {
    if (user) {
      if (createCartReminder && typeof createCartReminder === 'function') {
        createCartReminder(cartCount || 3);
      }
      
      if (createOrderNotification && typeof createOrderNotification === 'function') {
        const testOrderId = Math.floor(Math.random() * 1000) + 1;
        createOrderNotification(testOrderId, 'placed', cartTotal || 5000);
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        user,
        cart,
        cartCount,
        cartTotal,
        loading,
        fetchCart,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        checkout,
        refreshUser,
        notifyOrderUpdate,
        testNotifications,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}