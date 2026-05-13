import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, scheduleTable, showsTable, presentersTable } from "@workspace/db";
import {
  CreateScheduleSlotBody,
  UpdateScheduleSlotParams,
  UpdateScheduleSlotBody,
  UpdateScheduleSlotResponse,
  DeleteScheduleSlotParams,
  ListScheduleResponse,
  ListScheduleQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

router.get("/schedule", async (req, res): Promise<void> => {
  const query = ListScheduleQueryParams.safeParse(req.query);

  const rows = await db.select({
    id: scheduleTable.id,
    day: scheduleTable.day,
    startTime: scheduleTable.startTime,
    endTime: scheduleTable.endTime,
    showId: scheduleTable.showId,
    showTitle: showsTable.title,
    presenterName: presentersTable.name,
    isLive: scheduleTable.createdAt,
  })
    .from(scheduleTable)
    .leftJoin(showsTable, eq(scheduleTable.showId, showsTable.id))
    .leftJoin(presentersTable, eq(showsTable.presenterId, presentersTable.id));

  let result = rows.map(r => ({
    ...r,
    showTitle: r.showTitle ?? "Unknown Show",
    presenterName: r.presenterName ?? "Staff",
    isLive: false,
  }));

  if (query.success && query.data.day) {
    result = result.filter(r => r.day === query.data.day);
  }

  result.sort((a, b) => {
    const dayDiff = DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });

  res.json(ListScheduleResponse.parse(result));
});

router.post("/schedule", async (req, res): Promise<void> => {
  const parsed = CreateScheduleSlotBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(scheduleTable).values(parsed.data).returning();
  const full = await db.select({
    id: scheduleTable.id,
    day: scheduleTable.day,
    startTime: scheduleTable.startTime,
    endTime: scheduleTable.endTime,
    showId: scheduleTable.showId,
    showTitle: showsTable.title,
    presenterName: presentersTable.name,
    isLive: scheduleTable.createdAt,
  })
    .from(scheduleTable)
    .leftJoin(showsTable, eq(scheduleTable.showId, showsTable.id))
    .leftJoin(presentersTable, eq(showsTable.presenterId, presentersTable.id))
    .where(eq(scheduleTable.id, row.id));
  const slot = full[0];
  res.status(201).json({
    ...slot,
    showTitle: slot?.showTitle ?? "Unknown Show",
    presenterName: slot?.presenterName ?? "Staff",
    isLive: false,
  });
});

router.patch("/schedule/:id", async (req, res): Promise<void> => {
  const params = UpdateScheduleSlotParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateScheduleSlotBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(scheduleTable)
    .set(parsed.data)
    .where(eq(scheduleTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Schedule slot not found" });
    return;
  }
  const full = await db.select({
    id: scheduleTable.id,
    day: scheduleTable.day,
    startTime: scheduleTable.startTime,
    endTime: scheduleTable.endTime,
    showId: scheduleTable.showId,
    showTitle: showsTable.title,
    presenterName: presentersTable.name,
    isLive: scheduleTable.createdAt,
  })
    .from(scheduleTable)
    .leftJoin(showsTable, eq(scheduleTable.showId, showsTable.id))
    .leftJoin(presentersTable, eq(showsTable.presenterId, presentersTable.id))
    .where(eq(scheduleTable.id, row.id));
  const slot = full[0];
  res.json(UpdateScheduleSlotResponse.parse({
    ...slot,
    showTitle: slot?.showTitle ?? "Unknown Show",
    presenterName: slot?.presenterName ?? "Staff",
    isLive: false,
  }));
});

router.delete("/schedule/:id", async (req, res): Promise<void> => {
  const params = DeleteScheduleSlotParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(scheduleTable)
    .where(eq(scheduleTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Schedule slot not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
