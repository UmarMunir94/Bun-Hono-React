import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./server/db";
import * as schema from "./server/db/schema/auth";

const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: { enabled: true }
});

async function run() {
  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: "test" + Date.now() + "@test.com",
        password: "password123",
        name: "Test User"
      }
    });
    console.log("Success:", res);
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}
run();
