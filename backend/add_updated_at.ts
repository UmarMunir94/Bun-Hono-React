import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Adding updated_at column to events...");
  await db.execute(sql`ALTER TABLE events ADD COLUMN updated_at timestamp;`);
  console.log("Column added successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error adding column:", err);
  process.exit(1);
});
