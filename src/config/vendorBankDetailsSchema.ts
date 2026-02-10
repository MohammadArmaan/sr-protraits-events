import {
    pgTable,
    integer,
    varchar,
    boolean,
    timestamp,
    jsonb,
} from "drizzle-orm/pg-core";
import { vendorsTable } from "./vendorsSchema";
import { VendorBankPendingChanges } from "@/types/vendor-bank-details";

export const vendorBankDetailsTable = pgTable("vendor_bank_details", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    /* -------- Relation -------- */
    vendorId: integer()
        .notNull()
        .references(() => vendorsTable.id)
        .unique(),

    /* -------- Bank Info -------- */
    accountHolderName: varchar("accountHolderName", {
        length: 255,
    }).notNull(),

    accountNumber: varchar("accountNumber", {
        length: 50,
    }).notNull(),

    ifscCode: varchar("ifscCode", {
        length: 11,
    }).notNull(),

    /* -------- Payout State -------- */
    isPayoutReady: boolean("isPayoutReady").default(false),

    // True ONLY if vendor edited details after initial submission
    isEdited: boolean("isEdited").default(false),

    // When vendor explicitly confirmed details
    confirmedAt: timestamp("confirmedAt", {
        withTimezone: true,
    }),

    //  Pending Changes (EDIT FLOW)
    pendingChanges: jsonb(
        "pendingChanges",
    ).$type<VendorBankPendingChanges | null>(),
    // example:
    // {
    //   accountNumber: "XYZ",
    //   ifscCode: "HDFC0005678"
    // }

    // When admin approved edited details (nullable)
    adminApprovedAt: timestamp("adminApprovedAt", {
        withTimezone: true,
    }),

    /* -------- Verification metadata -------- */
    isVerified: boolean("isVerified").default(false),

    verificationRefId: varchar("verificationRefId", { length: 255 }),
    verifiedAt: timestamp("verifiedAt", { withTimezone: true }),

    /* -------- Audit -------- */
    createdAt: timestamp("createdAt", {
        withTimezone: true,
    }).defaultNow(),

    updatedAt: timestamp("updatedAt", {
        withTimezone: true,
    }).defaultNow(),
});
