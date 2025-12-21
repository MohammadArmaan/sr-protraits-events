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
ALTER TABLE "vendor_reviews" ADD CONSTRAINT "vendor_reviews_bookingId_vendor_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."vendor_bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_reviews" ADD CONSTRAINT "vendor_reviews_vendorId_vendors_id_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_reviews" ADD CONSTRAINT "vendor_reviews_vendorProductId_vendor_products_id_fk" FOREIGN KEY ("vendorProductId") REFERENCES "public"."vendor_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_reviews" ADD CONSTRAINT "vendor_reviews_reviewerVendorId_vendors_id_fk" FOREIGN KEY ("reviewerVendorId") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;