// src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, refreshUser, loading: authLoading } = useAuth(); // ✅ Use AuthContext
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧮 Cart badge count
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // 🧠 Normalize item structure from backend
  const normalizeItem = (item) => {
    const product = item.product || {};
    const image =
      (product.image &&
        (typeof product.image === "string" ? product.image : product.image.url)) ||
      item.image ||
      null;

    const price = parseFloat(product.price ?? item.price ?? 0) || 0;

    return {
      id: item.id, // cart item ID
      productId: product.id ?? item.product_id ?? item.product ?? null,
      slug: product.slug ?? item.slug ?? null,
      name: product.name ?? item.product ?? item.name ?? "Unnamed product",
      image,
      price,
      quantity: item.quantity ?? 1,
      raw: item,
    };
  };

  // 🛒 Fetch cart from API
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

        // 💾 Cache per-user cart locally
        localStorage.setItem(`cart_${activeUser.id}`, JSON.stringify(normalized));
      } catch (err) {
        console.error("fetchCart failed:", err);
        if (activeUser?.id) {
          const saved = localStorage.getItem(`cart_${activeUser.id}`);
          if (saved) setCart(JSON.parse(saved));
          else setCart([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // 🔄 Sync cart when user changes (after login/logout)
  useEffect(() => {
    (async () => {
      if (authLoading) return; // wait for AuthContext to finish
      if (user) {
        const saved = localStorage.getItem(`cart_${user.id}`);
        if (saved) setCart(JSON.parse(saved));
        await fetchCart(user);
      } else {
        setCart([]);
        setLoading(false);
      }
    })();
  }, [user, authLoading, fetchCart]);

  // 🛒 Add item to cart
  const addToCart = async (productIdentifier, quantity = 1, productName = "") => {
    if (!user) throw new Error("You must be logged in to add items to cart");
    try {
      const payload = { product_id: productIdentifier, quantity };
      await API.post("/orders/cart/add/", payload);
      await fetchCart(user);
      const namePart = productName ? ` ${productName}` : "";
      return `Added ${quantity}${namePart} to cart successfully`;
    } catch (err) {
      console.error("addToCart failed:", err);
      throw err;
    }
  };

  // 🔁 Update quantity
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

  // ❌ Remove item
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

  // 🧹 Clear cart
  const clearCart = async () => {
    if (!user) throw new Error("You must be logged in to clear cart");
    try {
      await API.post("/orders/cart/clear/");
      setCart([]);
      localStorage.removeItem(`cart_${user.id}`);
      return true;
    } catch (err) {
      console.error("clearCart failed:", err);
      throw err;
    }
  };

  // 💳 Checkout
  const checkout = async () => {
    if (!user) throw new Error("You must be logged in to checkout");
    try {
      const res = await API.post("/orders/checkout/");
      await fetchCart(user);
      return res.data;
    } catch (err) {
      console.error("checkout failed:", err);
      throw err;
    }
  };

  return (
    <CartContext.Provider
      value={{
        user,
        cart,
        cartCount,
        loading,
        fetchCart,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        checkout,
        refreshUser, // ✅ from AuthContext
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
