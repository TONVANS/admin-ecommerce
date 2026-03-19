// src/store/banklogoStore/banklogoStore.ts
import apiClient from '@/lib/axios';
import { BankLogo } from '@/types/bank';
import { create } from 'zustand';

interface BankLogoState {
  bankLogos: BankLogo[];
  loading: boolean;
  error: string | null;

  getBankLogos: () => Promise<void>;
  createBankLogo: (payload: { name: string; bankimg?: File }) => Promise<BankLogo>;
  updateBankLogo: (id: number, payload: { name: string; bankimg?: File }) => Promise<BankLogo>;
  deleteBankLogo: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useBankLogoStore = create<BankLogoState>((set, get) => ({
  bankLogos: [],
  loading: false,
  error: null,

  getBankLogos: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/banklogos');
      set({ bankLogos: response.data, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch bank logos', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch bank logos',
        loading: false
      });
    }
  },

  createBankLogo: async (payload) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('name', payload.name);
      if (payload.bankimg) {
        formData.append('bankimg', payload.bankimg);
      }

      const response = await apiClient.post('/banklogos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newBankLogo = response.data;
      set((state) => ({ bankLogos: [...state.bankLogos, newBankLogo], loading: false }));
      return newBankLogo;
    } catch (error: any) {
      console.error('Failed to create bank logo', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to create bank logo',
        loading: false
      });
      throw error;
    }
  },

  updateBankLogo: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('name', payload.name);
      if (payload.bankimg) {
        formData.append('bankimg', payload.bankimg);
      }

      const response = await apiClient.put(`/banklogos/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updatedBankLogo = response.data;
      set((state) => ({
        bankLogos: state.bankLogos.map((bank) => (bank.id === id ? updatedBankLogo : bank)),
        loading: false
      }));
      return updatedBankLogo;
    } catch (error: any) {
      console.error('Failed to update bank logo', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to update bank logo',
        loading: false
      });
      throw error;
    }
  },

  deleteBankLogo: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/banklogos/${id}`);
      set((state) => ({
        bankLogos: state.bankLogos.filter((bank) => bank.id !== id),
        loading: false
      }));
    } catch (error: any) {
      console.error('Failed to delete bank logo', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to delete bank logo',
        loading: false
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));