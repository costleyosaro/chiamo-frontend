// ✅ src/pages/SmartListContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { fetchProducts } from "../services/products";
import { safeApiCall } from '../utils/apiHelpers';

const SmartListContext = createContext();

export function SmartListProvider({ children }) {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  /** 🔹 Load backend products once */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        console.debug("📦 SmartList loaded products:", data.length);
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Failed to load backend products:", err);
        setProducts([]);
      }
    };
    loadProducts();
  }, []);

  /** 🔹 Normalize product shape */
  const normalizeProduct = (p) => {
    if (!p || typeof p !== "object") return null;
    return {
      id: p.id ?? null,
      name: p.name ?? "Unnamed Product",
      price: Number(p.price ?? 0),
      image:
        p.image_url ||
        (typeof p.image === "string" ? p.image : p.image?.url) ||
        "/assets/images/placeholder.png",
      category:
        typeof p.category === "object"
          ? p.category?.name ?? "Uncategorized"
          : p.category ?? "Uncategorized",
    };
  };

  /** 🔹 Enrich item with normalized product data */
  const enrichItem = (item) => {
    if (!item) return null;
    let product = item.product;
    if (!product && item.product_id) {
      product = products.find((p) => String(p.id) === String(item.product_id));
    }

    return {
      id: item.id ?? Math.random(),
      quantity: Number(item.quantity ?? 1),
      product: normalizeProduct(product) ?? {
        id: item.product_id ?? null,
        name: item.name ?? "Unnamed Product",
        price: Number(item.price ?? 0),
        image: "/assets/images/placeholder.png",
        category: "Unknown",
      },
    };
  };

  /** 📋 Fetch SmartLists for logged-in user - WITH ERROR HANDLING */
  const fetchLists = useCallback(
  async (activeUser = user) => {
    if (!activeUser) {
      setLists([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    // ✅ Use safe API call
    const result = await safeApiCall("/orders/smartlists/");
    
    if (result.success) {
      const data = Array.isArray(result.data?.results)
        ? result.data.results
        : Array.isArray(result.data)
        ? result.data
        : [];

      const mapped = data.map((list) => ({
        id: list.id,
        name: list.name ?? "Unnamed SmartList",
        created_at: list.created_at,
        updated_at: list.updated_at,
        items: (list.items || []).map(enrichItem),
      }));

      setLists(mapped);
      localStorage.setItem(`smartlists_${activeUser.id}`, JSON.stringify(mapped));
    } else {
      if (result.isNotFound) {
        console.info("📝 SmartLists feature not implemented yet");
        setError("SmartLists feature coming soon!");
      } else if (result.isTimeout) {
        setError("Connection timeout - please try again");
      } else {
        setError("Unable to load smartlists");
      }
      
      // Try to load from cache
      const cached = localStorage.getItem(`smartlists_${activeUser?.id}`);
      if (cached) {
        try {
          setLists(JSON.parse(cached));
        } catch (parseErr) {
          setLists([]);
        }
      } else {
        setLists([]);
      }
    }
    
    setLoading(false);
  },
  [user, products]
);

  /** 🚀 Sync SmartLists whenever user changes */
  useEffect(() => {
    (async () => {
      if (authLoading) return;
      if (user) {
        const cached = localStorage.getItem(`smartlists_${user.id}`);
        if (cached) {
          try {
            console.debug("💾 Loaded cached smartlists");
            setLists(JSON.parse(cached));
          } catch (err) {
            console.error("Failed to parse cached smartlists:", err);
            setLists([]);
          }
        }
        await fetchLists(user);
      } else {
        setLists([]);
        setLoading(false);
      }
    })();
  }, [user, authLoading, fetchLists]);

  /** 🧩 Add item to a SmartList - WITH ERROR HANDLING */
  const addItemToList = async (listId, productId, quantity = 1) => {
    if (!user) throw new Error("You must be logged in to modify SmartLists");
    if (!listId || !productId) throw new Error("Missing parameters for addItem");
    
    try {
      const res = await API.post(`/orders/smartlists/${listId}/add_item/`, {
        product_id: productId,
        quantity,
      });

      const newItem = enrichItem(res.data);
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId ? { ...l, items: [...l.items, newItem] } : l
        )
      );
      await fetchLists(user);
    } catch (err) {
      console.error("❌ addItemToList failed:", err);
      if (err.response?.status === 404) {
        throw new Error("SmartLists feature is not available yet.");
      }
      await fetchLists(user);
      throw err;
    }
  };

  /** ❌ Remove item - WITH ERROR HANDLING */
  const removeItem = async (listId, itemId) => {
    if (!user) throw new Error("You must be logged in to modify SmartLists");
    
    try {
      await API.post(`/orders/smartlists/${listId}/remove_item/`, { item_id: itemId });
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? { ...l, items: l.items.filter((i) => i.id !== itemId) }
            : l
        )
      );
    } catch (err) {
      console.error("❌ removeItem failed:", err);
      if (err.response?.status === 404) {
        throw new Error("SmartLists feature is not available yet.");
      }
      throw err;
    }
  };

  /** ➕ Create SmartList - WITH ERROR HANDLING */
  const createList = async (name) => {
    if (!user) throw new Error("You must be logged in to create a SmartList");
    
    try {
      const res = await API.post("/orders/smartlists/", { name });
      const newList = { 
        id: res.data.id, 
        name, 
        items: [],
        created_at: res.data.created_at,
        updated_at: res.data.updated_at
      };
      setLists((prev) => [newList, ...prev]);
      return newList;
    } catch (err) {
      console.error("❌ createList failed:", err);
      if (err.response?.status === 404) {
        throw new Error("SmartLists feature is not available yet.");
      }
      throw err;
    }
  };

  /** 🗑️ Delete SmartList - WITH ERROR HANDLING */
  const deleteList = async (id) => {
    if (!user) throw new Error("You must be logged in to delete a SmartList");
    
    try {
      await API.delete(`/orders/smartlists/${id}/`);
      setLists((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error("❌ deleteList failed:", err);
      if (err.response?.status === 404) {
        throw new Error("SmartLists feature is not available yet.");
      }
      throw err;
    }
  };

  /** 🛍️ Order all items - WITH ERROR HANDLING */
  const orderAll = async (listId) => {
    if (!user) throw new Error("You must be logged in to order");
    
    try {
      const res = await API.post(`/orders/smartlists/${listId}/order_all/`);
      await fetchLists(user);
      return res.data;
    } catch (err) {
      console.error("❌ orderAll failed:", err);
      if (err.response?.status === 404) {
        throw new Error("SmartLists feature is not available yet.");
      }
      throw err;
    }
  };

  /** 🔢 Update quantity - WITH ERROR HANDLING */
  const syncQty = async (listId, itemId, newQty) => {
    try {
      await API.post(`/orders/smartlists/${listId}/update_item/`, {
        item_id: itemId,
        quantity: newQty,
      });
    } catch (err) {
      console.error("syncQty failed:", err);
      if (err.response?.status === 404) {
        console.warn("SmartLists feature is not available yet.");
      }
    }
  };

  const increaseQty = (listId, itemId) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              items: l.items.map((i) =>
                i.id === itemId ? { ...i, quantity: Number(i.quantity) + 1 } : i
              ),
            }
          : l
      )
    );
    const item = lists.find((l) => l.id === listId)?.items.find((i) => i.id === itemId);
    if (item) syncQty(listId, itemId, item.quantity + 1);
  };

  const decreaseQty = (listId, itemId) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              items: l.items.map((i) =>
                i.id === itemId && i.quantity > 1
                  ? { ...i, quantity: Number(i.quantity) - 1 }
                  : i
              ),
            }
          : l
      )
    );
    const item = lists.find((l) => l.id === listId)?.items.find((i) => i.id === itemId);
    if (item && item.quantity > 1) syncQty(listId, itemId, item.quantity - 1);
  };

  /** 📊 Summary counts for SmartLists */
  const totalSmartListCount = lists.length;
  const totalSmartListItems = lists.reduce(
    (sum, l) => sum + (l.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0),
    0
  );

  return (
    <SmartListContext.Provider
      value={{
        user,
        lists,
        loading,
        error,
        products,
        fetchLists,
        createList,
        deleteList,
        addItemToList,
        removeItem,
        increaseQty,
        decreaseQty,
        orderAll,
        totalSmartListCount,
        totalSmartListItems,
        refreshUser,
      }}
    >
      {children}
    </SmartListContext.Provider>
  );
}

export function useSmartLists() {
  const context = useContext(SmartListContext);
  if (!context) {
    throw new Error('useSmartLists must be used within a SmartListProvider');
  }
  return context;
}