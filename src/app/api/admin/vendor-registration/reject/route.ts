/**
 * @fileoverview Secure Admin Rejection of Vendor Registration
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
import { vendorCatalogsTable } from "@/config/vendorCatalogSchema";
import { vendorCatalogImagesTable } from "@/config/vendorCatalogImagesSchema";
import { eq, inArray } from "drizzle-orm";
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
        accessKeyId: process.env.AWS_ACCESS_KEY_Id!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_Key!,
    },
});

const deleteFromS3 = async (url: string) => {
    const key = url.split(".com/")[1];
    if (!key) return;

    try {
        await s3.send(
            new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME!,
                Key: key,
            }),
        );
    } catch (err) {
        console.error("S3 Delete Error:", err);
    }
};

export async function POST(req: NextRequest) {
    try {
        // -----------------------------
        // 1. Validate Admin Auth
        // -----------------------------
        const token = req.cookies.get("admin_token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!,
        ) as DecodedAdminToken;

        if (decoded.role !== "admin" && decoded.role !== "superadmin") {
            return NextResponse.json(
                { error: "Permission denied" },
                { status: 403 },
            );
        }

        // -----------------------------
        // 2. Extract vendorId
        // -----------------------------
        const body = (await req.json()) as { vendorId?: number };

        if (!body.vendorId) {
            return NextResponse.json(
                { error: "vendorId is required" },
                { status: 400 },
            );
        }

        const vendorId = body.vendorId;

        // -----------------------------
        // 3. Fetch vendor
        // -----------------------------
        const [vendor] = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.id, vendorId));

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 },
            );
        }

        // -----------------------------
        // 4. Delete profile photo
        // -----------------------------
        if (vendor.profilePhoto) {
            await deleteFromS3(vendor.profilePhoto);
        }

        // -----------------------------
        // 5. Fetch catalogs
        // -----------------------------
        const catalogs = await db
            .select({ id: vendorCatalogsTable.id })
            .from(vendorCatalogsTable)
            .where(eq(vendorCatalogsTable.vendorId, vendorId));

        const catalogIds = catalogs.map(c => c.id);

        // -----------------------------
        // 6. Fetch & delete catalog images
        // -----------------------------
        if (catalogIds.length > 0) {
            const images = await db
                .select({
                    imageUrl: vendorCatalogImagesTable.imageUrl,
                })
                .from(vendorCatalogImagesTable)
                .where(inArray(vendorCatalogImagesTable.catalogId, catalogIds));

            for (const img of images) {
                await deleteFromS3(img.imageUrl);
            }

            // Delete image rows
            await db
                .delete(vendorCatalogImagesTable)
                .where(inArray(vendorCatalogImagesTable.catalogId, catalogIds));

            // Delete catalogs
            await db
                .delete(vendorCatalogsTable)
                .where(eq(vendorCatalogsTable.vendorId, vendorId));
        }

        // -----------------------------
        // 7. Update vendor status
        // -----------------------------
        await db
            .update(vendorsTable)
            .set({
                status: "REJECTED",
                isApproved: false,
            })
            .where(eq(vendorsTable.id, vendorId));

        // -----------------------------
        // 8. Send rejection email
        // -----------------------------
        await sendEmail({
            to: vendor.email,
            subject: "Your Vendor Registration Was Rejected ❌",
            html: vendorRegistrationRejectedEmailTemplate(
                vendor.fullName || vendor.businessName || "Vendor",
            ),
        });

        return NextResponse.json(
            { success: true, message: "Vendor rejected successfully" },
            { status: 200 },
        );
    } catch (err) {
        console.error("Vendor Reject Error:", err);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 },
        );
    }
}
