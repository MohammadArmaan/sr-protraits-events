// src/config/vendorPaymentsSchema.ts
import {
    pgTable,
    integer,
    varchar,
    timestamp,
    numeric,
    uuid,
} from "drizzle-orm/pg-core";
import { vendorProductsTable } from "./vendorProductsSchema";
import { vendorsTable } from "./vendorsSchema";


export const vendorPaymentsTable = pgTable("vendor_payments", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    // Public-safe identifier (useful for frontend / logs)
    uuid: uuid("uuid").defaultRandom().notNull().unique(),

    // Relations
    vendorId: integer()
        .notNull()
        .references(() => vendorsTable.id),

    vendorProductId: integer()
        .notNull()
        .references(() => vendorProductsTable.id),

    // Razorpay identifiers
    razorpayOrderId: varchar("razorpayOrderId", { length: 100 }).notNull(),
    razorpayPaymentId: varchar("razorpayPaymentId", { length: 100 }),
    razorpaySignature: varchar("razorpaySignature", { length: 255 }),

    // Payment amount (always store in paise)
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 10 }).default("INR"),

    // Payment status lifecycle
    status: varchar("status", { length: 20 }).default("CREATED"),
    /*
      CREATED  → order created
      PAID     → signature verified
      FAILED   → payment failed / signature mismatch
    */

    // Audit
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});
