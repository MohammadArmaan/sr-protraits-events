ALTER TABLE "vendor_products" ADD COLUMN "basePriceSingleDay" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_products" ADD COLUMN "basePriceMultiDay" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_products" DROP COLUMN "basePrice";