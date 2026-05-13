import { Router, type IRouter } from "express";
import { db, newsletterTable } from "@workspace/db";
import {
  SubscribeNewsletterBody,
  ListNewsletterSubscribersResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/newsletter", async (_req, res): Promise<void> => {
  const rows = await db.select().from(newsletterTable).orderBy(newsletterTable.subscribedAt);
  res.json(ListNewsletterSubscribersResponse.parse(rows.map(r => ({ ...r, subscribedAt: r.subscribedAt.toISOString() }))));
});

router.post("/newsletter", async (req, res): Promise<void> => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [row] = await db.insert(newsletterTable).values(parsed.data).returning();
    res.status(201).json({ ...row, subscribedAt: row.subscribedAt.toISOString() });
  } catch {
    res.status(409).json({ error: "Email already subscribed" });
  }
});

export default router;
