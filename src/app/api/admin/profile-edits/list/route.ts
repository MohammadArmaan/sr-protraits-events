import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProfileEdits } from "@/config/vendorProfilesSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { adminsTable } from "@/config/adminsSchema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("admin_token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized: Admin token missing" },
                { status: 401 }
            );
        }

        let decoded: { adminId: number; role: string };

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
                adminId: number;
                role: string;
            };
        } catch {
            return NextResponse.json(
                { error: "Invalid admin token" },
                { status: 401 }
            );
        }

        if (decoded.role !== "admin") {
            return NextResponse.json(
                { error: "Access denied. Admins only." },
                { status: 403 }
            );
        }

        // Fetch all pending requests + vendor + admin
        const edits = await db
            .select({
                editId: vendorProfileEdits.id,
                vendorId: vendorProfileEdits.vendorId,
                changes: vendorProfileEdits.changes,
                newProfilePhotoUrl: vendorProfileEdits.newProfilePhotoUrl,
                oldProfilePhotoUrl: vendorProfileEdits.oldProfilePhotoUrl,
                status: vendorProfileEdits.status,
                createdAt: vendorProfileEdits.createdAt,
                reviewedAt: vendorProfileEdits.reviewedAt,

                vendorName: vendorsTable.fullName,
                vendorBusinessName: vendorsTable.businessName,
                vendorEmail: vendorsTable.email,
                vendorCurrentPhoto: vendorsTable.profilePhoto,

                // SAFELY ALSO RETURN BUSINESS PHOTOS
                vendorBusinessPhotos: vendorsTable.businessPhotos,

                approvedBy: adminsTable.fullName,
            })
            .from(vendorProfileEdits)
            .leftJoin(
                vendorsTable,
                eq(vendorProfileEdits.vendorId, vendorsTable.id)
            )
            .leftJoin(
                adminsTable,
                eq(vendorProfileEdits.approvedByAdminId, adminsTable.id)
            )
            .orderBy(vendorProfileEdits.createdAt);

        // 🔒 Ensure vendorBusinessPhotos is always an array (never null)
        const safeEdits = edits.map((e) => ({
            ...e,
            vendorBusinessPhotos: e.vendorBusinessPhotos ?? [],
        }));

        return NextResponse.json(
            { success: true, edits: safeEdits },
            { status: 200 }
        );
    } catch (error) {
        console.error("List profile edits error:", error);
        return NextResponse.json(
            { error: "Server error fetching profile edits" },
            { status: 500 }
        );
    }
}
