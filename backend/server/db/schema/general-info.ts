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
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 255 }),
  city: varchar("city", { length: 255 }),
  country: varchar("country", { length: 255 }),
  linkedinProfile: varchar("linkedin_profile", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGeneralInfoSchema = createInsertSchema(generalInfo);
export const selectGeneralInfoSchema = createSelectSchema(generalInfo);
