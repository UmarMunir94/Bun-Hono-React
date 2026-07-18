-- Add missing columns to general_info to match the account-general page fields
ALTER TABLE "general_info" ADD COLUMN IF NOT EXISTS "avatar_url" varchar(2048);
--> statement-breakpoint
ALTER TABLE "general_info" ADD COLUMN IF NOT EXISTS "address" varchar(500);
--> statement-breakpoint
ALTER TABLE "general_info" ADD COLUMN IF NOT EXISTS "state" varchar(255);
--> statement-breakpoint
ALTER TABLE "general_info" ADD COLUMN IF NOT EXISTS "zip_code" varchar(20);
--> statement-breakpoint
ALTER TABLE "general_info" ADD COLUMN IF NOT EXISTS "about" text;
--> statement-breakpoint
-- Widen phone column from 255 to remain 255 (no change needed, keep consistent)
-- linkedin_profile is already present
