import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { getUser } from "../auth-middleware";
import { auth } from "../auth";
import { db } from "../db";
import {
  workExperience as workExperienceTable,
  selectWorkExperienceSchema,
} from "../db/schema/work-experience";
import { eq, desc, and } from "drizzle-orm";
import { createWorkExperienceSchema, updateWorkExperienceSchema } from "../sharedTypes";

const workExperienceResponseSchema = z.object({
  workExperience: z.array(selectWorkExperienceSchema),
});

const singleWorkExperienceResponseSchema = z.object({
  workExperience: selectWorkExperienceSchema,
});

const app = new OpenAPIHono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
  };
}>();

app.use("*", getUser);

export const workExperienceRoute = app
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      responses: {
        200: {
          content: {
            "application/json": { schema: workExperienceResponseSchema },
          },
          description: "List all work experience entries",
        },
      },
    }),
    async (c) => {
      const user = c.var.user;

      const entries = await db
        .select()
        .from(workExperienceTable)
        .where(eq(workExperienceTable.userId, user.id))
        .orderBy(desc(workExperienceTable.startDate));

      return c.json({ workExperience: entries }, 200);
    }
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/",
      request: {
        body: {
          content: { "application/json": { schema: createWorkExperienceSchema } },
        },
      },
      responses: {
        201: {
          content: { "application/json": { schema: selectWorkExperienceSchema } },
          description: "Created work experience entry",
        },
      },
    }),
    async (c) => {
      const body = c.req.valid("json");
      const user = c.var.user;

      const result = await db
        .insert(workExperienceTable)
        .values({
          ...body,
          userId: user.id,
        })
        .returning()
        .then((res) => res[0]);

      return c.json(result, 201);
    }
  )
  .openapi(
    createRoute({
      method: "delete",
      path: "/{id}",
      request: {
        params: z.object({ id: z.string() }),
      },
      responses: {
        200: {
          content: { "application/json": { schema: singleWorkExperienceResponseSchema } },
          description: "Deleted work experience entry",
        },
        404: {
          description: "Not found",
        },
      },
    }),
    async (c) => {
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

      return c.json({ workExperience: deleted }, 200);
    }
  )
  .openapi(
    createRoute({
      method: "put",
      path: "/{id}",
      request: {
        params: z.object({ id: z.string() }),
        body: {
          content: { "application/json": { schema: updateWorkExperienceSchema } },
        },
      },
      responses: {
        200: {
          content: { "application/json": { schema: singleWorkExperienceResponseSchema } },
          description: "Updated work experience entry",
        },
        404: {
          description: "Not found",
        },
      },
    }),
    async (c) => {
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

      return c.json({ workExperience: updated }, 200);
    }
  );
