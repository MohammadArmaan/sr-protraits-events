import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/config/db";
import { vendorBankDetailsTable } from "@/config/vendorBankDetailsSchema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
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

    const pending = await db
        .select()
        .from(vendorBankDetailsTable)
        .where(eq(vendorBankDetailsTable.isEdited, true));

    return NextResponse.json({ pending });
}