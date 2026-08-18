import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const generalInfo = pgTable("general_info", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  city: varchar("city", { length: 255 }),
  country: varchar("country", { length: 255 }),
  linkedinProfile: varchar("linkedin_profile", { length: 500 }),
  // ── New fields (added to match the account-general page) ──────────────────
  /** URL of the user's profile avatar (e.g. an external URL or future CDN path) */
  avatarUrl: varchar("avatar_url", { length: 2048 }),
  address: varchar("address", { length: 500 }),
  state: varchar("state", { length: 255 }),
  zipCode: varchar("zip_code", { length: 20 }),
  about: text("about"),
  // ─────────────────────────────────────────────────────────────────────────
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGeneralInfoSchema = createInsertSchema(generalInfo);
export const selectGeneralInfoSchema = createSelectSchema(generalInfo);
