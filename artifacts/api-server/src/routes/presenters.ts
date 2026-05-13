import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, presentersTable } from "@workspace/db";
import {
  CreatePresenterBody,
  UpdatePresenterParams,
  UpdatePresenterBody,
  UpdatePresenterResponse,
  DeletePresenterParams,
  ListPresentersResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/presenters", async (_req, res): Promise<void> => {
  const rows = await db.select().from(presentersTable).orderBy(presentersTable.createdAt);
  res.json(ListPresentersResponse.parse(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() }))));
});

router.post("/presenters", async (req, res): Promise<void> => {
  const parsed = CreatePresenterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(presentersTable).values(parsed.data).returning();
  res.status(201).json({ ...row, createdAt: row.createdAt.toISOString() });
});

router.patch("/presenters/:id", async (req, res): Promise<void> => {
  const params = UpdatePresenterParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePresenterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(presentersTable)
    .set(parsed.data)
    .where(eq(presentersTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Presenter not found" });
    return;
  }
  res.json(UpdatePresenterResponse.parse({ ...row, createdAt: row.createdAt.toISOString() }));
});

router.delete("/presenters/:id", async (req, res): Promise<void> => {
  const params = DeletePresenterParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(presentersTable)
    .where(eq(presentersTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Presenter not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
