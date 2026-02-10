import { sql, desc } from "drizzle-orm";
import { getTimeCondition } from "../getTimeCondition";
import { vendorsTable } from "@/config/vendorsSchema";
import { db } from "@/config/db";

export async function getTopVendorPoints(period: "weekly" | "monthly") {
    const timeCondition = getTimeCondition(period);

    const vendors = await db
        .select({
            vendorId: vendorsTable.id,
            businessName: vendorsTable.businessName,
            fullName: vendorsTable.fullName,
            profilePhoto: vendorsTable.profilePhoto,
            points: vendorsTable.points,
            experience: vendorsTable.yearsOfExperience,
            successfulEventsCompleted: vendorsTable.successfulEventsCompleted,
        })
        .from(vendorsTable)
        .where(sql`${vendorsTable.updatedAt} >= ${timeCondition}`)
        .orderBy(desc(vendorsTable.points))
        .limit(10);

    return vendors.map((vendor, index) => ({
        ...vendor,
        rank: index + 1,
    }));
}
