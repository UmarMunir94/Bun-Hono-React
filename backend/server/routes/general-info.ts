import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import { getUser } from "../auth-middleware";
import { auth } from "../auth";
import { db } from "../db";
import { generalInfo as generalInfoTable, insertGeneralInfoSchema, selectGeneralInfoSchema } from "../db/schema/general-info";
import { user as userTable } from "../db/schema/auth";
import { eq } from "drizzle-orm";
import { createGeneralInfoSchema } from "../sharedTypes";
import { UnauthorizedSchema, ValidationErrorSchema, defaultHook } from "../lib/openapi-schemas";

const GeneralInfoItemSchema = selectGeneralInfoSchema.extend({
  createdAt: z.string().nullable(),
  email: z.string().nullable().optional().describe("email is fetched from the user table and merged in the GET response"),
}).openapi("GeneralInfoItem");

const app = new OpenAPIHono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
  };
}>({ defaultHook });

const getGeneralInfo = createRoute({
  method: "get",
  path: "/",
  tags: ["General Info"],
  middleware: [getUser] as const,
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            generalInfo: GeneralInfoItemSchema.partial(),
          }),
        },
      },
      description: "Current user's general profile info",
    },
    401: {
      content: { "application/json": { schema: UnauthorizedSchema } },
      description: "Unauthorized",
    },
  },
});

const putGeneralInfo = createRoute({
  method: "put",
  path: "/",
  tags: ["General Info"],
  middleware: [getUser] as const,
  request: {
    body: {
      content: { "application/json": { schema: createGeneralInfoSchema } },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            generalInfo: GeneralInfoItemSchema,
          }),
        },
      },
      description: "Upserted general profile info",
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

export const generalInfoRoute = app
  .openapi(getGeneralInfo, async (c) => {
    const sessionUser = c.var.user;

    const [generalInfoResult, userResult] = await Promise.all([
      db
        .select()
        .from(generalInfoTable)
        .where(eq(generalInfoTable.userId, sessionUser.id))
        .limit(1)
        .then((res) => res[0]),
      db
        .select({ email: userTable.email })
        .from(userTable)
        .where(eq(userTable.id, sessionUser.id))
        .limit(1)
        .then((res) => res[0]),
    ]);

    const raw = {
      ...(generalInfoResult || {}),
      email: userResult?.email ?? null,
    };

    const mapped = {
      ...raw,
      createdAt: "createdAt" in raw && raw.createdAt ? (raw.createdAt instanceof Date ? raw.createdAt.toISOString() : String(raw.createdAt)) : null,
    };

    return c.json({ generalInfo: mapped as any }, 200);
  })
  .openapi(putGeneralInfo, async (c) => {
    const body = c.req.valid("json");
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
          phone: validated.phone,
          city: validated.city,
          country: validated.country,
          linkedinProfile: validated.linkedinProfile,
          // ── New fields ──────────────────────────────────────────────────
          avatarUrl: validated.avatarUrl,
          address: validated.address,
          state: validated.state,
          zipCode: validated.zipCode,
          about: validated.about,
        },
      })
      .returning()
      .then((res) => res[0]);

    // Keep the better-auth user table and cookie cache in sync
    const newName = `${validated.firstName} ${validated.lastName}`.trim();
    const updateRes = await auth.api.updateUser({
      headers: c.req.raw.headers,
      body: {
        name: newName,
        ...(validated.avatarUrl !== undefined && { image: validated.avatarUrl }),
      },
      asResponse: true,
    });

    const setCookies = updateRes.headers.getSetCookie();
    for (const cookie of setCookies) {
      c.header("Set-Cookie", cookie, { append: true });
    }

    const mapped = {
      ...result,
      createdAt: result.createdAt ? (result.createdAt instanceof Date ? result.createdAt.toISOString() : String(result.createdAt)) : null,
    };

    return c.json({ generalInfo: mapped as any }, 200);
  });
