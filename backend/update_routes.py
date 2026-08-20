import re

with open("server/routes/events.ts", "r", encoding="utf-8") as f:
    content = f.read()

# 1. BaseEventItemSchema
content = content.replace(
"""const BaseEventItemSchema = selectEventSchema.extend({
  createdAt: z.string().nullable(),
  dateAndTime: z.string(),
}).openapi("BaseEventItem");""",
"""const BaseEventItemSchema = selectEventSchema.extend({
  createdAt: z.string().nullable(),
  startTime: z.string(),
  endTime: z.string().nullable().optional(),
  cutoffTime: z.string().nullable().optional(),
  autoEndTime: z.string(),
}).openapi("BaseEventItem");"""
)

# 2. listEvents mapping
content = content.replace(
"""      return {
        ...e,
        dateAndTime: e.dateAndTime instanceof Date ? e.dateAndTime.toISOString() : String(e.dateAndTime),
        createdAt: e.createdAt ? (e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt)) : null,""",
"""      return {
        ...e,
        startTime: e.startTime instanceof Date ? e.startTime.toISOString() : String(e.startTime),
        endTime: e.endTime ? (e.endTime instanceof Date ? e.endTime.toISOString() : String(e.endTime)) : null,
        cutoffTime: e.cutoffTime ? (e.cutoffTime instanceof Date ? e.cutoffTime.toISOString() : String(e.cutoffTime)) : null,
        autoEndTime: e.autoEndTime instanceof Date ? e.autoEndTime.toISOString() : String(e.autoEndTime),
        createdAt: e.createdAt ? (e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt)) : null,"""
)

# 3. getEvent mapping
content = content.replace(
"""    const mappedEvent = {
      ...event,
      dateAndTime: event.dateAndTime instanceof Date ? event.dateAndTime.toISOString() : String(event.dateAndTime),
      createdAt: event.createdAt ? (event.createdAt instanceof Date ? event.createdAt.toISOString() : String(event.createdAt)) : null,""",
"""    const mappedEvent = {
      ...event,
      startTime: event.startTime instanceof Date ? event.startTime.toISOString() : String(event.startTime),
      endTime: event.endTime ? (event.endTime instanceof Date ? event.endTime.toISOString() : String(event.endTime)) : null,
      cutoffTime: event.cutoffTime ? (event.cutoffTime instanceof Date ? event.cutoffTime.toISOString() : String(event.cutoffTime)) : null,
      autoEndTime: event.autoEndTime instanceof Date ? event.autoEndTime.toISOString() : String(event.autoEndTime),
      createdAt: event.createdAt ? (event.createdAt instanceof Date ? event.createdAt.toISOString() : String(event.createdAt)) : null,"""
)

# 4. postEvent values & mapped
content = content.replace(
"""    const [result] = await db
      .insert(eventsTable)
      .values({
        ...body,
        userId: user.id,
        dateAndTime: new Date(body.dateAndTime),
      })
      .returning();""",
"""    const startTimeDate = new Date(body.startTime);
    const autoEndTimeDate = body.endTime ? new Date(body.endTime) : new Date(startTimeDate.getTime() + 24 * 60 * 60 * 1000);

    const [result] = await db
      .insert(eventsTable)
      .values({
        ...body,
        userId: user.id,
        startTime: startTimeDate,
        endTime: body.endTime ? new Date(body.endTime) : null,
        cutoffTime: body.cutoffTime ? new Date(body.cutoffTime) : null,
        autoEndTime: autoEndTimeDate,
      })
      .returning();"""
)

content = content.replace(
"""    const mapped = {
      ...result,
      dateAndTime: result.dateAndTime instanceof Date ? result.dateAndTime.toISOString() : String(result.dateAndTime),
      createdAt: result.createdAt ? (result.createdAt instanceof Date ? result.createdAt.toISOString() : String(result.createdAt)) : null,
    };""",
"""    const mapped = {
      ...result,
      startTime: result.startTime instanceof Date ? result.startTime.toISOString() : String(result.startTime),
      endTime: result.endTime ? (result.endTime instanceof Date ? result.endTime.toISOString() : String(result.endTime)) : null,
      cutoffTime: result.cutoffTime ? (result.cutoffTime instanceof Date ? result.cutoffTime.toISOString() : String(result.cutoffTime)) : null,
      autoEndTime: result.autoEndTime instanceof Date ? result.autoEndTime.toISOString() : String(result.autoEndTime),
      createdAt: result.createdAt ? (result.createdAt instanceof Date ? result.createdAt.toISOString() : String(result.createdAt)) : null,
    };"""
)

