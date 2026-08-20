import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync("server/routes/events.ts", "utf-8");

// 1. Add completeEvent route definition
const completeEventDef = `const completeEvent = createRoute({
  method: "post",
  path: "/:id{[0-9]+}/complete",
  tags: ["Events"],
  middleware: [getUser] as const,
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Event ID" }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ success: z.boolean(), endTime: z.string() }) } },
      description: "Marked as completed",
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

export const eventsRoute = app`;

content = content.replace("export const eventsRoute = app", completeEventDef);

// 2. Add completeEvent handler at the end
const completeEventHandler = `    if (!deleted) return c.json({ error: "Not Found" }, 404);

    return c.json({ success: true }, 200);
  })
  .openapi(completeEvent, async (c) => {
    const id = Number.parseInt(c.req.valid("param").id);
    const user = c.var.user;
    
    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id)).limit(1);
    if (!event) return c.json({ error: "Not Found" }, 404);
    
    if (event.userId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }
    
    const now = new Date();
    
    const [updated] = await db
      .update(eventsTable)
      .set({ endTime: now })
      .where(eq(eventsTable.id, id))
      .returning();
      
    return c.json({ success: true, endTime: updated.endTime!.toISOString() }, 200);
  });
`;

content = content.replace(`    if (!deleted) return c.json({ error: "Not Found" }, 404);

    return c.json({ success: true }, 200);
  });`, completeEventHandler);

// 3. Add joinEvent validation
content = content.replace(
`    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id)).limit(1);
    if (!event) return c.json({ error: "Not Found" }, 404);

    const [existing] = await db`,
`    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id)).limit(1);
    if (!event) return c.json({ error: "Not Found" }, 404);

    const now = new Date();
    const effectiveCutoff = event.cutoffTime ? event.cutoffTime : event.startTime;
    if (now >= effectiveCutoff) {
      return c.json({ success: false, error: "Joining and leaving is disabled for this event" }, 400);
    }

    const [existing] = await db`
);

// 4. Add leaveEvent validation
content = content.replace(
`    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id)).limit(1);
    if (!event) return c.json({ error: "Not Found" }, 404);

    if (event.userId === user.id) {`,
`    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id)).limit(1);
    if (!event) return c.json({ error: "Not Found" }, 404);

    const now = new Date();
    const effectiveCutoff = event.cutoffTime ? event.cutoffTime : event.startTime;
    if (now >= effectiveCutoff) {
      return c.json({ success: false, error: "Joining and leaving is disabled for this event" }, 400);
    }

    if (event.userId === user.id) {`
);

writeFileSync("server/routes/events.ts", content);
console.log("Done");
