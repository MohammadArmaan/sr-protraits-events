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

    // Public-safe identifier
    uuid: uuid("uuid").defaultRandom().notNull().unique(),

    //  Relations
    vendorId: integer()
        .notNull()
        .references(() => vendorsTable.id),

    createdByAdminId: integer()
        .notNull()
        .references(() => adminsTable.id),

    //  Product identity
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),

    //  Product images (copied/selected from vendor)
    images: varchar("images", { length: 500 }).array().default([]),

    // Featured image index
    featuredImageIndex: integer("featuredImageIndex").default(0),

    //  Buisness Detaisl
    businessName: varchar("businessName", { length: 255 }).notNull(),
    occupation: varchar("occupation", { length: 255 }).notNull(),

    //  Pricing
    basePrice: numeric("basePrice", { precision: 10, scale: 2 }).notNull(),

    //  Advance payment configuration
    advanceType: varchar("advanceType", { length: 20 }).default("PERCENTAGE"),
    advanceValue: numeric("advanceValue", { precision: 10, scale: 2 }),

    //  Rating (system controlled)
    rating: numeric("rating", { precision: 2, scale: 1 }).default("0.0"),
    ratingCount: integer("ratingCount").default(0),

    //  Flags
    isFeatured: boolean("isFeatured").default(false),
    isActive: boolean("isActive").default(true),

    //  Audit
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});
