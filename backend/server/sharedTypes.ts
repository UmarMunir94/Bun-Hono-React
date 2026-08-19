import { insertEducationSchema, selectEducationSchema } from "./db/schema/education";
import { insertWorkExperienceSchema, selectWorkExperienceSchema } from "./db/schema/work-experience";
import { insertGeneralInfoSchema, selectGeneralInfoSchema } from "./db/schema/general-info";
import { z } from "zod";

// ── Education ──────────────────────────────────────────────────────────────────

export const createEducationSchema = insertEducationSchema
  .omit({ userId: true, createdAt: true, id: true })
  .extend({
    institution: insertEducationSchema.shape.institution.describe(
      "Name of the academic institution (min 2 characters)"
    ),
    degree: insertEducationSchema.shape.degree.describe(
      "Degree or qualification obtained (e.g. Bachelor of Science)"
    ),
    fieldOfStudy: insertEducationSchema.shape.fieldOfStudy.describe(
      "Field or major of study (min 2 characters)"
    ),
    startYear: insertEducationSchema.shape.startYear.describe(
      "Year the program started (1900–2100)"
    ),
    endYear: insertEducationSchema.shape.endYear.describe(
      "Year the program ended, or null if still ongoing"
    ),
    description: insertEducationSchema.shape.description.describe(
      "Optional notes about the degree (max 500 characters)"
    ),
  });

export type CreateEducation = z.infer<typeof createEducationSchema>;

export const updateEducationSchema = createEducationSchema.partial();

export type UpdateEducation = z.infer<typeof updateEducationSchema>;

export type Education = Omit<z.infer<typeof selectEducationSchema>, "createdAt"> & {
  createdAt: string | null;
};

// ── Work Experience ────────────────────────────────────────────────────────────

export const createWorkExperienceSchema = insertWorkExperienceSchema
  .omit({ userId: true, createdAt: true, id: true })
  .extend({
    company: insertWorkExperienceSchema.shape.company.describe(
      "Company or organisation name (min 2 characters)"
    ),
    location: insertWorkExperienceSchema.shape.location.describe(
      "City, country, or 'Remote' (min 2 characters)"
    ),
    position: insertWorkExperienceSchema.shape.position.describe(
      "Job title or role (min 2 characters)"
    ),
    startDate: insertWorkExperienceSchema.shape.startDate.describe(
      "Start date in YYYY-MM-DD format"
    ),
    endDate: insertWorkExperienceSchema.shape.endDate.describe(
      "End date in YYYY-MM-DD format, or null if currently employed here"
    ),
    description: insertWorkExperienceSchema.shape.description.describe(
      "Responsibilities / achievements (max 1 000 characters)"
    ),
  });

export type CreateWorkExperience = z.infer<typeof createWorkExperienceSchema>;

export const updateWorkExperienceSchema = createWorkExperienceSchema.partial();

export type UpdateWorkExperience = z.infer<typeof updateWorkExperienceSchema>;

export type WorkExperience = Omit<z.infer<typeof selectWorkExperienceSchema>, "createdAt"> & {
  createdAt: string | null;
};

// ── General Info ───────────────────────────────────────────────────────────────

export const createGeneralInfoSchema = insertGeneralInfoSchema
  .omit({ userId: true, createdAt: true, id: true })
  .extend({
    firstName: insertGeneralInfoSchema.shape.firstName.describe("User's first name"),
    lastName: insertGeneralInfoSchema.shape.lastName.describe("User's last name"),
    phone: insertGeneralInfoSchema.shape.phone.describe("Contact phone number"),
    city: insertGeneralInfoSchema.shape.city.describe("City of residence"),
    country: insertGeneralInfoSchema.shape.country.describe("Country of residence"),
    linkedinProfile: insertGeneralInfoSchema.shape.linkedinProfile.describe(
      "Full LinkedIn profile URL"
    ),
    avatarUrl: insertGeneralInfoSchema.shape.avatarUrl.describe(
      "URL of the user's profile avatar image"
    ),
    address: insertGeneralInfoSchema.shape.address.describe("Street address"),
    state: insertGeneralInfoSchema.shape.state.describe("State or province"),
    zipCode: insertGeneralInfoSchema.shape.zipCode.describe("Postal / ZIP code"),
    about: insertGeneralInfoSchema.shape.about.describe(
      "Short bio or professional summary"
    ),
  });

export type CreateGeneralInfo = z.infer<typeof createGeneralInfoSchema>;

export const updateGeneralInfoSchema = createGeneralInfoSchema.partial();

export type UpdateGeneralInfo = z.infer<typeof updateGeneralInfoSchema>;

export type GeneralInfo = Omit<z.infer<typeof selectGeneralInfoSchema>, "createdAt"> & {
  createdAt: string | null;
  /** email is fetched from the user table and merged in the GET response */
  email?: string | null;
};

// ── Events ─────────────────────────────────────────────────────────────────────

import { insertEventSchema, selectEventSchema, insertEventAttendeeSchema, selectEventAttendeeSchema } from "./db/schema/events";

export const createEventSchema = insertEventSchema
  .omit({ userId: true, createdAt: true, id: true })
  .extend({
    name: insertEventSchema.shape.name.describe("Name of the event (min 2 characters)"),
    location: insertEventSchema.shape.location.describe("Location of the event (min 2 characters)"),
    slots: z.number().int().min(2).max(100).describe("Number of available slots"),
    description: insertEventSchema.shape.description.describe("Event description"),
    dateAndTime: z.string().describe("Date and time of the event in ISO string format"),
    isPrivate: z.boolean().optional().default(false).describe("Whether the event is private"),
    autoApprove: z.boolean().optional().default(false).describe("Whether to automatically approve requests"),
  });

export type CreateEvent = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema.partial();

export type UpdateEvent = z.infer<typeof updateEventSchema>;

export type Event = Omit<z.infer<typeof selectEventSchema>, "createdAt" | "dateAndTime"> & {
  createdAt: string | null;
  dateAndTime: string;
};

export type EventAttendee = Omit<z.infer<typeof selectEventAttendeeSchema>, "createdAt"> & {
  createdAt: string | null;
};
