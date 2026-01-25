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
        // --------------------------
        // Validate admin token
        // --------------------------
        const token = req.cookies.get("admin_token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        let decoded: DecodedToken;
        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET!,
            ) as DecodedToken;
        } catch {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 401 },
            );
        }

        if (decoded.role !== "admin") {
            return NextResponse.json(
                { error: "Permission denied" },
                { status: 403 },
            );
        }

        // --------------------------
        // Parse editId from request
        // --------------------------
        const body = await req.json();
        const editId: number = Number(body.editId);

        if (!editId) {
            return NextResponse.json(
                { error: "Missing editId" },
                { status: 400 },
            );
        }

        // --------------------------
        // Fetch related edit request
        // --------------------------
        const [edit] = await db
            .select()
            .from(vendorProfileEdits)
            .where(eq(vendorProfileEdits.id, editId));

        if (!edit) {
            return NextResponse.json(
                { error: "Request not found" },
                { status: 404 },
            );
        }

        if (edit.status !== "PENDING") {
            return NextResponse.json(
                { error: "Already processed" },
                { status: 400 },
            );
        }

        // --------------------------
        // Fetch vendor for email
        // --------------------------
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

        // ----------------------------------------------------------
        // Delete NEW profile photo (if uploaded)
        // ----------------------------------------------------------
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

        // ----------------------------------------------------------
        // Delete NEW business photos
        // ----------------------------------------------------------
        const newBusinessPhotos = Array.isArray(edit.newBusinessPhotos)
            ? edit.newBusinessPhotos
            : [];

        for (const url of newBusinessPhotos) {
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

        // ----------------------------------------------------------
        // Mark the edit request as REJECTED
        // ----------------------------------------------------------
        await db
            .update(vendorProfileEdits)
            .set({
                status: "REJECTED",
                rejectedByAdminId: decoded.adminId,
                reviewedAt: new Date(),
            })
            .where(eq(vendorProfileEdits.id, editId));

        // ----------------------------------------------------------
        // Send rejection email
        // ----------------------------------------------------------
        await sendEmail({
            to: vendor.email,
            subject: "Your Profile Edit Request Was Rejected",
            html: vendorEditRejectedEmailTemplate(vendor.fullName),
        });

        return NextResponse.json(
            { success: true, message: "Profile edit rejected" },
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
