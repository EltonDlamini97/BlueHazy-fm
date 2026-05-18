const DEFAULT_MOUNT = "fyhks2vxdmgvv";
const READ_TIMEOUT_MS = 4000;

export type ZenoTrackMetadata = {
  trackTitle: string | null;
  trackArtist: string | null;
};

function parseStreamTitle(raw: string): ZenoTrackMetadata {
  const title = raw.trim();
  if (!title) return { trackTitle: null, trackArtist: null };

  const separators = [" - ", " – ", " — ", " / "];
  for (const sep of separators) {
    const idx = title.indexOf(sep);
    if (idx > 0) {
      return {
        trackArtist: title.slice(0, idx).trim(),
        trackTitle: title.slice(idx + sep.length).trim(),
      };
    }
  }
  return { trackTitle: title, trackArtist: null };
}

function parseMetadataPayload(data: Record<string, unknown>): ZenoTrackMetadata {
  const song =
    (typeof data.currentSong === "string" && data.currentSong) ||
    (typeof data.song === "string" && data.song) ||
    (typeof data.title === "string" && data.title) ||
    null;
  const artist =
    (typeof data.currentArtist === "string" && data.currentArtist) ||
    (typeof data.artist === "string" && data.artist) ||
    null;

  if (song && artist) {
    return { trackTitle: song, trackArtist: artist };
  }
  if (typeof data.streamTitle === "string" && data.streamTitle) {
    return parseStreamTitle(data.streamTitle);
  }
  if (song) return { trackTitle: song, trackArtist: artist };
  return { trackTitle: null, trackArtist: null };
}

/** Read the first SSE `data:` event from Zeno's metadata subscribe endpoint. */
async function readFirstSseJson(url: string): Promise<Record<string, unknown> | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), READ_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { Accept: "text/event-stream" },
      signal: controller.signal,
    });
    if (!res.ok || !res.body) return null;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (buffer.length < 16_000) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const match = buffer.match(/data:\s*(\{[\s\S]*?\})\s*(?:\r?\n\r?\n|\r?\n)/);
      if (match) {
        try {
          return JSON.parse(match[1]) as Record<string, unknown>;
        } catch {
          return null;
        }
      }
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}

/** Fetch now-playing from Zeno Metadata API (SSE; mount point without /source). */
export async function fetchZenoMetadata(
  mountId = process.env.ZENO_MOUNT_ID ?? DEFAULT_MOUNT,
): Promise<ZenoTrackMetadata> {
  const url = `https://api.zeno.fm/mounts/metadata/subscribe/${mountId}`;
  const data = await readFirstSseJson(url);
  if (!data) return { trackTitle: null, trackArtist: null };
  return parseMetadataPayload(data);
}
