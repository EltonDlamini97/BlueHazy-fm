import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, postsTable } from "@workspace/db";
import {
  CreatePostBody,
  GetPostParams,
  GetPostResponse,
  UpdatePostParams,
  UpdatePostBody,
  UpdatePostResponse,
  DeletePostParams,
  ListPostsResponse,
  ListPostsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/posts", async (req, res): Promise<void> => {
  const query = ListPostsQueryParams.safeParse(req.query);
  let rows = await db.select().from(postsTable).orderBy(desc(postsTable.createdAt));

  if (query.success) {
    if (query.data.featured !== undefined) {
      rows = rows.filter(r => r.isFeatured === query.data.featured);
    }
    if (query.data.category) {
      rows = rows.filter(r => r.category === query.data.category);
    }
    if (query.data.limit) {
      rows = rows.slice(0, query.data.limit);
    }
  }

  res.json(ListPostsResponse.parse(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString(), publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null }))));
});

router.post("/posts", async (req, res): Promise<void> => {
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(postsTable).values(parsed.data).returning();
  res.status(201).json(GetPostResponse.parse({ ...row, createdAt: row.createdAt.toISOString(), publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null }));
});

router.get("/posts/:id", async (req, res): Promise<void> => {
  const params = GetPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(postsTable).where(eq(postsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(GetPostResponse.parse({ ...row, createdAt: row.createdAt.toISOString(), publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null }));
});

router.patch("/posts/:id", async (req, res): Promise<void> => {
  const params = UpdatePostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(postsTable)
    .set(parsed.data)
    .where(eq(postsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(UpdatePostResponse.parse({ ...row, createdAt: row.createdAt.toISOString(), publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null }));
});

router.delete("/posts/:id", async (req, res): Promise<void> => {
  const params = DeletePostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(postsTable)
    .where(eq(postsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
