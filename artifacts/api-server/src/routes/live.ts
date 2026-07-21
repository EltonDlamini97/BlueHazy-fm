import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, scheduleTable, showsTable, presentersTable } from "@workspace/db";
import { getCurrentScheduleSlot } from "../lib/schedule-live";
import { fetchZenoMetadata } from "../lib/zeno-metadata";

const router: IRouter = Router();

router.get("/live/now-playing", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: scheduleTable.id,
      day: scheduleTable.day,
      startTime: scheduleTable.startTime,
      endTime: scheduleTable.endTime,
      showId: scheduleTable.showId,
      showTitle: showsTable.title,
      presenterName: presentersTable.name,
      imageUrl: showsTable.imageUrl,
    })
    .from(scheduleTable)
    .leftJoin(showsTable, eq(scheduleTable.showId, showsTable.id))
    .leftJoin(presentersTable, eq(showsTable.presenterId, presentersTable.id));

  const slots = rows.map((r) => ({
    ...r,
    showTitle: r.showTitle ?? null,
    presenterName: r.presenterName ?? null,
  }));

  const current = getCurrentScheduleSlot(slots);
  const meta = await fetchZenoMetadata();

  const showTitle = current?.showTitle ?? null;
  const presenterName = current?.presenterName ?? null;

  const showLine =
    showTitle && presenterName
      ? `${showTitle} · with ${presenterName}`
      : showTitle ?? (presenterName ? `with ${presenterName}` : null);

  let displaySubtitle: string;
  if (meta.trackTitle && showLine) {
    displaySubtitle = meta.trackArtist
      ? `${meta.trackArtist} · ${showLine}`
      : showLine;
  } else if (meta.trackArtist) {
    displaySubtitle = meta.trackArtist;
  } else if (showLine) {
    displaySubtitle = showLine;
  } else {
    displaySubtitle = "Live on Zeno.fm";
  }

  res.json({
    showTitle,
    presenterName,
    showImageUrl: current?.imageUrl ?? null,
    trackTitle: meta.trackTitle,
    trackArtist: meta.trackArtist,
    isScheduledShow: Boolean(current),
    displayTitle: meta.trackTitle ?? showTitle ?? "BlueHazy FM",
    displaySubtitle,
  });
});

export default router;
