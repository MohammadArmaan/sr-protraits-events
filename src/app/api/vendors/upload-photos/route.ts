/**
 * @fileoverview Vendor Registration – Step 4 (Upload Business Photos)
 */

import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

/** Type for JWT onboarding token */
interface OnboardingTokenPayload {
    vendorId: number;
    step: number;
    iat?: number;
    exp?: number;
}

/** Response type for returning JSON */
interface Step4Response {
    success: boolean;
    message: string;
    onboardingToken?: string;
    photos?: string[];
}

/** AWS S3 Client */
const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS!,
    },
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const onboardingToken = formData.get("onboardingToken") as
            | string
            | null;
        const files = formData.getAll("files") as File[];

        if (!onboardingToken) {
            return NextResponse.json(
                { error: "Missing onboarding token." },
                { status: 400 }
            );
        }

        if (files.length === 0) {
            return NextResponse.json(
                { error: "At least one photo must be uploaded." },
                { status: 400 }
            );
        }

        // ------------------------------
        // 1. VERIFY TOKEN
        // ------------------------------
        let decoded: OnboardingTokenPayload;
        try {
            decoded = jwt.verify(
                onboardingToken,
                process.env.JWT_SECRET!
            ) as OnboardingTokenPayload;
        } catch {
            return NextResponse.json(
                { error: "Invalid or expired onboarding token." },
                { status: 401 }
            );
        }

        const vendorId = decoded.vendorId;

        // ------------------------------
        // 2. FETCH VENDOR
        // ------------------------------
        const vendorResult = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.id, vendorId));

        if (vendorResult.length === 0) {
            return NextResponse.json(
                { error: "Vendor not found." },
                { status: 404 }
            );
        }

        const vendor = vendorResult[0];

        if (vendor.currentStep !== 3) {
            return NextResponse.json(
                {
                    error: `Vendor is currently on step ${vendor.currentStep}, cannot upload photos.`,
                },
                { status: 400 }
            );
        }

        // ------------------------------
        // 3. UPLOAD ALL IMAGES TO S3
        // ------------------------------
        const uploadedUrls: string[] = [];

        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `${vendorId}-${Date.now()}-${file.name}`;

            const command = new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME!,
                Key: fileName,
                Body: buffer,
                ContentType: file.type,
            });

            await s3.send(command);

            const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

            uploadedUrls.push(fileUrl);
        }

        // ------------------------------
        // 4. APPEND TO existing photos
        // ------------------------------
        const updatedPhotos = [
            ...(vendor.businessPhotos ?? []),
            ...uploadedUrls,
        ];

        await db
            .update(vendorsTable)
            .set({
                businessPhotos: updatedPhotos,
                currentStep: 4,
                status: "BUSINESS_PHOTOS_UPLOADED"
            })
            .where(eq(vendorsTable.id, vendorId));

        // ------------------------------
        // 5. ISSUE NEXT ONBOARDING TOKEN (Step 4)
        // ------------------------------
        const newToken = jwt.sign(
            { vendorId, step: 4 },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
        );

        // ------------------------------
        // 6. SUCCESS RESPONSE
        // ------------------------------
        return NextResponse.json<Step4Response>(
            {
                success: true,
                message: "Business photos uploaded successfully.",
                onboardingToken: newToken,
                photos: updatedPhotos,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Step 4 Upload Error:", error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}
