CREATE TABLE "vendor_profile_edits" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendor_profile_edits_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"vendorId" integer NOT NULL,
	"changes" json,
	"newProfilePhotoUrl" varchar(500),
	"oldProfilePhotoUrl" varchar(500),
	"status" varchar(50) DEFAULT 'PENDING',
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "vendor_profile_edits" ADD CONSTRAINT "vendor_profile_edits_vendorId_vendors_id_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;