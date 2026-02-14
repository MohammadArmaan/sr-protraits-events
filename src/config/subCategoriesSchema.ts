// src/config/subCategoriesSchema.ts
import {
    pgTable,
    integer,
    varchar,
    boolean,
    timestamp,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { categoriesTable } from "./categoriesSchema";

export const subCategoriesTable = pgTable(
    "sub_categories",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),

        categoryId: integer()
            .notNull()
            .references(() => categoriesTable.id, { onDelete: "cascade" }),

        name: varchar({ length: 100 }).notNull(),
        slug: varchar({ length: 150 }).notNull(),

        isActive: boolean().default(true),
        isDeleted: boolean("is_deleted").default(false),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),

        createdAt: timestamp({ withTimezone: true }).defaultNow(),
    },
    (table) => {
        return {
            uniqueSlugPerCategory: uniqueIndex(
                "unique_subcategory_slug_per_category",
            ).on(table.categoryId, table.slug),
        };
    },
);
