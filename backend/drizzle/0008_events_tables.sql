-- Create events table
CREATE TABLE IF NOT EXISTS "events" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "location" text NOT NULL,
  "date_and_time" timestamp NOT NULL,
  "slots" integer NOT NULL,
  "description" text,
  "is_private" boolean NOT NULL DEFAULT false,
  "auto_approve" boolean NOT NULL DEFAULT false,
  "created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_user_id_idx" ON "events" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_is_private_idx" ON "events" ("is_private");
--> statement-breakpoint
-- Create event_attendees table
CREATE TABLE IF NOT EXISTS "event_attendees" (
  "id" serial PRIMARY KEY NOT NULL,
  "event_id" integer NOT NULL REFERENCES "events"("id") ON DELETE cascade,
  "user_id" text NOT NULL,
  "status" text NOT NULL,
  "created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_attendees_event_id_idx" ON "event_attendees" ("event_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_attendees_user_id_idx" ON "event_attendees" ("user_id");
