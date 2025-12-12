export interface AdminJWTPayload {
    adminId: number;
    role: "admin" | "superadmin";
    iat?: number;
    exp?: number;
}