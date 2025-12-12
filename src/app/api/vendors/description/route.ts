/**
 * @fileoverview Vendor Registration – Step 3 (Business Description)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

interface DescriptionBody {
    onboardingToken: string;
    businessDescription: string;
}

interface OnboardingTokenPayload {
    vendorId: number;
    step: number;
    iat?: number;
    exp?: number;
}

export async function POST(req: NextRequest) {
    try {
        const body: DescriptionBody = await req.json();
        const { onboardingToken, businessDescription } = body;

        if (!onboardingToken || !businessDescription) {
            return NextResponse.json(
                {
                    error: "onboardingToken and businessDescription are required.",
                },
                { status: 400 }
            );
        }

        // Verify onboarding token
        let decoded: OnboardingTokenPayload;
        try {
            decoded = jwt.verify(
                onboardingToken,
                process.env.JWT_SECRET!
            ) as OnboardingTokenPayload;
        } catch {
            return NextResponse.json(
                { error: "Invalid or expired onboarding token." },
                { status: 401 }
            );
        }

        const vendorId = decoded.vendorId;

        // Fetch vendor
        const vendor = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.id, vendorId));

        if (vendor.length === 0) {
            return NextResponse.json(
                { error: "Vendor not found." },
                { status: 404 }
            );
        }

        const vendorRecord = vendor[0];

        if (!vendorRecord.emailVerified) {
            return NextResponse.json(
                { error: "Email not verified yet." },
                { status: 400 }
            );
        }

        if (vendorRecord.currentStep !== 2) {
            return NextResponse.json(
                {
                    error: `Vendor is currently on step ${vendorRecord.currentStep}, cannot update description.`,
                },
                { status: 400 }
            );
        }

        // Update vendor
        await db
            .update(vendorsTable)
            .set({
                businessDescription,
                currentStep: 3,
                status: "BUSINESS_DESCRIPTION_ADDED"
            })
            .where(eq(vendorsTable.id, vendorId));

        // Issue new onboarding token
        const newToken = jwt.sign(
            { vendorId, step: 3 },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
        );

        return NextResponse.json(
            {
                success: true,
                message: "Business description saved.",
                onboardingToken: newToken,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Step 3 Error:", error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}