# 5. putEvent mapping
content = content.replace(
"""    const updateData: any = { ...body };
    if (updateData.dateAndTime) {
      updateData.dateAndTime = new Date(updateData.dateAndTime);
    }""",
"""    const updateData: any = { ...body };
    if (updateData.startTime) {
      updateData.startTime = new Date(updateData.startTime);
    }
    if (updateData.endTime !== undefined) {
      updateData.endTime = updateData.endTime ? new Date(updateData.endTime) : null;
    }
    if (updateData.cutoffTime !== undefined) {
      updateData.cutoffTime = updateData.cutoffTime ? new Date(updateData.cutoffTime) : null;
    }

    if (updateData.startTime !== undefined || updateData.endTime !== undefined) {
      const [currentEvent] = await db.select().from(eventsTable).where(eq(eventsTable.id, id)).limit(1);
      if (currentEvent) {
        const newStartTime = updateData.startTime || currentEvent.startTime;
        const newEndTime = updateData.endTime !== undefined ? updateData.endTime : currentEvent.endTime;
        updateData.autoEndTime = newEndTime ? new Date(newEndTime) : new Date(newStartTime.getTime() + 24 * 60 * 60 * 1000);
      }
    }"""
)

content = content.replace(
"""    const mapped = {
      ...updated,
      dateAndTime: updated.dateAndTime instanceof Date ? updated.dateAndTime.toISOString() : String(updated.dateAndTime),
      createdAt: updated.createdAt ? (updated.createdAt instanceof Date ? updated.createdAt.toISOString() : String(updated.createdAt)) : null,
    };""",
"""    const mapped = {
      ...updated,
      startTime: updated.startTime instanceof Date ? updated.startTime.toISOString() : String(updated.startTime),
      endTime: updated.endTime ? (updated.endTime instanceof Date ? updated.endTime.toISOString() : String(updated.endTime)) : null,
      cutoffTime: updated.cutoffTime ? (updated.cutoffTime instanceof Date ? updated.cutoffTime.toISOString() : String(updated.cutoffTime)) : null,
      autoEndTime: updated.autoEndTime instanceof Date ? updated.autoEndTime.toISOString() : String(updated.autoEndTime),
      createdAt: updated.createdAt ? (updated.createdAt instanceof Date ? updated.createdAt.toISOString() : String(updated.createdAt)) : null,
    };"""
)

# 6. deleteEvent mapping
content = content.replace(
"""    const mapped = {
      ...deleted,
      dateAndTime: deleted.dateAndTime instanceof Date ? deleted.dateAndTime.toISOString() : String(deleted.dateAndTime),
      createdAt: deleted.createdAt ? (deleted.createdAt instanceof Date ? deleted.createdAt.toISOString() : String(deleted.createdAt)) : null,
    };""",
"""    const mapped = {
      ...deleted,
      startTime: deleted.startTime instanceof Date ? deleted.startTime.toISOString() : String(deleted.startTime),
      endTime: deleted.endTime ? (deleted.endTime instanceof Date ? deleted.endTime.toISOString() : String(deleted.endTime)) : null,
      cutoffTime: deleted.cutoffTime ? (deleted.cutoffTime instanceof Date ? deleted.cutoffTime.toISOString() : String(deleted.cutoffTime)) : null,
      autoEndTime: deleted.autoEndTime instanceof Date ? deleted.autoEndTime.toISOString() : String(deleted.autoEndTime),
      createdAt: deleted.createdAt ? (deleted.createdAt instanceof Date ? deleted.createdAt.toISOString() : String(deleted.createdAt)) : null,
    };"""
)

with open("server/routes/events.ts", "w", encoding="utf-8") as f:
    f.write(content)
