import { useState } from "react";
import {
  useGetStationStats,
  useListShows, useCreateShow, useUpdateShow, useDeleteShow,
  useListPresenters, useCreatePresenter, useUpdatePresenter, useDeletePresenter,
  useListPosts, useCreatePost, useUpdatePost, useDeletePost,
  useListGallery, useCreateGalleryItem, useUpdateGalleryItem, useDeleteGalleryItem,
  useListSchedule, useCreateScheduleSlot, useUpdateScheduleSlot, useDeleteScheduleSlot,
} from "@workspace/api-client-react";
import type {
  Show, ShowInput, ShowUpdate,
  Presenter, PresenterInput, PresenterUpdate,
  Post, PostInput, PostUpdate,
  GalleryItem, GalleryInput,
  ScheduleSlot, ScheduleSlotInput,
} from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Radio, Mic, FileText, Image as ImageIcon, Trash2, Pencil, Plus, Calendar } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// ─── helpers ────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-white/80 text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

const inputCls = "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary";
const textareaCls = "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary min-h-[80px]";

// ─── Delete confirm dialog ───────────────────────────────────────────────────

function DeleteConfirm({ open, onCancel, onConfirm, label }: {
  open: boolean; onCancel: () => void; onConfirm: () => void; label: string;
}) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="bg-background border-white/10">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Delete {label}?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} className="border-white/10 text-white hover:bg-white/5">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Shows Tab ───────────────────────────────────────────────────────────────

