import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { getUser } from "../auth-middleware";
import { auth } from "../auth";
import { db } from "../db";
import {
  education as educationTable,
  insertEducationSchema,
} from "../db/schema/education";
import { eq, desc, and } from "drizzle-orm";
import { createEducationSchema, updateEducationSchema } from "../sharedTypes";

export const educationRoute = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
  };
}>()
  .get("/", getUser, async (c) => {
    const user = c.var.user;

    const entries = await db
      .select()
      .from(educationTable)
      .where(eq(educationTable.userId, user.id))
      .orderBy(desc(educationTable.startYear));

    return c.json({ education: entries });
  })
  .post("/", getUser, zValidator("json", createEducationSchema), async (c) => {
    const body = await c.req.valid("json");
    const user = c.var.user;

    const validated = insertEducationSchema.parse({
      ...body,
      userId: user.id,
    });

    const result = await db
      .insert(educationTable)
      .values(validated)
      .returning()
      .then((res) => res[0]);

    c.status(201);
    return c.json(result);
  })
  .delete("/:id{[0-9]+}", getUser, async (c) => {
    const id = Number.parseInt(c.req.param("id"));
    const user = c.var.user;

    const deleted = await db
      .delete(educationTable)
      .where(
        and(eq(educationTable.userId, user.id), eq(educationTable.id, id))
      )
      .returning()
      .then((res) => res[0]);

    if (!deleted) {
      return c.notFound();
    }

    return c.json({ education: deleted });
  })
  .put("/:id{[0-9]+}", getUser, zValidator("json", updateEducationSchema), async (c) => {
    const id = Number.parseInt(c.req.param("id"));
    const user = c.var.user;
    const body = c.req.valid("json");

    const updated = await db
      .update(educationTable)
      .set(body)
      .where(
        and(eq(educationTable.userId, user.id), eq(educationTable.id, id))
      )
      .returning()
      .then((res) => res[0]);

    if (!updated) {
      return c.notFound();
    }

    return c.json({ education: updated });
  });
