import { education, insertEducationSchema, selectEducationSchema } from "./db/schema/education";
import { workExperience, insertWorkExperienceSchema, selectWorkExperienceSchema } from "./db/schema/work-experience";
import { z } from "zod";

export const createEducationSchema = insertEducationSchema.omit({
  userId: true,
  createdAt: true,
  id: true,
});

export type CreateEducation = z.infer<typeof createEducationSchema>;

export const updateEducationSchema = createEducationSchema.partial();

export type UpdateEducation = z.infer<typeof updateEducationSchema>;

export type Education = Omit<z.infer<typeof selectEducationSchema>, "createdAt"> & {
  createdAt: string | null;
};

export const createWorkExperienceSchema = insertWorkExperienceSchema.omit({
  userId: true,
  createdAt: true,
  id: true,
});

export type CreateWorkExperience = z.infer<typeof createWorkExperienceSchema>;

export const updateWorkExperienceSchema = createWorkExperienceSchema.partial();

export type UpdateWorkExperience = z.infer<typeof updateWorkExperienceSchema>;

export type WorkExperience = Omit<z.infer<typeof selectWorkExperienceSchema>, "createdAt"> & {
  createdAt: string | null;
};

import { generalInfo, insertGeneralInfoSchema, selectGeneralInfoSchema } from "./db/schema/general-info";

export const createGeneralInfoSchema = insertGeneralInfoSchema.omit({
  userId: true,
  createdAt: true,
  id: true,
});

export type CreateGeneralInfo = z.infer<typeof createGeneralInfoSchema>;

export const updateGeneralInfoSchema = createGeneralInfoSchema.partial();

export type UpdateGeneralInfo = z.infer<typeof updateGeneralInfoSchema>;

export type GeneralInfo = Omit<z.infer<typeof selectGeneralInfoSchema>, "createdAt"> & {
  createdAt: string | null;
};
