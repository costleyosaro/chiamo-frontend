// src/services/products.js
import api from "./api";

/**
 * Fetch products from the backend
 * Always returns an array of product objects (never an object)
 */
export const fetchProducts = async () => {
  try {
    // First request -> returns endpoint links (e.g. { products: "...", categories: "..." })
    const rootRes = await api.get("products/");
    console.log("Initial products response (root):", rootRes.data);

    const productsUrl = rootRes.data?.products;
    if (!productsUrl) {
      // Sometimes backend might return the actual list directly
      if (Array.isArray(rootRes.data)) return rootRes.data;
      console.error("❌ No products URL found in API root response");
      return [];
    }

    // Second request -> actual products endpoint (may return array or paginated object)
    const productsRes = await api.get(productsUrl);
    console.log("Actual products response:", productsRes.data);

    // Normalize into an array
    if (Array.isArray(productsRes.data)) {
      return productsRes.data;
    }
    if (Array.isArray(productsRes.data.results)) {
      return productsRes.data.results;
    }
    // If the endpoint returns a paginated `products` or nested key
    if (Array.isArray(productsRes.data.products)) {
      return productsRes.data.products;
    }

    console.warn("⚠️ Unexpected products response format:", productsRes.data);
    return [];
  } catch (err) {
    console.error("❌ fetchProducts failed:", err.response?.data || err.message);
    throw err;
  }
};