function ShowsTab() {
  const queryClient = useQueryClient();
  const { data: showsData } = useListShows();
  const { data: presentersData } = useListPresenters();
  const shows = Array.isArray(showsData) ? showsData : [];
  const presenters = Array.isArray(presentersData) ? presentersData : [];

  const createShow = useCreateShow();
  const updateShow = useUpdateShow();
  const deleteShow = useDeleteShow();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Show | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Show | null>(null);

  const blank: ShowInput = { title: "", description: "", category: "", imageUrl: "", presenterId: undefined, isFeatured: false };
  const [form, setForm] = useState<ShowInput>(blank);

  function openCreate() { setEditing(null); setForm(blank); setDialogOpen(true); }
  function openEdit(s: Show) {
    setEditing(s);
    setForm({ title: s.title, description: s.description, category: s.category, imageUrl: s.imageUrl ?? "", presenterId: s.presenterId ?? undefined, isFeatured: s.isFeatured });
    setDialogOpen(true);
  }

  function save() {
    const payload = { ...form, presenterId: form.presenterId || undefined, imageUrl: form.imageUrl || undefined };
    if (editing) {
      updateShow.mutate({ id: editing.id, data: payload as ShowUpdate }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/shows"] }); setDialogOpen(false); }
      });
    } else {
      createShow.mutate({ data: payload }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/shows"] }); setDialogOpen(false); }
      });
    }
  }

  return (
    <>
      <div className="glass rounded-2xl border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="font-bold text-lg text-white">Manage Shows</h3>
          <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold box-glow gap-2">
            <Plus className="w-4 h-4" /> Add New Show
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="text-xs uppercase bg-black/40 text-white/60">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Presenter</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shows.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-white/30">No shows yet. Add one above.</td></tr>
              )}
              {shows.map(show => (
                <tr key={show.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{show.title}</td>
                  <td className="px-6 py-4">{show.category}</td>
                  <td className="px-6 py-4">{show.presenterName ?? "—"}</td>
                  <td className="px-6 py-4">{show.isFeatured ? <span className="text-primary font-bold text-xs">Yes</span> : "No"}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10" onClick={() => openEdit(show)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => setDeleteTarget(show)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-background border-white/10 text-white max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Show" : "Add New Show"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Title *"><Input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Show title" /></Field>
            <Field label="Description"><Textarea className={textareaCls} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" /></Field>
            <Field label="Category *"><Input className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Hip-Hop, Jazz" /></Field>
            <Field label="Image URL"><Input className={inputCls} value={form.imageUrl ?? ""} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." /></Field>
            <Field label="Presenter">
              <Select value={form.presenterId?.toString() ?? "none"} onValueChange={v => setForm(f => ({ ...f, presenterId: v === "none" ? undefined : Number(v) }))}>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Select presenter" /></SelectTrigger>
                <SelectContent className="bg-background border-white/10">
                  <SelectItem value="none">None</SelectItem>
                  {presenters.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <div className="flex items-center gap-3">
              <Switch checked={form.isFeatured ?? false} onCheckedChange={v => setForm(f => ({ ...f, isFeatured: v }))} />
              <Label className="text-white/80">Featured show</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
            <Button onClick={save} disabled={!form.title || !form.category} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {editing ? "Save Changes" : "Create Show"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirm open={!!deleteTarget} label={deleteTarget?.title ?? "show"} onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { deleteShow.mutate({ id: deleteTarget!.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/shows"] }); setDeleteTarget(null); } }); }} />
    </>
  );
}

// ─── Presenters Tab ──────────────────────────────────────────────────────────

function PresentersTab() {
  const queryClient = useQueryClient();
  const { data: presentersData } = useListPresenters();
  const presenters = Array.isArray(presentersData) ? presentersData : [];

  const createPresenter = useCreatePresenter();
  const updatePresenter = useUpdatePresenter();
  const deletePresenter = useDeletePresenter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Presenter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Presenter | null>(null);

  const blank: PresenterInput = { name: "", role: "", bio: "", imageUrl: "", socialInstagram: "", socialTwitter: "", socialFacebook: "" };
  const [form, setForm] = useState<PresenterInput>(blank);

  function openCreate() { setEditing(null); setForm(blank); setDialogOpen(true); }
  function openEdit(p: Presenter) {
    setEditing(p);
    setForm({ name: p.name, role: p.role, bio: p.bio, imageUrl: p.imageUrl ?? "", socialInstagram: p.socialInstagram ?? "", socialTwitter: p.socialTwitter ?? "", socialFacebook: p.socialFacebook ?? "" });
    setDialogOpen(true);
  }

  function clean(f: PresenterInput) {
    return Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v === "" ? undefined : v])) as PresenterInput;
  }

  function save() {
    const payload = clean(form);
    if (editing) {
      updatePresenter.mutate({ id: editing.id, data: payload as PresenterUpdate }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/presenters"] }); setDialogOpen(false); }
      });
    } else {
      createPresenter.mutate({ data: payload }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/presenters"] }); setDialogOpen(false); }
      });
    }
  }

  return (
    <>
      <div className="glass rounded-2xl border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="font-bold text-lg text-white">Manage Presenters</h3>
          <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold box-glow gap-2">
            <Plus className="w-4 h-4" /> Add Presenter
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="text-xs uppercase bg-black/40 text-white/60">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Bio</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {presenters.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-white/30">No presenters yet.</td></tr>
              )}
              {presenters.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                    <img src={p.imageUrl || "/images/presenter-1.png"} alt="" className="w-8 h-8 rounded-full object-cover bg-white/10" />
                    {p.name}
                  </td>
                  <td className="px-6 py-4">{p.role}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{p.bio}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => setDeleteTarget(p)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-background border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Presenter" : "Add Presenter"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Name *"><Input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" /></Field>
            <Field label="Role *"><Input className={inputCls} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. Morning Drive DJ" /></Field>
            <Field label="Bio *"><Textarea className={textareaCls} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Short bio" /></Field>
            <Field label="Image URL"><Input className={inputCls} value={form.imageUrl ?? ""} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." /></Field>
            <Field label="Instagram"><Input className={inputCls} value={form.socialInstagram ?? ""} onChange={e => setForm(f => ({ ...f, socialInstagram: e.target.value }))} placeholder="https://instagram.com/..." /></Field>
            <Field label="Twitter / X"><Input className={inputCls} value={form.socialTwitter ?? ""} onChange={e => setForm(f => ({ ...f, socialTwitter: e.target.value }))} placeholder="https://x.com/..." /></Field>
            <Field label="Facebook"><Input className={inputCls} value={form.socialFacebook ?? ""} onChange={e => setForm(f => ({ ...f, socialFacebook: e.target.value }))} placeholder="https://facebook.com/..." /></Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
            <Button onClick={save} disabled={!form.name || !form.role || !form.bio} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {editing ? "Save Changes" : "Add Presenter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirm open={!!deleteTarget} label={deleteTarget?.name ?? "presenter"} onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { deletePresenter.mutate({ id: deleteTarget!.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/presenters"] }); setDeleteTarget(null); } }); }} />
    </>
  );
}

// ─── Posts Tab ───────────────────────────────────────────────────────────────

