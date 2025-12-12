import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { adminsTable } from "@/config/adminsSchema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AdminJWTPayload } from "@/types/admin";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = (await req.json()) as {
            email: string;
            password: string;
        };

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password required" },
                { status: 400 }
            );
        }

        const adminList = await db
            .select()
            .from(adminsTable)
            .where(eq(adminsTable.email, email));

        if (adminList.length === 0) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
        }

        const admin = adminList[0];

        const match = await bcrypt.compare(password, admin.passwordHash);
        if (!match) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
        }

        const payload: AdminJWTPayload = {
            adminId: admin.id,
            role: admin.role as "admin" | "superadmin",
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET!, {
            expiresIn: "7d",
        });

        const res = NextResponse.json({
            success: true,
            message: "Login successful",
            token,
            admin: {
                id: admin.id,
                fullName: admin.fullName,
                email: admin.email,
                role: admin.role,
            },
        });

        res.cookies.set("admin_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return res;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
