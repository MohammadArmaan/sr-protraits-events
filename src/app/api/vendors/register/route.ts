/**
 * @fileoverview Vendor Registration (Step 1)
 * - Accepts multipart/form-data
 * - Uploads profile photo to S3
 * - Creates vendor
 * - Calculates initial points
 * - Sends OTP email
 */

import { NextRequest, NextResponse } from "next/server";
import { vendorsTable } from "@/config/vendorsSchema";
import { db } from "@/config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/sendEmail";
import { otpEmailTemplate } from "@/lib/email-templates/otpTemplates";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

// ----------------------------
// S3 Client
// ----------------------------
const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_Id!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_Key!,
    },
});

export async function POST(req: NextRequest) {
    try {
        // ----------------------------
        // 1. Parse multipart form data
        // ----------------------------
        const formData = await req.formData();

        const fullName = formData.get("fullName") as string;
        const businessName = formData.get("businessName") as string | null;
        const occupation = formData.get("occupation") as string;
        const phone = formData.get("phone") as string;
        const address = formData.get("address") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        const demandPrice = Number(formData.get("demandPrice"));
        const yearsOfExperience = Number(formData.get("yearsOfExperience"));
        const successfulEventsCompleted = Number(
            formData.get("successfulEventsCompleted"),
        );

        const gstNumber = formData.get("gstNumber") as string | null;

        const profilePhoto = formData.get("profilePhoto") as File;

        const hasAcceptedTerms = formData.get("hasAcceptedTerms") === "true";

        // ----------------------------
        // 2. Validate
        // ----------------------------
        if (
            !fullName ||
            !occupation ||
            !phone ||
            !address ||
            !email ||
            !password ||
            !confirmPassword ||
            !profilePhoto ||
            !hasAcceptedTerms ||
            isNaN(demandPrice) ||
            isNaN(yearsOfExperience) ||
            isNaN(successfulEventsCompleted)
        ) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: "Passwords do not match" },
                { status: 400 },
            );
        }

        // ----------------------------
        // 3. Check if vendor exists
        // ----------------------------
        const existingVendor = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.email, email));

        if (existingVendor.length > 0) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 400 },
            );
        }

        // ----------------------------
        // 4. Upload profile photo to S3
        // ----------------------------
        const fileBuffer = Buffer.from(await profilePhoto.arrayBuffer());
        const fileKey = `vendors/profile/${randomUUID()}-${profilePhoto.name}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME!,
                Key: fileKey,
                Body: fileBuffer,
                ContentType: profilePhoto.type,
            }),
        );

        const profilePhotoUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

        // ----------------------------
        // 5. Hash password
        // ----------------------------
        const passwordHash = await bcrypt.hash(password, 10);

        // ----------------------------
        // 6. Generate OTP
        // ----------------------------
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // ----------------------------
        // 7. Save the terms accepted at
        // ----------------------------

        const termsAcceptedAtRaw = formData.get("termsAcceptedAt") as
            | string
            | null;
        const termsAcceptedAt = termsAcceptedAtRaw
            ? new Date(termsAcceptedAtRaw)
            : null;

        // ----------------------------
        // 8. Calculate initial points
        // ----------------------------
        const points = yearsOfExperience * 5 + successfulEventsCompleted * 2;

        // ----------------------------
        // 9. Insert vendor
        // ----------------------------
        const newVendor = await db
            .insert(vendorsTable)
            .values({
                fullName,
                businessName: businessName || null,
                occupation,
                phone,
                address,
                email,
                passwordHash,

                profilePhoto: profilePhotoUrl,

                demandPrice,
                yearsOfExperience,
                successfulEventsCompleted,
                gstNumber: gstNumber || null,

                points,

                hasAcceptedTerms,
                termsAcceptedAt,

                emailVerified: false,
                emailVerificationOtp: otp,
                emailVerificationExpires: otpExpiry,

                status: "PENDING_EMAIL_VERIFICATION",
            })
            .returning();

        const vendorId = newVendor[0].id;

        // ----------------------------
        // 10. Generate onboarding token
        // ----------------------------
        const onboardingToken = jwt.sign(
            { vendorId, step: 1 },
            process.env.JWT_SECRET!,
            { expiresIn: "2h" },
        );

        // ----------------------------
        // 11. Send OTP email
        // ----------------------------
        await sendEmail({
            to: email,
            subject: "Your SR Portraits & Events Verification Code",
            html: otpEmailTemplate(otp),
        });

        return NextResponse.json(
            {
                success: true,
                message: "Vendor registered. OTP sent to email.",
                vendorId,
                onboardingToken,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Vendor Registration Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
