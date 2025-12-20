import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/config/db";
import { vendorBankDetailsTable } from "@/config/vendorBankDetailsSchema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("vendor_token")?.value;
        if (!token)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as { vendorId: number };

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

        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
            return NextResponse.json(
                { error: "Invalid IFSC code" },
                { status: 400 }
            );
        }

        await db.insert(vendorBankDetailsTable).values({
            vendorId: decoded.vendorId,
            accountHolderName,
            accountNumber,
            ifscCode,
            isPayoutReady: true,
            isEdited: false,
            confirmedAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: "Bank details added and payout-ready",
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("vendor_token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as { vendorId: number };

        const [bank] = await db
            .select({
                accountHolderName:
                    vendorBankDetailsTable.accountHolderName,
                ifscCode: vendorBankDetailsTable.ifscCode,
                accountNumber:
                    vendorBankDetailsTable.accountNumber,
                isPayoutReady:
                    vendorBankDetailsTable.isPayoutReady,
                isEdited:
                    vendorBankDetailsTable.isEdited,
            })
            .from(vendorBankDetailsTable)
            .where(eq(vendorBankDetailsTable.vendorId, decoded.vendorId))
            .limit(1);

        // If bank details not added yet
        if (!bank) {
            return NextResponse.json({ bankDetails: null });
        }

        return NextResponse.json({
            bankDetails: {
                accountHolderName: bank.accountHolderName,
                ifscCode: bank.ifscCode,
                accountNumber: `XXXX${bank.accountNumber.slice(-4)}`,
                isPayoutReady: bank.isPayoutReady,
                isEdited: bank.isEdited,
            },
        });
    } catch (error) {
        console.error("Get Bank Details Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}