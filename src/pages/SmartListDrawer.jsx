// src/pages/SmartListDrawer.jsx
import React, { useState, useEffect, useMemo } from "react";
import API from "../services/api";
import { useSmartLists } from "./SmartListContext";
import "./SmartListDrawer.css";

export default function SmartListDrawer({ onClose, targetListId }) {
  const { lists, addItemToList } = useSmartLists();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  const activeList = useMemo(
    () => lists.find((l) => l.id === targetListId),
    [lists, targetListId]
  );

  // ✅ Fetch products from backend
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);

        // 1️⃣ Try to hit /api/products/
        const root = await API.get("/products/");
        console.log("✅ Products root fetched:", root.data);

        // 2️⃣ Detect if it only returned URLs
        let dataResponse = null;
        if (
          root.data &&
          typeof root.data === "object" &&
          root.data.products &&
          typeof root.data.products === "string"
        ) {
          // Fetch the real data from the "products" URL
          console.log("🌐 Fetching actual product list from:", root.data.products);
          dataResponse = await API.get(root.data.products);
        } else {
          dataResponse = root;
        }

        console.log("📦 Actual products data response:", dataResponse.data);

        // 3️⃣ Extract array from different possible formats
        const raw =
          Array.isArray(dataResponse.data)
            ? dataResponse.data
            : Array.isArray(dataResponse.data?.results)
            ? dataResponse.data.results
            : Array.isArray(dataResponse.data?.data)
            ? dataResponse.data.data
            : [];

        console.log("🧩 Extracted raw array length:", raw.length);

        // 4️⃣ Normalize data safely
        const normalized = raw.map((p) => {
          const safeName =
            typeof p.name === "string"
              ? p.name
              : typeof p.name === "object"
              ? JSON.stringify(p.name)
              : "Unnamed Product";

          const safeCategory =
            typeof p.category === "object"
              ? p.category?.name || "Uncategorized"
              : typeof p.category === "string"
              ? p.category
              : "Uncategorized";

          const safeImage =
            typeof p.image === "object"
              ? p.image?.url || "/assets/images/placeholder.png"
              : typeof p.image === "string"
              ? p.image
              : p.image_url || "/assets/images/placeholder.png";

          return {
            id: Number(p.id),
            name: safeName,
            price: Number(p.price ?? 0),
            image: safeImage,
            category: safeCategory,
          };
        });

        console.log("🧩 Normalized products (safe):", normalized);
        setProducts(normalized);
        setError(null);
      } catch (err) {
        console.error("❌ Failed to fetch products:", err);
        setError("Unable to load products. Try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (!activeList) return null;

  // 🏷️ Categories
  const categories = useMemo(() => {
    const names = products
      .map((p) =>
        typeof p.category === "string" && p.category.trim() !== ""
          ? p.category
          : "Uncategorized"
      )
      .filter(Boolean);
    return ["all", ...new Set(names)];
  }, [products]);

  // 🧠 Filtered products
  const filtered =
    selectedCategory === "all"
      ? products
      : products.filter(
          (p) =>
            (p.category || "Uncategorized").toLowerCase() ===
            selectedCategory.toLowerCase()
        );

  // ➕ Add item
  const handleAddItem = async (product, e) => {
    setError(null);
    const btn = e.currentTarget;
    try {
      await addItemToList(activeList.id, product.id, 1);
      btn.classList.add("btn-animate");
      setTimeout(() => btn.classList.remove("btn-animate"), 400);
      setFeedback(`${product.name} added to "${activeList.name}"`);
      setTimeout(() => setFeedback(null), 1500);
    } catch (err) {
      console.error("❌ Failed to add item (drawer):", err);
      setError(`Failed to add "${product.name}". Try again.`);
      setTimeout(() => setError(null), 2000);
    }
  };

  // ⏳ Loading state
  if (loading) {
    return (
      <div className="drawer-backdrop">
        <div className="drawer-content">
          <p style={{ padding: "2rem", textAlign: "center" }}>
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="drawer-backdrop" role="dialog" aria-labelledby="drawer-title">
      <div className="drawer-content">
        {/* HEADER */}
        <div className="drawer-header">
          <h2 id="drawer-title">Add to "{activeList.name}"</h2>
          <button className="drawer-close-btn" onClick={onClose}>
            ✖
          </button>
        </div>

        {/* CATEGORY FILTER */}
        <div className="drawer-filter">
          {categories.map((cat, i) => (
            <button
              key={i}
              className={`filter-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCTS GRID */}
        <div className="drawer-products">
          {filtered.length === 0 ? (
            <p className="no-products">No products found in this category.</p>
          ) : (
            filtered.map((product) => (
              <div key={product.id} className="drawer-product-card">
                <img
                  src={product.image}
                  alt={product.name}
                  className="drawer-product-img"
                  onError={(e) =>
                    (e.target.src = "/assets/images/placeholder.png")
                  }
                />
                <div className="drawer-product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">
                    ₦{Number(product.price).toLocaleString()}
                  </p>
                  <p className="product-category">{product.category}</p>
                </div>
                <button
                  className="add-to-list-btn"
                  onClick={(e) => handleAddItem(product, e)}
                >
                  + Add
                </button>
              </div>
            ))
          )}
        </div>

        {feedback && <div className="feedback-popup">{feedback}</div>}
        {error && <div className="error-popup">{error}</div>}

        {/* FOOTER */}
        <div className="drawer-footer">
          <button className="save-list-btn" onClick={onClose}>
            ✅ Done
          </button>
        </div>
      </div>
    </div>
  );
}
