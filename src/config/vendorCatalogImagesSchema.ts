import { pgTable, integer, varchar } from "drizzle-orm/pg-core";
import { vendorCatalogsTable } from "./vendorCatalogSchema";

export const vendorCatalogImagesTable = pgTable("vendor_catalog_images", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    catalogId: integer()
        .notNull()
        .references(() => vendorCatalogsTable.id, {
            onDelete: "cascade",
        }),

    imageUrl: varchar({ length: 500 }).notNull(),
    sortOrder: integer().default(0),
});
