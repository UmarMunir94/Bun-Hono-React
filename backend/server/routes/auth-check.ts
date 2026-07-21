import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";
import { db } from "../db";
import { user } from "../db/schema/auth";
import { eq } from "drizzle-orm";

const checkEmailRoute = createRoute({
  method: "post",
  path: "/check-email",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            email: z.string().email(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            exists: z.boolean(),
            verified: z.boolean().optional(),
          }),
        },
      },
      description: "Check if email exists",
    },
  },
});

export const authCheckRoute = new OpenAPIHono().openapi(checkEmailRoute, async (c) => {
  const { email } = c.req.valid("json");

  const [existingUser] = await db.select().from(user).where(eq(user.email, email)).limit(1);

  return c.json(
    {
      exists: !!existingUser,
      verified: existingUser?.emailVerified,
    },
    200
  );
});
