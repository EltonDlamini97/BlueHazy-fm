import { useQuery } from "@tanstack/react-query";

export type NowPlaying = {
  showTitle: string | null;
  presenterName: string | null;
  showImageUrl: string | null;
  trackTitle: string | null;
  trackArtist: string | null;
  isScheduledShow: boolean;
  displayTitle: string;
  displaySubtitle: string;
};

async function fetchNowPlaying(): Promise<NowPlaying> {
  const res = await fetch("/api/live/now-playing");
  if (!res.ok) {
    throw new Error("Failed to load now playing");
  }
  return res.json() as Promise<NowPlaying>;
}

export function useNowPlaying(poll = true) {
  return useQuery({
    queryKey: ["/api/live/now-playing"],
    queryFn: fetchNowPlaying,
    refetchInterval: poll ? 15_000 : false,
    staleTime: 10_000,
  });
}
