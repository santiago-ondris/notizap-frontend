import axios from "axios";
import { toast } from "react-toastify";
import type { ProblemDetails } from "@/types/api/errorTypes";
import { ApiError } from "@/types/api/errorTypes";
import ErrorToast from "@/components/ui/ErrorToast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // baseURL : "http://localhost:5090",
  headers: {
    'Content-Type': 'application/json',
  }
});

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
    
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 500) {
      const data = error.response.data as ProblemDetails;
      
      if (data?.traceId) {
        toast.error(<ErrorToast traceId={data.traceId} />, { 
          autoClose: 10000 
        });
        
        console.error('Error del servidor:', {
          traceId: data.traceId,
          detail: data.detail,
          instance: data.instance
        });
        
        return Promise.reject(new ApiError(data));
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}