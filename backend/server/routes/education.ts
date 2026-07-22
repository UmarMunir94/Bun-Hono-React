import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { getUser } from "../auth-middleware";
import { auth } from "../auth";
import { db } from "../db";
import { education as educationTable, selectEducationSchema } from "../db/schema/education";
import { eq, desc, and } from "drizzle-orm";
import { createEducationSchema, updateEducationSchema } from "../sharedTypes";

const educationResponseSchema = z.object({
  education: z.array(selectEducationSchema),
});

const singleEducationResponseSchema = z.object({
  education: selectEducationSchema,
});

const app = new OpenAPIHono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
  };
}>();

app.use("*", getUser);

export const educationRoute = app
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      responses: {
        200: {
          content: {
            "application/json": { schema: educationResponseSchema },
          },
          description: "List all education entries",
        },
      },
    }),
    async (c) => {
      const user = c.var.user;
      const entries = await db
        .select()
        .from(educationTable)
        .where(eq(educationTable.userId, user.id))
        .orderBy(desc(educationTable.startYear));

      return c.json({ education: entries }, 200);
    }
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/",
      request: {
        body: {
          content: { "application/json": { schema: createEducationSchema } },
        },
      },
      responses: {
        201: {
          content: { "application/json": { schema: selectEducationSchema } },
          description: "Created education entry",
        },
      },
    }),
    async (c) => {
      const body = c.req.valid("json");
      const user = c.var.user;

      const result = await db
        .insert(educationTable)
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
          content: { "application/json": { schema: singleEducationResponseSchema } },
          description: "Deleted education entry",
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
        .delete(educationTable)
        .where(and(eq(educationTable.userId, user.id), eq(educationTable.id, id)))
        .returning()
        .then((res) => res[0]);

      if (!deleted) {
        return c.notFound();
      }

      return c.json({ education: deleted }, 200);
    }
  )
  .openapi(
    createRoute({
      method: "put",
      path: "/{id}",
      request: {
        params: z.object({ id: z.string() }),
        body: {
          content: { "application/json": { schema: updateEducationSchema } },
        },
      },
      responses: {
        200: {
          content: { "application/json": { schema: singleEducationResponseSchema } },
          description: "Updated education entry",
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
        .update(educationTable)
        .set(body)
        .where(and(eq(educationTable.userId, user.id), eq(educationTable.id, id)))
        .returning()
        .then((res) => res[0]);

      if (!updated) {
        return c.notFound();
      }

      return c.json({ education: updated }, 200);
    }
  );
