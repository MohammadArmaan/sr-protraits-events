/**
 * @fileoverview Secure Admin Rejection of Vendor Registration
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { sendEmail } from "@/lib/sendEmail";
import { vendorRegistrationRejectedEmailTemplate } from "@/lib/email-templates/vendorRegistrationRejectedEmailTemplate";

interface DecodedAdminToken {
    adminId: number;
    role: "admin" | "superadmin";
}

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS!,
    },
});

export async function POST(req: NextRequest) {
    try {
        // ---------------------------------------------------
        // 1. VALIDATE ADMIN AUTH
        // ---------------------------------------------------
        const token = req.cookies.get("admin_token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        let decoded: DecodedAdminToken;
        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET!
            ) as DecodedAdminToken;
        } catch {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 401 }
            );
        }

        if (decoded.role !== "admin" && decoded.role !== "superadmin") {
            return NextResponse.json(
                { error: "Permission denied" },
                { status: 403 }
            );
        }

        // ---------------------------------------------------
        // 2. Extract vendorId from request body
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

        // ---------------------------------------------------
        // 4. Delete vendor uploaded photos (profile + business)
        // ---------------------------------------------------
        const deleteFromS3 = async (url: string) => {
            const key = url?.split(".com/")[1];
            if (!key) return;

            try {
                await s3.send(
                    new DeleteObjectCommand({
                        Bucket: process.env.AWS_S3_BUCKET_NAME!,
                        Key: key,
                    })
                );
            } catch (err) {
                console.error("S3 Delete Error:", err);
            }
        };

        // Delete profile photo
        if (vendor.profilePhoto) {
            await deleteFromS3(vendor.profilePhoto);
        }

        // Delete all business photos
        if (Array.isArray(vendor.businessPhotos)) {
            for (const url of vendor.businessPhotos) {
                await deleteFromS3(url);
            }
        }

        // ---------------------------------------------------
        // 5. Update vendor status → REJECTED
        // ---------------------------------------------------
        await db
            .update(vendorsTable)
            .set({
                status: "REJECTED",
                isApproved: false,
            })
            .where(eq(vendorsTable.id, vendorId));

        // ---------------------------------------------------
        // 6. Send rejection email
        // ---------------------------------------------------
        await sendEmail({
            to: vendor.email,
            subject: "Your Vendor Registration Was Rejected ❌",
            html: vendorRegistrationRejectedEmailTemplate(
                vendor.fullName || vendor.businessName || "Vendor"
            ),
        });

        return NextResponse.json(
            { success: true, message: "Vendor rejected successfully" },
            { status: 200 }
        );
    } catch (err) {
        console.error("Vendor Reject Error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
