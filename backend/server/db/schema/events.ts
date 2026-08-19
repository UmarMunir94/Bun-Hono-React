import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    location: text("location").notNull(),
    dateAndTime: timestamp("date_and_time").notNull(),
    slots: integer("slots").notNull(),
    description: text("description"),
    isPrivate: boolean("is_private").notNull().default(false),
    autoApprove: boolean("auto_approve").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdIndex: index("events_user_id_idx").on(table.userId),
    isPrivateIndex: index("events_is_private_idx").on(table.isPrivate),
  })
);

export const eventAttendees = pgTable(
  "event_attendees",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    status: text("status").notNull(), // 'requested', 'approved'
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    eventIdIndex: index("event_attendees_event_id_idx").on(table.eventId),
    userIdIndex: index("event_attendees_user_id_idx").on(table.userId),
  })
);

export const insertEventSchema = createInsertSchema(events, {
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  location: z.string().min(2, { message: "Location must be at least 2 characters" }),
  slots: z.number().int().min(1, { message: "Must have at least 1 slot" }),
  description: z.string().max(1000).nullable().optional(),
  dateAndTime: z.union([z.date(), z.string().datetime()]), // allow ISO strings
});

export const selectEventSchema = createSelectSchema(events);

export const insertEventAttendeeSchema = createInsertSchema(eventAttendees);
export const selectEventAttendeeSchema = createSelectSchema(eventAttendees);
