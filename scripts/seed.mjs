// Seed script — run with: node scripts/seed.mjs
const BASE = "http://localhost:8080/api";

async function patch(url, body) {
  const r = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}
async function post(url, body) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}
async function get(url) {
  const r = await fetch(url);
  return r.json();
}

// ── Mark existing show as featured ──────────────────────────────────────────
await patch(`${BASE}/shows/1`, { isFeatured: true });
console.log("✓ Show 1 marked as featured");

// ── Add more shows ───────────────────────────────────────────────────────────
const newShows = [
  { title: "Evening Vibes", description: "Wind down with smooth R&B, Afrobeats and soulful sounds as the sun sets.", category: "R&B", imageUrl: "https://jcujkjznziksxxgwirfb.supabase.co/storage/v1/object/public/bluehazy-fm/show-1.png", presenterId: 2, isFeatured: true },
  { title: "Late Night Frequencies", description: "Deep house, electronic and ambient sounds for the night owls.", category: "Electronic", imageUrl: "https://jcujkjznziksxxgwirfb.supabase.co/storage/v1/object/public/bluehazy-fm/show-2.png", presenterId: 3, isFeatured: true },
  { title: "Weekend Takeover", description: "The biggest hits and hottest mixes every weekend. Non-stop energy.", category: "Hip-Hop", imageUrl: "https://jcujkjznziksxxgwirfb.supabase.co/storage/v1/object/public/bluehazy-fm/gallery-2.png", presenterId: 1, isFeatured: false },
];
for (const s of newShows) {
  const r = await post(`${BASE}/shows`, s);
  console.log(`✓ Show created: ${r.title}`);
}

// ── Mark existing posts as featured + add images ─────────────────────────────
await patch(`${BASE}/posts/2`, { isFeatured: true, imageUrl: "https://jcujkjznziksxxgwirfb.supabase.co/storage/v1/object/public/bluehazy-fm/news-1.png" });
await patch(`${BASE}/posts/3`, { isFeatured: true, imageUrl: "https://jcujkjznziksxxgwirfb.supabase.co/storage/v1/object/public/bluehazy-fm/news-2.png" });
console.log("✓ Posts marked as featured");

// ── Add more posts ────────────────────────────────────────────────────────────
const newPosts = [
  {
    title: "Top 10 Afrobeats Tracks of the Year",
    excerpt: "Our DJs have compiled the definitive list of Afrobeats bangers that dominated the airwaves this year.",
    content: "From Lagos to London, Afrobeats has taken the world by storm. Our team of DJs and music analysts spent weeks reviewing thousands of tracks to bring you the definitive top 10 list. These songs dominated our request lines, trended on social media, and filled dance floors across the globe. Whether you're a longtime fan or just discovering the genre, this list is your essential guide to the sound of the year.",
    category: "Music",
    imageUrl: "https://jcujkjznziksxxgwirfb.supabase.co/storage/v1/object/public/bluehazy-fm/news-3.png",
    isFeatured: true,
  },
  {
    title: "New Studio Upgrade: BlueHazy FM Goes HD",
    excerpt: "We've invested in state-of-the-art broadcasting equipment to bring you the clearest sound yet.",
    content: "BlueHazy FM is proud to announce a major studio upgrade. Our new HD broadcasting equipment delivers crystal-clear audio quality across all platforms. The upgrade includes new mixing consoles, acoustic treatment panels, and a redundant streaming infrastructure to ensure zero downtime. Listeners can expect an even richer listening experience starting this month.",
    category: "Station News",
    imageUrl: "https://jcujkjznziksxxgwirfb.supabase.co/storage/v1/object/public/bluehazy-fm/studio-bg.png",
    isFeatured: false,
  },
];
for (const p of newPosts) {
  const r = await post(`${BASE}/posts`, p);
  console.log(`✓ Post created: ${r.title}`);
}

// ── Add schedule slots ────────────────────────────────────────────────────────
const shows = await get(`${BASE}/shows`);
const showMap = Object.fromEntries(shows.map(s => [s.title, s.id]));

const slots = [
  { day: "Monday", startTime: "06:00", endTime: "09:00", showId: showMap["Morning Rush"] },
  { day: "Monday", startTime: "18:00", endTime: "21:00", showId: showMap["Evening Vibes"] },
  { day: "Monday", startTime: "22:00", endTime: "01:00", showId: showMap["Late Night Frequencies"] },
  { day: "Tuesday", startTime: "06:00", endTime: "09:00", showId: showMap["Morning Rush"] },
  { day: "Tuesday", startTime: "18:00", endTime: "21:00", showId: showMap["Evening Vibes"] },
  { day: "Wednesday", startTime: "06:00", endTime: "09:00", showId: showMap["Morning Rush"] },
  { day: "Wednesday", startTime: "22:00", endTime: "01:00", showId: showMap["Late Night Frequencies"] },
  { day: "Friday", startTime: "18:00", endTime: "21:00", showId: showMap["Evening Vibes"] },
  { day: "Saturday", startTime: "12:00", endTime: "16:00", showId: showMap["Weekend Takeover"] },
  { day: "Sunday", startTime: "12:00", endTime: "16:00", showId: showMap["Weekend Takeover"] },
];

for (const slot of slots.filter(s => s.showId)) {
  await post(`${BASE}/schedule`, slot);
  console.log(`✓ Schedule: ${slot.day} ${slot.startTime} - ${slot.endTime}`);
}

console.log("\n✅ Seed complete!");
