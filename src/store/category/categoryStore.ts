// src/store/categoryStore/categoryStore.ts
import apiClient from '@/lib/axios';
import { Category } from '@/types/product';
import { create } from 'zustand';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;

  getCategories: () => Promise<void>;
  createCategory: (payload: { name: string; code: string; catimg?: File }) => Promise<Category>;
  updateCategory: (id: number, payload: { name: string; code: string; catimg?: File }) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  getCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/categorys');
      set({ categories: response.data, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch categories', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch categories',
        loading: false
      });
    }
  },

  createCategory: async (payload) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('code', payload.code);
      if (payload.catimg) {
        formData.append('catimg', payload.catimg);
      }

      const response = await apiClient.post('/categorys', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newCategory = response.data;
      set((state) => ({ categories: [...state.categories, newCategory], loading: false }));
      return newCategory;
    } catch (error: any) {
      console.error('Failed to create category', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to create category',
        loading: false
      });
      throw error;
    }
  },

  updateCategory: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('code', payload.code);
      if (payload.catimg) {
        formData.append('catimg', payload.catimg);
      }

      const response = await apiClient.put(`/categorys/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updatedCategory = response.data;
      set((state) => ({
        categories: state.categories.map((cat) => (cat.id === id ? updatedCategory : cat)),
        loading: false
      }));
      return updatedCategory;
    } catch (error: any) {
      console.error('Failed to update category', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to update category',
        loading: false
      });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/categorys/${id}`);
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
        loading: false
      }));
    } catch (error: any) {
      console.error('Failed to delete category', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to delete category',
        loading: false
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
