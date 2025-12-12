import { NextRequest, NextResponse } from "next/server";
import { vendorsTable } from "@/config/vendorsSchema";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

interface OnboardingTokenPayload {
    vendorId: number;
    step: number;
    iat?: number;
    exp?: number;
}

export async function POST(req: NextRequest) {
    try {
        const { onboardingToken, otp } = await req.json();

        if (!onboardingToken || !otp) {
            return NextResponse.json(
                { error: "Missing token or OTP" },
                { status: 400 }
            );
        }

        // -----------------------------
        // 1. Decode onboarding JWT
        // -----------------------------
        let decoded: OnboardingTokenPayload;

        try {
            decoded = jwt.verify(
                onboardingToken,
                process.env.JWT_SECRET!
            ) as OnboardingTokenPayload;
        } catch (error) {
            console.error(error);
            return NextResponse.json(
                { error: "Invalid or expired session token" },
                { status: 401 }
            );
        }

        const vendorId = decoded.vendorId;

        // -----------------------------
        // 2. Fetch vendor
        // -----------------------------
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

        // -----------------------------
        // 3. Check OTP match
        // -----------------------------
        if (vendor.emailVerificationOtp !== otp) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        // -----------------------------
        // 4. Check expiry
        // -----------------------------
        if (
            vendor.emailVerificationExpires &&
            vendor.emailVerificationExpires < new Date()
        ) {
            return NextResponse.json(
                { error: "OTP expired, request a new one" },
                { status: 410 }
            );
        }

        // -----------------------------
        // 5. Mark email verified
        // -----------------------------
        await db
            .update(vendorsTable)
            .set({
                emailVerified: true,
                emailVerificationOtp: null,
                emailVerificationExpires: null,
                currentStep: 2,
                status: "EMAIL_VERIFIED",
            })
            .where(eq(vendorsTable.id, vendorId));

        // -----------------------------
        // 6. Issue next-step onboarding JWT
        // -----------------------------
        const nextToken = jwt.sign(
            {
                vendorId,
                step: 2,
            },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
        );

        return NextResponse.json(
            {
                success: true,
                message: "OTP verified successfully",
                nextStep: 3,
                onboardingToken: nextToken,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("OTP Verification Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
