import { Link } from "wouter";
import { SiFacebook, SiTiktok, SiInstagram, SiWhatsapp, SiYoutube, SiX } from "react-icons/si";
import logoPath from "@assets/OIP_(1)_1778692461968.webp";

export function Footer() {
  return (
    <footer className="bg-background border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <img src={logoPath} alt="BlueHazy FM Logo" className="w-10 h-10 object-cover rounded" />
              <span className="font-black text-xl text-glow text-white tracking-tight">
                BlueHazy FM
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              The pulse of the city. Let your voice be heard on the most immersive online radio station.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><SiInstagram className="w-5 h-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><SiX className="w-5 h-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><SiFacebook className="w-5 h-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><SiYoutube className="w-5 h-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><SiTiktok className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/shows" className="text-muted-foreground hover:text-primary transition-colors">Shows & Schedule</Link></li>
              <li><Link href="/presenters" className="text-muted-foreground hover:text-primary transition-colors">Our DJs</Link></li>
              <li><Link href="/news" className="text-muted-foreground hover:text-primary transition-colors">Latest News</Link></li>
              <li><Link href="/gallery" className="text-muted-foreground hover:text-primary transition-colors">Gallery</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Station</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/advertise" className="text-muted-foreground hover:text-primary transition-colors">Advertise With Us</Link></li>
              <li><Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">Subscribe for the latest updates and event info.</p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-white/5 border border-white/10 rounded-l-md px-4 py-2 text-sm w-full focus:outline-none focus:border-primary"
              />
              <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-r-md text-sm font-bold hover:bg-primary/90">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-xs text-muted-foreground flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} BlueHazy FM. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