function PostsTab() {
  const queryClient = useQueryClient();
  const { data: postsData } = useListPosts();
  const posts = Array.isArray(postsData) ? postsData : [];

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  const blank: PostInput = { title: "", excerpt: "", content: "", category: "", tags: "", imageUrl: "", isFeatured: false };
  const [form, setForm] = useState<PostInput>(blank);

  function openCreate() { setEditing(null); setForm(blank); setDialogOpen(true); }
  function openEdit(p: Post) {
    setEditing(p);
    setForm({ title: p.title, excerpt: p.excerpt, content: p.content, category: p.category, tags: p.tags ?? "", imageUrl: p.imageUrl ?? "", isFeatured: p.isFeatured });
    setDialogOpen(true);
  }

  function save() {
    const payload = { ...form, tags: form.tags || undefined, imageUrl: form.imageUrl || undefined };
    if (editing) {
      updatePost.mutate({ id: editing.id, data: payload as PostUpdate }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/posts"] }); setDialogOpen(false); }
      });
    } else {
      createPost.mutate({ data: payload }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/posts"] }); setDialogOpen(false); }
      });
    }
  }

  return (
    <>
      <div className="glass rounded-2xl border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="font-bold text-lg text-white">Manage News Posts</h3>
          <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold box-glow gap-2">
            <Plus className="w-4 h-4" /> Add Post
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="text-xs uppercase bg-black/40 text-white/60">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-white/30">No posts yet.</td></tr>
              )}
              {posts.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-white max-w-xs truncate">{p.title}</td>
                  <td className="px-6 py-4">{p.category}</td>
                  <td className="px-6 py-4">{p.isFeatured ? <span className="text-primary font-bold text-xs">Yes</span> : "No"}</td>
                  <td className="px-6 py-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => setDeleteTarget(p)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-background border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Post" : "Add News Post"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Title *"><Input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Post title" /></Field>
            <Field label="Category *"><Input className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Music, Events" /></Field>
            <Field label="Excerpt *"><Textarea className={textareaCls} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Short summary shown in listings" /></Field>
            <Field label="Content *"><Textarea className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary min-h-[140px]" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Full article content" /></Field>
            <Field label="Tags"><Input className={inputCls} value={form.tags ?? ""} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="comma, separated, tags" /></Field>
            <Field label="Image URL"><Input className={inputCls} value={form.imageUrl ?? ""} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." /></Field>
            <div className="flex items-center gap-3">
              <Switch checked={form.isFeatured ?? false} onCheckedChange={v => setForm(f => ({ ...f, isFeatured: v }))} />
              <Label className="text-white/80">Featured post</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
            <Button onClick={save} disabled={!form.title || !form.category || !form.excerpt || !form.content} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {editing ? "Save Changes" : "Publish Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirm open={!!deleteTarget} label={deleteTarget?.title ?? "post"} onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { deletePost.mutate({ id: deleteTarget!.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/posts"] }); setDeleteTarget(null); } }); }} />
    </>
  );
}

// ─── Gallery Tab ─────────────────────────────────────────────────────────────

const GALLERY_CATEGORIES = ["Events", "Studio", "Presenters", "Promo"];

function GalleryTab() {
  const queryClient = useQueryClient();
  const { data: galleryData } = useListGallery();
  const gallery = Array.isArray(galleryData) ? galleryData : [];

  const createGalleryItem = useCreateGalleryItem();
  const updateGalleryItem = useUpdateGalleryItem();
  const deleteGalleryItem = useDeleteGalleryItem();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);

  const blank: GalleryInput = { imageUrl: "", caption: "", category: "Events" };
  const [form, setForm] = useState<GalleryInput>(blank);

  function openCreate() { setEditing(null); setForm(blank); setDialogOpen(true); }
  function openEdit(item: GalleryItem) {
    setEditing(item);
    setForm({ imageUrl: item.imageUrl, caption: item.caption, category: item.category });
    setDialogOpen(true);
  }

  function save() {
    if (editing) {
      updateGalleryItem.mutate({ id: editing.id, data: form }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/gallery"] }); setDialogOpen(false); }
      });
    } else {
      createGalleryItem.mutate({ data: form }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/gallery"] }); setDialogOpen(false); setForm(blank); }
      });
    }
  }

  return (
    <>
      <div className="glass rounded-2xl border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="font-bold text-lg text-white">Manage Gallery</h3>
          <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold box-glow gap-2">
            <Plus className="w-4 h-4" /> Add Image
          </Button>
        </div>

        {/* Table view for easier editing */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="text-xs uppercase bg-black/40 text-white/60">
              <tr>
                <th className="px-6 py-4">Preview</th>
                <th className="px-6 py-4">Caption</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {gallery.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-white/30">No gallery items yet.</td></tr>
              )}
              {gallery.map(item => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <img src={item.imageUrl} alt={item.caption} className="w-16 h-12 object-cover rounded-lg bg-white/5" />
                  </td>
                  <td className="px-6 py-4 font-medium text-white max-w-xs truncate">{item.caption}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10" onClick={() => openEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => setDeleteTarget(item)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-background border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Gallery Item" : "Add Gallery Image"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Image URL *">
              <Input className={inputCls} value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
            </Field>
            {form.imageUrl && (
              <img src={form.imageUrl} alt="preview" className="w-full h-40 object-cover rounded-lg bg-white/5" onError={e => (e.currentTarget.style.display = "none")} />
            )}
            <Field label="Caption *">
              <Input className={inputCls} value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} placeholder="Image caption" />
            </Field>
            <Field label="Category *">
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-background border-white/10">
                  {GALLERY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
            <Button onClick={save} disabled={!form.imageUrl || !form.caption} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {editing ? "Save Changes" : "Add Image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirm open={!!deleteTarget} label={deleteTarget?.caption ?? "image"} onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { deleteGalleryItem.mutate({ id: deleteTarget!.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/gallery"] }); setDeleteTarget(null); } }); }} />
    </>
  );
}

