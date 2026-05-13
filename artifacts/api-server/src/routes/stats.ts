import { Router, type IRouter } from "express";
import { count } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db, showsTable, presentersTable, postsTable, galleryTable, newsletterTable, contactTable } from "@workspace/db";
import { GetStationStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const [
    [showsCount],
    [presentersCount],
    [postsCount],
    [galleryCount],
    [newsletterCount],
    [contactCount],
    [featuredShows],
    [featuredPosts],
  ] = await Promise.all([
    db.select({ count: count() }).from(showsTable),
    db.select({ count: count() }).from(presentersTable),
    db.select({ count: count() }).from(postsTable),
    db.select({ count: count() }).from(galleryTable),
    db.select({ count: count() }).from(newsletterTable),
    db.select({ count: count() }).from(contactTable),
    db.select({ count: count() }).from(showsTable).where(eq(showsTable.isFeatured, true)),
    db.select({ count: count() }).from(postsTable).where(eq(postsTable.isFeatured, true)),
  ]);

  res.json(GetStationStatsResponse.parse({
    totalShows: showsCount.count,
    totalPresenters: presentersCount.count,
    totalPosts: postsCount.count,
    totalGalleryItems: galleryCount.count,
    totalSubscribers: newsletterCount.count,
    totalInquiries: contactCount.count,
    featuredShows: featuredShows.count,
    featuredPosts: featuredPosts.count,
  }));
});

export default router;
