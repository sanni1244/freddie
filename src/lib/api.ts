import axios from "axios";

const api = axios.create({
  baseURL: "https://api-freddie.ai-wk.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
