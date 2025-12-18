// src/config/vendorCalendarSchema.ts
import {
    pgTable,
    integer,
    date,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";
import { vendorsTable } from "./vendorsSchema";

export const vendorCalendarTable = pgTable(
    "vendor_calendar",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),

        uuid: uuid("uuid").defaultRandom().notNull().unique(),

        vendorId: integer()
            .notNull()
            .references(() => vendorsTable.id),

        startDate: date("startDate").notNull(),
        endDate: date("endDate").notNull(),

        reason: varchar("reason", { length: 255 }),

        createdAt: timestamp("createdAt", {
            withTimezone: true,
        }).defaultNow(),
    }
);
