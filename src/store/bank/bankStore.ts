import apiClient from "@/lib/axios";
import { Bank } from "@/types/bank";
import { create } from "zustand";

interface BankState {
  banks: Bank[];
  loading: boolean;
  error: string | null;

  getBanks: () => Promise<void>;
  createBank: (payload: { name: string; accountNo: string; accountName: string; banklogo?: File; bankqr?: File }) => Promise<Bank>;
  updateBank: (id: number, payload: { name: string; accountNo: string; accountName: string; banklogo?: File; bankqr?: File }) => Promise<Bank>;
  deleteBank: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useBankStore = create<BankState>((set, get) => ({
  banks: [],
  loading: false,
  error: null,

  getBanks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get("/banklogos");
      set({ banks: response.data, loading: false });
    } catch (error: any) {
      console.error("Failed to fetch banks", error);
      set({
        error: error.response?.data?.message || error.message || "Failed to fetch banks",
        loading: false,
      });
    }
  },

  createBank: async (payload) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("accountNo", payload.accountNo);
      formData.append("accountName", payload.accountName);
      if (payload.banklogo) formData.append("banklogo", payload.banklogo);
      if (payload.bankqr) formData.append("bankqr", payload.bankqr);

      const response = await apiClient.post("/banks", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newBank = response.data;
      set((state) => ({ banks: [...state.banks, newBank], loading: false }));
      return newBank;
    } catch (error: any) {
      console.error("Failed to create bank", error);
      set({
        error: error.response?.data?.message || error.message || "Failed to create bank",
        loading: false,
      });
      throw error;
    }
  },

  updateBank: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("accountNo", payload.accountNo);
      formData.append("accountName", payload.accountName);
      if (payload.banklogo) formData.append("banklogo", payload.banklogo);
      if (payload.bankqr) formData.append("bankqr", payload.bankqr);

      const response = await apiClient.put(`/banks/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedBank = response.data;
      set((state) => ({
        banks: state.banks.map((bank) => (bank.id === id ? updatedBank : bank)),
        loading: false,
      }));
      return updatedBank;
    } catch (error: any) {
      console.error("Failed to update bank", error);
      set({
        error: error.response?.data?.message || error.message || "Failed to update bank",
        loading: false,
      });
      throw error;
    }
  },

  deleteBank: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/banks/${id}`);
      set((state) => ({
        banks: state.banks.filter((bank) => bank.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      console.error("Failed to delete bank", error);
      set({
        error: error.response?.data?.message || error.message || "Failed to delete bank",
        loading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));