// ─── Schedule Tab ────────────────────────────────────────────────────────────

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function ScheduleTab() {
  const queryClient = useQueryClient();
  const [activeDay, setActiveDay] = useState("Monday");
  const { data: slotsData } = useListSchedule({ day: activeDay });
  const { data: showsData } = useListShows();
  const slots = Array.isArray(slotsData) ? slotsData : [];
  const shows = Array.isArray(showsData) ? showsData : [];

  const createSlot = useCreateScheduleSlot();
  const updateSlot = useUpdateScheduleSlot();
  const deleteSlot = useDeleteScheduleSlot();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleSlot | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScheduleSlot | null>(null);

  const blank: ScheduleSlotInput = { day: activeDay, startTime: "08:00", endTime: "10:00", showId: 0 };
  const [form, setForm] = useState<ScheduleSlotInput>(blank);

  function openCreate() { setEditing(null); setForm({ ...blank, day: activeDay }); setDialogOpen(true); }
  function openEdit(s: ScheduleSlot) {
    setEditing(s);
    setForm({ day: s.day, startTime: s.startTime, endTime: s.endTime, showId: s.showId });
    setDialogOpen(true);
  }

  function save() {
    if (!form.showId) return;
    if (editing) {
      updateSlot.mutate({ id: editing.id, data: form }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/schedule"] }); setDialogOpen(false); }
      });
    } else {
      createSlot.mutate({ data: form }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/schedule"] }); setDialogOpen(false); }
      });
    }
  }

  return (
    <>
      <div className="glass rounded-2xl border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="font-bold text-lg text-white">Manage Schedule</h3>
          <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold box-glow gap-2">
            <Plus className="w-4 h-4" /> Add Slot
          </Button>
        </div>
        <div className="p-4 border-b border-white/10 flex gap-2 overflow-x-auto">
          {DAYS.map(day => (
            <button key={day} onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeDay === day ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"}`}>
              {day}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="text-xs uppercase bg-black/40 text-white/60">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Show</th>
                <th className="px-6 py-4">Presenter</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-white/30">No slots for {activeDay}.</td></tr>
              )}
              {slots.map(s => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">{s.startTime.substring(0, 5)} – {s.endTime.substring(0, 5)}</td>
                  <td className="px-6 py-4 font-bold text-white">{s.showTitle}</td>
                  <td className="px-6 py-4">{s.presenterName}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => setDeleteTarget(s)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-background border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Schedule Slot" : "Add Schedule Slot"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Day">
              <Select value={form.day} onValueChange={v => setForm(f => ({ ...f, day: v }))}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-background border-white/10">
                  {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start Time"><Input type="time" className={inputCls} value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} /></Field>
              <Field label="End Time"><Input type="time" className={inputCls} value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} /></Field>
            </div>
            <Field label="Show *">
              <Select value={form.showId ? form.showId.toString() : ""} onValueChange={v => setForm(f => ({ ...f, showId: Number(v) }))}>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Select a show" /></SelectTrigger>
                <SelectContent className="bg-background border-white/10">
                  {shows.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
            <Button onClick={save} disabled={!form.showId} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {editing ? "Save Changes" : "Add Slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirm open={!!deleteTarget} label="schedule slot" onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { deleteSlot.mutate({ id: deleteTarget!.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/schedule"] }); setDeleteTarget(null); } }); }} />
    </>
  );
}

