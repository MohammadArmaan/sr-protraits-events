export interface AdminJWTPayload {
    adminId: number;
    role: "admin" | "superadmin";
    iat?: number;
    exp?: number;
}
// src/types/admin.ts
export type Admin = {
  id: number;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  createdAt: string;
};