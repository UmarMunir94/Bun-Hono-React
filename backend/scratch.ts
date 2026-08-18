import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function run() {
  console.log("Running migration...");
  await sql`
    CREATE TABLE IF NOT EXISTS "general_info" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL,
      "first_name" varchar(255),
      "last_name" varchar(255),
      "phone" varchar(255),
      "city" varchar(255),
      "country" varchar(255),
      "linkedin_profile" varchar(255),
      "created_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "general_info_user_id_unique" UNIQUE("user_id"),
      CONSTRAINT "general_info_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action
    );
  `;
  console.log("Migration complete.");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
