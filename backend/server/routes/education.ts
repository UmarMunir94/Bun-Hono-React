import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import { getUser } from "../auth-middleware";
import { auth } from "../auth";
import { db } from "../db";
import {
  education as educationTable,
  insertEducationSchema,
  selectEducationSchema,
} from "../db/schema/education";
import { eq, desc, and } from "drizzle-orm";
import { createEducationSchema, updateEducationSchema } from "../sharedTypes";
import { UnauthorizedSchema, NotFoundSchema, ValidationErrorSchema, defaultHook } from "../lib/openapi-schemas";

const EducationItemSchema = selectEducationSchema.extend({
  createdAt: z.string().nullable(),
}).openapi("EducationItem");

const app = new OpenAPIHono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
  };
}>({ defaultHook });

const listEducation = createRoute({
  method: "get",
  path: "/",
  tags: ["Education"],
  middleware: [getUser] as const,
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            education: z.array(EducationItemSchema),
          }),
        },
      },
      description: "List of education entries",
    },
    401: {
      content: { "application/json": { schema: UnauthorizedSchema } },
      description: "Unauthorized",
    },
  },
});

const postEducation = createRoute({
  method: "post",
  path: "/",
  tags: ["Education"],
  middleware: [getUser] as const,
  request: {
    body: {
      content: { "application/json": { schema: createEducationSchema } },
    },
  },
  responses: {
    201: {
      content: { "application/json": { schema: EducationItemSchema } },
      description: "Created education entry",
    },
    400: {
      content: { "application/json": { schema: ValidationErrorSchema } },
      description: "Validation error",
    },
    401: {
      content: { "application/json": { schema: UnauthorizedSchema } },
      description: "Unauthorized",
    },
  },
});

const deleteEducation = createRoute({
  method: "delete",
  path: "/:id{[0-9]+}",
  tags: ["Education"],
  middleware: [getUser] as const,
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Numeric ID" }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ education: EducationItemSchema }) } },
      description: "Deleted education entry",
    },
    401: {
      content: { "application/json": { schema: UnauthorizedSchema } },
      description: "Unauthorized",
    },
    404: {
      content: { "application/json": { schema: NotFoundSchema } },
      description: "Not Found",
    },
  },
});

const putEducation = createRoute({
  method: "put",
  path: "/:id{[0-9]+}",
  tags: ["Education"],
  middleware: [getUser] as const,
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Numeric ID" }),
    }),
    body: {
      content: { "application/json": { schema: updateEducationSchema } },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ education: EducationItemSchema }) } },
      description: "Updated education entry",
    },
    400: {
      content: { "application/json": { schema: ValidationErrorSchema } },
      description: "Validation error",
    },
    401: {
      content: { "application/json": { schema: UnauthorizedSchema } },
      description: "Unauthorized",
    },
    404: {
      content: { "application/json": { schema: NotFoundSchema } },
      description: "Not Found",
    },
  },
});

export const educationRoute = app
  .openapi(listEducation, async (c) => {
    const user = c.var.user;

    const entries = await db
      .select()
      .from(educationTable)
      .where(eq(educationTable.userId, user.id))
      .orderBy(desc(educationTable.startYear));

    // The DB driver might return Date objects for createdAt depending on config.
    // We'll coerce it to string to match the frontend expectations.
    const mapped = entries.map(e => ({
      ...e,
      createdAt: e.createdAt ? (e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt)) : null,
    }));

    return c.json({ education: mapped }, 200);
  })
  .openapi(postEducation, async (c) => {
    const body = c.req.valid("json");
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

    const mapped = {
      ...result,
      createdAt: result.createdAt ? (result.createdAt instanceof Date ? result.createdAt.toISOString() : String(result.createdAt)) : null,
    };

    return c.json(mapped, 201);
  })
  .openapi(deleteEducation, async (c) => {
    const id = Number.parseInt(c.req.valid("param").id);
    const user = c.var.user;

    const deleted = await db
      .delete(educationTable)
      .where(
        and(eq(educationTable.userId, user.id), eq(educationTable.id, id))
      )
      .returning()
      .then((res) => res[0]);

    if (!deleted) {
      return c.json({ error: "Not Found" }, 404);
    }

    const mapped = {
      ...deleted,
      createdAt: deleted.createdAt ? (deleted.createdAt instanceof Date ? deleted.createdAt.toISOString() : String(deleted.createdAt)) : null,
    };

    return c.json({ education: mapped }, 200);
  })
  .openapi(putEducation, async (c) => {
    const id = Number.parseInt(c.req.valid("param").id);
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
      return c.json({ error: "Not Found" }, 404);
    }

    const mapped = {
      ...updated,
      createdAt: updated.createdAt ? (updated.createdAt instanceof Date ? updated.createdAt.toISOString() : String(updated.createdAt)) : null,
    };

    return c.json({ education: mapped }, 200);
  });
