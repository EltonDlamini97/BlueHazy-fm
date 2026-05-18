import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Play, Pause, Volume2, Maximize2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useRadioPlayer } from "@/contexts/RadioPlayerContext";
import { useNowPlaying } from "@/hooks/use-now-playing";

export function Layout({ children }: { children: React.ReactNode }) {
  const { isPlaying, volume, setVolume, togglePlay } = useRadioPlayer();
  const { data: nowPlaying } = useNowPlaying(true);
  const [location] = useLocation();

  const isLivePage = location === "/live";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />

      {!isLivePage && (
        <div className="fixed bottom-0 left-0 w-full glass border-t border-white/10 z-50 safe-area-bottom">
          <div className="container mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
            {/* Play button + track info */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <button
                type="button"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 box-glow transition-transform active:scale-95 shrink-0"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause stream" : "Play stream"}
              >
                {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />}
              </button>
              <div className="min-w-0">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                  Live Now
                </div>
                <div className="font-medium text-xs sm:text-sm text-white truncate">
                  {nowPlaying?.displayTitle ?? "BlueHazy FM"}
                </div>
                <div className="text-xs text-muted-foreground truncate hidden sm:block">
                  {nowPlaying?.displaySubtitle ?? "Zeno.fm stream"}
                </div>
              </div>
            </div>

            {/* Equalizer — desktop only */}
            <div className="hidden md:flex items-center justify-center flex-1 px-8">
              {isPlaying ? (
                <div className="flex items-end justify-center gap-1 h-8 opacity-80">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-primary rounded-t-full eq-bar"
                      style={{ animationDelay: `${i * 0.1}s`, height: `${Math.max(20, (i % 4) * 25)}%` }}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full max-w-md h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-0 h-full bg-primary" />
                </div>
              )}
            </div>

            {/* Volume + expand */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                <Volume2 className="w-4 h-4" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-20 accent-primary h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  aria-label="Volume"
                />
              </div>
              <Link href="/live" className="p-2 text-muted-foreground hover:text-white transition-colors">
                <Maximize2 className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
