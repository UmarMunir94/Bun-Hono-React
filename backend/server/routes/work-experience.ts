import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { getUser } from "../auth-middleware";
import { auth } from "../auth";
import { db } from "../db";
import {
  workExperience as workExperienceTable,
  insertWorkExperienceSchema,
} from "../db/schema/work-experience";
import { eq, desc, and } from "drizzle-orm";
import { createWorkExperienceSchema, updateWorkExperienceSchema } from "../sharedTypes";

export const workExperienceRoute = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
  };
}>()
  .get("/", getUser, async (c) => {
    const user = c.var.user;

    const entries = await db
      .select()
      .from(workExperienceTable)
      .where(eq(workExperienceTable.userId, user.id))
      .orderBy(desc(workExperienceTable.startDate));

    return c.json({ workExperience: entries });
  })
  .post(
    "/",
    getUser,
    zValidator("json", createWorkExperienceSchema),
    async (c) => {
      const body = await c.req.valid("json");
      const user = c.var.user;

      const validated = insertWorkExperienceSchema.parse({
        ...body,
        userId: user.id,
      });

      const result = await db
        .insert(workExperienceTable)
        .values(validated)
        .returning()
        .then((res) => res[0]);

      c.status(201);
      return c.json(result);
    }
  )
  .delete("/:id{[0-9]+}", getUser, async (c) => {
    const id = Number.parseInt(c.req.param("id"));
    const user = c.var.user;

    const deleted = await db
      .delete(workExperienceTable)
      .where(
        and(
          eq(workExperienceTable.userId, user.id),
          eq(workExperienceTable.id, id)
        )
      )
      .returning()
      .then((res) => res[0]);

    if (!deleted) {
      return c.notFound();
    }

    return c.json({ workExperience: deleted });
  })
  .put("/:id{[0-9]+}", getUser, zValidator("json", updateWorkExperienceSchema), async (c) => {
    const id = Number.parseInt(c.req.param("id"));
    const user = c.var.user;
    const body = c.req.valid("json");

    const updated = await db
      .update(workExperienceTable)
      .set(body)
      .where(
        and(
          eq(workExperienceTable.userId, user.id),
          eq(workExperienceTable.id, id)
        )
      )
      .returning()
      .then((res) => res[0]);

    if (!updated) {
      return c.notFound();
    }

    return c.json({ workExperience: updated });
  });
