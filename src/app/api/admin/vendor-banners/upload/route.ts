/**
 * Admin – Create Banner
 */
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/config/db";
import { vendorBannersTable } from "@/config/vendorBannersSchema";
import jwt from "jsonwebtoken";

interface AdminTokenPayload {
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

export async function POST(req: NextRequest) {
    try {
        /* ------------------ AUTH ------------------ */
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
        ) as AdminTokenPayload;

        if (!["admin", "superadmin"].includes(decoded.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        /* ------------------ FORM DATA ------------------ */
        const formData = await req.formData();
        const file = formData.get("image") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "Image is required" },
                { status: 400 },
            );
        }

        const title = formData.get("title") as string | null;
        const subtitle = formData.get("subtitle") as string | null;
        const ctaText = formData.get("ctaText") as string | null;
        const ctaLink = formData.get("ctaLink") as string | null;
        const order = Number(formData.get("order") ?? 0);

        /* ------------------ S3 UPLOAD ------------------ */
        const buffer = Buffer.from(await file.arrayBuffer());
        const key = `banner-images/${Date.now()}-${file.name}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME!,
                Key: key,
                Body: buffer,
                ContentType: file.type,
            }),
        );

        const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        /* ------------------ DB INSERT ------------------ */
        const banners = {
            imageUrl,
            title,
            subtitle,
            ctaText,
            ctaLink,
            order,
            createdByAdminId: decoded.adminId,
        };
        await db.insert(vendorBannersTable).values(banners);

        return NextResponse.json(
            { success: true, message: "Banner created successfully", banners },
            { status: 201 },
        );
    } catch (error) {
        console.error("Create Banner Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
