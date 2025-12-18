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
ALTER TABLE "vendor_calendar" ADD CONSTRAINT "vendor_calendar_vendorId_vendors_id_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;