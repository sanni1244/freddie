import axios from "axios";

// Create an Axios instance pointing to your Next.js proxy
const api = axios.create({
  baseURL: "/api/proxy", // Points to your proxy route
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;