import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function run() {
  console.log("Running migration...");
  await sql`
    ALTER TABLE "general_info" ADD COLUMN IF NOT EXISTS "email" varchar(255);
  `;
  console.log("Migration complete.");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
