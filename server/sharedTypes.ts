import { insertExpensesSchema } from "./db/schema/expenses";
import { insertEducationSchema } from "./db/schema/education";
import { z } from "zod";

export const createExpenseSchema = insertExpensesSchema.omit({
  userId: true,
  createdAt: true,
  id: true,
});

export type CreateExpense = z.infer<typeof createExpenseSchema>;

export const createEducationSchema = insertEducationSchema.omit({
  userId: true,
  createdAt: true,
  id: true,
});

export type CreateEducation = z.infer<typeof createEducationSchema>;
