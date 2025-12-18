import { db } from "@/config/db";
import { vendorCalendarTable } from "@/config/vendorCalendarSchema";
import { getVendorFromRequest } from "@/lib/vendor/getVendorFromRequest";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { uuid: string } }
) {
    try {
        const { uuid } = await params;
        const vendor = await getVendorFromRequest(req);

        if (!vendor) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await db
            .delete(vendorCalendarTable)
            .where(
                and(
                    eq(vendorCalendarTable.uuid, uuid),
                    eq(vendorCalendarTable.vendorId, vendor.id)
                )
            );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Internal Server Error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}