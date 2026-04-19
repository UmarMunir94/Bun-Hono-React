import { insertEducationSchema } from "./db/schema/education";
import { insertWorkExperienceSchema } from "./db/schema/work-experience";
import { z } from "zod";

export const createEducationSchema = insertEducationSchema.omit({
  userId: true,
  createdAt: true,
  id: true,
});

export type CreateEducation = z.infer<typeof createEducationSchema>;

export const createWorkExperienceSchema = insertWorkExperienceSchema.omit({
  userId: true,
  createdAt: true,
  id: true,
});

export type CreateWorkExperience = z.infer<typeof createWorkExperienceSchema>;
