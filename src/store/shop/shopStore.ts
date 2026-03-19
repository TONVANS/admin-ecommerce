// src/store/shop/shopStore.ts
import apiClient from '@/lib/axios';
import { Shop } from '@/types/shop';
import { create } from 'zustand';

interface ShopState {
    shops: Shop[];
    loading: boolean;
    error: string | null;

    getShops: () => Promise<void>;
    getShopById: (id: number) => Promise<Shop | null>;
    createShop: (shopData: Partial<Shop>) => Promise<Shop>;
    updateShop: (id: number, shopData: Partial<Shop>) => Promise<Shop>;
    updateShopApproval: (id: number, approved: number) => Promise<Shop>;
    deleteShop: (id: number) => Promise<Shop>;
    clearError: () => void;
}

export const useShopStore = create<ShopState>((set, get) => ({
    shops: [],
    loading: false,
    error: null,

    getShops: async () => {
        set({ loading: true, error: null });
        try {
            const response = await apiClient.get('/shops/listapproved');
            set({ shops: response.data, loading: false });
        } catch (error: any) {
            console.error('Error fetching shops:', error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to fetch shops',
                loading: false
            });
        }
    },

    getShopById: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await apiClient.get(`/api/shops/listapproved/${id}`);
            set({ loading: false });
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching shop with id ${id}:`, error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to fetch shop',
                loading: false
            });
            throw error;
        }
    },

    createShop: async (payload) => {
        set({ loading: true, error: null });
        try {
            const response = await apiClient.post('/shops', payload);
            const newShop = response.data;
            set((state) => ({ shops: [...state.shops, newShop], loading: false }));
            return newShop;
        } catch (error: any) {
            console.error('Error creating shop:', error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to create shop',
                loading: false
            });
            throw error;
        }
    },

    updateShop: async (id, payload) => {
        set({ loading: true, error: null });
        try {
            const response = await apiClient.put(`/shops/${id}`, payload);
            const updatedShop = response.data;
            set((state) => ({
                shops: state.shops.map((shop) => (shop.id === id ? updatedShop : shop)),
                loading: false
            }));
            return updatedShop;
        } catch (error: any) {
            console.error(`Error updating shop with id ${id}:`, error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to update shop',
                loading: false
            });
            throw error;
        }
    },

    updateShopApproval: async (id, approved) => {
        set({ loading: true, error: null });
        try {
            const response = await apiClient.put(`/shops/approved/${id}`, { approved });
            const updatedShop = response.data;
            set((state) => ({
                shops: state.shops.map((shop) => (shop.id === id ? updatedShop : shop)),
                loading: false
            }));
            return updatedShop;
        } catch (error: any) {
            console.error(`Error updating approval for shop with id ${id}:`, error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to update shop approval',
                loading: false
            });
            throw error;
        }
    },

    deleteShop: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await apiClient.delete(`/shops/${id}`);    
            const deletedShop = response.data;
            set((state) => ({
                shops: state.shops.filter((shop) => shop.id !== id),
                loading: false
            }));
            return deletedShop;
        } catch (error: any) {
            console.error(`Error deleting shop with id ${id}:`, error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to delete shop',
                loading: false
            });
            throw error;
        }
    },

    clearError: () => 
        set({ error: null }),
    }));