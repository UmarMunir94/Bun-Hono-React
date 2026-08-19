import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const rows = await sql`SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at`;
console.log(JSON.stringify(rows, null, 2));
await sql.end();
