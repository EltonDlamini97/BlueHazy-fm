import { Play, Pause, Volume2, Radio, Maximize2 } from "lucide-react";
import { useRadioPlayer } from "@/contexts/RadioPlayerContext";
import { useNowPlaying } from "@/hooks/use-now-playing";

export default function Live() {
  const { isPlaying, volume, error, setVolume, togglePlay } = useRadioPlayer();
  const { data: nowPlaying } = useNowPlaying(true);

  const title = nowPlaying?.displayTitle ?? "BlueHazy FM";
  const subtitle = nowPlaying?.displaySubtitle ?? "Live on Zeno.fm";
  const artUrl = nowPlaying?.showImageUrl ?? "/images/show-2.png";

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col">
      <div className="flex-1 relative flex flex-col">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/images/studio-bg.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-primary/5" />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 text-red-500 text-sm font-bold tracking-widest uppercase mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> Live Broadcast
          </div>

          <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden glass border-primary/30 box-glow mb-10 relative group">
            <img src={artUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Radio className="w-16 h-16 text-white" />
            </div>
          </div>

          <div className="text-center mb-12 max-w-xl">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-3 line-clamp-2">{title}</h1>
            <p className="text-xl text-primary font-medium line-clamp-2">{subtitle}</p>
            {nowPlaying?.showTitle && (
              <p className="text-sm text-muted-foreground mt-3">
                On air: <span className="text-white">{nowPlaying.showTitle}</span>
                {nowPlaying.presenterName ? ` · ${nowPlaying.presenterName}` : ""}
              </p>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center max-w-md mb-6 px-4" role="alert">
              {error}
            </p>
          )}

          <div className="w-full max-w-2xl glass rounded-full p-4 px-6 md:px-8 flex items-center justify-between border-white/20">
            <div className="flex items-center gap-4 text-muted-foreground w-1/4">
              <Volume2 className="w-5 h-5" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-primary h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={togglePlay}
              className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all box-glow shadow-[0_0_40px_hsl(var(--primary)/0.4)]"
              aria-label={isPlaying ? "Pause stream" : "Play stream"}
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-2" />}
            </button>

            <div className="w-1/4 flex justify-end">
              <button type="button" className="p-3 rounded-full hover:bg-white/10 text-white transition-colors" aria-hidden>
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {isPlaying && (
            <div className="flex items-end justify-center gap-2 h-32 mt-16 w-full max-w-4xl opacity-50">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 bg-primary rounded-t-full eq-bar"
                  style={{
                    animationDelay: `${(i % 10) * 0.1}s`,
                    height: `${20 + (i % 5) * 15}%`,
                    animationDuration: `${0.5 + (i % 3) * 0.3}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
