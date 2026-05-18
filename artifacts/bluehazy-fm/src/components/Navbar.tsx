import { Link, useLocation } from "wouter";
import { Menu, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import logoPath from "@assets/OIP_(1)_1778692461968.webp";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setIsOpen(false); }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const links = [
    { href: "/", label: "Home" },
    { href: "/live", label: "Live Radio" },
    { href: "/shows", label: "Shows" },
    { href: "/news", label: "News" },
    { href: "/gallery", label: "Gallery" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[hsl(225,50%,8%)]">
        <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <img src={logoPath} alt="BlueHazy FM Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded" />
            <span className="font-black text-lg sm:text-xl md:text-2xl text-glow text-white tracking-tight">
              BlueHazy FM
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-primary ${
                  location === link.href ? "text-primary text-glow" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Link href="/live">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold box-glow rounded-full px-6">
                <Play className="w-4 h-4 mr-2" /> Listen Live
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-white rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile full-screen menu overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 flex flex-col"
          style={{ background: "hsl(225, 50%, 8%)" }}
        >
          {/* Header row inside overlay */}
          <div className="flex items-center justify-between px-4 h-16 sm:h-20 border-b border-white/10 shrink-0">
            <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
              <img src={logoPath} alt="BlueHazy FM Logo" className="w-8 h-8 object-cover rounded" />
              <span className="font-black text-lg text-white tracking-tight">BlueHazy FM</span>
            </Link>
            <button
              className="p-2 text-white rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 flex flex-col justify-center px-6 gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center py-4 text-2xl font-bold border-b border-white/5 transition-colors ${
                  location === link.href
                    ? "text-primary"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
                {location === link.href && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          {/* Bottom CTA */}
          <div className="px-6 pb-8 pt-4 shrink-0">
            <Link href="/live" onClick={() => setIsOpen(false)}>
              <Button className="w-full h-14 text-lg bg-primary text-primary-foreground font-bold box-glow rounded-full">
                <Play className="w-5 h-5 mr-2" /> Listen Live
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
