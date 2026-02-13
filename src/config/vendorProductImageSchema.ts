// src/config/vendorProductImageSchema.ts
import { pgTable, integer, varchar, boolean } from "drizzle-orm/pg-core";

import { vendorProductsTable } from "./vendorProductsSchema";

export const vendorProductImagesTable = pgTable("vendor_product_images", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    productId: integer()
        .notNull()
        .references(() => vendorProductsTable.id, { onDelete: "cascade" }),

    catalogId: integer().notNull(),
    imageUrl: varchar({ length: 500 }).notNull(),

    isFeatured: boolean().default(false),
    sortOrder: integer().default(0),
});
