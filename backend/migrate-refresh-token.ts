import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

await sql`
  CREATE TABLE IF NOT EXISTS refresh_token (
    id          text      PRIMARY KEY NOT NULL,
    token       text      NOT NULL UNIQUE,
    user_id     text      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    expires_at  timestamp NOT NULL,
    created_at  timestamp NOT NULL,
    revoked_at  timestamp
  )
`;

console.log("✓ refresh_token table created (or already exists)");
await sql.end();
