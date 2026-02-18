// src/services/cart.js
import API from "./api";

// ✅ Fetch cart items for the logged-in user
export const fetchCart = () => {
  return API.get("/orders/cart/"); // GET current cart
};

// ✅ Add item to cart
export const addToCart = (productId, quantity = 1) => {
  return API.post("/orders/cart/add/", { product_id: productId, quantity });
};

// ✅ Update quantity of a cart item
export const updateCartItem = (productId, quantity) => {
  return API.post("/orders/cart/update/", { product_id: productId, quantity });
};

// ✅ Remove item from cart
export const removeCartItem = (productId) => {
  return API.post("/orders/cart/remove/", { product_id: productId });
};

// ✅ Clear entire cart
export const clearCart = () => {
  return API.post("/orders/cart/clear/"); 
};
