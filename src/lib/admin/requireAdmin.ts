// src/lib/requireAdmin.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface AdminToken {
    adminId: number;
    role: "admin" | "superadmin";
}

export function requireAdmin(req: NextRequest): AdminToken {
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
        throw new Error("UNAUTHORIZED");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AdminToken;

    if (!["admin", "superadmin"].includes(decoded.role)) {
        throw new Error("FORBIDDEN");
    }

    return decoded;
}
