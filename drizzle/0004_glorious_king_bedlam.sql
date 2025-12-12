CREATE TABLE "admins" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admins_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"fullName" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"profilePhoto" varchar(500),
	"passwordHash" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'admin',
	"isActive" boolean DEFAULT true,
	"resetPasswordToken" varchar(255),
	"resetPasswordExpires" timestamp with time zone,
	"lastLoginAt" timestamp with time zone,
	"createdByAdminId" integer,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "vendor_profile_edits" ADD COLUMN "approvedByAdminId" integer;--> statement-breakpoint
ALTER TABLE "vendor_profile_edits" ADD COLUMN "rejectedByAdminId" integer;--> statement-breakpoint
ALTER TABLE "vendor_profile_edits" ADD COLUMN "reviewedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "vendor_profile_edits" ADD CONSTRAINT "vendor_profile_edits_approvedByAdminId_admins_id_fk" FOREIGN KEY ("approvedByAdminId") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_profile_edits" ADD CONSTRAINT "vendor_profile_edits_rejectedByAdminId_admins_id_fk" FOREIGN KEY ("rejectedByAdminId") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;