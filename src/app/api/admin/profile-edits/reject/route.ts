// src/app/api/admin/profile-edits/reject/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProfileEdits } from "@/config/vendorProfilesSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { sendEmail } from "@/lib/sendEmail";
import { vendorEditRejectedEmailTemplate } from "@/lib/email-templates/vendorEditRejectedEmailTemplate";

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
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!,
        ) as DecodedToken;

        if (decoded.role !== "admin") {
            return NextResponse.json(
                { error: "Permission denied" },
                { status: 403 },
            );
        }

        /* ---------------------------- INPUT ---------------------------- */

        const { editId, reason } = (await req.json()) as {
            editId: number;
            reason?: string;
        };

        if (!editId) {
            return NextResponse.json(
                { error: "Missing editId" },
                { status: 400 },
            );
        }

        /* ------------------------- FETCH EDIT ------------------------- */

        const [edit] = await db
            .select()
            .from(vendorProfileEdits)
            .where(eq(vendorProfileEdits.id, editId));

        if (!edit) {
            return NextResponse.json(
                { error: "Edit request not found" },
                { status: 404 },
            );
        }

        if (edit.status !== "PENDING") {
            return NextResponse.json(
                { error: "Request already processed" },
                { status: 400 },
            );
        }

        /* ------------------------ FETCH VENDOR ------------------------ */

        const [vendor] = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.id, edit.vendorId));

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 },
            );
        }

        /* ------------------- CLEANUP: PROFILE PHOTO ------------------- */

        if (edit.newProfilePhotoUrl) {
            const key = edit.newProfilePhotoUrl.split(".com/")[1];
            if (key) {
                await s3.send(
                    new DeleteObjectCommand({
                        Bucket: process.env.AWS_S3_BUCKET_NAME!,
                        Key: key,
                    }),
                );
            }
        }

        /* ------------------ CLEANUP: CATALOG IMAGES ------------------- */

        if (Array.isArray(edit.catalogChanges)) {
            for (const change of edit.catalogChanges) {
                const addedImages = change.payload?.addedImages ?? [];

                for (const url of addedImages) {
                    const key = url.split(".com/")[1];
                    if (key) {
                        await s3.send(
                            new DeleteObjectCommand({
                                Bucket: process.env.AWS_S3_BUCKET_NAME!,
                                Key: key,
                            }),
                        );
                    }
                }
            }
        }

        /* -------------------- MARK AS REJECTED -------------------- */

        await db
            .update(vendorProfileEdits)
            .set({
                status: "REJECTED",
                rejectionReason: reason ?? null,
                rejectedByAdminId: decoded.adminId,
                reviewedAt: new Date(),
            })
            .where(eq(vendorProfileEdits.id, editId));

        /* ------------------------ EMAIL ------------------------ */

        await sendEmail({
            to: vendor.email,
            subject: "Your profile update request was rejected",
            html: vendorEditRejectedEmailTemplate(
                vendor.fullName,
            ),
        });

        return NextResponse.json(
            { success: true, message: "Profile edit rejected successfully" },
            { status: 200 },
        );
    } catch (error) {
        console.error("Reject Error:", error);
        return NextResponse.json(
            { error: "Server error rejecting request" },
            { status: 500 },
        );
    }
}
