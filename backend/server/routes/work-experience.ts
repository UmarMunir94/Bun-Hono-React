import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import { getUser } from "../auth-middleware";
import { auth } from "../auth";
import { db } from "../db";
import {
  workExperience as workExperienceTable,
  insertWorkExperienceSchema,
  selectWorkExperienceSchema,
} from "../db/schema/work-experience";
import { eq, desc, and } from "drizzle-orm";
import { createWorkExperienceSchema, updateWorkExperienceSchema } from "../sharedTypes";
import { UnauthorizedSchema, NotFoundSchema, ValidationErrorSchema, defaultHook } from "../lib/openapi-schemas";

const WorkExperienceItemSchema = selectWorkExperienceSchema.extend({
  createdAt: z.string().nullable(),
}).openapi("WorkExperienceItem");

const app = new OpenAPIHono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
  };
}>({ defaultHook });

const listWorkExperience = createRoute({
  method: "get",
  path: "/",
  tags: ["Work Experience"],
  middleware: [getUser] as const,
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            workExperience: z.array(WorkExperienceItemSchema),
          }),
        },
      },
      description: "List of work experience entries",
    },
    401: {
      content: { "application/json": { schema: UnauthorizedSchema } },
      description: "Unauthorized",
    },
  },
});

const postWorkExperience = createRoute({
  method: "post",
  path: "/",
  tags: ["Work Experience"],
  middleware: [getUser] as const,
  request: {
    body: {
      content: { "application/json": { schema: createWorkExperienceSchema } },
    },
  },
  responses: {
    201: {
      content: { "application/json": { schema: WorkExperienceItemSchema } },
      description: "Created work experience entry",
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

const deleteWorkExperience = createRoute({
  method: "delete",
  path: "/:id{[0-9]+}",
  tags: ["Work Experience"],
  middleware: [getUser] as const,
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Numeric ID" }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ workExperience: WorkExperienceItemSchema }) } },
      description: "Deleted work experience entry",
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

const putWorkExperience = createRoute({
  method: "put",
  path: "/:id{[0-9]+}",
  tags: ["Work Experience"],
  middleware: [getUser] as const,
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Numeric ID" }),
    }),
    body: {
      content: { "application/json": { schema: updateWorkExperienceSchema } },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ workExperience: WorkExperienceItemSchema }) } },
      description: "Updated work experience entry",
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

export const workExperienceRoute = app
  .openapi(listWorkExperience, async (c) => {
    const user = c.var.user;

    const entries = await db
      .select()
      .from(workExperienceTable)
      .where(eq(workExperienceTable.userId, user.id))
      .orderBy(desc(workExperienceTable.startDate));

    const mapped = entries.map(e => ({
      ...e,
      createdAt: e.createdAt ? (e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt)) : null,
    }));

    return c.json({ workExperience: mapped }, 200);
  })
  .openapi(postWorkExperience, async (c) => {
    const body = c.req.valid("json");
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

    const mapped = {
      ...result,
      createdAt: result.createdAt ? (result.createdAt instanceof Date ? result.createdAt.toISOString() : String(result.createdAt)) : null,
    };

    return c.json(mapped, 201);
  })
  .openapi(deleteWorkExperience, async (c) => {
    const id = Number.parseInt(c.req.valid("param").id);
    const user = c.var.user;

    const deleted = await db
      .delete(workExperienceTable)
      .where(
        and(eq(workExperienceTable.userId, user.id), eq(workExperienceTable.id, id))
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

    return c.json({ workExperience: mapped }, 200);
  })
  .openapi(putWorkExperience, async (c) => {
    const id = Number.parseInt(c.req.valid("param").id);
    const user = c.var.user;
    const body = c.req.valid("json");

    const updated = await db
      .update(workExperienceTable)
      .set(body)
      .where(
        and(eq(workExperienceTable.userId, user.id), eq(workExperienceTable.id, id))
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

    return c.json({ workExperience: mapped }, 200);
  });
