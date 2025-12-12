/**
 * @fileoverview Vendor Login Route
 * Handles vendor authentication using email + password.
 * Issues JWT and sets secure HTTP-only cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface VendorLoginBody {
    email: string;
    password: string;
}

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as VendorLoginBody;
        const { email, password } = body;

        // 1 Validate inputs
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // 2 Lookup vendor
        const vendorList = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.email, email));

        if (vendorList.length === 0) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        const vendor = vendorList[0];

        // 3 Ensure vendor email verified
        if (!vendor.emailVerified) {
            return NextResponse.json(
                { error: "Email not verified. Please complete registration." },
                { status: 403 }
            );
        }

        // 4 Ensure admin approved
        if (!vendor.isApproved) {
            return NextResponse.json(
                { error: "Your vendor account is pending admin approval." },
                { status: 403 }
            );
        }

        // 5 Compare password
        const isMatch = await bcrypt.compare(password, vendor.passwordHash);

        if (!isMatch) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // 6 Generate JWT
        const token = jwt.sign(
            { vendorId: vendor.id, role: "vendor" },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        // 7 Create response with cookie
        const response = NextResponse.json(
            {
                success: true,
                message: "Login successful",
                token,
                vendor: {
                    id: vendor.id,
                    fullName: vendor.fullName,
                    email: vendor.email,
                    occupation: vendor.occupation,
                    phone: vendor.phone,
                },
            },
            { status: 200 }
        );

        response.cookies.set("vendor_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
    } catch (error) {
        console.error("Vendor Login Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
