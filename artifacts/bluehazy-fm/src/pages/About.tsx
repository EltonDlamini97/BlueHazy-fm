import { useListPresenters } from "@workspace/api-client-react";
import { SiFacebook, SiTiktok, SiInstagram, SiX } from "react-icons/si";
import { Mic, Radio, Award, Heart, Globe, Users } from "lucide-react";

export default function About() {
  const { data: presentersData, isLoading } = useListPresenters();
  const presenters = Array.isArray(presentersData) ? presentersData : [];

  return (
    <div className="pt-8 pb-24">
      {/* Hero */}
      <section className="relative py-20 md:py-32 mb-16 rounded-3xl overflow-hidden glass border-white/10 mx-4">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity" style={{ backgroundImage: "url('/images/studio-bg.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="container relative z-10 px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-black mb-6">More Than Just a <span className="text-primary text-glow">Radio Station</span></h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8">
              We are the heartbeat of the community. A platform for emerging artists, unfiltered voices, and uninterrupted vibes. Born in the underground, broadcasting to the world.
            </p>
            <div className="flex flex-wrap gap-6 text-sm font-bold text-white">
              <div className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Global Reach</div>
              <div className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> 1M+ Listeners</div>
              <div className="flex items-center gap-2"><Radio className="w-5 h-5 text-primary" /> 24/7 Live</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Our Mission & Values */}
        <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-2xl border-white/10 hover:border-primary/50 transition-colors">
              <Mic className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Authentic Voices</h3>
              <p className="text-muted-foreground leading-relaxed">
                We believe in raw, unedited, and authentic broadcasting. No corporate filters, just real people talking about real things and playing the music that matters.
              </p>
            </div>
            <div className="glass p-8 rounded-2xl border-white/10 hover:border-primary/50 transition-colors">
              <Heart className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Community First</h3>
              <p className="text-muted-foreground leading-relaxed">
                We exist for our listeners. From hosting local events to spotlighting neighborhood artists, our community is the core of everything we do.
              </p>
            </div>
            <div className="glass p-8 rounded-2xl border-white/10 hover:border-primary/50 transition-colors">
              <Award className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Sonic Excellence</h3>
              <p className="text-muted-foreground leading-relaxed">
                We don't compromise on sound quality. Our state-of-the-art studios and expert audio engineers ensure every beat drops exactly as it should.
              </p>
            </div>
          </div>
        </section>

        {/* Presenters */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Meet Our <span className="text-primary text-glow">Voices</span></h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">The personalities behind the mics who keep the station alive 24/7.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="glass rounded-xl h-[400px] animate-pulse" />
              ))
            ) : presenters.map((presenter, i) => (
              <div key={presenter.id} className="group relative rounded-xl overflow-hidden glass border-white/10 hover:border-primary/50 transition-all duration-300">
                <div className="aspect-[3/4] w-full overflow-hidden">
                  <img 
                    src={presenter.imageUrl || (i % 2 === 0 ? '/images/presenter-1.png' : '/images/presenter-2.png')} 
                    alt={presenter.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80" />
                </div>
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{presenter.name}</h3>
                  <p className="text-primary font-medium mb-3">{presenter.role}</p>
                  <p className="text-sm text-white/80 line-clamp-2 mb-4">{presenter.bio}</p>
                  <div className="flex items-center gap-3">
                    {presenter.socialInstagram && <a href={presenter.socialInstagram} className="w-8 h-8 rounded-full bg-white/10 hover:bg-primary text-white flex items-center justify-center transition-colors"><SiInstagram className="w-3 h-3" /></a>}
                    {presenter.socialTwitter && <a href={presenter.socialTwitter} className="w-8 h-8 rounded-full bg-white/10 hover:bg-primary text-white flex items-center justify-center transition-colors"><SiX className="w-3 h-3" /></a>}
                    {presenter.socialFacebook && <a href={presenter.socialFacebook} className="w-8 h-8 rounded-full bg-white/10 hover:bg-primary text-white flex items-center justify-center transition-colors"><SiFacebook className="w-3 h-3" /></a>}
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
