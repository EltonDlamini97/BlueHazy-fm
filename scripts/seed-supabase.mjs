/**
 * Seed Supabase Postgres with BlueHazy FM demo content.
 * Usage: node scripts/seed-supabase.mjs [--force]
 * Requires: DATABASE_URL in repo root .env
 */
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
config({ path: path.join(repoRoot, ".env") });
config({ path: path.join(repoRoot, ".env.local"), override: true });

const force = process.argv.includes("--force");
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing. Add it to .env (see .env.example).");
  process.exit(1);
}

const useSsl =
  connectionString.includes("supabase.com") ||
  connectionString.includes("sslmode=require");

const storageBase =
  process.env.SUPABASE_URL && process.env.SUPABASE_STORAGE_BUCKET
    ? `${process.env.SUPABASE_URL.replace(/\/+$/, "")}/storage/v1/object/public/${process.env.SUPABASE_STORAGE_BUCKET}`
    : "https://jcujkjznziksxxgwirfb.supabase.co/storage/v1/object/public/bluehazy-fm";

const img = (file) => `${storageBase}/${file}`;

const pool = new pg.Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

async function count(table) {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
  return rows[0].n;
}

async function clearAll() {
  await pool.query("DELETE FROM schedule");
  await pool.query("DELETE FROM shows");
  await pool.query("DELETE FROM posts");
  await pool.query("DELETE FROM gallery");
  await pool.query("DELETE FROM presenters");
  await pool.query("ALTER SEQUENCE presenters_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE shows_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE posts_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE gallery_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE schedule_id_seq RESTART WITH 1");
}

async function insertPresenter(row) {
  const { rows } = await pool.query(
    `INSERT INTO presenters (name, role, bio, image_url, social_instagram, social_twitter, social_facebook)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name`,
    row,
  );
  return rows[0];
}

async function insertShow(row) {
  const { rows } = await pool.query(
    `INSERT INTO shows (title, description, category, image_url, presenter_id, is_featured)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, title`,
    row,
  );
  return rows[0];
}

async function insertPost(row) {
  const { rows } = await pool.query(
    `INSERT INTO posts (title, excerpt, content, category, tags, image_url, is_featured, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id, title`,
    row,
  );
  return rows[0];
}

async function insertGallery(row) {
  const { rows } = await pool.query(
    `INSERT INTO gallery (image_url, caption, category) VALUES ($1, $2, $3) RETURNING id`,
    row,
  );
  return rows[0];
}

async function insertSchedule(row) {
  await pool.query(
    `INSERT INTO schedule (day, start_time, end_time, show_id) VALUES ($1, $2, $3, $4)`,
    row,
  );
}