// ─── Inquiries Tab ───────────────────────────────────────────────────────────

function InquiriesTab() {
  const { data: inquiriesData } = useListContactInquiries();
  const inquiries = Array.isArray(inquiriesData) ? inquiriesData : [];
  const [viewing, setViewing] = useState<typeof inquiries[0] | null>(null);

  return (
    <>
      <div className="glass rounded-2xl border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/5">
          <h3 className="font-bold text-lg text-white">Contact & Advertising Inquiries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="text-xs uppercase bg-black/40 text-white/60">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4 text-right">View</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length === 0 && <tr><td colSpan={5} className="px-6 py-10 text-center text-white/30">No inquiries yet.</td></tr>}
              {inquiries.map(inq => (
                <tr key={inq.id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setViewing(inq)}>
                  <td className="px-6 py-4">{new Date(inq.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 uppercase text-xs font-bold text-primary">{inq.inquiryType ?? "General"}</td>
                  <td className="px-6 py-4 font-bold text-white">{inq.name}<br /><span className="text-xs text-muted-foreground font-normal">{inq.email}</span></td>
                  <td className="px-6 py-4 max-w-xs truncate">{inq.subject}</td>
                  <td className="px-6 py-4 text-right"><Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">View</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="bg-background border-white/10 text-white max-w-lg">
          <DialogHeader><DialogTitle>Inquiry from {viewing?.name}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3 py-2 text-sm">
              <div className="flex gap-2"><span className="text-white/50 w-20">Email:</span><span className="text-white">{viewing.email}</span></div>
              {viewing.phone && <div className="flex gap-2"><span className="text-white/50 w-20">Phone:</span><span className="text-white">{viewing.phone}</span></div>}
              <div className="flex gap-2"><span className="text-white/50 w-20">Type:</span><span className="text-primary font-bold uppercase text-xs">{viewing.inquiryType ?? "General"}</span></div>
              <div className="flex gap-2"><span className="text-white/50 w-20">Subject:</span><span className="text-white">{viewing.subject}</span></div>
              <div className="flex gap-2"><span className="text-white/50 w-20">Date:</span><span className="text-white">{new Date(viewing.createdAt).toLocaleString()}</span></div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-white/50 mb-2">Message:</p>
                <p className="text-white leading-relaxed whitespace-pre-wrap">{viewing.message}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewing(null)} className="bg-primary text-primary-foreground hover:bg-primary/90">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────

export default function Admin() {
  const { data: stats } = useGetStationStats();

  return (
    <div className="pt-8 pb-24 min-h-screen bg-black/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Station <span className="text-primary text-glow">Admin</span></h1>
          <p className="text-muted-foreground">Manage your content, schedule, and community.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={<Radio />} label="Shows" value={stats?.totalShows ?? 0} />
          <StatCard icon={<Mic />} label="DJs" value={stats?.totalPresenters ?? 0} />
          <StatCard icon={<FileText />} label="Posts" value={stats?.totalPosts ?? 0} />
          <StatCard icon={<ImageIcon />} label="Gallery" value={stats?.totalGalleryItems ?? 0} />
        </div>

        <Tabs defaultValue="shows" className="w-full">
          <TabsList className="bg-black/50 border border-white/10 w-full justify-start overflow-x-auto h-auto p-1 rounded-xl mb-8 no-scrollbar">
            <TabsTrigger value="shows" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-5 gap-2"><Radio className="w-4 h-4" /> Shows</TabsTrigger>
            <TabsTrigger value="presenters" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-5 gap-2"><Mic className="w-4 h-4" /> Presenters</TabsTrigger>
            <TabsTrigger value="posts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-5 gap-2"><FileText className="w-4 h-4" /> News</TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-5 gap-2"><ImageIcon className="w-4 h-4" /> Gallery</TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-5 gap-2"><Calendar className="w-4 h-4" /> Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="shows" className="m-0"><ShowsTab /></TabsContent>
          <TabsContent value="presenters" className="m-0"><PresentersTab /></TabsContent>
          <TabsContent value="posts" className="m-0"><PostsTab /></TabsContent>
          <TabsContent value="gallery" className="m-0"><GalleryTab /></TabsContent>
          <TabsContent value="schedule" className="m-0"><ScheduleTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="glass p-4 rounded-xl border-white/10 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors">
      <div className="text-primary mb-2 opacity-80">{icon}</div>
      <div className="text-2xl font-black text-white mb-1">{value}</div>
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
