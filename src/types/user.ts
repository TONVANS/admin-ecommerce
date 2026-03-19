// src/types/user.ts
export interface Role {
  id: number;
  name: string;
  description?: string | null;
}

export interface Position {
  id: number;
  name: string;
  description?: string | null;
}

export interface Unit {
  id: number;
  no: number;
  name: string;
}

export interface Chu {
  id: number;
  unitId: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  code: string;
  firstname: string;
  lastname: string;
  actived: string;
  gender: string;
  tel: string;
  userimg: string;
  roleId: number;
  positionId: number;
  unitId: number;
  chuId: number;
  role: Role;
  position: Position;
  unit: Unit;
  chu: Chu;
}

export interface AuthResponse {
  user: User;
  token: string;
}
