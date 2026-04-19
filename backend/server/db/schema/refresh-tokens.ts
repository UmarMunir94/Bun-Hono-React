import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

// ─── Expiry Configuration ───────────────────────────────────────────────────
// Change these values to control token lifetimes.

/**
 * How long a refresh token is valid (in milliseconds).
 * Default: 7 days.
 * For quick testing, set to e.g. 60_000 (1 minute).
 */
export const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

// ─── Schema ─────────────────────────────────────────────────────────────────

export const refreshToken = pgTable("refresh_token", {
  id: text("id").primaryKey(),
  /** Opaque random token stored as an httpOnly cookie on the client. */
  token: text("token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull(),
  /**
   * Set when the token is rotated or explicitly revoked.
   * Allows soft-delete so you can audit revoked tokens.
   */
  revokedAt: timestamp("revoked_at"),
});
