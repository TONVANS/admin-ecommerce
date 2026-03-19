import apiClient from '@/lib/axios';
import { ProductUnit } from '@/types/product';
import { create } from 'zustand'

interface ProductUnitState {
    productUnits: ProductUnit[];
    loading: boolean;
    error: string | null;

    // Actions
    getProductUnits: () => Promise<void>;
    createProductUnit: (payload: { name: string; code: string;}) => Promise<ProductUnit>;
    updateProductUnit: (id: number, payload: { name: string; code: string;}) => Promise<ProductUnit>;
    deleteProductUnit: (id: number) => Promise<void>;
    clearError: () => void;
}

    

export const useProductUnitStore = create<ProductUnitState>((set, get) => ({
    productUnits: [],
    loading: false,
    error: null,

    getProductUnits: async () => {
        set({ loading: true, error: null });
        try {
            const response = await apiClient.get('/productunits');
            set({ productUnits: response.data, loading: false } );
        }
        catch (error: any) {
            console.error('Failed to fetch product units', error);
            set({
                error: error.message || 'Failed to fetch product units',
                loading: false
            });
        }
    },

    createProductUnit: async (payload) => {
        set({ loading: true, error: null });
        try {
            const response = await apiClient.post('/productunits', payload);
            const newProductUnit = await response.data;
            set((state) => ({ productUnits: [...state.productUnits, newProductUnit], loading: false }));
            return newProductUnit;
        } catch (error: any) {
            console.error('Failed to create product unit', error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to create product unit',
                loading: false
            });
            throw error;
        }
    },

    updateProductUnit: async (id, payload) => {
        set({ loading: true, error: null });
        try {
            const response = await apiClient.put(`/productunits/${id}`, payload);
            const updatedProductUnit = await response.data;
            set((state) => ({
                productUnits: state.productUnits.map((pu) =>
                    pu.id === id ? updatedProductUnit : pu
                ),
                loading: false
            }));
            return updatedProductUnit;
        }
        catch (error: any) {
            console.error('Failed to update product unit', error);
            set({
                error: error.message || 'Failed to update product unit',
                loading: false
            });
            throw error;
        }
    },

    deleteProductUnit: async (id) => {
        set({ loading: true, error: null });
        try {
            await apiClient.delete(`/productunits/${id}`);
            set((state) => ({
                productUnits: state.productUnits.filter((pu) => pu.id !== id),
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

    clearError: () => set({ error: null })
}));
