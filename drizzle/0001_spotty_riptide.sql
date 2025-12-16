CREATE TABLE "vendor_bookings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendor_bookings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"vendorId" integer NOT NULL,
	"vendorProductId" integer NOT NULL,
	"paymentId" integer NOT NULL,
	"bookingDate" date NOT NULL,
	"startTime" time NOT NULL,
	"endTime" time NOT NULL,
	"status" varchar(20) DEFAULT 'CONFIRMED',
	"notes" varchar(500),
	"source" varchar(20) DEFAULT 'WEB',
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "vendor_bookings_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "vendor_bookings" ADD CONSTRAINT "vendor_bookings_vendorId_vendors_id_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_bookings" ADD CONSTRAINT "vendor_bookings_vendorProductId_vendor_products_id_fk" FOREIGN KEY ("vendorProductId") REFERENCES "public"."vendor_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_bookings" ADD CONSTRAINT "vendor_bookings_paymentId_vendor_payments_id_fk" FOREIGN KEY ("paymentId") REFERENCES "public"."vendor_payments"("id") ON DELETE no action ON UPDATE no action;