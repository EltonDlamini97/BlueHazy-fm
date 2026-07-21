import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, desc, count } from "drizzle-orm";
import {
  pgTable, text, serial, timestamp, integer, boolean,
} from "drizzle-orm/pg-core";

// ── Schema (inline to avoid workspace import issues) ─────────────────────────

const presentersTable = pgTable("presenters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio").notNull(),
  imageUrl: text("image_url"),
  socialInstagram: text("social_instagram"),
  socialTwitter: text("social_twitter"),
  socialFacebook: text("social_facebook"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

const showsTable = pgTable("shows", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  presenterId: integer("presenter_id"),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  tags: text("tags"),
  imageUrl: text("image_url"),
  isFeatured: boolean("is_featured").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

const galleryTable = pgTable("gallery", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

const scheduleTable = pgTable("schedule", {
  id: serial("id").primaryKey(),
  day: text("day").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  showId: integer("show_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

const newsletterTable = pgTable("newsletter", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).notNull().defaultNow(),
});

const contactTable = pgTable("contact", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  phone: text("phone"),
  inquiryType: text("inquiry_type"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── DB connection ─────────────────────────────────────────────────────────────

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// ── Helpers ───────────────────────────────────────────────────────────────────

const DAYS_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function ts(d: Date | null) { return d ? d.toISOString() : null; }

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

function parseId(s: string | undefined) {
  const n = Number(s);
  return isNaN(n) ? null : n;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req: Request) {
  const url = new URL(req.url);
  // Strip /.netlify/functions/api prefix
  const path = url.pathname.replace(/^\/.netlify\/functions\/api/, "") || "/";
  const method = req.method.toUpperCase();

  // CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE", "Access-Control-Allow-Headers": "Content-Type" } });
  }

  try {
    // ── Health ──────────────────────────────────────────────────────────────
    if (path === "/healthz" && method === "GET") {
      return json(200, { status: "ok" });
    }

    // ── Shows ───────────────────────────────────────────────────────────────
    if (path === "/shows" && method === "GET") {
      const featured = url.searchParams.get("featured");
      const rows = await db.select({
        id: showsTable.id, title: showsTable.title, description: showsTable.description,
        category: showsTable.category, imageUrl: showsTable.imageUrl,
        presenterId: showsTable.presenterId, presenterName: presentersTable.name,
        isFeatured: showsTable.isFeatured, createdAt: showsTable.createdAt,
      }).from(showsTable).leftJoin(presentersTable, eq(showsTable.presenterId, presentersTable.id)).orderBy(desc(showsTable.createdAt));
      const result = featured !== null ? rows.filter(r => r.isFeatured === (featured === "true")) : rows;
      return json(200, result.map(r => ({ ...r, createdAt: ts(r.createdAt)! })));
    }

    if (path === "/shows" && method === "POST") {
      const body = await req.json();
      const [row] = await db.insert(showsTable).values(body).returning();
      const [full] = await db.select({ id: showsTable.id, title: showsTable.title, description: showsTable.description, category: showsTable.category, imageUrl: showsTable.imageUrl, presenterId: showsTable.presenterId, presenterName: presentersTable.name, isFeatured: showsTable.isFeatured, createdAt: showsTable.createdAt }).from(showsTable).leftJoin(presentersTable, eq(showsTable.presenterId, presentersTable.id)).where(eq(showsTable.id, row.id));
      return json(201, { ...full, createdAt: ts(full.createdAt)! });
    }

    const showMatch = path.match(/^\/shows\/(\d+)$/);
    if (showMatch) {
      const id = Number(showMatch[1]);
      if (method === "GET") {
        const [row] = await db.select({ id: showsTable.id, title: showsTable.title, description: showsTable.description, category: showsTable.category, imageUrl: showsTable.imageUrl, presenterId: showsTable.presenterId, presenterName: presentersTable.name, isFeatured: showsTable.isFeatured, createdAt: showsTable.createdAt }).from(showsTable).leftJoin(presentersTable, eq(showsTable.presenterId, presentersTable.id)).where(eq(showsTable.id, id));
        if (!row) return json(404, { error: "Not found" });
        return json(200, { ...row, createdAt: ts(row.createdAt)! });
      }
      if (method === "PATCH") {
        const body = await req.json();
        const [row] = await db.update(showsTable).set(body).where(eq(showsTable.id, id)).returning();
        if (!row) return json(404, { error: "Not found" });
        const [full] = await db.select({ id: showsTable.id, title: showsTable.title, description: showsTable.description, category: showsTable.category, imageUrl: showsTable.imageUrl, presenterId: showsTable.presenterId, presenterName: presentersTable.name, isFeatured: showsTable.isFeatured, createdAt: showsTable.createdAt }).from(showsTable).leftJoin(presentersTable, eq(showsTable.presenterId, presentersTable.id)).where(eq(showsTable.id, id));
        return json(200, { ...full, createdAt: ts(full.createdAt)! });
      }
      if (method === "DELETE") {
        const [row] = await db.delete(showsTable).where(eq(showsTable.id, id)).returning();
        if (!row) return json(404, { error: "Not found" });
        return new Response(null, { status: 204 });
      }
    }

    // ── Presenters ──────────────────────────────────────────────────────────
    if (path === "/presenters" && method === "GET") {
      const rows = await db.select().from(presentersTable).orderBy(presentersTable.createdAt);
      return json(200, rows.map(r => ({ ...r, createdAt: ts(r.createdAt)! })));
    }
    if (path === "/presenters" && method === "POST") {
      const body = await req.json();
      const [row] = await db.insert(presentersTable).values(body).returning();
      return json(201, { ...row, createdAt: ts(row.createdAt)! });
    }
    const presenterMatch = path.match(/^\/presenters\/(\d+)$/);
    if (presenterMatch) {
      const id = Number(presenterMatch[1]);
      if (method === "PATCH") {
        const body = await req.json();
        const [row] = await db.update(presentersTable).set(body).where(eq(presentersTable.id, id)).returning();
        if (!row) return json(404, { error: "Not found" });
        return json(200, { ...row, createdAt: ts(row.createdAt)! });
      }
      if (method === "DELETE") {
        const [row] = await db.delete(presentersTable).where(eq(presentersTable.id, id)).returning();
        if (!row) return json(404, { error: "Not found" });
        return new Response(null, { status: 204 });
      }
    }

    // ── Posts ───────────────────────────────────────────────────────────────
    if (path === "/posts" && method === "GET") {
      const featured = url.searchParams.get("featured");
      const category = url.searchParams.get("category");
      const limit = url.searchParams.get("limit");
      let rows = await db.select().from(postsTable).orderBy(desc(postsTable.createdAt));
      if (featured !== null) rows = rows.filter(r => r.isFeatured === (featured === "true"));
      if (category) rows = rows.filter(r => r.category === category);
      if (limit) rows = rows.slice(0, Number(limit));
      return json(200, rows.map(r => ({ ...r, createdAt: ts(r.createdAt)!, publishedAt: ts(r.publishedAt) })));
    }
    if (path === "/posts" && method === "POST") {
      const body = await req.json();
      const [row] = await db.insert(postsTable).values(body).returning();
      return json(201, { ...row, createdAt: ts(row.createdAt)!, publishedAt: ts(row.publishedAt) });
    }
    const postMatch = path.match(/^\/posts\/(\d+)$/);
    if (postMatch) {
      const id = Number(postMatch[1]);
      if (method === "GET") {
        const [row] = await db.select().from(postsTable).where(eq(postsTable.id, id));
        if (!row) return json(404, { error: "Not found" });
        return json(200, { ...row, createdAt: ts(row.createdAt)!, publishedAt: ts(row.publishedAt) });
      }
      if (method === "PATCH") {
        const body = await req.json();
        const [row] = await db.update(postsTable).set(body).where(eq(postsTable.id, id)).returning();
        if (!row) return json(404, { error: "Not found" });
        return json(200, { ...row, createdAt: ts(row.createdAt)!, publishedAt: ts(row.publishedAt) });
      }
      if (method === "DELETE") {
        const [row] = await db.delete(postsTable).where(eq(postsTable.id, id)).returning();
        if (!row) return json(404, { error: "Not found" });
        return new Response(null, { status: 204 });
      }
    }

    // ── Gallery ─────────────────────────────────────────────────────────────
    if (path === "/gallery" && method === "GET") {
      const category = url.searchParams.get("category");
      let rows = await db.select().from(galleryTable).orderBy(desc(galleryTable.createdAt));
      if (category) rows = rows.filter(r => r.category === category);
      return json(200, rows.map(r => ({ ...r, createdAt: ts(r.createdAt)! })));
    }
    if (path === "/gallery" && method === "POST") {
      const body = await req.json();
      const [row] = await db.insert(galleryTable).values(body).returning();
      return json(201, { ...row, createdAt: ts(row.createdAt)! });
    }
    const galleryMatch = path.match(/^\/gallery\/(\d+)$/);
    if (galleryMatch) {
      const id = Number(galleryMatch[1]);
      if (method === "PATCH") {
        const body = await req.json();
        const [row] = await db.update(galleryTable).set(body).where(eq(galleryTable.id, id)).returning();
        if (!row) return json(404, { error: "Not found" });
        return json(200, { ...row, createdAt: ts(row.createdAt)! });
      }
      if (method === "DELETE") {
        const [row] = await db.delete(galleryTable).where(eq(galleryTable.id, id)).returning();
        if (!row) return json(404, { error: "Not found" });
        return new Response(null, { status: 204 });
      }
    }

    // ── Schedule ────────────────────────────────────────────────────────────
    if (path === "/schedule" && method === "GET") {
      const day = url.searchParams.get("day");
      const rows = await db.select({ id: scheduleTable.id, day: scheduleTable.day, startTime: scheduleTable.startTime, endTime: scheduleTable.endTime, showId: scheduleTable.showId, showTitle: showsTable.title, presenterName: presentersTable.name }).from(scheduleTable).leftJoin(showsTable, eq(scheduleTable.showId, showsTable.id)).leftJoin(presentersTable, eq(showsTable.presenterId, presentersTable.id));
      let result = rows.map(r => ({ ...r, showTitle: r.showTitle ?? "Unknown", presenterName: r.presenterName ?? "Staff", isLive: false }));
      if (day) result = result.filter(r => r.day === day);
      result.sort((a, b) => { const d = DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day); return d !== 0 ? d : a.startTime.localeCompare(b.startTime); });
      return json(200, result);
    }
    if (path === "/schedule" && method === "POST") {
      const body = await req.json();
      const [row] = await db.insert(scheduleTable).values(body).returning();
      const [full] = await db.select({ id: scheduleTable.id, day: scheduleTable.day, startTime: scheduleTable.startTime, endTime: scheduleTable.endTime, showId: scheduleTable.showId, showTitle: showsTable.title, presenterName: presentersTable.name }).from(scheduleTable).leftJoin(showsTable, eq(scheduleTable.showId, showsTable.id)).leftJoin(presentersTable, eq(showsTable.presenterId, presentersTable.id)).where(eq(scheduleTable.id, row.id));
      return json(201, { ...full, showTitle: full?.showTitle ?? "Unknown", presenterName: full?.presenterName ?? "Staff", isLive: false });
    }
    const scheduleMatch = path.match(/^\/schedule\/(\d+)$/);
    if (scheduleMatch) {
      const id = Number(scheduleMatch[1]);
      if (method === "PATCH") {
        const body = await req.json();
        const [row] = await db.update(scheduleTable).set(body).where(eq(scheduleTable.id, id)).returning();
        if (!row) return json(404, { error: "Not found" });
        const [full] = await db.select({ id: scheduleTable.id, day: scheduleTable.day, startTime: scheduleTable.startTime, endTime: scheduleTable.endTime, showId: scheduleTable.showId, showTitle: showsTable.title, presenterName: presentersTable.name }).from(scheduleTable).leftJoin(showsTable, eq(scheduleTable.showId, showsTable.id)).leftJoin(presentersTable, eq(showsTable.presenterId, presentersTable.id)).where(eq(scheduleTable.id, id));
        return json(200, { ...full, showTitle: full?.showTitle ?? "Unknown", presenterName: full?.presenterName ?? "Staff", isLive: false });
      }
      if (method === "DELETE") {
        const [row] = await db.delete(scheduleTable).where(eq(scheduleTable.id, id)).returning();
        if (!row) return json(404, { error: "Not found" });
        return new Response(null, { status: 204 });
      }
    }

    // ── Contact ─────────────────────────────────────────────────────────────
    if (path === "/contact" && method === "GET") {
      const rows = await db.select().from(contactTable).orderBy(desc(contactTable.createdAt));
      return json(200, rows.map(r => ({ ...r, createdAt: ts(r.createdAt)! })));
    }
    if (path === "/contact" && method === "POST") {
      const body = await req.json();
      const [row] = await db.insert(contactTable).values(body).returning();
      return json(201, { ...row, createdAt: ts(row.createdAt)! });
    }

    // ── Newsletter ──────────────────────────────────────────────────────────
    if (path === "/newsletter" && method === "GET") {
      const rows = await db.select().from(newsletterTable).orderBy(newsletterTable.subscribedAt);
      return json(200, rows.map(r => ({ ...r, subscribedAt: ts(r.subscribedAt)! })));
    }
    if (path === "/newsletter" && method === "POST") {
      const body = await req.json();
      try {
        const [row] = await db.insert(newsletterTable).values(body).returning();
        return json(201, { ...row, subscribedAt: ts(row.subscribedAt)! });
      } catch {
        return json(409, { error: "Email already subscribed" });
      }
    }

    // ── Stats ───────────────────────────────────────────────────────────────
    if (path === "/stats" && method === "GET") {
      const [[shows], [presenters], [posts], [gallery], [newsletter], [contact], [featShows], [featPosts]] = await Promise.all([
        db.select({ count: count() }).from(showsTable),
        db.select({ count: count() }).from(presentersTable),
        db.select({ count: count() }).from(postsTable),
        db.select({ count: count() }).from(galleryTable),
        db.select({ count: count() }).from(newsletterTable),
        db.select({ count: count() }).from(contactTable),
        db.select({ count: count() }).from(showsTable).where(eq(showsTable.isFeatured, true)),
        db.select({ count: count() }).from(postsTable).where(eq(postsTable.isFeatured, true)),
      ]);
      return json(200, { totalShows: shows.count, totalPresenters: presenters.count, totalPosts: posts.count, totalGalleryItems: gallery.count, totalSubscribers: newsletter.count, totalInquiries: contact.count, featuredShows: featShows.count, featuredPosts: featPosts.count });
    }

    return json(404, { error: "Not found" });
  } catch (err) {
    console.error(err);
    return json(500, { error: "Internal server error" });
  }
}
