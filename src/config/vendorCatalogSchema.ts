import { pgTable, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { vendorsTable } from "./vendorsSchema";

export const vendorCatalogsTable = pgTable("vendor_catalogs", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    vendorId: integer()
        .notNull()
        .references(() => vendorsTable.id, { onDelete: "cascade" }),

    title: varchar({ length: 255 }).notNull(), // e.g. Wedding Photography
    description: varchar({ length: 500 }),

    categoryId: integer(), // admin-managed
    subCategoryId: integer(), // admin-managed

    createdAt: timestamp({ withTimezone: true }).defaultNow(),
});
