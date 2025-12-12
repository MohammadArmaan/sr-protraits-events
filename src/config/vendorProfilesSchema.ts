import {
    pgTable,
    integer,
    varchar,
    json,
    timestamp,
} from "drizzle-orm/pg-core";
import { vendorsTable } from "./vendorsSchema";
import { adminsTable } from "./adminsSchema";

export const vendorProfileEdits = pgTable("vendor_profile_edits", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    vendorId: integer()
        .notNull()
        .references(() => vendorsTable.id),

    changes: json("changes").$type<{
        fullName?: string;
        occupation?: string;
        businessName?: string;
        phone?: string;
        address?: string;
        businessDescription?: string;
        businessPhotos?: string[]; 
    }>(),

    newProfilePhotoUrl: varchar("newProfilePhotoUrl", { length: 500 }),
    oldProfilePhotoUrl: varchar("oldProfilePhotoUrl", { length: 500 }),

    newBusinessPhotos: json("newBusinessPhotos").$type<string[]>().default([]),
    oldBusinessPhotos: json("oldBusinessPhotos").$type<string[]>().default([]),
    removedBusinessPhotos: json("removedBusinessPhotos").$type<string[]>().default([]),

    status: varchar("status", { length: 50 }).default("PENDING"),

    // Admin Verification
    approvedByAdminId: integer().references(() => adminsTable.id),
    rejectedByAdminId: integer().references(() => adminsTable.id),
    reviewedAt: timestamp("reviewedAt", { withTimezone: true }),

    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});
