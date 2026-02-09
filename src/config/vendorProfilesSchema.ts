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
        .references(() => vendorsTable.id, { onDelete: "cascade" }),

    profileChanges: json("profileChanges").$type<{
        fullName?: string;
        occupation?: string;
        businessName?: string;
        phone?: string;
        address?: string;
        businessDescription?: string;
        gstNumber?: string;
        yearsOfExperience?: number;
        successfulEventsCompleted?: number;
        demandPrice?: number;
    }>(),

    catalogChanges: json("catalogChanges").$type<
        {
            catalogId?: number;
            action: "ADD" | "UPDATE" | "DELETE";
            payload: {
                title?: string;
                description?: string;
                categoryId?: number;
                subCategoryId?: number;
                addedImages?: string[];
                removedImageIds?: number[];
            };
        }[]
    >(),

    newProfilePhotoUrl: varchar("newProfilePhotoUrl", { length: 500 }),
    oldProfilePhotoUrl: varchar("oldProfilePhotoUrl", { length: 500 }),

    status: varchar("status", { length: 50 }).default("PENDING"),
    rejectionReason: varchar("rejectionReason", { length: 500 }),

    approvedByAdminId: integer().references(() => adminsTable.id),
    rejectedByAdminId: integer().references(() => adminsTable.id),
    reviewedAt: timestamp("reviewedAt", { withTimezone: true }),

    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});
