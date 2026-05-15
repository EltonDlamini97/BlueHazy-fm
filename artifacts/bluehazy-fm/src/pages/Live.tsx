import { useState } from "react";
import { Play, Pause, Volume2, Radio, Maximize2 } from "lucide-react";

export default function Live() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col">
      {/* Main Player Area */}
      <div className="flex-1 relative flex flex-col">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/images/studio-bg.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-primary/5" />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 text-red-500 text-sm font-bold tracking-widest uppercase mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> Live Broadcast
          </div>

          <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden glass border-primary/30 box-glow mb-10 relative group">
            <img src="/images/show-2.png" alt="Live Show" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Radio className="w-16 h-16 text-white" />
            </div>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-3">Midnight Synthwave</h1>
            <p className="text-xl text-primary font-medium">with DJ Neon</p>
          </div>

          {/* Player Controls */}
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
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all box-glow shadow-[0_0_40px_hsl(var(--primary)/0.4)]"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-2" />}
            </button>

            <div className="w-1/4 flex justify-end">
              <button className="p-3 rounded-full hover:bg-white/10 text-white transition-colors">
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Equalizer when playing */}
          {isPlaying && (
            <div className="flex items-end justify-center gap-2 h-32 mt-16 w-full max-w-4xl opacity-50">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 bg-primary rounded-t-full eq-bar"
                  style={{
                    animationDelay: `${Math.random() * 1}s`,
                    height: `${20 + Math.random() * 80}%`,
                    animationDuration: `${0.5 + Math.random() * 1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hidden audio element */}
      <audio id="radio-stream" preload="none">
        <source src="https://stream.placeholder.com/bluehazy" type="audio/mpeg" />
      </audio>
    </div>
  );
}
