// src/store/product/productStore.ts
import { create } from 'zustand';
import axios from 'axios'; // ✅ นำเข้า axios โดยตรง
import apiClient from '@/lib/axios'; // Import axios instance ที่มี interceptor
import { Product, Category, ProductUnit, ProductFormData } from '@/types/product';

// ✅ เพิ่มฟังก์ชันใหม่สำหรับการอัปโหลดไฟล์รูปภาพ
export const uploadProductImageAPI = async (file: File): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        // ✅ แก้ไข: ใช้ axios โดยตรงเพื่อกำหนด URL เต็ม
        // ✅ เพื่อหลีกเลี่ยง baseURL ของ apiClient
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload/product`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        // คาดหวังว่า backend จะส่งชื่อไฟล์กลับมา เช่น { "filename": "12345.jpg" }
        return response.data.filename;
    } catch (error) {
        console.error('Image upload failed:', error);
        throw new Error('Failed to upload image. Please try again.');
    }
};

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;

  getProducts: () => Promise<void>;
  createProduct: (payload: ProductFormData) => Promise<Product>;
  updateProduct: (id: number, payload: ProductFormData) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  error: null,

  getProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/products');
      set({ products: response.data, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch products', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch products',
        loading: false,
      });
    }
  },

  createProduct: async (payload) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('categoryId', String(payload.categoryId));
      formData.append('productunitId', String(payload.productunitId));
      formData.append('userCode', payload.userCode);
      formData.append('title', payload.title);
      formData.append('detail', payload.detail);
      formData.append('price', payload.price);
      if (payload.actived) {
        formData.append('actived', payload.actived);
      }
      if (payload.pimg instanceof File) {
        formData.append('pimg', payload.pimg);
      }

      const response = await apiClient.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newProduct: Product = response.data;
      set((state) => ({
        products: [...state.products, newProduct],
        loading: false,
      }));
      return newProduct;
    } catch (error: any) {
      console.error('Failed to create product', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to create product',
        loading: false,
      });
      throw error;
    }
  },

  updateProduct: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('categoryId', String(payload.categoryId));
      formData.append('productunitId', String(payload.productunitId));
      formData.append('userCode', payload.userCode);
      formData.append('title', payload.title);
      formData.append('detail', payload.detail);
      formData.append('price', payload.price);
      if (payload.actived) {
        formData.append('actived', payload.actived);
      }
      if (payload.pimg instanceof File) {
        formData.append('pimg', payload.pimg);
      }

      const response = await apiClient.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedProduct: Product = response.data;
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
        loading: false,
      }));
      return updatedProduct;
    } catch (error: any) {
      console.error('Failed to update product', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to update product',
        loading: false,
      });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/products/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      console.error('Failed to delete product', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to delete product',
        loading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

// Helper function to get categories
export const getCategoriesAPI = async (): Promise<Category[]> => {
    try {
        const response = await apiClient.get('/categorys');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        throw error;
    }
};

// Helper function to get product units
export const getProductUnitsAPI = async (): Promise<ProductUnit[]> => {
    try {
        const response = await apiClient.get('/productunits');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch product units:', error);
        throw error;
    }
};
