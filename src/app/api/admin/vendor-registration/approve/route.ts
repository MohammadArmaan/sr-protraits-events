/**
 * @fileoverview Secure Admin Approval of Vendor Registration
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { activationEmailTemplate } from "@/lib/email-templates/activationTemplate";
import { sendEmail } from "@/lib/sendEmail";

interface DecodedAdminToken {
    adminId: number;
    role: "admin" | "superadmin";
}

export async function POST(req: NextRequest) {
    try {
        // ---------------------------------------------------
        // 1. AUTH CHECK → MUST BE ADMIN
        // ---------------------------------------------------
        const token = req.cookies.get("admin_token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized: Admin login required" },
                { status: 401 }
            );
        }

        let decoded: DecodedAdminToken;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedAdminToken;
        } catch {
            return NextResponse.json(
                { error: "Invalid or expired admin token" },
                { status: 401 }
            );
        }

        if (decoded.role !== "admin" && decoded.role !== "superadmin") {
            return NextResponse.json(
                { error: "Permission denied: Only admins can approve vendors" },
                { status: 403 }
            );
        }

        // ---------------------------------------------------
        // 2. Get payload
        // ---------------------------------------------------
        const { vendorId } = await req.json();

        if (!vendorId) {
            return NextResponse.json(
                { error: "vendorId is required" },
                { status: 400 }
            );
        }

        // ---------------------------------------------------
        // 3. Fetch vendor
        // ---------------------------------------------------
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

        // Extra safety
        if (vendor.isApproved) {
            return NextResponse.json(
                { error: "Vendor is already approved" },
                { status: 400 }
            );
        }

        // ---------------------------------------------------
        // 4. Create activation token (48 hours)
        // ---------------------------------------------------
        const activationToken = jwt.sign(
            { vendorId },
            process.env.JWT_SECRET!,
            { expiresIn: "48h" }
        );

        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

        // ---------------------------------------------------
        // 5. Update vendor record
        // ---------------------------------------------------
        await db
            .update(vendorsTable)
            .set({
                status: "AWAITING_ACTIVATION",
                activationToken,
                activationTokenExpires: expiresAt,
                isApproved: true,
                approvedAt: new Date(),
            })
            .where(eq(vendorsTable.id, vendorId));

        // ---------------------------------------------------
        // 6. Send activation email
        // ---------------------------------------------------
        const activationUrl = `/api/vendors/activate?token=${activationToken}`;

        await sendEmail({
            to: vendor.email,
            subject: "Your Vendor Account is Approved 🎉",
            html: activationEmailTemplate(vendor.fullName, activationUrl),
        });

        // ---------------------------------------------------
        // 7. Response
        // ---------------------------------------------------
        return NextResponse.json({
            success: true,
            message: "Vendor approved and activation email sent.",
        });

    } catch (err) {
        console.error("Admin Approve Vendor Error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
