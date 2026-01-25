// src/app/api/admin/profile-edits/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProfileEdits } from "@/config/vendorProfilesSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import type { VendorEditableFields } from "@/types/vendor-edit";
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

        // fetch pending edit
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

        // fetch vendor
        const [vendor] = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.id, edit.vendorId));

        if (!vendor)
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 },
            );

        // --- Build updateData strictly typed ---
        const incoming: VendorEditableFields = edit.changes ?? {};

        const updateData: VendorEditableFields & {
            profilePhoto?: string;
            businessPhotos?: string[];
        } = { ...incoming };

        // profile photo
        if (edit.newProfilePhotoUrl) {
            updateData.profilePhoto = edit.newProfilePhotoUrl;
        }

        // business photos merge
        if (Array.isArray(incoming.businessPhotos)) {
            // This already contains existing + new - removed
            updateData.businessPhotos = incoming.businessPhotos;
        }

        // ---- Build final Drizzle set object (strict, no any) ----
        const setObj: Record<string, string | string[] | null> = {};

        if (updateData.fullName) setObj.fullName = updateData.fullName;
        if (updateData.businessName)
            setObj.businessName = updateData.businessName;
        if (updateData.occupation) setObj.occupation = updateData.occupation;
        if (updateData.phone) setObj.phone = updateData.phone;
        if (updateData.address) setObj.address = updateData.address;
        if (updateData.businessDescription)
            setObj.businessDescription = updateData.businessDescription;

        if (updateData.profilePhoto)
            setObj.profilePhoto = updateData.profilePhoto;
        if (updateData.businessPhotos)
            setObj.businessPhotos = updateData.businessPhotos;

        // nothing changed
        if (Object.keys(setObj).length === 0)
            return NextResponse.json(
                { success: true, message: "No changes to apply" },
                { status: 200 },
            );

        // ---- Update vendor ----
        await db
            .update(vendorsTable)
            .set(setObj)
            .where(eq(vendorsTable.id, vendor.id));

        // ---- Delete old S3 photo if needed ----
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

        // ---- Mark as approved ----
        await db
            .update(vendorProfileEdits)
            .set({
                status: "APPROVED",
                approvedByAdminId: decoded.adminId,
                reviewedAt: new Date(),
            })
            .where(eq(vendorProfileEdits.id, editId));

        // ---- Email notification ----
        await sendEmail({
            to: vendor.email,
            subject: "Your Profile is Updated",
            html: vendorEditApprovedEmailTemplate(vendor.fullName),
        });

        return NextResponse.json(
            { success: true, message: "Profile edit approved successfully" },
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
