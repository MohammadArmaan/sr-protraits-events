import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
    try {
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

        // ✅ Fetch ALL vendors (no status filter)
        const vendors = await db
            .select({
                vendorId: vendorsTable.id,
                fullName: vendorsTable.fullName,
                occupation: vendorsTable.occupation,
                businessName: vendorsTable.businessName,
                email: vendorsTable.email,
                phone: vendorsTable.phone,
                profilePhoto: vendorsTable.profilePhoto,
                businessPhotos: vendorsTable.businessPhotos,

                status: vendorsTable.status,
                activationToken: vendorsTable.activationToken,
                activationTokenExpires: vendorsTable.activationTokenExpires,
                createdAt: vendorsTable.createdAt,
                approvedAt: vendorsTable.approvedAt,
            })
            .from(vendorsTable)
            .orderBy(vendorsTable.createdAt);

        return NextResponse.json({ success: true, vendors }, { status: 200 });
    } catch (error) {
        console.error("Vendor list fetch error:", error);
        return NextResponse.json(
            { error: "Server error fetching vendor list" },
            { status: 500 },
        );
    }
}