try {
  const existing = await count("shows");
  if (existing > 0 && !force) {
    console.log(`Database already has ${existing} show(s). Run with --force to replace, or use the app as-is.`);
    process.exit(0);
  }

  if (force && existing > 0) {
    console.log("Clearing existing data…");
    await clearAll();
  }

  console.log("Seeding presenters…");
  const p1 = await insertPresenter([
    "DJ Neon",
    "Lead Host",
    "The voice of BlueHazy FM. Neon brings energy, interviews, and the hottest tracks every weeknight.",
    img("presenter-1.png"),
    "@djneon",
    "@djneon",
    null,
  ]);
  const p2 = await insertPresenter([
    "Sarah Kim",
    "R&B & Soul",
    "Smooth selections and soulful vibes. Sarah curates the best R&B and Afrobeats for late listeners.",
    img("presenter-2.png"),
    "@sarahkim",
    null,
    null,
  ]);
  const p3 = await insertPresenter([
    "Marcus Cole",
    "Electronic",
    "Deep house, techno, and experimental sounds. Marcus takes you on a journey after midnight.",
    img("presenter-1.png"),
    null,
    "@marcuscole",
    null,
  ]);
  console.log(`  ✓ ${p1.name}, ${p2.name}, ${p3.name}`);

  console.log("Seeding shows…");
  const morning = await insertShow([
    "Morning Rush",
    "Start your day with upbeat hits, traffic updates, and community shout-outs.",
    "Pop",
    img("show-1.png"),
    p1.id,
    true,
  ]);
  const evening = await insertShow([
    "Evening Vibes",
    "Wind down with smooth R&B, Afrobeats and soulful sounds as the sun sets.",
    "R&B",
    img("show-1.png"),
    p2.id,
    true,
  ]);
  const lateNight = await insertShow([
    "Late Night Frequencies",
    "Deep house, electronic and ambient sounds for the night owls.",
    "Electronic",
    img("show-2.png"),
    p3.id,
    true,
  ]);
  const weekend = await insertShow([
    "Weekend Takeover",
    "The biggest hits and hottest mixes every weekend. Non-stop energy.",
    "Hip-Hop",
    img("gallery-2.png"),
    p1.id,
    false,
  ]);
  console.log(`  ✓ ${morning.title}, ${evening.title}, ${lateNight.title}, ${weekend.title}`);

  console.log("Seeding posts…");
  const posts = [
    [
      "BlueHazy FM Launches 24/7 Stream",
      "We're live around the clock on Zeno.fm — tune in anytime, anywhere.",
      "BlueHazy FM is proud to launch our 24/7 live stream. Whether you're at home, in the car, or on the move, our DJs and community voices are with you. Bookmark the Live page and hit play to join the city’s pulse.",
      "Station News",
      "launch,stream",
      img("news-1.png"),
      true,
    ],
    [
      "Top 10 Afrobeats Tracks of the Year",
      "Our DJs compiled the definitive list of Afrobeats bangers that dominated the airwaves.",
      "From Lagos to London, Afrobeats has taken the world by storm. Our team spent weeks reviewing thousands of tracks to bring you the essential top 10 list for the year.",
      "Music",
      "afrobeats,charts",
      img("news-3.png"),
      true,
    ],
    [
      "New Studio Upgrade: BlueHazy FM Goes HD",
      "State-of-the-art broadcasting equipment for crystal-clear sound.",
      "We've invested in new mixing consoles, acoustic treatment, and redundant streaming so listeners get the clearest sound across every platform.",
      "Station News",
      "studio,hd",
      img("studio-bg.png"),
      true,
    ],
    [
      "Community Open Mic Night — This Friday",
      "Local artists take the mic live in our studio. Sign up on the Contact page.",
      "Our monthly open mic returns this Friday. Musicians, poets, and storytellers welcome — limited slots, first come first served.",
      "Community",
      "events,open-mic",
      img("news-2.png"),
      false,
    ],
  ];
  for (const row of posts) {
    const r = await insertPost(row);
    console.log(`  ✓ ${r.title}`);
  }

  console.log("Seeding gallery…");
  for (const [file, caption, category] of [
    ["gallery-1.png", "Studio session with guest artists", "Studio"],
    ["gallery-2.png", "Live broadcast night", "Events"],
    ["show-1.png", "On air with DJ Neon", "Shows"],
  ]) {
    await insertGallery([img(file), caption, category]);
    console.log(`  ✓ ${caption}`);
  }

  console.log("Seeding schedule…");
  const showMap = {
    "Morning Rush": morning.id,
    "Evening Vibes": evening.id,
    "Late Night Frequencies": lateNight.id,
    "Weekend Takeover": weekend.id,
  };
  const slots = [
    ["Monday", "06:00", "09:00", "Morning Rush"],
    ["Monday", "18:00", "21:00", "Evening Vibes"],
    ["Monday", "22:00", "01:00", "Late Night Frequencies"],
    ["Tuesday", "06:00", "09:00", "Morning Rush"],
    ["Tuesday", "18:00", "21:00", "Evening Vibes"],
    ["Wednesday", "06:00", "09:00", "Morning Rush"],
    ["Wednesday", "22:00", "01:00", "Late Night Frequencies"],
    ["Friday", "18:00", "21:00", "Evening Vibes"],
    ["Saturday", "12:00", "16:00", "Weekend Takeover"],
    ["Sunday", "12:00", "16:00", "Weekend Takeover"],
  ];
  for (const [day, start, end, title] of slots) {
    const showId = showMap[title];
    if (!showId) continue;
    await insertSchedule([day, start, end, showId]);
    console.log(`  ✓ ${day} ${start}-${end}`);
  }

  console.log("\n✅ Supabase seed complete!");
} catch (err) {
  console.error("Seed failed:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
