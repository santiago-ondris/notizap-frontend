import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // baseURL : "http://localhost:5090",
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para agregar el token automaticamente a cada request
api.interceptors.request.use(
  (config) => {
    if (config.url?.includes("/login")) {
      return config;
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Asegurar que siempre se envíe como JSON a menos que se especifique otro Content-Type
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}