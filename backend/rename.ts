import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

const queryClient = postgres("postgresql://postgres:l0g!cbOmb@localhost:5432/postgres");
const db = drizzle(queryClient);

async function main() {
    console.log("Adding end_time and cutoff_time...");
    await db.execute(sql`ALTER TABLE events ADD COLUMN end_time TIMESTAMP`);
    await db.execute(sql`ALTER TABLE events ADD COLUMN cutoff_time TIMESTAMP`);
    console.log("Done.");
    process.exit(0);
}
main();
