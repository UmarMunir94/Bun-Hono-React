import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import { getUser } from "../auth-middleware";
import { auth } from "../auth";
import { db } from "../db";
import { user as userTable } from "../db/schema/auth";
import { generalInfo as generalInfoTable } from "../db/schema/general-info";
import { events as eventsTable, eventAttendees as eventAttendeesTable } from "../db/schema/events";
import { eq, desc, and } from "drizzle-orm";
import { UnauthorizedSchema, NotFoundSchema, defaultHook, UserSchema } from "../lib/openapi-schemas";
import { selectEventSchema } from "../db/schema/events";

const PublicProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable().optional(),
  generalInfo: z.object({
    city: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    linkedinProfile: z.string().nullable().optional(),
    about: z.string().nullable().optional(),
  }).nullable().optional(),
  joinedEvents: z.array(
    selectEventSchema.extend({
      createdAt: z.string().nullable(),
      dateAndTime: z.string(),
    })
  ),
}).openapi("PublicProfile");

const app = new OpenAPIHono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
  };
}>({ defaultHook });

const getPublicProfile = createRoute({
  method: "get",
  path: "/:userId/public",
  tags: ["Users"],
  middleware: [getUser] as const,
  request: {
    params: z.object({
      userId: z.string().openapi({ description: "User ID" }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ profile: PublicProfileSchema }) } },
      description: "Public Profile",
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

export const usersRoute = app.openapi(getPublicProfile, async (c) => {
  const userId = c.req.valid("param").userId;

  const [user] = await db.select().from(userTable).where(eq(userTable.id, userId)).limit(1);
  if (!user) return c.json({ error: "Not Found" }, 404);

  const [info] = await db.select().from(generalInfoTable).where(eq(generalInfoTable.userId, userId)).limit(1);

  // Fetch joined non-private events
  const joinedEvents = await db
    .select({
      id: eventsTable.id,
      userId: eventsTable.userId,
      name: eventsTable.name,
      location: eventsTable.location,
      dateAndTime: eventsTable.dateAndTime,
      slots: eventsTable.slots,
      description: eventsTable.description,
      isPrivate: eventsTable.isPrivate,
      autoApprove: eventsTable.autoApprove,
      createdAt: eventsTable.createdAt,
    })
    .from(eventAttendeesTable)
    .innerJoin(eventsTable, eq(eventAttendeesTable.eventId, eventsTable.id))
    .where(
      and(
        eq(eventAttendeesTable.userId, userId),
        eq(eventAttendeesTable.status, "approved"),
        eq(eventsTable.isPrivate, false)
      )
    )
    .orderBy(desc(eventsTable.dateAndTime));

  const profile = {
    id: user.id,
    name: user.name,
    image: user.image,
    generalInfo: info ? {
      city: info.city,
      country: info.country,
      linkedinProfile: info.linkedinProfile,
      about: info.about,
    } : null,
    joinedEvents: joinedEvents.map(e => ({
      ...e,
      dateAndTime: e.dateAndTime instanceof Date ? e.dateAndTime.toISOString() : String(e.dateAndTime),
      createdAt: e.createdAt ? (e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt)) : null,
    })),
  };

  return c.json({ profile }, 200);
});
