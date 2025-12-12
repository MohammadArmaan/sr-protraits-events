/**
 * @fileoverview Vendor activation route with automatic login + redirect.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
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

        let decoded: { vendorId: number } | null = null;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
                vendorId: number;
            };
        } catch {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 401 }
            );
        }

        const vendorId = decoded.vendorId;

        const vendorList = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.id, vendorId));

        if (vendorList.length === 0) {
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 }
            );
        }

        // Activate Vendor
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

        // Generate Vendor Login JWT
        const loginToken = jwt.sign({ vendorId }, process.env.JWT_SECRET!, {
            expiresIn: "7d",
        });

        // Create a session cookie (HTTP-only)
        const response = NextResponse.redirect(`${process.env.DOMAIN}/vendor`);

        response.cookies.set("vendor_session", loginToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error) {
        console.error("Activation Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
