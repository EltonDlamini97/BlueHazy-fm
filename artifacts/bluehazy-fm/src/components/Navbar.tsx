import { Link, useLocation } from "wouter";
import { Radio, Menu, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logoPath from "@assets/OIP_(1)_1778692461968.webp";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

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
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src={logoPath} alt="BlueHazy FM Logo" className="w-10 h-10 object-cover rounded" />
          <span className="font-black text-xl md:text-2xl text-glow text-white tracking-tight">
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

        {/* Mobile Toggle */}
        <button className="lg:hidden p-2 text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full glass border-b border-white/10 py-4 flex flex-col gap-4 px-4 shadow-xl">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block py-2 text-lg font-medium ${
                location === link.href ? "text-primary text-glow" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/live" onClick={() => setIsOpen(false)}>
            <Button className="w-full bg-primary text-primary-foreground font-bold box-glow rounded-full mt-2">
              <Play className="w-4 h-4 mr-2" /> Listen Live
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
