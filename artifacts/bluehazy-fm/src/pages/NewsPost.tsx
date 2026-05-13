import { useGetPost } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Clock, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewsPost() {
  const { id } = useParams();
  const { data: post, isLoading } = useGetPost(Number(id), {
    query: { enabled: !!id, queryKey: ['/api/posts', id] } // Manual query key as getGetPostQueryKey might not be exported as expected
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="h-8 bg-white/5 rounded-lg w-1/4 mb-8 animate-pulse" />
        <div className="h-16 bg-white/5 rounded-lg w-3/4 mb-6 animate-pulse" />
        <div className="h-96 bg-white/5 rounded-2xl w-full mb-12 animate-pulse" />
        <div className="space-y-4">
          <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-8">The news article you're looking for doesn't exist.</p>
        <Link href="/news">
          <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to News</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Hero Image */}
      <div className="w-full h-[50vh] min-h-[400px] relative">
        <img 
          src={post.imageUrl || '/images/news-1.png'} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10 -mt-32">
        <div className="mb-8">
          <Link href="/news" className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors mb-8 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to News
          </Link>
          
          <div className="inline-flex text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1.5 rounded mb-6">
            {post.category}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-white/10 mb-10">
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>5 min read</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Share2 className="w-4 h-4" /> Share</span>
              <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary text-white flex items-center justify-center transition-colors"><Facebook className="w-3 h-3" /></button>
              <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary text-white flex items-center justify-center transition-colors"><Twitter className="w-3 h-3" /></button>
              <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary text-white flex items-center justify-center transition-colors"><Linkedin className="w-3 h-3" /></button>
            </div>
          </div>
        </div>

        <div className="prose prose-invert prose-blue max-w-none prose-lg">
          {/* Mock content rendering since the actual content might be plain text in the DB for this mock */}
          <p className="text-xl text-white/90 leading-relaxed font-medium mb-8">
            {post.excerpt}
          </p>
          
          <div className="text-white/80 leading-relaxed space-y-6" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
        </div>

        {post.tags && (
          <div className="mt-12 pt-8 border-t border-white/10 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-bold text-white">Tags:</span>
            {post.tags.split(',').map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-muted-foreground hover:text-white transition-colors cursor-pointer">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
