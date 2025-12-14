CREATE TABLE "vendor_products" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendor_products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"vendorId" integer NOT NULL,
	"createdByAdminId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"images" varchar(500)[] DEFAULT '{}',
	"businessName" varchar(255) NOT NULL,
	"occupation" varchar(255) NOT NULL,
	"basePrice" numeric(10, 2) NOT NULL,
	"advanceType" varchar(20) DEFAULT 'PERCENTAGE',
	"advanceValue" numeric(10, 2),
	"rating" numeric(2, 1) DEFAULT '0.0',
	"ratingCount" integer DEFAULT 0,
	"isFeatured" boolean DEFAULT false,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "vendor_products" ADD CONSTRAINT "vendor_products_vendorId_vendors_id_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_products" ADD CONSTRAINT "vendor_products_createdByAdminId_admins_id_fk" FOREIGN KEY ("createdByAdminId") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;