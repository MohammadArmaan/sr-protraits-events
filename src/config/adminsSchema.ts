import { pgTable, integer, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

export const adminsTable = pgTable("admins", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    // Profile fields
    fullName: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    profilePhoto: varchar({ length: 500 }), // S3 image

    // Auth fields
    passwordHash: varchar({ length: 255 }).notNull(),

    // Role system
    role: varchar({ length: 20 }).default("admin"), // "superadmin" | "admin"
    
    // Admin account status
    isActive: boolean("isActive").default(true), // for disabling admin accounts

    // Reset password flow
    resetPasswordToken: varchar({ length: 255 }),
    resetPasswordExpires: timestamp({ withTimezone: true }),

    // Audit info
    lastLoginAt: timestamp({ withTimezone: true }),
    createdByAdminId: integer(), // which admin created this admin

    createdAt: timestamp({ withTimezone: true }).defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow(),
});
