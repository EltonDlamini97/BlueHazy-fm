import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Play, Pause, Volume2, Maximize2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [location] = useLocation();

  const isLivePage = location === "/live";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      
      {/* Persistent Global Player - Hide on Live page to avoid duplication */}
      {!isLivePage && (
        <div className="fixed bottom-0 left-0 w-full glass border-t border-white/10 p-3 z-50 safe-area-bottom">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 box-glow transition-transform active:scale-95"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
              </button>
              <div>
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Live Now
                </div>
                <div className="font-medium text-sm text-white line-clamp-1">Midnight Synthwave Sessions</div>
                <div className="text-xs text-muted-foreground">with DJ Neon</div>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center flex-1 px-8">
              {isPlaying ? (
                <div className="flex items-end justify-center gap-1 h-8 opacity-80">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-primary rounded-t-full eq-bar" 
                      style={{ animationDelay: `${i * 0.1}s`, height: `${Math.max(20, Math.random() * 100)}%` }}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full max-w-md h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-0 h-full bg-primary"></div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                <Volume2 className="w-4 h-4" />
                <div className="w-20 h-1 bg-white/10 rounded-full cursor-pointer">
                  <div className="w-16 h-full bg-primary rounded-full box-glow"></div>
                </div>
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
