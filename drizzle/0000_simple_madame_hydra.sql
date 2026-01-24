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
CREATE TABLE "coupon_codes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "coupon_codes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"type" varchar(20) NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"minAmount" numeric(10, 2),
	"maxDiscount" numeric(10, 2),
	"isActive" boolean DEFAULT true,
	"expiresAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "coupon_codes_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "coupon_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"businessName" varchar(255) NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"occupation" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"address" varchar(500) NOT NULL,
	"email" varchar(255) NOT NULL,
	"passwordHash" varchar(255) NOT NULL,
	"emailVerified" boolean DEFAULT false,
	"emailVerificationOtp" varchar(6),
	"emailVerificationExpires" timestamp with time zone,
	"activationToken" varchar(255),
	"activationTokenExpires" timestamp with time zone,
	"forgotPasswordToken" varchar(255),
	"forgotPasswordExpires" timestamp with time zone,
	"resetPasswordToken" varchar(255),
	"resetPasswordExpires" timestamp with time zone,
	"approvedByAdminId" integer,
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
--> statement-breakpoint
CREATE TABLE "vendor_profile_edits" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendor_profile_edits_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"vendorId" integer NOT NULL,
	"changes" json,
	"newProfilePhotoUrl" varchar(500),
	"oldProfilePhotoUrl" varchar(500),
	"newBusinessPhotos" json DEFAULT '[]'::json,
	"oldBusinessPhotos" json DEFAULT '[]'::json,
	"removedBusinessPhotos" json DEFAULT '[]'::json,
	"status" varchar(50) DEFAULT 'PENDING',
	"approvedByAdminId" integer,
	"rejectedByAdminId" integer,
	"reviewedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendor_products" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendor_products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"vendorId" integer NOT NULL,
	"createdByAdminId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"images" varchar(500)[] DEFAULT '{}',
	"featuredImageIndex" integer DEFAULT 0,
	"businessName" varchar(255) NOT NULL,
	"occupation" varchar(255) NOT NULL,
	"basePriceSingleDay" numeric(10, 2) NOT NULL,
	"basePriceMultiDay" numeric(10, 2) NOT NULL,
	"pricingUnit" varchar(20) DEFAULT 'PER_DAY',
	"advanceType" varchar(20) DEFAULT 'PERCENTAGE',
	"advanceValue" numeric(10, 2),
	"rating" numeric(2, 1) DEFAULT '0.0',
	"ratingCount" integer DEFAULT 0,
	"isFeatured" boolean DEFAULT false,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "vendor_products_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "vendor_banners" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendor_banners_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"imageUrl" varchar(500) NOT NULL,
	"title" varchar(255),
	"subtitle" text,
	"ctaText" varchar(100),
	"ctaLink" varchar(255),
	"order" integer DEFAULT 0,
	"createdByAdminId" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendor_payments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendor_payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"vendorId" integer NOT NULL,
	"vendorProductId" integer NOT NULL,
	"razorpayOrderId" varchar(100) NOT NULL,
	"razorpayPaymentId" varchar(100),
	"razorpaySignature" varchar(255),
	"amount" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'INR',
	"status" varchar(20) DEFAULT 'CREATED',
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "vendor_payments_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "vendor_bank_details" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendor_bank_details_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"vendorId" integer NOT NULL,
	"accountHolderName" varchar(255) NOT NULL,
	"accountNumber" varchar(50) NOT NULL,
	"ifscCode" varchar(11) NOT NULL,
	"isPayoutReady" boolean DEFAULT false,
	"isEdited" boolean DEFAULT false,
	"confirmedAt" timestamp with time zone,
	"pendingChanges" jsonb,
	"adminApprovedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "vendor_bank_details_vendorId_unique" UNIQUE("vendorId")
);
--> statement-breakpoint
CREATE TABLE "vendor_bookings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendor_bookings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"vendorId" integer NOT NULL,
	"bookedByVendorId" integer NOT NULL,
	"vendorProductId" integer NOT NULL,
	"paymentId" integer,
	"bookingType" varchar(20) NOT NULL,
	"startDate" date NOT NULL,
	"endDate" date NOT NULL,
	"startTime" time,
	"endTime" time,
	"basePrice" numeric(10, 2) NOT NULL,
	"totalDays" integer NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	"couponCode" varchar(50),
	"discountAmount" numeric(10, 2) DEFAULT '0',
	"finalAmount" numeric(10, 2) NOT NULL,
	"advanceAmount" numeric(10, 2) NOT NULL,
	"remainingAmount" numeric(10, 2) NOT NULL,
	"status" varchar(30) DEFAULT 'REQUESTED',
	"approvalExpiresAt" timestamp with time zone NOT NULL,
	"notes" varchar(500),
	"source" varchar(20) DEFAULT 'WEB',
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "vendor_bookings_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "vendor_calendar" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendor_calendar_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"vendorId" integer NOT NULL,
	"startDate" date NOT NULL,
	"endDate" date NOT NULL,
	"reason" varchar(255),
	"createdAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "vendor_calendar_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "vendor_reviews" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendor_reviews_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"bookingId" integer NOT NULL,
	"vendorId" integer NOT NULL,
	"vendorProductId" integer NOT NULL,
	"reviewerVendorId" integer NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
	"comment" text,
	"createdAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "vendor_reviews_bookingId_unique" UNIQUE("bookingId")
);
--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_approvedByAdminId_admins_id_fk" FOREIGN KEY ("approvedByAdminId") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_profile_edits" ADD CONSTRAINT "vendor_profile_edits_vendorId_vendors_id_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_profile_edits" ADD CONSTRAINT "vendor_profile_edits_approvedByAdminId_admins_id_fk" FOREIGN KEY ("approvedByAdminId") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_profile_edits" ADD CONSTRAINT "vendor_profile_edits_rejectedByAdminId_admins_id_fk" FOREIGN KEY ("rejectedByAdminId") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_products" ADD CONSTRAINT "vendor_products_vendorId_vendors_id_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_products" ADD CONSTRAINT "vendor_products_createdByAdminId_admins_id_fk" FOREIGN KEY ("createdByAdminId") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_banners" ADD CONSTRAINT "vendor_banners_createdByAdminId_admins_id_fk" FOREIGN KEY ("createdByAdminId") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_payments" ADD CONSTRAINT "vendor_payments_vendorId_vendors_id_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_payments" ADD CONSTRAINT "vendor_payments_vendorProductId_vendor_products_id_fk" FOREIGN KEY ("vendorProductId") REFERENCES "public"."vendor_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_bank_details" ADD CONSTRAINT "vendor_bank_details_vendorId_vendors_id_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_bookings" ADD CONSTRAINT "vendor_bookings_vendorId_vendors_id_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_bookings" ADD CONSTRAINT "vendor_bookings_bookedByVendorId_vendors_id_fk" FOREIGN KEY ("bookedByVendorId") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_bookings" ADD CONSTRAINT "vendor_bookings_vendorProductId_vendor_products_id_fk" FOREIGN KEY ("vendorProductId") REFERENCES "public"."vendor_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_bookings" ADD CONSTRAINT "vendor_bookings_paymentId_vendor_payments_id_fk" FOREIGN KEY ("paymentId") REFERENCES "public"."vendor_payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_calendar" ADD CONSTRAINT "vendor_calendar_vendorId_vendors_id_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_reviews" ADD CONSTRAINT "vendor_reviews_bookingId_vendor_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."vendor_bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_reviews" ADD CONSTRAINT "vendor_reviews_vendorId_vendors_id_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_reviews" ADD CONSTRAINT "vendor_reviews_vendorProductId_vendor_products_id_fk" FOREIGN KEY ("vendorProductId") REFERENCES "public"."vendor_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_reviews" ADD CONSTRAINT "vendor_reviews_reviewerVendorId_vendors_id_fk" FOREIGN KEY ("reviewerVendorId") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;