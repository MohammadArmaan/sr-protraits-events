import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { token, password, confirmPassword } = await req.json();

        if (!token || !password || !confirmPassword) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: "Passwords do not match" },
                { status: 400 }
            );
        }

        // Find vendor by reset token
        const vendorList = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.resetPasswordToken, token));

        if (vendorList.length === 0) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        const vendor = vendorList[0];

        // Check expiry
        if (!vendor.resetPasswordExpires || vendor.resetPasswordExpires < new Date()) {
            return NextResponse.json({ error: "Reset token expired" }, { status: 400 });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(password, 10);

        // Update DB
        await db
            .update(vendorsTable)
            .set({
                passwordHash,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            })
            .where(eq(vendorsTable.id, vendor.id));

        return NextResponse.json(
            { success: true, message: "Password has been reset successfully" },
            { status: 200 }
        );
    } catch (err) {
        console.error("Reset password error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
