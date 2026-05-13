import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetStationStats,
  useListShows, useListPresenters, useListPosts, useListGallery,
  useCreateShow, useDeleteShow, useCreatePresenter, useDeletePresenter,
  useCreatePost, useDeletePost,
  useCreateGalleryItem, useDeleteGalleryItem,
  useListContactInquiries, useListNewsletterSubscribers,
  getListPostsQueryKey, getListGalleryQueryKey,
  getGetStationStatsQueryKey,
} from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radio, Mic, FileText, Image as ImageIcon, MessageSquare, Users, Trash2, Plus, X, Eye, Star } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  imageUrl: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

const gallerySchema = z.object({
  imageUrl: z.string().url("Must be a valid URL"),
  caption: z.string().min(1, "Caption is required"),
  category: z.string().min(1, "Category is required"),
});

type PostFormValues = z.infer<typeof postSchema>;
type GalleryFormValues = z.infer<typeof gallerySchema>;

const NEWS_CATEGORIES = ["Station News", "Music", "Interviews", "Community", "Events", "Entertainment"];
const GALLERY_CATEGORIES = ["Events", "Studio", "Presenters", "Promo"];

export default function Admin() {
  const { data: stats } = useGetStationStats();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: shows } = useListShows();
  const { data: presenters } = useListPresenters();
  const { data: posts } = useListPosts();
  const { data: gallery } = useListGallery();
  const { data: inquiries } = useListContactInquiries();
  const { data: subscribers } = useListNewsletterSubscribers();

  const deleteShow = useDeleteShow();
  const deletePresenter = useDeletePresenter();
  const deletePost = useDeletePost();
  const createPost = useCreatePost();
  const deleteGallery = useDeleteGalleryItem();
  const createGallery = useCreateGalleryItem();

  const [showPostForm, setShowPostForm] = useState(false);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [viewPost, setViewPost] = useState<(typeof posts)[0] | null>(null);

  const postForm = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: "", excerpt: "", content: "", category: "", tags: "", imageUrl: "", isFeatured: false },
  });

  const galleryForm = useForm<GalleryFormValues>({
    resolver: zodResolver(gallerySchema),
    defaultValues: { imageUrl: "", caption: "", category: "" },
  });

  const handleDeleteShow = (id: number) => {
    if (confirm("Delete this show?")) {
      deleteShow.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/shows"] }),
      });
    }
  };

  const handleDeletePresenter = (id: number) => {
    if (confirm("Delete this presenter?")) {
      deletePresenter.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/presenters"] }),
      });
    }
  };

  const handleDeletePost = (id: number) => {
    if (confirm("Delete this article?")) {
      deletePost.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStationStatsQueryKey() });
          toast({ title: "Article deleted" });
        },
      });
    }
  };

  const handleDeleteGallery = (id: number) => {
    if (confirm("Delete this image?")) {
      deleteGallery.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGalleryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStationStatsQueryKey() });
          toast({ title: "Image deleted" });
        },
      });
    }
  };

  const onSubmitPost = (values: PostFormValues) => {
    createPost.mutate(
      { data: { ...values, publishedAt: new Date().toISOString() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStationStatsQueryKey() });
          toast({ title: "Article published!", description: values.title });
          postForm.reset();
          setShowPostForm(false);
        },
        onError: () => toast({ title: "Failed to publish", variant: "destructive" }),
      }
    );
  };

  const onSubmitGallery = (values: GalleryFormValues) => {
    createGallery.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGalleryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStationStatsQueryKey() });
          toast({ title: "Image added to gallery!" });
          galleryForm.reset();
          setShowGalleryForm(false);
        },
        onError: () => toast({ title: "Failed to add image", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="pt-8 pb-24 min-h-screen bg-black/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Station <span className="text-primary">Admin</span>
          </h1>
          <p className="text-muted-foreground">Manage your content, schedule, and community.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <StatCard icon={<Radio />} label="Shows" value={stats?.totalShows ?? 0} />
          <StatCard icon={<Mic />} label="DJs" value={stats?.totalPresenters ?? 0} />
          <StatCard icon={<FileText />} label="Posts" value={stats?.totalPosts ?? 0} />
          <StatCard icon={<ImageIcon />} label="Gallery" value={stats?.totalGalleryItems ?? 0} />
          <StatCard icon={<MessageSquare />} label="Inquiries" value={stats?.totalInquiries ?? 0} />
          <StatCard icon={<Users />} label="Subs" value={stats?.totalSubscribers ?? 0} />
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="bg-black/50 border border-white/10 w-full justify-start overflow-x-auto h-auto p-1 rounded-xl mb-8 no-scrollbar">
            <TabsTrigger value="posts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6">
              <FileText className="w-4 h-4 mr-2" /> News
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6">
              <ImageIcon className="w-4 h-4 mr-2" /> Gallery
            </TabsTrigger>
            <TabsTrigger value="shows" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6">
              <Radio className="w-4 h-4 mr-2" /> Shows
            </TabsTrigger>
            <TabsTrigger value="presenters" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6">
              <Mic className="w-4 h-4 mr-2" /> Presenters
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6">
              <MessageSquare className="w-4 h-4 mr-2" /> Messages
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6">
              <Users className="w-4 h-4 mr-2" /> Subscribers
            </TabsTrigger>
          </TabsList>

          {/* ── NEWS TAB ── */}
          <TabsContent value="posts" className="m-0 space-y-4">
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h3 className="font-bold text-lg text-white">News Articles</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{posts?.length ?? 0} articles published</p>
                </div>
                <Button
                  data-testid="button-new-post"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2"
                  onClick={() => setShowPostForm(true)}
                >
                  <Plus className="w-4 h-4" /> New Article
                </Button>
              </div>

              {posts && posts.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {posts.map(post => (
                    <div key={post.id} data-testid={`row-post-${post.id}`} className="flex items-start gap-4 p-5 hover:bg-white/5 transition-colors group">
                      {post.imageUrl && (
                        <img src={post.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-white/10" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-white font-bold truncate">{post.title}</span>
                          {post.isFeatured && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs gap-1">
                              <Star className="w-2.5 h-2.5" /> Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm truncate mb-2">{post.excerpt}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <Badge variant="outline" className="border-primary/30 text-primary text-xs">{post.category}</Badge>
                          <span>{new Date(post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button
                          variant="ghost" size="icon"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                          onClick={() => setViewPost(post)}
                          data-testid={`button-view-post-${post.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          onClick={() => handleDeletePost(post.id)}
                          data-testid={`button-delete-post-${post.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No articles yet. Publish your first one.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── GALLERY TAB ── */}
          <TabsContent value="gallery" className="m-0">
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h3 className="font-bold text-lg text-white">Gallery Images</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{gallery?.length ?? 0} images</p>
                </div>
                <Button
                  data-testid="button-add-gallery"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2"
                  onClick={() => setShowGalleryForm(true)}
                >
                  <Plus className="w-4 h-4" /> Add Image
                </Button>
              </div>

              {gallery && gallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-5">
                  {gallery.map(item => (
                    <div key={item.id} data-testid={`card-gallery-${item.id}`} className="relative group rounded-xl overflow-hidden aspect-square bg-white/5">
                      <img src={item.imageUrl} alt={item.caption} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                        <p className="text-white text-xs text-center font-semibold line-clamp-2">{item.caption}</p>
                        <Badge variant="outline" className="border-primary/40 text-primary text-xs">{item.category}</Badge>
                        <Button
                          variant="ghost" size="icon"
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 mt-1"
                          onClick={() => handleDeleteGallery(item.id)}
                          data-testid={`button-delete-gallery-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No images yet. Add your first photo.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── SHOWS TAB ── */}
          <TabsContent value="shows" className="m-0">
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="font-bold text-lg text-white">Manage Shows</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-muted-foreground">
                  <thead className="text-xs uppercase bg-black/40 text-white/60">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Title</th>
                      <th className="px-6 py-4 font-semibold">Category</th>
                      <th className="px-6 py-4 font-semibold">Presenter</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shows?.map(show => (
                      <tr key={show.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{show.title}</td>
                        <td className="px-6 py-4">{show.category}</td>
                        <td className="px-6 py-4">{show.presenterName ?? "—"}</td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDeleteShow(show.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ── PRESENTERS TAB ── */}
          <TabsContent value="presenters" className="m-0">
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="font-bold text-lg text-white">Manage Presenters</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-muted-foreground">
                  <thead className="text-xs uppercase bg-black/40 text-white/60">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presenters?.map(presenter => (
                      <tr key={presenter.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">
                          <div className="flex items-center gap-3">
                            <img src={presenter.imageUrl ?? ""} alt="" className="w-8 h-8 rounded-full object-cover bg-white/10" />
                            {presenter.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">{presenter.role}</td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDeletePresenter(presenter.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ── INQUIRIES TAB ── */}
          <TabsContent value="inquiries" className="m-0">
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 bg-white/5">
                <h3 className="font-bold text-lg text-white">Contact & Advertising Inquiries</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-muted-foreground">
                  <thead className="text-xs uppercase bg-black/40 text-white/60">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Type</th>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Subject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries?.map(inquiry => (
                      <tr key={inquiry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 uppercase text-xs font-bold text-primary">{inquiry.inquiryType ?? "—"}</td>
                        <td className="px-6 py-4 font-bold text-white">
                          {inquiry.name}
                          <br />
                          <span className="text-xs text-muted-foreground font-normal">{inquiry.email}</span>
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate">{inquiry.subject}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ── SUBSCRIBERS TAB ── */}
          <TabsContent value="subscribers" className="m-0">
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 bg-white/5">
                <h3 className="font-bold text-lg text-white">Newsletter Subscribers</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{subscribers?.length ?? 0} active subscribers</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-muted-foreground">
                  <thead className="text-xs uppercase bg-black/40 text-white/60">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Subscribed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers?.map(sub => (
                      <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{sub.name ?? "—"}</td>
                        <td className="px-6 py-4">{sub.email}</td>
                        <td className="px-6 py-4">{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── NEW ARTICLE DIALOG ── */}
      <Dialog open={showPostForm} onOpenChange={setShowPostForm}>
        <DialogContent className="bg-[#0d1526] border border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Publish New Article</DialogTitle>
          </DialogHeader>
          <Form {...postForm}>
            <form onSubmit={postForm.handleSubmit(onSubmitPost)} className="space-y-4 mt-2">
              <FormField
                control={postForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Headline *</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-post-title"
                        placeholder="Enter article headline..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={postForm.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Short Summary *</FormLabel>
                    <FormControl>
                      <Textarea
                        data-testid="input-post-excerpt"
                        placeholder="A one or two sentence summary shown in the news list..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={postForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Full Article *</FormLabel>
                    <FormControl>
                      <Textarea
                        data-testid="input-post-content"
                        placeholder="Write the full article here..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary resize-none"
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={postForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-post-category" className="bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0d1526] border-white/10">
                          {NEWS_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat} className="text-white">{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={postForm.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Tags</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-post-tags"
                          placeholder="music,interview,events"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={postForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Cover Image URL</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-post-image"
                        placeholder="https://example.com/image.jpg"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {postForm.watch("imageUrl") && (
                <div className="rounded-lg overflow-hidden h-32 bg-white/5">
                  <img src={postForm.watch("imageUrl")} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <FormField
                control={postForm.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <FormControl>
                      <input
                        data-testid="checkbox-post-featured"
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 accent-primary"
                      />
                    </FormControl>
                    <div>
                      <FormLabel className="text-white/80 cursor-pointer">Mark as Featured Article</FormLabel>
                      <p className="text-xs text-muted-foreground">Featured articles appear prominently on the homepage and news page.</p>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  data-testid="button-submit-post"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                  disabled={createPost.isPending}
                >
                  {createPost.isPending ? "Publishing..." : "Publish Article"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/10"
                  onClick={() => { setShowPostForm(false); postForm.reset(); }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── ADD GALLERY IMAGE DIALOG ── */}
      <Dialog open={showGalleryForm} onOpenChange={setShowGalleryForm}>
        <DialogContent className="bg-[#0d1526] border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Add Gallery Image</DialogTitle>
          </DialogHeader>
          <Form {...galleryForm}>
            <form onSubmit={galleryForm.handleSubmit(onSubmitGallery)} className="space-y-4 mt-2">
              <FormField
                control={galleryForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Image URL *</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-gallery-url"
                        placeholder="https://example.com/photo.jpg"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {galleryForm.watch("imageUrl") && (
                <div className="rounded-lg overflow-hidden h-40 bg-white/5">
                  <img src={galleryForm.watch("imageUrl")} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <FormField
                control={galleryForm.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Caption *</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-gallery-caption"
                        placeholder="Describe this photo..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={galleryForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-gallery-category" className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#0d1526] border-white/10">
                        {GALLERY_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat} className="text-white">{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  data-testid="button-submit-gallery"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                  disabled={createGallery.isPending}
                >
                  {createGallery.isPending ? "Adding..." : "Add to Gallery"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/10"
                  onClick={() => { setShowGalleryForm(false); galleryForm.reset(); }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── VIEW POST DIALOG ── */}
      {viewPost && (
        <Dialog open={!!viewPost} onOpenChange={() => setViewPost(null)}>
          <DialogContent className="bg-[#0d1526] border border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-black leading-tight">{viewPost.title}</DialogTitle>
            </DialogHeader>
            {viewPost.imageUrl && (
              <img src={viewPost.imageUrl} alt="" className="w-full h-48 object-cover rounded-lg" />
            )}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="outline" className="border-primary/30 text-primary">{viewPost.category}</Badge>
              <span>{new Date(viewPost.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <p className="text-white/70 italic text-sm border-l-2 border-primary/50 pl-3">{viewPost.excerpt}</p>
            <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{viewPost.content}</div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="glass p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors">
      <div className="text-primary mb-2 opacity-80">{icon}</div>
      <div className="text-2xl font-black text-white mb-1">{value}</div>
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
