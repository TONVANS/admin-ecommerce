import { ProductUnit } from "./product";

// โครงสร้างข้อมูลร้านค้าแบบย่อ
export interface ShopPartial {
    id: number;
    name: string;
    tel: string;
}

// (ใหม่) โครงสร้างข้อมูลผู้ดำเนินการ (อ้างอิงจาก Req 2)
export interface UserAction {
    id: number;
    firstname: string;
    lastname: string;
    gender: string;
}

// โครงสร้างสำหรับ Product (อัปเดต userAction type)
export interface ProductApprove {
    id: number;
    shopId: number;
    categoryId: number | null;
    productunitId: number;
    actived: 'A' | 'I';
    approved: number; // 0: Pending, 1: Approved, 2: Rejected
    title: string;
    detail: string;
    price: string;
    pimg: string;
    percent: number | null;
    userActionId: number | null;
    createdAt: string;
    updatedAt: string;
    productunit: ProductUnit;
    shop: ShopPartial;
    userAction: UserAction | null; // (อัปเดต)
}