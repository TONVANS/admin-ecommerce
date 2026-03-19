// src/store/report/reportOrderStore.ts
import { create } from 'zustand';
import apiClient from '@/lib/axios';
import { ReportOrderItem } from '@/types/report';

interface ReportOrderState {
  reportData: ReportOrderItem[];
  loading: boolean;
  error: string | null;

  getReportOrders: (dateStart: string, dateEnd: string) => Promise<void>;
  clearError: () => void;
}

export const useReportOrderStore = create<ReportOrderState>((set) => ({
  reportData: [],
  loading: false,
  error: null,

  getReportOrders: async (dateStart, dateEnd) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/reportallorder', {
        params: {
          datestart: dateStart,
          dateend: dateEnd,
        },
      });
      set({ reportData: response.data, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch report orders', error);
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch report orders',
        loading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));