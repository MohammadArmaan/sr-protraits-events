// src/config/vendorBookingsSchema.ts
import {
    pgTable,
    integer,
    varchar,
    timestamp,
    date,
    time,
    numeric,
    uuid,
} from "drizzle-orm/pg-core";
import { vendorsTable } from "./vendorsSchema";
import { vendorProductsTable } from "./vendorProductsSchema";
import { vendorPaymentsTable } from "./vendorPaymentsSchema";

export const vendorBookingsTable = pgTable("vendor_bookings", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    uuid: uuid("uuid").defaultRandom().notNull().unique(),

    /* -------- Relations -------- */
    vendorId: integer()
        .notNull()
        .references(() => vendorsTable.id),

    bookedByVendorId: integer()           
    .notNull()
    .references(() => vendorsTable.id), // requester

    vendorProductId: integer()
        .notNull()
        .references(() => vendorProductsTable.id),

    paymentId: integer()
        .references(() => vendorPaymentsTable.id),

    /* -------- Booking Type -------- */
    bookingType: varchar("bookingType", { length: 20 }).notNull(),
    /*
      SINGLE_DAY
      MULTI_DAY
    */

    /* -------- Date Range -------- */
    startDate: date("startDate").notNull(),
    endDate: date("endDate").notNull(),

    /* -------- Time Slot (Only for SINGLE_DAY) -------- */
    startTime: time("startTime"),
    endTime: time("endTime"),

    /* -------- Pricing Snapshot -------- */
    basePrice: numeric("basePrice", { precision: 10, scale: 2 }).notNull(),
    totalDays: integer("totalDays").notNull(),
    totalAmount: numeric("totalAmount", { precision: 10, scale: 2 }).notNull(),

    /* -------- Coupon Snapshot -------- */
    couponCode: varchar("couponCode", { length: 50 }),
    discountAmount: numeric("discountAmount", {
        precision: 10,
        scale: 2,
    }).default("0"),

    finalAmount: numeric("finalAmount", {
        precision: 10,
        scale: 2,
    }).notNull(),

    /* -------- Booking Lifecycle -------- */
    status: varchar("status", { length: 30 }).default("REQUESTED"),
    /*
      REQUESTED        → booking request sent
      APPROVED         → vendor approved
      REJECTED         → vendor rejected
      PAYMENT_PENDING  → approved, waiting for payment
      CONFIRMED        → payment done
      COMPLETED        → event completed
      CANCELLED        → cancelled
      EXPIRED          → no response within 3 hours
    */

    /* -------- Vendor Approval Window -------- */
    approvalExpiresAt: timestamp("approvalExpiresAt", {
        withTimezone: true,
    }).notNull(),

    /* -------- Metadata -------- */
    notes: varchar("notes", { length: 500 }),
    source: varchar("source", { length: 20 }).default("WEB"),

    /* -------- Audit -------- */
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});
