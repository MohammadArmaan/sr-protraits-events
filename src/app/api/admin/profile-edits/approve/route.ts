// src/app/api/admin/profile-edits/approve/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProfileEdits } from "@/config/vendorProfilesSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { vendorCatalogsTable } from "@/config/vendorCatalogSchema";
import { vendorCatalogImagesTable } from "@/config/vendorCatalogImagesSchema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { sendEmail } from "@/lib/sendEmail";
import { vendorEditApprovedEmailTemplate } from "@/lib/email-templates/vendorEditApprovedEmailTemplate";

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_Id!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_Key!,
    },
});

interface DecodedToken {
    adminId: number;
    role: string;
}

export async function POST(req: NextRequest) {
    try {
        /* ---------------------------- AUTH ---------------------------- */

        const token = req.cookies.get("admin_token")?.value;
        if (!token)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!,
        ) as DecodedToken;

        if (decoded.role !== "admin")
            return NextResponse.json(
                { error: "Permission denied" },
                { status: 403 },
            );

        const { editId } = (await req.json()) as { editId: number };

        /* ---------------------- FETCH EDIT ---------------------- */

        const [edit] = await db
            .select()
            .from(vendorProfileEdits)
            .where(eq(vendorProfileEdits.id, editId));

        if (!edit)
            return NextResponse.json(
                { error: "Edit request not found" },
                { status: 404 },
            );

        if (edit.status !== "PENDING")
            return NextResponse.json(
                { error: "Request already processed" },
                { status: 400 },
            );

        /* ---------------------- FETCH VENDOR ---------------------- */

        const [vendor] = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.id, edit.vendorId));

        if (!vendor)
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 },
            );

        /* ---------------------- APPLY PROFILE CHANGES ---------------------- */

        if (edit.profileChanges) {
            await db
                .update(vendorsTable)
                .set({
                    ...edit.profileChanges,
                    ...(edit.newProfilePhotoUrl && {
                        profilePhoto: edit.newProfilePhotoUrl,
                    }),
                })
                .where(eq(vendorsTable.id, vendor.id));
        }

        /* ---------------------- DELETE OLD PROFILE PHOTO ---------------------- */

        if (edit.newProfilePhotoUrl && edit.oldProfilePhotoUrl) {
            const key = edit.oldProfilePhotoUrl.split(".com/")[1];
            if (key) {
                await s3.send(
                    new DeleteObjectCommand({
                        Bucket: process.env.AWS_S3_BUCKET_NAME!,
                        Key: key,
                    }),
                );
            }
        }

        /* ---------------------- APPLY CATALOG CHANGES ---------------------- */

        if (Array.isArray(edit.catalogChanges)) {
            for (const change of edit.catalogChanges) {
                const { catalogId, action, payload } = change;

                // ADD catalog
                if (action === "ADD") {
                    const [newCatalog] = await db
                        .insert(vendorCatalogsTable)
                        .values({
                            vendorId: vendor.id,
                            title: payload.title!,
                            description: payload.description ?? null,
                            categoryId: payload.categoryId!,
                            subCategoryId: payload.subCategoryId!,
                        } satisfies typeof vendorCatalogsTable.$inferInsert)

                        .returning();

                    if (payload.addedImages?.length) {
                        await db.insert(vendorCatalogImagesTable).values(
                            payload.addedImages.map((url) => ({
                                catalogId: newCatalog.id,
                                imageUrl: url,
                            })),
                        );
                    }
                }

                // UPDATE catalog
                if (action === "UPDATE" && catalogId) {
                    await db
                        .update(vendorCatalogsTable)
                        .set({
                            title: payload.title,
                            description: payload.description,
                            categoryId: payload.categoryId,
                            subCategoryId: payload.subCategoryId,
                        })
                        .where(eq(vendorCatalogsTable.id, catalogId));

                    if (payload.removedImageIds?.length) {
                        await db
                            .delete(vendorCatalogImagesTable)
                            .where(
                                eq(
                                    vendorCatalogImagesTable.catalogId,
                                    catalogId,
                                ),
                            );
                    }

                    if (payload.addedImages?.length) {
                        await db.insert(vendorCatalogImagesTable).values(
                            payload.addedImages.map((url) => ({
                                catalogId,
                                imageUrl: url,
                            })),
                        );
                    }
                }

                // DELETE catalog
                if (action === "DELETE" && catalogId) {
                    await db
                        .delete(vendorCatalogImagesTable)
                        .where(
                            eq(vendorCatalogImagesTable.catalogId, catalogId),
                        );

                    await db
                        .delete(vendorCatalogsTable)
                        .where(eq(vendorCatalogsTable.id, catalogId));
                }
            }
        }

        /* ---------------------- MARK EDIT APPROVED ---------------------- */

        await db
            .update(vendorProfileEdits)
            .set({
                status: "APPROVED",
                approvedByAdminId: decoded.adminId,
                reviewedAt: new Date(),
            })
            .where(eq(vendorProfileEdits.id, editId));

        /* ---------------------- EMAIL ---------------------- */

        await sendEmail({
            to: vendor.email,
            subject: "Your profile update has been approved",
            html: vendorEditApprovedEmailTemplate(vendor.fullName),
        });

        return NextResponse.json(
            { success: true, message: "Edit approved successfully" },
            { status: 200 },
        );
    } catch (error) {
        console.error("Approve Error:", error);
        return NextResponse.json(
            { error: "Server error approving request" },
            { status: 500 },
        );
    }
}
