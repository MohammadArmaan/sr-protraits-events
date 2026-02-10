import { sql } from "drizzle-orm";

export const getTimeCondition = (period: "weekly" | "monthly") => {
    if (period === "weekly") {
        return sql`NOW() - INTERVAL '7 days'`;
    }

    return sql`date_trunc('month', NOW())`;
};
