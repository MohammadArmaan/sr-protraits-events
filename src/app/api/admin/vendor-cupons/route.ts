import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import jwt from "jsonwebtoken";
import { couponCodesTable } from "@/config/couponCodeSchema";

interface AdminTokenPayload {
    adminId: number;
    role: "admin" | "superadmin";
}

export async function POST(req: NextRequest) {
    try {
        /* ---------- ADMIN AUTH ---------- */
        const token = req.cookies.get("admin_token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        let decoded: AdminTokenPayload;
        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET!
            ) as AdminTokenPayload;
        } catch {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 401 }
            );
        }

        if (!["admin", "superadmin"].includes(decoded.role)) {
            return NextResponse.json(
                { error: "Permission denied" },
                { status: 403 }
            );
        }

        /* ---------- BODY ---------- */
        const {
            code,
            type,
            value,
            minAmount,
            maxDiscount,
            expiresAt,
            isActive
        } = await req.json();

        if (!code || !type || value === undefined) {
            return NextResponse.json(
                { error: "code, type and value are required" },
                { status: 400 }
            );
        }

        if (!["FLAT", "PERCENT", "UPTO"].includes(type)) {
            return NextResponse.json(
                { error: "Invalid coupon type" },
                { status: 400 }
            );
        }

        if (type === "PERCENT" && value > 100) {
            return NextResponse.json(
                { error: "Percentage cannot exceed 100" },
                { status: 400 }
            );
        }

        if (type === "UPTO" && !maxDiscount) {
            return NextResponse.json(
                { error: "UPTO coupons require maxDiscount" },
                { status: 400 }
            );
        }

        /* ---------- CREATE COUPON ---------- */
        const [coupon] = await db
            .insert(couponCodesTable)
            .values({
                code: code.toUpperCase(),
                type,
                value,
                isActive,
                minAmount: minAmount ?? null,
                maxDiscount: maxDiscount ?? null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            })
            .returning();

        return NextResponse.json(
            { success: true, coupon },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create Coupon Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
