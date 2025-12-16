// src/config/couponCodesSchema.ts
import {
    pgTable,
    integer,
    varchar,
    timestamp,
    numeric,
    boolean,
    uuid,
} from "drizzle-orm/pg-core";

export const couponCodesTable = pgTable("coupon_codes", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uuid: uuid("uuid").defaultRandom().notNull().unique(),

    code: varchar("code", { length: 50 }).notNull().unique(),

    type: varchar("type", { length: 20 }).notNull(),
    /*
      FLAT        -> SAVE50
      PERCENT     -> 50OFF
      UPTO        -> UPTOOFF50
    */

    value: numeric("value", { precision: 10, scale: 2 }).notNull(),

    minAmount: numeric("minAmount", { precision: 10, scale: 2 }),
    maxDiscount: numeric("maxDiscount", { precision: 10, scale: 2 }),

    isActive: boolean("isActive").default(true),
    expiresAt: timestamp("expiresAt", { withTimezone: true }),

    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});
