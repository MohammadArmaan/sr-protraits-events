import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/config/db";
import { vendorBankDetailsTable } from "@/config/vendorBankDetailsSchema";
import { eq } from "drizzle-orm";
import { vendorsTable } from "@/config/vendorsSchema";
import { sendEmail } from "@/lib/sendEmail";
import { vendorBankDetailsApprovedEmailTemplate } from "@/lib/email-templates/vendorBankDetailsApprovedEmailTemplate";

export async function POST(req: NextRequest) {
    const token = req.cookies.get("admin_token")?.value;
    if (!token)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
    ) as { role: string };

    if (decoded.role !== "admin")
        return NextResponse.json(
            { error: "Permission denied" },
            { status: 403 }
        );

    const { vendorId } = await req.json();

const [bank] = await db
    .select()
    .from(vendorBankDetailsTable)
    .where(eq(vendorBankDetailsTable.vendorId, vendorId));

if (!bank || !bank.pendingChanges) {
    return NextResponse.json(
        { error: "No pending changes to approve" },
        { status: 400 }
    );
}

await db
    .update(vendorBankDetailsTable)
    .set({
        accountHolderName:
            bank.pendingChanges.accountHolderName ??
            bank.accountHolderName,

        accountNumber:
            bank.pendingChanges.accountNumber ??
            bank.accountNumber,

        ifscCode:
            bank.pendingChanges.ifscCode ??
            bank.ifscCode,

        pendingChanges: null,
        isEdited: false,
        isPayoutReady: true,
        adminApprovedAt: new Date(),
        updatedAt: new Date(),
    })
    .where(eq(vendorBankDetailsTable.vendorId, vendorId));

    const [vendor] = await db
    .select({
        email: vendorsTable.email,
        fullName: vendorsTable.fullName,
    })
    .from(vendorsTable)
    .where(eq(vendorsTable.id, vendorId));

    await sendEmail({
    to: vendor.email,
    subject: "Bank Details Approved – You’re Payout Ready 🎉",
    html: vendorBankDetailsApprovedEmailTemplate(vendor.fullName),
});

    return NextResponse.json({
        success: true,
        message: "Bank details approved. Vendor is payout-ready.",
    });
}
