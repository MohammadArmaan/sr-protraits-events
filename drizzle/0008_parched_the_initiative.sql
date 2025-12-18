ALTER TABLE "vendor_bookings" ADD COLUMN "advanceAmount" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_bookings" ADD COLUMN "remainingAmount" numeric(10, 2) NOT NULL;