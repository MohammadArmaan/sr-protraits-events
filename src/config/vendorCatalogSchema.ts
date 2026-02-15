import {
    pgTable,
    integer,
    varchar,
    timestamp,
    index,
} from "drizzle-orm/pg-core";

import { vendorsTable } from "./vendorsSchema";
import { categoriesTable } from "./categoriesSchema";
import { subCategoriesTable } from "./subCategoriesSchema";

export const vendorCatalogsTable = pgTable(
    "vendor_catalogs",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),

        vendorId: integer("vendorId")
            .notNull()
            .references(() => vendorsTable.id, { onDelete: "cascade" }),

        title: varchar({ length: 255 }).notNull(),
        description: varchar({ length: 500 }),

        categoryId: integer()
            .notNull()
            .references(() => categoriesTable.id),

        subCategoryId: integer()
            .notNull()
            .references(() => subCategoriesTable.id),

        createdAt: timestamp({ withTimezone: true }).defaultNow(),
    },
    (table) => {
        return {
            categoryIndex: index("idx_catalog_category").on(table.categoryId),
            subCategoryIndex: index("idx_catalog_subcategory").on(
                table.subCategoryId,
            ),
            vendorIndex: index("idx_catalog_vendor").on(table.vendorId),
        };
    },
);
