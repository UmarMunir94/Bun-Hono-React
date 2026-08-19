import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import { getUser } from "../auth-middleware";
import { auth } from "../auth";
import { db } from "../db";
import {
  events as eventsTable,
  eventAttendees as eventAttendeesTable,
  selectEventSchema,
  selectEventAttendeeSchema,
} from "../db/schema/events";
import { eq, desc, and, or, inArray, getTableColumns } from "drizzle-orm";
import { createEventSchema, updateEventSchema } from "../sharedTypes";
import { UnauthorizedSchema, NotFoundSchema, ValidationErrorSchema, defaultHook, UserSchema } from "../lib/openapi-schemas";
import { user as userTable } from "../db/schema/auth";

const BaseEventItemSchema = selectEventSchema.extend({
  createdAt: z.string().nullable(),
  dateAndTime: z.string(),
}).openapi("BaseEventItem");

const EventListItemSchema = BaseEventItemSchema.extend({
  attendeeCount: z.number().int(),
  interestedCount: z.number().int(),
  slotsLeft: z.number().int(),
  myStatus: z.enum(["none", "requested", "approved"]),
  organizerName: z.string().nullable(),
}).openapi("EventListItem");

const EventAttendeeItemSchema = selectEventAttendeeSchema.extend({
  createdAt: z.string().nullable(),
}).openapi("EventAttendeeItem");

const EventDetailsSchema = BaseEventItemSchema.extend({
  attendees: z.array(EventAttendeeItemSchema.extend({
    user: z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().nullable().optional(),
    }).optional()
  })),
}).openapi("EventDetails");

const app = new OpenAPIHono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
  };
}>({ defaultHook });

const listEvents = createRoute({
  method: "get",
  path: "/",
  tags: ["Events"],
  middleware: [getUser] as const,
  request: {
    query: z.object({
      tab: z.enum(["all", "managed", "joined"]).default("all").openapi({ description: "Tab filter" }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            events: z.array(EventListItemSchema),
          }),
        },
      },
      description: "List of events",
    },
    401: {
      content: { "application/json": { schema: UnauthorizedSchema } },
      description: "Unauthorized",
    },
  },
});

const postEvent = createRoute({
  method: "post",
  path: "/",
  tags: ["Events"],
  middleware: [getUser] as const,
  request: {
    body: {
      content: { "application/json": { schema: createEventSchema } },
    },
  },
  responses: {
    201: {
      content: { "application/json": { schema: BaseEventItemSchema } },
      description: "Created event",
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

const getEvent = createRoute({
  method: "get",
  path: "/:id{[0-9]+}",
  tags: ["Events"],
  middleware: [getUser] as const,
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Numeric ID" }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ event: EventDetailsSchema }) } },
      description: "Event Details",
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

const putEvent = createRoute({
  method: "put",
  path: "/:id{[0-9]+}",
  tags: ["Events"],
  middleware: [getUser] as const,
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Numeric ID" }),
    }),
    body: {
      content: { "application/json": { schema: updateEventSchema } },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ event: BaseEventItemSchema }) } },
      description: "Updated event",
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

const deleteEvent = createRoute({
  method: "delete",
  path: "/:id{[0-9]+}",
  tags: ["Events"],
  middleware: [getUser] as const,
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Numeric ID" }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ event: BaseEventItemSchema }) } },
      description: "Deleted event",
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

const joinEvent = createRoute({
  method: "post",
  path: "/:id{[0-9]+}/join",
  tags: ["Events"],
  middleware: [getUser] as const,
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Numeric ID" }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ attendee: EventAttendeeItemSchema }) } },
      description: "Joined event",
    },
    400: {
      content: { "application/json": { schema: ValidationErrorSchema } },
      description: "Validation error / Already joined",
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

const updateAttendee = createRoute({
  method: "put",
  path: "/:id{[0-9]+}/attendees/:attendeeId{[0-9]+}",
  tags: ["Events"],
  middleware: [getUser] as const,
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Event ID" }),
      attendeeId: z.string().openapi({ description: "Attendee ID" }),
    }),
    body: {
      content: { "application/json": { schema: z.object({ status: z.enum(["requested", "approved", "rejected"]) }) } },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ attendee: EventAttendeeItemSchema.nullable() }) } },
      description: "Updated attendee",
    },
    400: {
      content: { "application/json": { schema: ValidationErrorSchema } },
      description: "Validation error",
    },
    401: {
      content: { "application/json": { schema: UnauthorizedSchema } },
      description: "Unauthorized",
    },
    403: {
      content: { "application/json": { schema: z.object({ error: z.string() }) } },
      description: "Forbidden",
    },
    404: {
      content: { "application/json": { schema: NotFoundSchema } },
      description: "Not Found",
    },
  },
});

