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
ALTER TABLE "vendor_bookings" ALTER COLUMN "paymentId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_bookings" ALTER COLUMN "startTime" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_bookings" ALTER COLUMN "endTime" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_bookings" ALTER COLUMN "status" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "vendor_bookings" ALTER COLUMN "status" SET DEFAULT 'REQUESTED';--> statement-breakpoint
ALTER TABLE "vendor_products" ADD COLUMN "pricingUnit" varchar(20) DEFAULT 'PER_DAY';--> statement-breakpoint
ALTER TABLE "vendor_bookings" ADD COLUMN "bookingType" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_bookings" ADD COLUMN "startDate" date NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_bookings" ADD COLUMN "endDate" date NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_bookings" ADD COLUMN "basePrice" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_bookings" ADD COLUMN "totalDays" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_bookings" ADD COLUMN "totalAmount" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_bookings" ADD COLUMN "couponCode" varchar(50);--> statement-breakpoint
ALTER TABLE "vendor_bookings" ADD COLUMN "discountAmount" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "vendor_bookings" ADD COLUMN "finalAmount" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_bookings" ADD COLUMN "approvalExpiresAt" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_bookings" DROP COLUMN "bookingDate";