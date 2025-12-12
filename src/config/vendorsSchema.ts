import {
    integer,
    varchar,
    text,
    boolean,
    timestamp,
    json,
    pgTable,
} from "drizzle-orm/pg-core";
import { adminsTable } from "./adminsSchema";


export const vendorsTable = pgTable("vendors", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    // Step 1 – Basic account
    businessName: varchar({ length: 255 }).notNull(),
    fullName: varchar({ length: 255 }).notNull(),
    occupation: varchar({ length: 255 }).notNull(),
    phone: varchar({ length: 20 }).notNull(),
    address: varchar({ length: 500 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    passwordHash: varchar({ length: 255 }).notNull(),

    // Email verification
    emailVerified: boolean("emailVerified").default(false),
    emailVerificationOtp: varchar("emailVerificationOtp", { length: 6 }),
    emailVerificationExpires: timestamp("emailVerificationExpires", {
        withTimezone: true,
        mode: "date",
    }),

    // Admin Verfies and Activation Token is generated
    activationToken: varchar("activationToken", { length: 255 }),
    activationTokenExpires: timestamp("activationTokenExpires", {
        withTimezone: true,
        mode: "date",
    }),

    // Forgot password (token used to initiate reset flow)
    forgotPasswordToken: varchar("forgotPasswordToken", { length: 255 }),
    forgotPasswordExpires: timestamp("forgotPasswordExpires", {
        withTimezone: true,
        mode: "date",
    }),

    // Reset password (token used to confirm/reset)
    resetPasswordToken: varchar("resetPasswordToken", { length: 255 }),
    resetPasswordExpires: timestamp("resetPasswordExpires", {
        withTimezone: true,
        mode: "date",
    }),

    approvedByAdminId: integer().references(() => adminsTable.id),

    // Business details
    businessDescription: text("businessDescription"),
    businessPhotos: json("businessPhotos").$type<string[]>().default([]),
    profilePhoto: varchar("profilePhoto", { length: 500 }),

    // Registration flow
    currentStep: integer("currentStep").default(1),
    status: varchar("status", { length: 50 }).default(
        "PENDING_EMAIL_VERIFICATION"
    ),

    // Admin approval flags
    isApproved: boolean("isApproved").default(false),
    approvedAt: timestamp("approvedAt", { withTimezone: true, mode: "date" }),

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
