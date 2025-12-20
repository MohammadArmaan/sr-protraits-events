/**
 * @fileoverview Vendor activation route with automatic login + redirect
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
    try {
        const token = req.nextUrl.searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { error: "Token missing" },
                { status: 400 }
            );
        }

        let decoded: { vendorId: number };

        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET!
            ) as { vendorId: number };
        } catch {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 401 }
            );
        }

        const vendorId = decoded.vendorId;

        const [vendor] = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.id, vendorId));

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 }
            );
        }

        /* ---------------- ACTIVATE VENDOR ---------------- */
        await db
            .update(vendorsTable)
            .set({
                status: "ACTIVE",
                emailVerified: true,
                currentStep: 5,
                activationToken: null,
                activationTokenExpires: null,
            })
            .where(eq(vendorsTable.id, vendorId));

        /* ---------------- ISSUE LOGIN TOKEN ---------------- */
        const loginToken = jwt.sign(
            { vendorId },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        /* ---------------- REDIRECT TO PROFILE ---------------- */
        const response = NextResponse.redirect(
            `${process.env.DOMAIN}/vendor/profile`
        );

        // 🔑 CRITICAL FIXES HERE
        response.cookies.set("vendor_token", loginToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax", // ✅ REQUIRED for email activation
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (error) {
        console.error("Activation Error:", error);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
