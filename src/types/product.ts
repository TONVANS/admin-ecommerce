// src/types/product.ts
export interface Product {
  id: number;
  categoryId: number;
  productunitId: number;
  userCode: string;
  actived: string;
  title: string;
  detail: string;
  price: string;
  pimg: string; // ชื่อไฟล์ภาพ
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
    catimg: string;
    code: string;
  };
  productunit: {
    id: number;
    name: string;
    code: string;
  };
  user: {
    id: number;
    firstname: string;
    lastname: string;
    code: string;
    unit: {
      name: string;
    };
    chu: {
      name: string;
    };
  };
  reviews: any[];
  avgRating: number | null;
}

export interface Category {
  id: number;
  name: string;
  catimg: string;
  code: string | null;
}

export interface ProductUnit {
  id: number;
  name: string;
  code: string | null;
}

export interface ProductStatus{
  id: number;
  name: string;
  code: string | null;
}

// Form data for creating/updating products
export interface ProductFormData {
  categoryId: number;
  productunitId: number;
  userCode: string;
  title: string;
  detail: string;
  price: string;
  pimg?: File | string;
  actived?: string;
}

export interface CategoryFormData {
  name: string;
  code: string;
  catimg: string; // ชื่อไฟล์ภาพ
}
