// src/config/vendorReviewsSchema.ts
import {
    pgTable,
    integer,
    varchar,
    text,
    timestamp,
    numeric,
    unique,
} from "drizzle-orm/pg-core";
import { vendorBookingsTable } from "./vendorBookingsSchema";
import { vendorsTable } from "./vendorsSchema";
import { vendorProductsTable } from "./vendorProductsSchema";

export const vendorReviewsTable = pgTable(
    "vendor_reviews",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),

        /* -------- Relations -------- */
        bookingId: integer()
            .notNull()
            .references(() => vendorBookingsTable.id),

        vendorId: integer()
            .notNull()
            .references(() => vendorsTable.id),

        vendorProductId: integer()
            .notNull()
            .references(() => vendorProductsTable.id),

        reviewerVendorId: integer()
            .notNull()
            .references(() => vendorsTable.id), // requester

        /* -------- Review Content -------- */
        rating: numeric("rating", { precision: 2, scale: 1 }).notNull(), // 1.0 → 5.0
        comment: text("comment"),

        /* -------- Audit -------- */
        createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        uniqueBookingReview: unique().on(table.bookingId), // 🚫 no multiple reviews
    })
);
