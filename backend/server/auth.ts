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
 * Current: 8 hours (8 * 60 * 60).
 * For quick testing, set to e.g. 30 (30 seconds).
 */
const ACCESS_SESSION_EXPIRY_S = 8 * 60 * 60;

/**
 * Cookie cache: how long a signed cookie can stand in for a DB query, in SECONDS.
 * Should always be ≤ ACCESS_SESSION_EXPIRY_S.
 * Default: 5 minutes.
 * Current: 1 hour.
 */
const COOKIE_CACHE_MAX_AGE_S = 1 * 60 * 60;

// ─── Auth Instance ───────────────────────────────────────────────────────────

import nodemailer from "nodemailer";

// 1. Create Nodemailer transporter pointing to Mailpit (localhost:1025)
const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025,
  secure: false, // true for 465, false for other ports
  // auth is not required for default Mailpit
});

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

  session: {
    expiresIn: ACCESS_SESSION_EXPIRY_S,
    updateAge: ACCESS_SESSION_EXPIRY_S,
    cookieCache: {
      enabled: true,
      maxAge: COOKIE_CACHE_MAX_AGE_S,
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Enforce email verification
    preventEmailEnumeration: false, // Disable so we can show "user exists" errors
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await transporter.sendMail({
          from: '"Axentia App" <no-reply@axentia.local>',
          to: user.email,
          subject: "Verify your email address",
          text: `Click the link to verify your email: ${url}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Welcome to Axentia, ${user.name}!</h2>
              <p>Please verify your email address by clicking the button below:</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
                Verify Email
              </a>
              <p>Or copy and paste this link: <br/> <a href="${url}">${url}</a></p>
            </div>
          `,
        });
        console.log(`Verification email sent to ${user.email} (Check Mailpit at http://localhost:8025)`);
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          let firstName = "";
          let lastName = "";
          
          if (user.name) {
            const nameParts = user.name.split(' ');
            firstName = nameParts[0];
            lastName = nameParts.slice(1).join(' ');
          }

          const { generalInfo } = await import("./db/schema/general-info");
          await db.insert(generalInfo).values({
            userId: user.id,
            firstName,
            lastName,
          });
        }
      }
    },
    session: {
      create: {
        after: async (session) => {
          await createRefreshToken(session.userId, session.id);
        },
      },
    },
  },
});
