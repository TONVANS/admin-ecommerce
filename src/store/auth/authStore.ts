// store/auth/authStore.ts
import { create } from "zustand";
import axios from "axios";
import { User } from "@/types/user";
import Cookies from "js-cookie";

interface AuthState {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const getInitialState = (): AuthState => {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        return {
          user,
          token: storedToken,
          login: async () => {}, // ถูกแทนที่ใน create
          logout: () => {}, // ถูกแทนที่ใน create
        };
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
      }
    }
  }
  return {
    user: null,
    token: null,
    login: async () => {},
    logout: () => {},
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),

  login: async (username, password) => {
    try {
      const res = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/login",
        {
          username,
          password,
        },
      );
      const { user, token } = res.data;
      set({ user, token });
      Cookies.set("token", token, { expires: 1 }); // เก็บ token ใน cookie 1 วัน
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Login failed:", error);
      set({ user: null, token: null });
      Cookies.remove("token");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      throw error;
    }
  },

  logout: () => {
    set({ user: null, token: null });
    Cookies.remove("token");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  },
}));