import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// Base API URL - adjust based on your backend URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("authToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Check if this is an authentication endpoint (OTP verification, etc.)
      // Don't redirect for auth endpoints - let the component handle the error
      const isAuthEndpoint = error.config?.url?.includes("/auth/");

      if (!isAuthEndpoint) {
        // Token expired or invalid - clear token and redirect to appropriate login
        // Determine which login page based on the API endpoint
        const url = error.config?.url || "";
        let redirectPath = "/login";

        if (url.includes("/admin/")) {
          redirectPath = "/admin/login";
        } else if (url.includes("/seller/") || url.includes("/sellers")) {
          redirectPath = "/seller/login";
        } else if (url.includes("/delivery/")) {
          redirectPath = "/delivery/login";
        }

        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        window.location.href = redirectPath;
      }
    }
    return Promise.reject(error);
  }
);

// Token management helpers
export const setAuthToken = (token: string) => {
  localStorage.setItem("authToken", token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

export const removeAuthToken = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
};

export default api;
