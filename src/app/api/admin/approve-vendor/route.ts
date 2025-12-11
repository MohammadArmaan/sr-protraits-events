/**
 * @fileoverview Admin approval of vendor registration.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { activationEmailTemplate } from "@/lib/email-templates/activationTemplate";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
    try {
        const { vendorId } = await req.json();

        if (!vendorId) {
            return NextResponse.json(
                { error: "vendorId required" },
                { status: 400 }
            );
        }

        const vendorList = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.id, vendorId));

        if (vendorList.length === 0) {
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 }
            );
        }

        const vendor = vendorList[0];

        // Generate activation token (valid 48 hours)
        const activationToken = jwt.sign(
            { vendorId },
            process.env.JWT_SECRET!,
            { expiresIn: "48h" }
        );

        await db
            .update(vendorsTable)
            .set({
                status: "AWAITING_ACTIVATION",
                activationToken,
                activationTokenExpires: new Date(
                    Date.now() + 48 * 60 * 60 * 1000
                ),
                isApproved: true,
                approvedAt: new Date(),
            })
            .where(eq(vendorsTable.id, vendorId));

        // Send activation email
        await sendEmail({
            to: vendor.email,
            subject: "Your Vendor Account is Approved 🎉",
            html: activationEmailTemplate(
                vendor.fullName,
                `api/vendors/activate?token=${activationToken}`
            ),
        });

        return NextResponse.json({
            success: true,
            message: "Vendor approved and activation email sent.",
        });
    } catch (error) {
        console.error("Admin Approve Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
