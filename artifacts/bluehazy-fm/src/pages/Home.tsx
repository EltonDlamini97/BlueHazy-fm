import { Link } from "wouter";
import { useListShows, useListPosts } from "@workspace/api-client-react";
import { Play, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiConnectionBanner } from "@/components/ApiConnectionBanner";

export default function Home() {
  const {
    data: showsData,
    isLoading: loadingShows,
    isError: showsError,
    refetch: refetchShows,
  } = useListShows();
  const {
    data: postsData,
    isLoading: loadingPosts,
    isError: postsError,
    refetch: refetchPosts,
  } = useListPosts({ limit: 3 });

  const apiDown = showsError || postsError;
  const retryApi = () => {
    void refetchShows();
    void refetchPosts();
  };

  const shows = Array.isArray(showsData) ? showsData : [];
  const featured = shows.filter((s) => s.isFeatured);
  const featuredShows = (featured.length ? featured : shows).slice(0, 3);
  const latestPosts = Array.isArray(postsData) ? postsData : [];

  return (
    <div className="min-w-0">
      {apiDown && <ApiConnectionBanner onRetry={retryApi} />}
      {/* Hero Section */}
      <section className="relative page-hero-pad pb-12 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20" style={{ backgroundImage: "url('/images/studio-bg.png')" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/30 via-background/90 to-background pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-primary text-sm font-semibold mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live 24/7
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 tracking-tight text-balance animate-fade-in animation-delay-100">
            Let Your Voice <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary text-glow">
              Be Heard
            </span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 px-2 text-pretty animate-fade-in animation-delay-200">
            The pulse of the city. Live broadcasting 24/7 with the best DJs, community voices, and uninterrupted vibes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in animation-delay-300">
            <Link href="/live">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 box-glow w-full sm:w-auto h-14 text-lg">
                <Play className="w-5 h-5 mr-2 fill-current" /> Start Listening
              </Button>
            </Link>
            <Link href="/shows">
              <Button size="lg" variant="outline" className="rounded-full px-8 border-white/20 hover:bg-white/5 w-full sm:w-auto h-14 text-lg">
                Explore Shows
              </Button>
            </Link>
          </div>

          {/* Equalizer */}
          <div className="hidden sm:flex items-end justify-center gap-1.5 h-16 mt-12 sm:mt-20 opacity-80 animate-fade-in animation-delay-400">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div 
                key={i} 
                className="w-2 bg-primary rounded-t-full eq-bar box-glow" 
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Shows */}
      <section className="py-12 sm:py-20 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 flex items-center gap-2">
                <Star className="text-primary fill-primary w-5 h-5 sm:w-6 sm:h-6 shrink-0" /> Featured Shows
              </h2>
              <p className="text-muted-foreground">The best of BlueHazy FM</p>
            </div>
            <Link href="/shows" className="hidden md:flex items-center text-primary hover:text-primary/80 font-medium">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingShows ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="glass rounded-xl h-80 animate-pulse" />
              ))
            ) : apiDown ? null : featuredShows.length > 0 ? featuredShows.map((show) => (
              <div key={show.id} className="group relative rounded-xl overflow-hidden glass border-white/10 hover:border-primary/50 transition-all duration-300">
                <div className="aspect-[16/9] w-full overflow-hidden">
                  <img 
                    src={show.imageUrl || '/images/show-1.png'} 
                    alt={show.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                </div>
                <div className="p-6 relative z-10 -mt-16">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">
                      {show.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{show.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{show.description}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden">
                      <img src="/images/presenter-1.png" alt={show.presenterName || 'DJ'} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium text-white">{show.presenterName}</span>
                  </div>
                </div>
              </div>
            )) : (
              <p className="col-span-full text-center text-muted-foreground py-12">
                No shows yet. Check back soon or explore the full lineup.
              </p>
            )}
          </div>
          <Link href="/shows" className="md:hidden mt-6 flex items-center justify-center text-primary hover:text-primary/80 font-medium w-full p-4 glass rounded-lg">
            View All Shows <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-12 sm:py-20 bg-black/40">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Latest News</h2>
              <p className="text-muted-foreground">Stay updated with the station and music scene</p>
            </div>
            <Link href="/news" className="hidden md:flex items-center text-primary hover:text-primary/80 font-medium">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadingPosts ? (
               Array(3).fill(0).map((_, i) => (
                <div key={i} className="glass rounded-xl h-96 animate-pulse" />
              ))
            ) : apiDown ? null : latestPosts.length > 0 ? latestPosts.map((post) => (
              <Link key={post.id} href={`/news/${post.id}`}>
                <div className="group rounded-xl overflow-hidden glass hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={post.imageUrl || '/images/news-1.png'} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">{post.category}</div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
                    <div className="text-xs text-muted-foreground mt-auto">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              <p className="col-span-full text-center text-muted-foreground py-12">
                No news posts yet. Check back soon for updates.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
