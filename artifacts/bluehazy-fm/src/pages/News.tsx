import { useListPosts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Search, ArrowRight, Clock } from "lucide-react";
import { useState } from "react";

export default function News() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: posts, isLoading } = useListPosts();

  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredPost = filteredPosts?.find(p => p.isFeatured) || filteredPosts?.[0];
  const regularPosts = filteredPosts?.filter(p => p.id !== featuredPost?.id);

  return (
    <div className="pt-8 pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">Latest <span className="text-primary text-glow">News</span></h1>
            <p className="text-lg text-muted-foreground">Music news, station updates, and community stories.</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search articles..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="h-96 bg-white/5 rounded-2xl animate-pulse mb-12" />
        ) : featuredPost && !searchTerm ? (
          <Link href={`/news/${featuredPost.id}`}>
            <div className="group relative rounded-2xl overflow-hidden glass border-white/10 hover:border-primary/50 transition-all duration-300 mb-16 h-[60vh] min-h-[400px]">
              <div className="absolute inset-0">
                <img 
                  src={featuredPost.imageUrl || '/images/news-1.png'} 
                  alt={featuredPost.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 lg:w-2/3">
                <div className="inline-flex text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1.5 rounded mb-4">
                  {featuredPost.category}
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-primary transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-lg text-white/80 line-clamp-2 mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm font-medium">
                  <span className="text-primary flex items-center gap-1">Read Article <ArrowRight className="w-4 h-4" /></span>
                  <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Link>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="glass rounded-xl h-96 animate-pulse" />
            ))
          ) : regularPosts?.length ? (
            regularPosts.map((post) => (
              <Link key={post.id} href={`/news/${post.id}`}>
                <div className="group rounded-xl overflow-hidden glass border-white/10 hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img 
                      src={post.imageUrl || '/images/news-2.png'} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">{post.category}</div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-white/10">
                      <span className="text-primary font-medium">Read more</span>
                      <span className="text-muted-foreground">{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No articles found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
