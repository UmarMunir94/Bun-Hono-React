import { z } from "zod";
import type { Hook } from "@hono/zod-openapi";

export const UnauthorizedSchema = z
  .object({
    error: z.string().openapi({ example: "Unauthorized" }),
  })
  .openapi("Unauthorized");

export const NotFoundSchema = z
  .object({
    error: z.string().openapi({ example: "Not Found" }),
  })
  .openapi("NotFound");

export const ValidationErrorSchema = z
  .object({
    success: z.boolean().openapi({ example: false }),
    error: z.any().openapi({
      description: "Zod validation error details",
    }),
  })
  .openapi("ValidationError");

export const UserSchema = z
  .object({
    user: z.object({
      id: z.string(),
      email: z.string(),
      emailVerified: z.boolean(),
      name: z.string(),
      createdAt: z.string().or(z.date()),
      updatedAt: z.string().or(z.date()),
      image: z.string().nullable().optional(),
    }),
  })
  .openapi("User");

export const defaultHook: Hook<any, any, any, any> = (result, c) => {
  if (!result.success) {
    return c.json(
      {
        success: result.success,
        error: result.error,
      },
      422
    );
  }
};

export const cookieSecurity = [
  {
    cookieAuth: [],
  },
];
