// src/config/categoriesSchema.ts
import {
    pgTable,
    integer,
    varchar,
    boolean,
    timestamp,
} from "drizzle-orm/pg-core";

export const categoriesTable = pgTable("categories", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    name: varchar({ length: 100 }).notNull(),
    slug: varchar({ length: 150 }).notNull().unique(),

    isActive: boolean().default(true),
    isDeleted: boolean("is_deleted").default(false),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

    createdAt: timestamp({ withTimezone: true }).defaultNow(),
});
