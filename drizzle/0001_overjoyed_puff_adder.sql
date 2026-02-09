CREATE TABLE "vendor_catalog_images" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendor_catalog_images_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"catalogId" integer NOT NULL,
	"imageUrl" varchar(500) NOT NULL,
	"sortOrder" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "vendor_catalogs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendor_catalogs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"vendorId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(500),
	"categoryId" integer,
	"subCategoryId" integer,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "vendor_profile_edits" DROP CONSTRAINT "vendor_profile_edits_vendorId_vendors_id_fk";
--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "businessName" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "profilePhoto" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "status" SET DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "demandPrice" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "yearsOfExperience" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "successfulEventsCompleted" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "gstNumber" varchar(20);--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "hasAcceptedTerms" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "termsAcceptedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_profile_edits" ADD COLUMN "profileChanges" json;--> statement-breakpoint
ALTER TABLE "vendor_profile_edits" ADD COLUMN "catalogChanges" json;--> statement-breakpoint
ALTER TABLE "vendor_profile_edits" ADD COLUMN "rejectionReason" varchar(500);--> statement-breakpoint
ALTER TABLE "vendor_catalog_images" ADD CONSTRAINT "vendor_catalog_images_catalogId_vendor_catalogs_id_fk" FOREIGN KEY ("catalogId") REFERENCES "public"."vendor_catalogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_catalogs" ADD CONSTRAINT "vendor_catalogs_vendorId_vendors_id_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_profile_edits" ADD CONSTRAINT "vendor_profile_edits_vendorId_vendors_id_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" DROP COLUMN "businessDescription";--> statement-breakpoint
ALTER TABLE "vendors" DROP COLUMN "businessPhotos";--> statement-breakpoint
ALTER TABLE "vendors" DROP COLUMN "currentStep";--> statement-breakpoint
ALTER TABLE "vendor_profile_edits" DROP COLUMN "changes";--> statement-breakpoint
ALTER TABLE "vendor_profile_edits" DROP COLUMN "newBusinessPhotos";--> statement-breakpoint
ALTER TABLE "vendor_profile_edits" DROP COLUMN "oldBusinessPhotos";--> statement-breakpoint
ALTER TABLE "vendor_profile_edits" DROP COLUMN "removedBusinessPhotos";