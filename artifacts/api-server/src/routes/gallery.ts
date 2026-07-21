import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, galleryTable } from "@workspace/db";
import {
  CreateGalleryItemBody,
  DeleteGalleryItemParams,
  UpdateGalleryItemParams,
  UpdateGalleryItemBody,
  UpdateGalleryItemResponse,
  ListGalleryResponse,
  ListGalleryQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/gallery", async (req, res): Promise<void> => {
  const query = ListGalleryQueryParams.safeParse(req.query);
  let rows = await db.select().from(galleryTable).orderBy(desc(galleryTable.createdAt));

  if (query.success && query.data.category) {
    rows = rows.filter(r => r.category === query.data.category);
  }

  res.json(ListGalleryResponse.parse(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() }))));
});

router.post("/gallery", async (req, res): Promise<void> => {
  const parsed = CreateGalleryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(galleryTable).values(parsed.data).returning();
  res.status(201).json({ ...row, createdAt: row.createdAt.toISOString() });
});

router.delete("/gallery/:id", async (req, res): Promise<void> => {
  const params = DeleteGalleryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(galleryTable)
    .where(eq(galleryTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Gallery item not found" });
    return;
  }
  res.sendStatus(204);
});

router.patch("/gallery/:id", async (req, res): Promise<void> => {
  const params = UpdateGalleryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateGalleryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(galleryTable)
    .set(parsed.data)
    .where(eq(galleryTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Gallery item not found" });
    return;
  }
  res.json(UpdateGalleryItemResponse.parse({ ...row, createdAt: row.createdAt.toISOString() }));
});

export default router;
