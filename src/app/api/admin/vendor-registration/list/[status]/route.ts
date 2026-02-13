import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const ALLOWED_STATUSES = [
    "ACTIVE",
    "PENDING",
    "REJECTED",
    "SUSPENDED",
];

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ status: string }> }
) {
    try {
        const { status } = await context.params;
        const normalizedStatus = status.toUpperCase();

        /* ---------------- VALIDATE STATUS ---------------- */
        if (!ALLOWED_STATUSES.includes(normalizedStatus)) {
            return NextResponse.json(
                { error: "Invalid vendor status" },
                { status: 400 }
            );
        }

        /* ---------------- AUTH ---------------- */
        const token = req.cookies.get("admin_token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            adminId: number;
            role: "admin" | "superadmin";
        };

        if (!["admin", "superadmin"].includes(decoded.role)) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        /* ---------------- FETCH VENDORS ---------------- */
        const vendors = await db
            .select({
                vendorId: vendorsTable.id,
                fullName: vendorsTable.fullName,
                businessName: vendorsTable.businessName,
                occupation: vendorsTable.occupation,

                phone: vendorsTable.phone,
                email: vendorsTable.email,
                address: vendorsTable.address,

                businessDescription: vendorsTable.businessDescription,
                profilePhoto: vendorsTable.profilePhoto,

                yearsOfExperience: vendorsTable.yearsOfExperience,
                successfulEventsCompleted:
                    vendorsTable.successfulEventsCompleted,
                points: vendorsTable.points,

                gstNumber: vendorsTable.gstNumber,

                status: vendorsTable.status,
                isApproved: vendorsTable.isApproved,
                approvedAt: vendorsTable.approvedAt,
                createdAt: vendorsTable.createdAt,
            })
            .from(vendorsTable)
            .where(eq(vendorsTable.status, normalizedStatus));

        return NextResponse.json(
            {
                success: true,
                vendors, // ✅ ARRAY
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Fetch vendors by status error:", error);
        return NextResponse.json(
            { error: "Server error fetching vendors" },
            { status: 500 }
        );
    }
}
