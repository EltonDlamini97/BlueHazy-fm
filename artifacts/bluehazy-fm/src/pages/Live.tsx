import { useState } from "react";
import { Play, Pause, Volume2, MessageSquare, Users, Radio, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Live() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row">
      {/* Main Player Area */}
      <div className="flex-1 relative flex flex-col">
        {/* Background */}
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

          {/* Big Equalizer when playing */}
          {isPlaying && (
            <div className="flex items-end justify-center gap-2 h-32 mt-16 w-full max-w-4xl opacity-50">
              {Array.from({ length: 32 }).map((_, i) => (
                <div 
                  key={i} 
                  className="w-3 bg-primary rounded-t-full eq-bar" 
                  style={{ 
                    animationDelay: `${Math.random() * 1}s`,
                    height: `${20 + Math.random() * 80}%`,
                    animationDuration: `${0.5 + Math.random() * 1}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Chat / Interaction */}
      <div className="w-full lg:w-96 bg-background border-l border-white/10 flex flex-col h-[600px] lg:h-auto">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h3 className="font-bold flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" /> Live Chat</h3>
          <span className="text-xs font-medium bg-white/10 px-2 py-1 rounded text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" /> 1.2k listening
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Chat message placeholders */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">JD</div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-0.5">John Doe <span className="text-[10px] opacity-50 ml-1">12:42</span></p>
              <p className="text-sm text-white/90">This track is absolute fire! 🔥</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs shrink-0">SK</div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-0.5">Sarah K <span className="text-[10px] opacity-50 ml-1">12:43</span></p>
              <p className="text-sm text-white/90">Shoutout from London!</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0"><Radio className="w-4 h-4"/></div>
            <div>
              <p className="text-xs text-primary font-bold mb-0.5">BlueHazy Bot <span className="text-[10px] opacity-50 ml-1">12:45</span></p>
              <p className="text-sm text-white/90 font-medium">Now playing: Midnight City - M83</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-white/5">
          <form className="flex gap-2" onSubmit={e => e.preventDefault()}>
            <input 
              type="text" 
              placeholder="Send a message..." 
              className="flex-1 bg-black/50 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
            />
            <Button type="submit" size="icon" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
              <MessageSquare className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio id="radio-stream" preload="none">
        <source src="https://stream.placeholder.com/bluehazy" type="audio/mpeg" />
      </audio>
    </div>
  );
}
