CREATE TABLE "vendor_bank_details" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendor_bank_details_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"vendorId" integer NOT NULL,
	"accountHolderName" varchar(255) NOT NULL,
	"accountNumber" varchar(50) NOT NULL,
	"ifscCode" varchar(11) NOT NULL,
	"isPayoutReady" boolean DEFAULT false,
	"isEdited" boolean DEFAULT false,
	"confirmedAt" timestamp with time zone,
	"adminApprovedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "vendor_bank_details_vendorId_unique" UNIQUE("vendorId")
);
--> statement-breakpoint
ALTER TABLE "vendor_bank_details" ADD CONSTRAINT "vendor_bank_details_vendorId_vendors_id_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;