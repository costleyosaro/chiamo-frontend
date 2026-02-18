// src/services/customers.js
// src/services/customers.js
import API from "./api"; // ✅ default import

export const login = (data) => API.post("customers/login/", data);
export const signup = (data) => API.post("customers/signup/", data);
export const getProfile = () => API.get("customers/profile/");
