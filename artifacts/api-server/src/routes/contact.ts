import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, contactTable } from "@workspace/db";
import {
  SubmitContactBody,
  ListContactInquiriesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/contact", async (_req, res): Promise<void> => {
  const rows = await db.select().from(contactTable).orderBy(desc(contactTable.createdAt));
  res.json(ListContactInquiriesResponse.parse(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() }))));
});

router.post("/contact", async (req, res): Promise<void> => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(contactTable).values(parsed.data).returning();
  res.status(201).json({ ...row, createdAt: row.createdAt.toISOString() });
});

export default router;
