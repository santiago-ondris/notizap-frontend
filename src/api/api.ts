import axios from "axios";
import { trackApiCall, trackApiError } from '@/lib/applicationInsights';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // baseURL : "http://localhost:5090",
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    // Agregar timestamp para medir duración
    config.metadata = { startTime: Date.now() };
    
    // Track API call start (opcional, solo para debugging)
    if (import.meta.env.MODE === 'development') {
      console.log(`🌐 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    // Track request configuration errors
    trackApiError('unknown', 'REQUEST_CONFIG', 0, error.message);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Calcular duración del API call
    const duration = Date.now() - (response.config.metadata?.startTime || Date.now());
    const url = response.config.url || 'unknown';
    const method = response.config.method?.toUpperCase() || 'GET';
    const statusCode = response.status;

    // Track API call exitoso
    trackApiCall(url, method, duration, statusCode);

    // Log adicional en development
    if (import.meta.env.MODE === 'development') {
      console.log(`✅ API Success: ${method} ${url} - ${statusCode} (${duration}ms)`);
    }

    return response;
  },
  (error) => {
    // Calcular duración incluso para errores
    const duration = Date.now() - (error.config?.metadata?.startTime || Date.now());
    const url = error.config?.url || 'unknown';
    const method = error.config?.method?.toUpperCase() || 'GET';
    const statusCode = error.response?.status || 0;
    const errorMessage = error.response?.data?.message || error.message;

    // Track API call error
    trackApiError(url, method, statusCode, errorMessage);

    // Track métricas también para errores (útil para medir performance)
    trackApiCall(url, method, duration, statusCode);

    // Log adicional en development
    if (import.meta.env.MODE === 'development') {
      console.error(`❌ API Error: ${method} ${url} - ${statusCode} (${duration}ms)`, errorMessage);
    }

    // Trackear errores específicos comunes
    if (statusCode === 401) {
      trackApiError(url, method, statusCode, 'Unauthorized - Token expired or invalid');
    } else if (statusCode === 403) {
      trackApiError(url, method, statusCode, 'Forbidden - Insufficient permissions');
    } else if (statusCode === 404) {
      trackApiError(url, method, statusCode, 'Not Found - Endpoint not available');
    } else if (statusCode >= 500) {
      trackApiError(url, method, statusCode, 'Server Error - Backend issue');
    }

    return Promise.reject(error);
  }
);

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