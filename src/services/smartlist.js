// src/services/smartlist.js
import API from "./api";

export const fetchSmartList = () => API.get("/api/orders/smartlist/");
export const addToSmartList = (productId, quantity = 1) =>
  API.post("/api/orders/smartlists/create/", { product_id: productId, quantity });
export const orderSmartList = (smartlistId) =>
  API.post(`/api/orders/smartlist/order/${smartlistId}/`);
