import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync("server/routes/users.ts", "utf-8");

content = content.replace(
`  joinedEvents: z.array(
    selectEventSchema.extend({
      createdAt: z.string().nullable(),
      dateAndTime: z.string(),
    })
  ),`,
`  joinedEvents: z.array(
    selectEventSchema.extend({
      createdAt: z.string().nullable(),
      startTime: z.string(),
      endTime: z.string().nullable().optional(),
      cutoffTime: z.string().nullable().optional(),
      autoEndTime: z.string(),
    })
  ),`
);

content = content.replace(
`      dateAndTime: eventsTable.dateAndTime,
      slots: eventsTable.slots,
      description: eventsTable.description,
      isPrivate: eventsTable.isPrivate,
      autoApprove: eventsTable.autoApprove,
      createdAt: eventsTable.createdAt,`,
`      startTime: eventsTable.startTime,
      endTime: eventsTable.endTime,
      cutoffTime: eventsTable.cutoffTime,
      autoEndTime: eventsTable.autoEndTime,
      slots: eventsTable.slots,
      description: eventsTable.description,
      isPrivate: eventsTable.isPrivate,
      autoApprove: eventsTable.autoApprove,
      createdAt: eventsTable.createdAt,`
);

content = content.replace(
`    .orderBy(desc(eventsTable.dateAndTime));`,
`    .orderBy(desc(eventsTable.startTime));`
);

content = content.replace(
`    joinedEvents: joinedEvents.map(e => ({
      ...e,
      dateAndTime: e.dateAndTime instanceof Date ? e.dateAndTime.toISOString() : String(e.dateAndTime),
      createdAt: e.createdAt ? (e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt)) : null,
    })),`,
`    joinedEvents: joinedEvents.map(e => ({
      ...e,
      startTime: e.startTime instanceof Date ? e.startTime.toISOString() : String(e.startTime),
      endTime: e.endTime ? (e.endTime instanceof Date ? e.endTime.toISOString() : String(e.endTime)) : null,
      cutoffTime: e.cutoffTime ? (e.cutoffTime instanceof Date ? e.cutoffTime.toISOString() : String(e.cutoffTime)) : null,
      autoEndTime: e.autoEndTime instanceof Date ? e.autoEndTime.toISOString() : String(e.autoEndTime),
      createdAt: e.createdAt ? (e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt)) : null,
    })),`
);

writeFileSync("server/routes/users.ts", content);
console.log("Done");
