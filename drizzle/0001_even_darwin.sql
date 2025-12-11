ALTER TABLE "vendors" ADD COLUMN "activationToken" varchar(255);--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "activationTokenExpires" timestamp with time zone;