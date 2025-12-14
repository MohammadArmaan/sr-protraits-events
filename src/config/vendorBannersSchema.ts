// src/config/vendorBannersSchema.ts
import {
    pgTable,
    integer,
    varchar,
    text,
    timestamp,
} from "drizzle-orm/pg-core";
import { adminsTable } from "./adminsSchema";

export const vendorBannersTable = pgTable("vendor_banners", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    imageUrl: varchar("imageUrl", { length: 500 }).notNull(),

    title: varchar("title", { length: 255 }),      // heading text
    subtitle: text("subtitle"),                    // optional smaller text
    ctaText: varchar("ctaText", { length: 100 }),  // optional button text
    ctaLink: varchar("ctaLink", { length: 255 }),  // optional URL

    order: integer("order").default(0), // for carousel ordering

    createdByAdminId: integer()
        .notNull()
        .references(() => adminsTable.id),

    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});
