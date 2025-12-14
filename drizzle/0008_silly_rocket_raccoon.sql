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
ALTER TABLE "vendor_banners" ADD CONSTRAINT "vendor_banners_createdByAdminId_admins_id_fk" FOREIGN KEY ("createdByAdminId") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;