const leaveEvent = createRoute({
  method: "delete",
  path: "/:id{[0-9]+}/join",
  tags: ["Events"],
  middleware: [getUser] as const,
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Event ID" }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ success: z.boolean() }) } },
      description: "Left event",
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
      description: "Not Found / Not a member",
    },
  },
});

export const eventsRoute = app
  .openapi(listEvents, async (c) => {
    const user = c.var.user;
    const tab = c.req.valid("query").tab;

    let query = db
      .select({
        ...getTableColumns(eventsTable),
        organizerName: userTable.name,
      })
      .from(eventsTable)
      .leftJoin(userTable, eq(eventsTable.userId, userTable.id))
      .$dynamic();

    if (tab === "all") {
      query = query.where(eq(eventsTable.isPrivate, false));
    } else if (tab === "managed") {
      query = query.where(eq(eventsTable.userId, user.id));
    } else if (tab === "joined") {
      const joinedEventsQuery = db
        .select({ eventId: eventAttendeesTable.eventId })
        .from(eventAttendeesTable)
        .where(and(eq(eventAttendeesTable.userId, user.id), eq(eventAttendeesTable.status, "approved")));
      query = query.where(inArray(eventsTable.id, joinedEventsQuery));
    }

    const entries = await query.orderBy(desc(eventsTable.createdAt));

    if (entries.length === 0) {
      return c.json({ events: [] }, 200);
    }

    const eventIds = entries.map((e) => e.id);

    // Fetch all attendees for the listed events in one query
    const allAttendees = await db
      .select({
        eventId: eventAttendeesTable.eventId,
        userId: eventAttendeesTable.userId,
        status: eventAttendeesTable.status,
      })
      .from(eventAttendeesTable)
      .where(inArray(eventAttendeesTable.eventId, eventIds));

    // Fetch current user's status for each event
    const myAttendances = await db
      .select({
        eventId: eventAttendeesTable.eventId,
        status: eventAttendeesTable.status,
      })
      .from(eventAttendeesTable)
      .where(and(inArray(eventAttendeesTable.eventId, eventIds), eq(eventAttendeesTable.userId, user.id)));

    const attendeeCountMap = new Map<number, number>();
    const interestedCountMap = new Map<number, number>();
    for (const a of allAttendees) {
      if (a.status === "approved") {
        attendeeCountMap.set(a.eventId, (attendeeCountMap.get(a.eventId) ?? 0) + 1);
      } else if (a.status === "requested") {
        interestedCountMap.set(a.eventId, (interestedCountMap.get(a.eventId) ?? 0) + 1);
      }
    }

    const myStatusMap = new Map<number, "requested" | "approved">();
    for (const a of myAttendances) {
      myStatusMap.set(a.eventId, a.status as "requested" | "approved");
    }

    const mapped = entries.map((e) => {
      const attendeeCount = attendeeCountMap.get(e.id) ?? 0;
      return {
        ...e,
        dateAndTime: e.dateAndTime instanceof Date ? e.dateAndTime.toISOString() : String(e.dateAndTime),
        createdAt: e.createdAt ? (e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt)) : null,
        attendeeCount,
        interestedCount: interestedCountMap.get(e.id) ?? 0,
        slotsLeft: Math.max(0, e.slots - attendeeCount),
        myStatus: (myStatusMap.get(e.id) ?? "none") as "none" | "requested" | "approved",
        organizerName: e.organizerName,
      };
    });

    return c.json({ events: mapped }, 200);
  })
  .openapi(getEvent, async (c) => {
    const id = Number.parseInt(c.req.valid("param").id);

    const [event] = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, id))
      .limit(1);

    if (!event) return c.json({ error: "Not Found" }, 404);

    const attendees = await db
      .select({
        ...getTableColumns(eventAttendeesTable),
        userName: userTable.name,
        userImage: userTable.image,
      })
      .from(eventAttendeesTable)
      .leftJoin(userTable, eq(eventAttendeesTable.userId, userTable.id))
      .where(eq(eventAttendeesTable.eventId, id));

    const isOrganizerIncluded = attendees.some(a => a.userId === event.userId);
    if (!isOrganizerIncluded) {
      const [organizer] = await db.select().from(userTable).where(eq(userTable.id, event.userId)).limit(1);
      if (organizer) {
        const [newAttendee] = await db.insert(eventAttendeesTable).values({
          eventId: id,
          userId: event.userId,
          status: "approved",
        }).returning();
        
        attendees.push({
          ...newAttendee,
          userName: organizer.name,
          userImage: organizer.image,
        });
      }
    }

    const mappedEvent = {
      ...event,
      dateAndTime: event.dateAndTime instanceof Date ? event.dateAndTime.toISOString() : String(event.dateAndTime),
      createdAt: event.createdAt ? (event.createdAt instanceof Date ? event.createdAt.toISOString() : String(event.createdAt)) : null,
      attendees: attendees.map(a => ({
        id: a.id,
        eventId: a.eventId,
        userId: a.userId,
        status: a.status,
        createdAt: a.createdAt ? (a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt)) : null,
        user: {
          id: a.userId,
          name: a.userName || "Unknown",
          image: a.userImage,
        }
      })),
    };

    return c.json({ event: mappedEvent }, 200);
  })
  .openapi(postEvent, async (c) => {
    const body = c.req.valid("json");
    const user = c.var.user;

    const [result] = await db
      .insert(eventsTable)
      .values({
        ...body,
        userId: user.id,
        dateAndTime: new Date(body.dateAndTime),
      })
      .returning();

    await db.insert(eventAttendeesTable).values({
      eventId: result.id,
      userId: user.id,
      status: "approved",
    });

    const mapped = {
      ...result,
      dateAndTime: result.dateAndTime instanceof Date ? result.dateAndTime.toISOString() : String(result.dateAndTime),
      createdAt: result.createdAt ? (result.createdAt instanceof Date ? result.createdAt.toISOString() : String(result.createdAt)) : null,
    };

    return c.json(mapped, 201);
  })
  .openapi(putEvent, async (c) => {
    const id = Number.parseInt(c.req.valid("param").id);
    const user = c.var.user;
    const body = c.req.valid("json");

    const updateData: any = { ...body };
    if (updateData.dateAndTime) {
      updateData.dateAndTime = new Date(updateData.dateAndTime);
    }

    if (updateData.slots !== undefined) {
      const approvedAttendees = await db
        .select()
        .from(eventAttendeesTable)
        .where(and(eq(eventAttendeesTable.eventId, id), eq(eventAttendeesTable.status, "approved")));
      if (updateData.slots < approvedAttendees.length) {
        return c.json({ success: false, error: "Cannot reduce slots below the number of currently joined participants" }, 400);
      }
    }

    const [updated] = await db
      .update(eventsTable)
      .set(updateData)
      .where(and(eq(eventsTable.userId, user.id), eq(eventsTable.id, id)))
      .returning();

    if (!updated) return c.json({ error: "Not Found" }, 404);

    const mapped = {
      ...updated,
      dateAndTime: updated.dateAndTime instanceof Date ? updated.dateAndTime.toISOString() : String(updated.dateAndTime),
      createdAt: updated.createdAt ? (updated.createdAt instanceof Date ? updated.createdAt.toISOString() : String(updated.createdAt)) : null,
    };

    return c.json({ event: mapped }, 200);
  })
  .openapi(deleteEvent, async (c) => {
    const id = Number.parseInt(c.req.valid("param").id);
    const user = c.var.user;

    const [deleted] = await db
      .delete(eventsTable)
      .where(and(eq(eventsTable.userId, user.id), eq(eventsTable.id, id)))
      .returning();

    if (!deleted) return c.json({ error: "Not Found" }, 404);

    const mapped = {
      ...deleted,
      dateAndTime: deleted.dateAndTime instanceof Date ? deleted.dateAndTime.toISOString() : String(deleted.dateAndTime),
      createdAt: deleted.createdAt ? (deleted.createdAt instanceof Date ? deleted.createdAt.toISOString() : String(deleted.createdAt)) : null,
    };

    return c.json({ event: mapped }, 200);
  })
  .openapi(joinEvent, async (c) => {
    const id = Number.parseInt(c.req.valid("param").id);
    const user = c.var.user;

    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id)).limit(1);
    if (!event) return c.json({ error: "Not Found" }, 404);

    const [existing] = await db
      .select()
      .from(eventAttendeesTable)
      .where(and(eq(eventAttendeesTable.eventId, id), eq(eventAttendeesTable.userId, user.id)))
      .limit(1);

    if (existing) {
      return c.json({ success: false, error: "Validation error / Already joined" }, 400);
    }

    const approvedList = await db.select().from(eventAttendeesTable).where(and(eq(eventAttendeesTable.eventId, id), eq(eventAttendeesTable.status, "approved")));
    
    let status = event.autoApprove ? "approved" : "requested";
    if (approvedList.length >= event.slots) {
      status = "requested"; // Force waitlist if full
    }

    const [attendee] = await db
      .insert(eventAttendeesTable)
      .values({
        eventId: id,
        userId: user.id,
        status,
      })
      .returning();

    return c.json({
      attendee: {
        ...attendee,
        createdAt: attendee.createdAt ? (attendee.createdAt instanceof Date ? attendee.createdAt.toISOString() : String(attendee.createdAt)) : null,
      }
    }, 200);
  })
  .openapi(updateAttendee, async (c) => {
    const eventId = Number.parseInt(c.req.valid("param").id);
    const attendeeId = Number.parseInt(c.req.valid("param").attendeeId);
    const { status } = c.req.valid("json");
    const user = c.var.user;

    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId)).limit(1);
    if (!event) return c.json({ error: "Not Found" }, 404);

    if (event.userId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const [targetAttendee] = await db.select().from(eventAttendeesTable).where(and(eq(eventAttendeesTable.id, attendeeId), eq(eventAttendeesTable.eventId, eventId))).limit(1);
    if (!targetAttendee) return c.json({ error: "Not Found" }, 404);

    if (status === "rejected") {
      if (targetAttendee.userId === event.userId) {
        return c.json({ success: false, error: "Cannot remove the organizer" }, 400);
      }
      const [deleted] = await db
        .delete(eventAttendeesTable)
        .where(eq(eventAttendeesTable.id, attendeeId))
        .returning();
      return c.json({ attendee: null }, 200);
    } else {
      if (status === "approved" && targetAttendee.status !== "approved") {
        const approvedList = await db.select().from(eventAttendeesTable).where(and(eq(eventAttendeesTable.eventId, eventId), eq(eventAttendeesTable.status, "approved")));
        if (approvedList.length >= event.slots) {
          return c.json({ success: false, error: "Event is full" }, 400);
        }
      }

      const [updated] = await db
        .update(eventAttendeesTable)
        .set({ status })
        .where(eq(eventAttendeesTable.id, attendeeId))
        .returning();
      return c.json({
        attendee: {
          ...updated,
          createdAt: updated.createdAt ? (updated.createdAt instanceof Date ? updated.createdAt.toISOString() : String(updated.createdAt)) : null,
        }
      }, 200);
    }
  })
  .openapi(leaveEvent, async (c) => {
    const id = Number.parseInt(c.req.valid("param").id);
    const user = c.var.user;
    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id)).limit(1);
    if (!event) return c.json({ error: "Not Found" }, 404);

    if (event.userId === user.id) {
      return c.json({ success: false, error: "Organizer cannot leave the event" }, 400);
    }

    const [deleted] = await db
      .delete(eventAttendeesTable)
      .where(and(eq(eventAttendeesTable.eventId, id), eq(eventAttendeesTable.userId, user.id)))
      .returning();

    if (!deleted) return c.json({ error: "Not Found" }, 404);

    return c.json({ success: true }, 200);
  });
