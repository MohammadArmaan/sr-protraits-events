import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/schema";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

interface FinishTokenPayload {
    vendorId: number;
    step: number;
    iat?: number;
    exp?: number;
}

export async function POST(req: NextRequest) {
    try {
        const { onboardingToken } = await req.json();

        if (!onboardingToken) {
            return NextResponse.json(
                { error: "Missing onboarding token." },
                { status: 400 }
            );
        }

        let decoded: FinishTokenPayload;
        try {
            decoded = jwt.verify(
                onboardingToken,
                process.env.JWT_SECRET!
            ) as FinishTokenPayload;
        } catch {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 401 }
            );
        }

        const vendorId = decoded.vendorId;

        // Fetch vendor
        const vendorList = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.id, vendorId));

        if (vendorList.length === 0) {
            return NextResponse.json(
                { error: "Vendor not found." },
                { status: 404 }
            );
        }

        const vendor = vendorList[0];

        // Ensure vendor completed Step 4
        if (vendor.currentStep !== 4) {
            return NextResponse.json(
                { error: "Complete all steps before finishing registration." },
                { status: 400 }
            );
        }

        // Mark complete
        await db
            .update(vendorsTable)
            .set({ currentStep: 5 })
            .where(eq(vendorsTable.id, vendorId));

        return NextResponse.json({
            message: "Registration marked as complete",
        });
    } catch (error) {
        console.error("Finish Error:", error);
        return NextResponse.json(
            { error: "Failed to finalize registration" },
            { status: 500 }
        );
    }
}
