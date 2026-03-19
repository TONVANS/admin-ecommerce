import { Shop } from "./shop";

// Types
export interface ReportOrderProduct {
  productId: number;
  title: string;
  pimg: string;
  price: number;
  percent: number;
  quantity: number;
  totalprice: number;
  divide: number;
}

export interface ReportOrderItem {
  shop: Shop;
  products: ReportOrderProduct[];
  shopTotal: number;
  shopDivide: number;
}