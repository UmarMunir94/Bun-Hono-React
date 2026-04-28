import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function run() {
  const users = await sql`SELECT * FROM "user" LIMIT 5`;
  console.log("USERS:", users);
  
  const generalInfos = await sql`SELECT * FROM "general_info" LIMIT 5`;
  console.log("GENERAL INFOS:", generalInfos);
  
  process.exit(0);
}

run();
