import { useListGallery } from "@workspace/api-client-react";
import { useState } from "react";
import { Maximize2, Image as ImageIcon } from "lucide-react";

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", "Events", "Studio", "Presenters", "Promo"];
  
  const { data: galleryItems, isLoading } = useListGallery();

  const filteredItems = activeCategory === "All" 
    ? galleryItems 
    : galleryItems?.filter(item => item.category === activeCategory);

  return (
    <div className="pt-8 pb-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Our <span className="text-primary text-glow">Gallery</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Visuals from our events, studio sessions, and the community.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === category 
                  ? "bg-primary text-primary-foreground box-glow" 
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Masonry/Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl animate-pulse" style={{ height: `${200 + Math.random() * 200}px` }} />
            ))
          ) : filteredItems?.length ? (
            filteredItems.map((item, i) => (
              <div key={item.id} className="group relative rounded-xl overflow-hidden glass break-inside-avoid">
                <img 
                  src={item.imageUrl || (i % 2 === 0 ? '/images/gallery-1.png' : '/images/gallery-2.png')} 
                  alt={item.caption} 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">{item.category}</span>
                    <p className="text-white font-medium text-sm">{item.caption}</p>
                  </div>
                  <button className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-primary text-white rounded-full backdrop-blur transition-colors opacity-0 group-hover:opacity-100">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center">
              <ImageIcon className="w-16 h-16 text-white/20 mb-4" />
              <p className="text-muted-foreground text-lg">No images found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
