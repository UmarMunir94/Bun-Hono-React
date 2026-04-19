CREATE TABLE "education" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"institution" text NOT NULL,
	"degree" text NOT NULL,
	"field_of_study" text NOT NULL,
	"start_year" integer NOT NULL,
	"end_year" integer,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "education_user_id_idx" ON "education" USING btree ("user_id");