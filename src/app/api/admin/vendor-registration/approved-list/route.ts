import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
import { adminsTable } from "@/config/adminsSchema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
    try {
        // -----------------------------
        // Validate Admin Token
        // -----------------------------
        const token = req.cookies.get("admin_token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized: Admin token missing" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            adminId: number;
            role: string;
        };

        if (decoded.role !== "admin") {
            return NextResponse.json(
                { error: "Access denied. Admins only." },
                { status: 403 }
            );
        }

        // -----------------------------
        // Fetch Vendors Awaiting Activation
        // (Catalog created, waiting admin approval)
        // -----------------------------
        const vendors = await db
            .select({
                vendorId: vendorsTable.id,
                fullName: vendorsTable.fullName,
                businessName: vendorsTable.businessName,
                email: vendorsTable.email,
                profilePhoto: vendorsTable.profilePhoto,

                currentStep: vendorsTable.currentStep,
                status: vendorsTable.status,

                createdAt: vendorsTable.createdAt,
                approvedAt: vendorsTable.approvedAt,
                approvedBy: adminsTable.fullName,
            })
            .from(vendorsTable)
            .leftJoin(
                adminsTable,
                eq(vendorsTable.approvedByAdminId, adminsTable.id)
            )
            .where(eq(vendorsTable.currentStep, 4))
            .orderBy(vendorsTable.createdAt);

        return NextResponse.json(
            { success: true, vendors },
            { status: 200 }
        );
    } catch (error) {
        console.error("Activation list fetch error:", error);
        return NextResponse.json(
            { error: "Server error fetching activation list" },
            { status: 500 }
        );
    }
}
