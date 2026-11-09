import axios from "axios";

console.log(
  "API KEY LOADED:",
  Boolean(import.meta.env.VITE_API_KEY)
);

const API = axios.create({
  baseURL: "https://pqc-backend-b6zx.onrender.com",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": import.meta.env.VITE_API_KEY,
  },
  timeout: 30000,
});

export default API;