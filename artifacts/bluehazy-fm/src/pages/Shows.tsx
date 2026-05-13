import { useListShows, useListSchedule } from "@workspace/api-client-react";
import { Calendar, Clock, Radio } from "lucide-react";
import { useState } from "react";

export default function Shows() {
  const [activeDay, setActiveDay] = useState("Monday");
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  const { data: shows, isLoading: loadingShows } = useListShows();
  const { data: scheduleSlots, isLoading: loadingSchedule } = useListSchedule({ day: activeDay });

  return (
    <div className="pt-8 pb-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Shows & <span className="text-primary text-glow">Schedule</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl">Discover our lineup of premium shows, guest DJs, and live broadcasts.</p>
        </div>

        {/* Schedule Section */}
        <section className="mb-20">
          <div className="glass rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Calendar className="w-6 h-6 text-primary" /> Weekly Schedule</h2>
            </div>
            
            {/* Days Tabs */}
            <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    activeDay === day 
                      ? "bg-primary text-primary-foreground box-glow" 
                      : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Schedule List */}
            <div className="space-y-4">
              {loadingSchedule ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
                ))
              ) : scheduleSlots && scheduleSlots.length > 0 ? (
                scheduleSlots.map((slot) => (
                  <div key={slot.id} className={`glass p-4 rounded-xl flex flex-col md:flex-row md:items-center gap-4 border-l-4 ${slot.isLive ? 'border-primary bg-primary/5' : 'border-transparent'}`}>
                    <div className="flex items-center gap-2 text-primary font-bold min-w-[150px]">
                      <Clock className="w-4 h-4" />
                      {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{slot.showTitle}</h3>
                      <p className="text-sm text-muted-foreground">with {slot.presenterName}</p>
                    </div>
                    {slot.isLive && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live Now
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No shows scheduled for {activeDay}.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* All Shows Grid */}
        <section>
          <h2 className="text-3xl font-bold mb-8">All Shows</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loadingShows ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="glass rounded-xl h-72 animate-pulse" />
              ))
            ) : shows?.map((show) => (
              <div key={show.id} className="group relative rounded-xl overflow-hidden glass border-white/10 hover:border-primary/50 transition-all duration-300 flex flex-col h-full">
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={show.imageUrl || '/images/show-1.png'} 
                    alt={show.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">{show.category}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{show.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{show.description}</p>
                  <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                    <span className="text-xs font-medium text-white">{show.presenterName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
