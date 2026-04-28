import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getUser } from "../auth-middleware";
import { auth } from "../auth";
import { db } from "../db";
import { generalInfo as generalInfoTable, insertGeneralInfoSchema } from "../db/schema/general-info";
import { user as userTable } from "../db/schema/auth";
import { eq } from "drizzle-orm";
import { createGeneralInfoSchema } from "../sharedTypes";

export const generalInfoRoute = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
  };
}>()
  .get("/", getUser, async (c) => {
    const sessionUser = c.var.user;

    const generalInfoResult = await db
      .select()
      .from(generalInfoTable)
      .where(eq(generalInfoTable.userId, sessionUser.id))
      .limit(1)
      .then((res) => res[0]);

    return c.json({
      generalInfo: generalInfoResult || null
    });
  })
  .put("/", getUser, zValidator("json", createGeneralInfoSchema), async (c) => {
    const body = await c.req.valid("json");
    const sessionUser = c.var.user;

    const validated = insertGeneralInfoSchema.parse({
      ...body,
      userId: sessionUser.id,
    });

    const result = await db
      .insert(generalInfoTable)
      .values(validated)
      .onConflictDoUpdate({
        target: generalInfoTable.userId,
        set: {
          firstName: validated.firstName,
          lastName: validated.lastName,
          email: validated.email,
          phone: validated.phone,
          city: validated.city,
          country: validated.country,
          linkedinProfile: validated.linkedinProfile,
        },
      })
      .returning()
      .then((res) => res[0]);

    return c.json({ generalInfo: result });
  });
