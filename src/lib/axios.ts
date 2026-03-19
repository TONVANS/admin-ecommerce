// src/lib/axios.ts
import axios from "axios";

// Helper function to remove cookies
const removeCookie = (name: string) => {
  // Remove cookie for current domain
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  // Remove cookie for root domain (if subdomain)
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
  // Remove cookie for parent domain (if subdomain)
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  if (parts.length > 2) {
    const parentDomain = "." + parts.slice(-2).join(".");
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${parentDomain};`;
  }
};

// Create axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api",
  timeout: 30000, // ✅ เพิ่ม timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Log API config ตอน initialize
if (typeof window !== "undefined") {
  console.log("🔌 API Config:", {
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    environment: process.env.NODE_ENV,
  });
}

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (client-side only)
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // ✅ Debug request
      console.log("📤 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasAuth: !!token,
      });
    }
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error.message);
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    // ✅ Debug success response
    console.log("✅ API Response:", {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    // ✅ Detailed error logging
    if (error.response) {
      // Server responded with error
      console.error("❌ API Error Response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request made but no response
      console.error("❌ Network Error (No Response):", {
        url: error.config?.url,
        message: error.message,
        errno: error.errno,
      });
    } else {
      // Error in request setup
      console.error("❌ Request Setup Error:", error.message);
    }

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      // Clear token from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("accessToken");

        // Clear common auth-related cookies
        const authCookies = [
          "token",
          "authToken",
          "accessToken",
          "refreshToken",
          "jwt",
          "auth",
          "session",
          "sessionToken",
          "user",
          "userData",
        ];

        authCookies.forEach((cookieName) => {
          removeCookie(cookieName);
        });

        // Clear session storage as well
        sessionStorage.clear();

        // Redirect to login page
        window.location.href = "/sign-in";
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error("Access denied");
    }

    return Promise.reject(error);
  },
);

export default apiClient;
