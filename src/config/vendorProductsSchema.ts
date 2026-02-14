// src/config/vendorProductsSchema.ts
import {
    pgTable,
    integer,
    varchar,
    text,
    boolean,
    timestamp,
    numeric,
    uuid,
} from "drizzle-orm/pg-core";
import { vendorsTable } from "./vendorsSchema";
import { adminsTable } from "./adminsSchema";

export const vendorProductsTable = pgTable("vendor_products", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    uuid: uuid("uuid").defaultRandom().notNull().unique(),

    /* -------- Relations -------- */
    vendorId: integer()
        .notNull()
        .references(() => vendorsTable.id),

    createdByAdminId: integer()
        .notNull()
        .references(() => adminsTable.id),

    /* -------- Product Identity -------- */
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),

    /* -------- Media -------- */
    images: varchar("images", { length: 500 }).array().default([]),
    featuredImageIndex: integer("featuredImageIndex").default(0),
    featuredImageUrl: varchar("featured_image_url", { length: 500 }),

    /* -------- Snapshot Business Info -------- */
    businessName: varchar("businessName", { length: 255 }).notNull(),
    occupation: varchar("occupation", { length: 255 }).notNull(),

    /* -------- Pricing -------- */
    basePriceSingleDay: numeric("basePriceSingleDay", {
        precision: 10,
        scale: 2,
    }).notNull(),

    basePriceMultiDay: numeric("basePriceMultiDay", {
        precision: 10,
        scale: 2,
    }).notNull(),

    pricingUnit: varchar("pricingUnit", { length: 20 }).default("PER_DAY"),

    /* -------- Advance Payment -------- */
    advanceType: varchar("advanceType", { length: 20 }).default("PERCENTAGE"),
    advanceValue: numeric("advanceValue", { precision: 10, scale: 2 }),

    /* -------- Rating -------- */
    rating: numeric("rating", { precision: 2, scale: 1 }).default("0.0"),
    ratingCount: integer("ratingCount").default(0),

    /* -------- Flags -------- */
    isFeatured: boolean("isFeatured").default(false),
    isActive: boolean("isActive").default(true),
    isPriority: boolean("isPriority").default(false),
    isSessionBased: boolean("isSessionBased").default(false),

    maxSessionHours: integer("maxSessionHours").default(8),

    /* -------- Audit -------- */
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});

