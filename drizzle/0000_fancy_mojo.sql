CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"imageUrl" varchar(255),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"fullName" varchar(255) NOT NULL,
	"occupation" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"address" varchar(500) NOT NULL,
	"email" varchar(255) NOT NULL,
	"passwordHash" varchar(255) NOT NULL,
	"emailVerified" boolean DEFAULT false,
	"emailVerificationOtp" varchar(6),
	"emailVerificationExpires" timestamp with time zone,
	"forgotPasswordToken" varchar(255),
	"forgotPasswordExpires" timestamp with time zone,
	"resetPasswordToken" varchar(255),
	"resetPasswordExpires" timestamp with time zone,
	"businessDescription" text,
	"businessPhotos" json DEFAULT '[]'::json,
	"profilePhoto" varchar(500),
	"currentStep" integer DEFAULT 1,
	"status" varchar(50) DEFAULT 'PENDING_EMAIL_VERIFICATION',
	"isApproved" boolean DEFAULT false,
	"approvedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "vendors_email_unique" UNIQUE("email")
);
