import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/config/db";
import { vendorBankDetailsTable } from "@/config/vendorBankDetailsSchema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("vendor_token")?.value;
        if (!token)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            vendorId: number;
        };

        const {
            accountHolderName,
            accountNumber,
            confirmAccountNumber,
            ifscCode,
            confirmed,
        } = await req.json();

        if (
            !accountHolderName ||
            !accountNumber ||
            !confirmAccountNumber ||
            !ifscCode ||
            confirmed !== true
        ) {
            return NextResponse.json(
                { error: "All fields and confirmation are required" },
                { status: 400 }
            );
        }

        if (accountNumber !== confirmAccountNumber) {
            return NextResponse.json(
                { error: "Account numbers do not match" },
                { status: 400 }
            );
        }

await db
    .update(vendorBankDetailsTable)
    .set({
        pendingChanges: {
            accountHolderName,
            accountNumber,
            ifscCode,
        },
        isEdited: true,
        isPayoutReady: false,
        confirmedAt: new Date(),
        adminApprovedAt: null,
        updatedAt: new Date(),
    })
    .where(eq(vendorBankDetailsTable.vendorId, decoded.vendorId));

        return NextResponse.json({
            success: true,
            message:
                "Bank details updated. Awaiting admin approval for payouts.",
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
