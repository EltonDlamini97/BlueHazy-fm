import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, showsTable, presentersTable } from "@workspace/db";
import {
  CreateShowBody,
  GetShowParams,
  GetShowResponse,
  UpdateShowParams,
  UpdateShowBody,
  UpdateShowResponse,
  DeleteShowParams,
  ListShowsResponse,
  ListShowsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/shows", async (req, res): Promise<void> => {
  const query = ListShowsQueryParams.safeParse(req.query);
  const rows = await db.select({
    id: showsTable.id,
    title: showsTable.title,
    description: showsTable.description,
    category: showsTable.category,
    imageUrl: showsTable.imageUrl,
    presenterId: showsTable.presenterId,
    presenterName: presentersTable.name,
    isFeatured: showsTable.isFeatured,
    createdAt: showsTable.createdAt,
  })
    .from(showsTable)
    .leftJoin(presentersTable, eq(showsTable.presenterId, presentersTable.id))
    .orderBy(desc(showsTable.createdAt));

  let result = rows;
  if (query.success && query.data.featured !== undefined) {
    result = rows.filter(r => r.isFeatured === query.data.featured);
  }

  res.json(ListShowsResponse.parse(result.map(r => ({ ...r, createdAt: r.createdAt.toISOString() }))));
});

router.post("/shows", async (req, res): Promise<void> => {
  const parsed = CreateShowBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(showsTable).values(parsed.data).returning();
  const full = await db.select({
    id: showsTable.id,
    title: showsTable.title,
    description: showsTable.description,
    category: showsTable.category,
    imageUrl: showsTable.imageUrl,
    presenterId: showsTable.presenterId,
    presenterName: presentersTable.name,
    isFeatured: showsTable.isFeatured,
    createdAt: showsTable.createdAt,
  })
    .from(showsTable)
    .leftJoin(presentersTable, eq(showsTable.presenterId, presentersTable.id))
    .where(eq(showsTable.id, row.id));
  const s = full[0];
  res.status(201).json(GetShowResponse.parse({ ...s, createdAt: s.createdAt.toISOString() }));
});

router.get("/shows/:id", async (req, res): Promise<void> => {
  const params = GetShowParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = await db.select({
    id: showsTable.id,
    title: showsTable.title,
    description: showsTable.description,
    category: showsTable.category,
    imageUrl: showsTable.imageUrl,
    presenterId: showsTable.presenterId,
    presenterName: presentersTable.name,
    isFeatured: showsTable.isFeatured,
    createdAt: showsTable.createdAt,
  })
    .from(showsTable)
    .leftJoin(presentersTable, eq(showsTable.presenterId, presentersTable.id))
    .where(eq(showsTable.id, params.data.id));
  if (!rows[0]) {
    res.status(404).json({ error: "Show not found" });
    return;
  }
  const s = rows[0];
  res.json(GetShowResponse.parse({ ...s, createdAt: s.createdAt.toISOString() }));
});

router.patch("/shows/:id", async (req, res): Promise<void> => {
  const params = UpdateShowParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateShowBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(showsTable)
    .set(parsed.data)
    .where(eq(showsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Show not found" });
    return;
  }
  const full = await db.select({
    id: showsTable.id,
    title: showsTable.title,
    description: showsTable.description,
    category: showsTable.category,
    imageUrl: showsTable.imageUrl,
    presenterId: showsTable.presenterId,
    presenterName: presentersTable.name,
    isFeatured: showsTable.isFeatured,
    createdAt: showsTable.createdAt,
  })
    .from(showsTable)
    .leftJoin(presentersTable, eq(showsTable.presenterId, presentersTable.id))
    .where(eq(showsTable.id, row.id));
  const su = full[0];
  res.json(UpdateShowResponse.parse({ ...su, createdAt: su.createdAt.toISOString() }));
});

router.delete("/shows/:id", async (req, res): Promise<void> => {
  const params = DeleteShowParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(showsTable)
    .where(eq(showsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Show not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
