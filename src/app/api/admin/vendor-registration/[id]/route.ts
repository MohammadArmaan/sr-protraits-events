import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
import { vendorBankDetailsTable } from "@/config/vendorBankDetailsSchema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const vendorId = Number(id);

        if (!vendorId || Number.isNaN(vendorId)) {
            return NextResponse.json(
                { error: "Invalid vendor id" },
                { status: 400 },
            );
        }

        // 🔐 Validate admin token
        const token = req.cookies.get("admin_token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            adminId: number;
            role: string;
        };

        if (decoded.role !== "admin") {
            return NextResponse.json(
                { error: "Forbidden: Admins only" },
                { status: 403 },
            );
        }

        // ✅ Fetch vendor
        const [vendor] = await db
            .select({
                id: vendorsTable.id,
                fullName: vendorsTable.fullName,
                businessName: vendorsTable.businessName,
                occupation: vendorsTable.occupation,
                phone: vendorsTable.phone,
                email: vendorsTable.email,
                address: vendorsTable.address,
                businessDescription: vendorsTable.businessDescription,
                profilePhoto: vendorsTable.profilePhoto,
                businessPhotos: vendorsTable.businessPhotos,
                status: vendorsTable.status,
                isApproved: vendorsTable.isApproved,
                approvedAt: vendorsTable.approvedAt,
                createdAt: vendorsTable.createdAt,
            })
            .from(vendorsTable)
            .where(eq(vendorsTable.id, vendorId));

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 },
            );
        }

        // ✅ Fetch bank details (nullable)
        const [bankDetails] = await db
            .select({
                accountHolderName: vendorBankDetailsTable.accountHolderName,
                accountNumber: vendorBankDetailsTable.accountNumber,
                ifscCode: vendorBankDetailsTable.ifscCode,
                isPayoutReady: vendorBankDetailsTable.isPayoutReady,
                isEdited: vendorBankDetailsTable.isEdited,
                confirmedAt: vendorBankDetailsTable.confirmedAt,
                pendingChanges: vendorBankDetailsTable.pendingChanges,
                adminApprovedAt: vendorBankDetailsTable.adminApprovedAt,
            })
            .from(vendorBankDetailsTable)
            .where(eq(vendorBankDetailsTable.vendorId, vendorId));

        return NextResponse.json(
            {
                success: true,
                vendor: {
                    ...vendor,
                    bankDetails: bankDetails ?? null,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Vendor details fetch error:", error);
        return NextResponse.json(
            { error: "Server error fetching vendor details" },
            { status: 500 },
        );
    }
}
