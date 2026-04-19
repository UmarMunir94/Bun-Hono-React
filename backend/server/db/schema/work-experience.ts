import {
  pgTable,
  serial,
  text,
  timestamp,
  index,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const workExperience = pgTable(
  "work_experience",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    company: text("company").notNull(),
    location: text("location").notNull(),
    position: text("position").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"), // null = current / present
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdIndex: index("work_experience_user_id_idx").on(table.userId),
  })
);

export const insertWorkExperienceSchema = createInsertSchema(workExperience, {
  company: z
    .string()
    .min(2, { message: "Company name must be at least 2 characters" }),
  location: z
    .string()
    .min(2, { message: "Location must be at least 2 characters" }),
  position: z
    .string()
    .min(2, { message: "Position must be at least 2 characters" }),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Start date must be YYYY-MM-DD" }),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "End date must be YYYY-MM-DD" })
    .nullable()
    .optional(),
  description: z.string().max(1000).nullable().optional(),
});

export const selectWorkExperienceSchema = createSelectSchema(workExperience);
