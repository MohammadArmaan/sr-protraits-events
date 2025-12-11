/**
 * @fileoverview Vendor Registration (Step 1)
 * Creates the vendor record, generates OTP, stores OTP in DB,
 * sends branded OTP email, and returns onboarding JWT token.
 */

import { NextRequest, NextResponse } from "next/server";
import { vendorsTable } from "@/config/schema";
import { db } from "@/config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/sendEmail";
import { otpEmailTemplate } from "@/lib/email-templates/otpTemplates";

interface VendorRegistrationBody {
    fullName: string;
    occupation: string;
    phone: string;
    address: string;
    email: string;
    password: string;
    confirmPassword: string;
}

/**
 * @typedef {Object} VendorRegistrationBody
 * @property {string} fullName
 * @property {string} occupation
 * @property {string} phone
 * @property {string} address
 * @property {string} email
 * @property {string} password
 * @property {string} confirmPassword
 */

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as VendorRegistrationBody;

        const {
            fullName,
            occupation,
            phone,
            address,
            email,
            password,
            confirmPassword,
        } = body;

        // ----------------------------
        // 1. Validate required fields
        // ----------------------------
        if (
            !fullName ||
            !occupation ||
            !phone ||
            !address ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: "Passwords do not match" },
                { status: 400 }
            );
        }

        // ----------------------------
        // 2. Check if vendor exists
        // ----------------------------
        const existingVendor = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.email, email));

        if (existingVendor.length > 0) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 400 }
            );
        }

        // ----------------------------
        // 3. Hash password
        // ----------------------------
        const passwordHash = await bcrypt.hash(password, 10);

        // ----------------------------
        // 4. Generate a 6-digit OTP
        // ----------------------------
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 minutes

        // ----------------------------
        // 5. Insert vendor into DB
        // ----------------------------
        const newVendor = await db
            .insert(vendorsTable)
            .values({
                fullName,
                occupation,
                phone,
                address,
                email,
                passwordHash,

                emailVerified: false,
                emailVerificationOtp: otp,
                emailVerificationExpires: otpExpiry,

                currentStep: 1,
                status: "PENDING_EMAIL_VERIFICATION",
            })
            .returning();

        const vendorId = newVendor[0].id;

        // ----------------------------
        // 6. Generate onboarding JWT
        // ----------------------------
        const onboardingToken = jwt.sign(
            { vendorId, step: 1 },
            process.env.JWT_SECRET!,
            { expiresIn: "2h" }
        );

        // ----------------------------
        // 7. Send OTP email
        // ----------------------------
        await sendEmail({
            to: email,
            subject: "Your SR Portraits & Events Verification Code",
            html: otpEmailTemplate(otp),
        });

        return NextResponse.json(
            {
                success: true,
                message: "Vendor registered. OTP sent to email.",
                vendorId,
                onboardingToken,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Vendor Registration Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
