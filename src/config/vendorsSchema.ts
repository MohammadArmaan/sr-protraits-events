import {
    integer,
    varchar,
    boolean,
    timestamp,
    pgTable,
    text,
} from "drizzle-orm/pg-core";
import { adminsTable } from "./adminsSchema";

export const vendorsTable = pgTable("vendors", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    // Identity
    fullName: varchar({ length: 255 }).notNull(),
    businessName: varchar({ length: 255 }), // ✅ optional
    occupation: varchar({ length: 255 }).notNull(),

    phone: varchar({ length: 20 }).notNull(),
    address: varchar({ length: 500 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    passwordHash: varchar({ length: 255 }).notNull(),

    businessDescription: text("businessDescription"),

    currentStep: integer("currentStep").default(1),

    // Profile
    profilePhoto: varchar({ length: 500 }),

    // Professional metrics
    demandPrice: integer("demandPrice").notNull(), // admin-only
    yearsOfExperience: integer("yearsOfExperience").notNull().default(0),
    successfulEventsCompleted: integer("successfulEventsCompleted")
        .notNull()
        .default(0),

    // Compliance
    gstNumber: varchar("gstNumber", { length: 20 }),

    hasAcceptedTerms: boolean("hasAcceptedTerms").notNull().default(false), // ✅ safe default

    termsAcceptedAt: timestamp("termsAcceptedAt", {
        withTimezone: true,
        mode: "date",
    }), // ✅ nullable until accepted

    // Ranking
    points: integer("points").notNull().default(0),

    // Verification & security
    emailVerified: boolean("emailVerified").default(false),
    emailVerificationOtp: varchar("emailVerificationOtp", { length: 6 }),
    emailVerificationExpires: timestamp("emailVerificationExpires", {
        withTimezone: true,
        mode: "date",
    }),

    activationToken: varchar("activationToken", { length: 255 }),
    activationTokenExpires: timestamp("activationTokenExpires", {
        withTimezone: true,
        mode: "date",
    }),

    forgotPasswordToken: varchar("forgotPasswordToken", { length: 255 }),
    forgotPasswordExpires: timestamp("forgotPasswordExpires", {
        withTimezone: true,
        mode: "date",
    }),

    resetPasswordToken: varchar("resetPasswordToken", { length: 255 }),
    resetPasswordExpires: timestamp("resetPasswordExpires", {
        withTimezone: true,
        mode: "date",
    }),

    // Admin control
    isApproved: boolean("isApproved").default(false),
    approvedByAdminId: integer().references(() => adminsTable.id),
    approvedAt: timestamp("approvedAt", {
        withTimezone: true,
        mode: "date",
    }),

    status: varchar({ length: 50 }).default("PENDING"),

    // Audit
    createdAt: timestamp("createdAt", {
        withTimezone: true,
        mode: "date",
    }).defaultNow(),

    updatedAt: timestamp("updatedAt", {
        withTimezone: true,
        mode: "date",
    }).defaultNow(),
});
