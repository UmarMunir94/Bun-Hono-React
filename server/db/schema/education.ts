import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const education = pgTable(
  "education",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    institution: text("institution").notNull(),
    degree: text("degree").notNull(),
    fieldOfStudy: text("field_of_study").notNull(),
    startYear: integer("start_year").notNull(),
    endYear: integer("end_year"), // null = ongoing
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdIndex: index("education_user_id_idx").on(table.userId),
  })
);

export const insertEducationSchema = createInsertSchema(education, {
  institution: z.string().min(2, { message: "Institution must be at least 2 characters" }),
  degree: z.string().min(2, { message: "Degree must be at least 2 characters" }),
  fieldOfStudy: z.string().min(2, { message: "Field of study must be at least 2 characters" }),
  startYear: z
    .number()
    .int()
    .min(1900, { message: "Start year must be 1900 or later" })
    .max(2100),
  endYear: z
    .number()
    .int()
    .min(1900)
    .max(2100)
    .nullable()
    .optional(),
  description: z.string().max(500).nullable().optional(),
});

export const selectEducationSchema = createSelectSchema(education);
