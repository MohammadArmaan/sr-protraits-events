import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { resetPasswordTemplate } from "@/lib/email-templates/resetPasswordTemplate";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Find vendor
        const vendorList = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.email, email));

        if (vendorList.length === 0) {
            return NextResponse.json(
                { message: "If an account exists, a reset email will be sent." },
                { status: 200 }
            );
        }

        const vendor = vendorList[0];

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Save to DB
        await db
            .update(vendorsTable)
            .set({
                resetPasswordToken: resetToken,
                resetPasswordExpires: expiresAt,
            })
            .where(eq(vendorsTable.id, vendor.id));

        const resetUrl = `/vendor/password-reset?token=${resetToken}`;

        // Send Email
        await sendEmail({
            to: vendor.email,
            subject: "Reset Your Password",
            html: resetPasswordTemplate(vendor.fullName, resetUrl),
        });

        return NextResponse.json(
            {
                success: true,
                message: "If an account exists, reset email has been sent.",
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("Forgot password error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
