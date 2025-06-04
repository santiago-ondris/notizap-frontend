import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // baseURL : "http://localhost:5090"
});

// Interceptor para agregar el token automaticamente a cada request
api.interceptors.request.use(
  (config) => {
    if (
      config.url?.includes("/login") ||
      config.url?.includes("/register")
    ) {
      return config;
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
