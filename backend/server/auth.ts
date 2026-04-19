import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema/auth";
import { createRefreshToken } from "./routes/refresh";

// ─── Expiry Configuration ────────────────────────────────────────────────────
// These are the two values you'll want to tweak when testing session expiry.

/**
 * How long the access session (session cookie) is valid, in SECONDS.
 * Default: 15 minutes (15 * 60 = 900).
 * For quick testing, set to e.g. 30 (30 seconds).
 */
const ACCESS_SESSION_EXPIRY_S = 15 * 60;

/**
 * Cookie cache: how long a signed cookie can stand in for a DB query, in SECONDS.
 * Should always be ≤ ACCESS_SESSION_EXPIRY_S.
 * Default: 5 minutes.
 */
const COOKIE_CACHE_MAX_AGE_S = 5 * 60;

// ─── Auth Instance ───────────────────────────────────────────────────────────

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  // ── Session lifetime ──────────────────────────────────────────────────────
  session: {
    expiresIn: ACCESS_SESSION_EXPIRY_S,
    // How often Better Auth may extend the session expiry (must be ≤ expiresIn).
    updateAge: ACCESS_SESSION_EXPIRY_S,
    // Signed cookie cache so we don't query the DB on every request.
    cookieCache: {
      enabled: true,
      maxAge: COOKIE_CACHE_MAX_AGE_S,
    },
  },

  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // ── Issue a refresh token right after a successful sign-in ────────────────
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          // Runs every time Better Auth creates a new session (sign-in, OAuth callback, etc.)
          await createRefreshToken(session.userId, session.id);
        },
      },
    },
  },
});
