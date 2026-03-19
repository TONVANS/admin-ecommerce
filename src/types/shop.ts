// src/types/shop.ts
import { User } from "./user";

export interface Shop {
  id: number;
  name: string;
  tel: string;
  userCode: string;
  approved: number;
  createdAt: string;
  updatedAt: string;
  user: User;
}