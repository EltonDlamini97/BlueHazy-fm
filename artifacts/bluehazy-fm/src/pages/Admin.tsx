import { useState } from "react";
import { 
  useGetStationStats, useListShows, useListPresenters, useListPosts, useListGallery,
  useCreateShow, useDeleteShow, useCreatePresenter, useDeletePresenter,
  useListContactInquiries, useListNewsletterSubscribers 
} from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radio, Mic, FileText, Image as ImageIcon, MessageSquare, Users, Calendar, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export default function Admin() {
  const { data: stats } = useGetStationStats();
  const queryClient = useQueryClient();

  const { data: shows } = useListShows();
  const { data: presenters } = useListPresenters();
  const { data: posts } = useListPosts();
  const { data: gallery } = useListGallery();
  const { data: inquiries } = useListContactInquiries();
  const { data: subscribers } = useListNewsletterSubscribers();

  const deleteShow = useDeleteShow();
  const deletePresenter = useDeletePresenter();

  const handleDeleteShow = (id: number) => {
    if(confirm("Are you sure?")) {
      deleteShow.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/shows'] })
      });
    }
  }

  const handleDeletePresenter = (id: number) => {
    if(confirm("Are you sure?")) {
      deletePresenter.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/presenters'] })
      });
    }
  }

  return (
    <div className="pt-8 pb-24 min-h-screen bg-black/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Station <span className="text-primary text-glow">Admin</span></h1>
          <p className="text-muted-foreground">Manage your content, schedule, and community.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <StatCard icon={<Radio />} label="Shows" value={stats?.totalShows || 0} />
          <StatCard icon={<Mic />} label="DJs" value={stats?.totalPresenters || 0} />
          <StatCard icon={<FileText />} label="Posts" value={stats?.totalPosts || 0} />
          <StatCard icon={<ImageIcon />} label="Gallery" value={stats?.totalGalleryItems || 0} />
          <StatCard icon={<MessageSquare />} label="Inquiries" value={stats?.totalInquiries || 0} />
          <StatCard icon={<Users />} label="Subs" value={stats?.totalSubscribers || 0} />
        </div>

        <Tabs defaultValue="shows" className="w-full">
          <TabsList className="bg-black/50 border border-white/10 w-full justify-start overflow-x-auto h-auto p-1 rounded-xl mb-8 no-scrollbar">
            <TabsTrigger value="shows" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6"><Radio className="w-4 h-4 mr-2" /> Shows</TabsTrigger>
            <TabsTrigger value="presenters" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6"><Mic className="w-4 h-4 mr-2" /> Presenters</TabsTrigger>
            <TabsTrigger value="posts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6"><FileText className="w-4 h-4 mr-2" /> News</TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6"><ImageIcon className="w-4 h-4 mr-2" /> Gallery</TabsTrigger>
            <TabsTrigger value="inquiries" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6"><MessageSquare className="w-4 h-4 mr-2" /> Messages</TabsTrigger>
            <TabsTrigger value="subscribers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6"><Users className="w-4 h-4 mr-2" /> Subscribers</TabsTrigger>
          </TabsList>

          {/* Shows Tab */}
          <TabsContent value="shows" className="m-0">
            <div className="glass rounded-2xl border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="font-bold text-lg text-white">Manage Shows</h3>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold box-glow">Add New Show</Button>
              </div>
              <div className="p-0 overflow-x-auto">
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
                        <td className="px-6 py-4">{show.presenterName}</td>
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

          {/* Presenters Tab */}
          <TabsContent value="presenters" className="m-0">
            <div className="glass rounded-2xl border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="font-bold text-lg text-white">Manage Presenters</h3>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold box-glow">Add Presenter</Button>
              </div>
              <div className="p-0 overflow-x-auto">
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
                        <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                          <img src={presenter.imageUrl || ''} alt="" className="w-8 h-8 rounded-full object-cover bg-white/10" />
                          {presenter.name}
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

          {/* Posts Tab */}
          <TabsContent value="posts" className="m-0">
             <div className="glass rounded-2xl border-white/10 overflow-hidden p-8 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-white mb-2">News Management</h3>
                <p>Full CRUD interface for news articles goes here.</p>
             </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="m-0">
             <div className="glass rounded-2xl border-white/10 overflow-hidden p-8 text-center text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-white mb-2">Gallery Management</h3>
                <p>Upload and categorize images for the public gallery.</p>
             </div>
          </TabsContent>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries" className="m-0">
             <div className="glass rounded-2xl border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-white/5">
                  <h3 className="font-bold text-lg text-white">Contact & Advertising Inquiries</h3>
                </div>
                <div className="p-0 overflow-x-auto">
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
                        <td className="px-6 py-4 uppercase text-xs font-bold text-primary">{inquiry.inquiryType}</td>
                        <td className="px-6 py-4 font-bold text-white">{inquiry.name} <br/><span className="text-xs text-muted-foreground font-normal">{inquiry.email}</span></td>
                        <td className="px-6 py-4 max-w-xs truncate">{inquiry.subject}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
             </div>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="m-0">
            <div className="glass rounded-2xl border-white/10 overflow-hidden p-8 text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-white mb-2">Newsletter Subscribers</h3>
                <p>{subscribers?.length || 0} active subscribers</p>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: number | string }) {
  return (
    <div className="glass p-4 rounded-xl border-white/10 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors">
      <div className="text-primary mb-2 opacity-80">{icon}</div>
      <div className="text-2xl font-black text-white mb-1">{value}</div>
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
