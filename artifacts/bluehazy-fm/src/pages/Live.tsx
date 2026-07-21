import { Play, Pause, Volume2, Maximize2 } from "lucide-react";
import { useRadioPlayer } from "@/contexts/RadioPlayerContext";
import { useNowPlaying } from "@/hooks/use-now-playing";

export default function Live() {
  const { isPlaying, volume, error, setVolume, togglePlay } = useRadioPlayer();
  const { data: nowPlaying } = useNowPlaying(true);

  const title = nowPlaying?.displayTitle ?? "BlueHazy FM";
  const subtitle = nowPlaying?.displaySubtitle ?? "Live on Zeno.fm";
  const artUrl = nowPlaying?.showImageUrl ?? "/images/show-2.png";

  return (
    <div
      className="flex flex-col min-h-0 w-full"
      style={{ minHeight: "calc(100dvh - var(--nav-height))" }}
    >
      <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/images/studio-bg.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-primary/5" />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8 gap-4 sm:gap-6 overflow-y-auto overscroll-contain">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 text-red-500 text-sm font-bold tracking-widest uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> Live Broadcast
          </div>

          {/* Album art — responsive size */}
          <div className="aspect-square w-[min(72vw,12rem)] sm:w-64 md:w-80 rounded-2xl overflow-hidden glass border-primary/30 box-glow relative group shrink-0">
            <img src={artUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>

          {/* Track info */}
          <div className="text-center max-w-xs sm:max-w-xl px-2">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-2 line-clamp-2">{title}</h1>
            <p className="text-sm sm:text-xl text-primary font-medium line-clamp-2 break-words">{subtitle}</p>
            {nowPlaying?.showTitle && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                On air: <span className="text-white">{nowPlaying.showTitle}</span>
                {nowPlaying.presenterName ? ` · ${nowPlaying.presenterName}` : ""}
              </p>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center max-w-xs px-4" role="alert">{error}</p>
          )}

          {/* Player controls — full width on mobile */}
          <div className="w-full max-w-sm sm:max-w-2xl glass rounded-full p-3 sm:p-4 px-3 sm:px-8 flex items-center gap-2 sm:gap-4 justify-between border-white/20">
            <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground min-w-0 flex-1 max-w-[38%] sm:max-w-none sm:w-1/4">
              <Volume2 className="w-4 h-4 shrink-0" />
              <input
                type="range" min="0" max="100" value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-primary h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <button
              type="button" onClick={togglePlay}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all box-glow"
              aria-label={isPlaying ? "Pause stream" : "Play stream"}
            >
              {isPlaying
                ? <Pause className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
                : <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-1" />}
            </button>

            <div className="shrink-0 hidden sm:flex justify-end sm:w-1/4">
              <button type="button" className="p-2 rounded-full hover:bg-white/10 text-white transition-colors" aria-hidden>
                <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Equalizer */}
          {isPlaying && (
            <div className="hidden sm:flex items-end justify-center gap-1 sm:gap-2 h-16 sm:h-32 w-full max-w-xs sm:max-w-4xl opacity-50">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="w-2 sm:w-3 bg-primary rounded-t-full eq-bar"
                  style={{ animationDelay: `${(i % 10) * 0.1}s`, height: `${20 + (i % 5) * 15}%`, animationDuration: `${0.5 + (i % 3) * 0.3}s` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
