import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { getUser } from "../auth-middleware";
import { auth } from "../auth";
import { db } from "../db";
import { generalInfo as generalInfoTable, selectGeneralInfoSchema } from "../db/schema/general-info";
import { user as userTable } from "../db/schema/auth";
import { eq } from "drizzle-orm";
import { createGeneralInfoSchema } from "../sharedTypes";

const generalInfoResponseSchema = z.object({
  generalInfo: selectGeneralInfoSchema.extend({
    email: z.string().nullable(),
  }),
});

const putGeneralInfoResponseSchema = z.object({
  generalInfo: selectGeneralInfoSchema,
});

const app = new OpenAPIHono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
  };
}>();

app.use("*", getUser);

export const generalInfoRoute = app
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      responses: {
        200: {
          content: {
            "application/json": { schema: generalInfoResponseSchema },
          },
          description: "Get general info and email",
        },
      },
    }),
    async (c) => {
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

      return c.json(
        {
          generalInfo: {
            id: generalInfoResult?.id ?? "",
            userId: generalInfoResult?.userId ?? sessionUser.id,
            firstName: generalInfoResult?.firstName ?? null,
            lastName: generalInfoResult?.lastName ?? null,
            phone: generalInfoResult?.phone ?? null,
            city: generalInfoResult?.city ?? null,
            country: generalInfoResult?.country ?? null,
            linkedinProfile: generalInfoResult?.linkedinProfile ?? null,
            createdAt: generalInfoResult?.createdAt ?? new Date(),
            email: userResult?.email ?? null,
          },
        },
        200
      );
    }
  )
  .openapi(
    createRoute({
      method: "put",
      path: "/",
      request: {
        body: {
          content: { "application/json": { schema: createGeneralInfoSchema } },
        },
      },
      responses: {
        200: {
          content: { "application/json": { schema: putGeneralInfoResponseSchema } },
          description: "Upsert general info",
        },
      },
    }),
    async (c) => {
      const body = c.req.valid("json");
      const sessionUser = c.var.user;

      const result = await db
        .insert(generalInfoTable)
        .values({
          ...body,
          userId: sessionUser.id,
        })
        .onConflictDoUpdate({
          target: generalInfoTable.userId,
          set: {
            firstName: body.firstName,
            lastName: body.lastName,
            phone: body.phone,
            city: body.city,
            country: body.country,
            linkedinProfile: body.linkedinProfile,
          },
        })
        .returning()
        .then((res) => res[0]);

      return c.json({ generalInfo: result }, 200);
    }
  );
