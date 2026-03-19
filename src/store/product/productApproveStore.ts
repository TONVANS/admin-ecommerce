// src/store/product/productApproveStore.ts

import apiClient from '@/lib/axios'; // สมมติว่ามี apiClient ที่กำหนดค่า Axios ไว้แล้ว
import { ProductApprove } from '@/types/product_approve';
import { create } from 'zustand';

// (ใหม่) โครงสร้างข้อมูลสำหรับส่งไปอัปเดต (อ้างอิงจาก Req 1)
export interface ProductApprovalPayload {
    categoryId: number | null;
    percent: number | null;
    approved: number;
}

// --- Store State Interface ---

interface ProductApproveState {
    products: ProductApprove[];
    loading: boolean;
    error: string | null;

    // Actions
    getProductsPendingApproval: (page?: number, limit?: number) => Promise<void>;
    getProductById: (id: number) => Promise<ProductApprove | null>;
    // (อัปเดต Signature)
    updateProductApproval: (id: number, payload: ProductApprovalPayload) => Promise<ProductApprove>;
    clearError: () => void;
}

// --- Zustand Store Implementation ---

export const useProductApproveStore = create<ProductApproveState>((set, get) => ({
    products: [],
    loading: false,
    error: null,

    // 1. ดึงรายการสินค้าที่รอการอนุมัติ (คงเดิม)
    getProductsPendingApproval: async (page = 1, limit = 10) => {
        set({ loading: true, error: null });
        try {
            // สมมติ Endpoint สำหรับรายการสินค้าที่ต้องอนุมัติ
            const response = await apiClient.get('/products/listapproved', {
                params: { page, limit }
            }); 
            set({ products: response.data.rows || response.data, loading: false });
        } catch (error: any) {
            console.error('Error fetching pending products:', error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to fetch pending products',
                loading: false
            });
        }
    },

    // 2. ดึงข้อมูลสินค้าตาม ID (คงเดิม)
    getProductById: async (id) => {
        set({ loading: true, error: null });
        try {
            // สมมติ Endpoint สำหรับดึงสินค้าตาม ID
            const response = await apiClient.get(`/products/approved/${id}`); 
            set({ loading: false });
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching product with id ${id}:`, error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to fetch product',
                loading: false
            });
            // throw error; // โยน error เพื่อให้ component จัดการต่อได้
            return null;
        }
    },

    // 3. อัปเดตสถานะการอนุมัติสินค้า (อัปเดตตาม Req 1)
    updateProductApproval: async (id, payload) => {
        set({ loading: true, error: null });
        console.log(payload);
        try {
            // สมมติ Endpoint สำหรับอัปเดตสถานะอนุมัติ
            // ส่ง payload ทั้งหมดตามที่กำหนด (categoryId, percent, approved, userActionId)
            const response = await apiClient.put(`/products/approved/${id}`, payload);
            const updatedProduct = response.data;

            // อัปเดต State ใน Store
            set((state) => ({
                products: state.products.map((product) =>
                    product.id === id ? { ...product, ...updatedProduct } : product
                ),
                loading: false
            }));
            return updatedProduct;
        } catch (error: any) {
            console.error(`Error updating approval for product with id ${id}:`, error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to update product approval',
                loading: false
            });
            throw error;
        }
    },

    // 4. ล้างข้อผิดพลาด (คงเดิม)
    clearError: () => 
        set({ error: null }),
}));