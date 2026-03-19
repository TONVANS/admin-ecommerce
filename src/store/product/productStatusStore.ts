
import { create } from "zustand";
import { ProductStatus } from "@/types/product";
import apiClient from "@/lib/axios";

interface ProductStatusState {
  statuses: ProductStatus[];
  loading: boolean;
  error: string | null;

  // actions
  getStatuses: () => Promise<void>;
  createStatus: (payload: { name: string; code:string; }) => Promise<ProductStatus>;
  updateStatus: (id: number, payload: { name: string; code:string; }) => Promise<ProductStatus>;
  deleteStatus: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useProductStatusStore = create<ProductStatusState>((set, get) => ({
  statuses: [],
  loading: false,
  error: null,

  getStatuses: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get("/productstatus");
      set({ statuses: response.data, loading: false });
    } catch (error: any) {
      console.error("Failed to fetch productstatus", error);
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch productstatus",
        loading: false,
      });
    }
  },

  createStatus: async (payload) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post("/productstatus", payload);
      const newProductStatus = await response.data;
      set((state) => ({ statuses: [...state.statuses, newProductStatus], loading: false }));
            return newProductStatus;
    } catch (error: any) {
      console.error("Failed to fetch product status", error);
      set({
        error: error.message || "Failed to fetch product status",
        loading: false,
      });
    }
  },

  updateStatus: async (id, payload) => {
    set({ loading: true, error: null });
        try {
            const response = await apiClient.put(`/productstatus/${id}`, payload);
            const updatedStatus = await response.data;
            set((state) => ({
                statuses: state.statuses.map((status) =>
                    status.id === id ? updatedStatus : status
                ),
                loading: false
            }));
            return updatedStatus;
        }
        catch (error: any) {
            console.error('Failed to update product Status', error);
            set({
                error: error.message || 'Failed to update product Status',
                loading: false
            });
            throw error;
        }
  },

  deleteStatus: async (id) => {
         set({ loading: true, error: null });
        try {
            await apiClient.delete(`/productstatus/${id}`);
            set((state) => ({
                statuses: state.statuses.filter((status) => status.id !== id),
                loading: false
            }));
        } catch (error: any) {
            console.error('Failed to delete product unit', error);
            set({
                error: error.message || 'Failed to delete product unit',
                loading: false
            });
            throw error;
        }
  },

  clearError: () => set({ error: null }),
}));
