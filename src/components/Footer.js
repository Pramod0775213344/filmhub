"use client";

import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-secondary py-20 text-zinc-400">
      <div className="container-custom">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-12 lg:gap-8">
          {/* Logo and About */}
          <div className="space-y-6 md:col-span-1">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-2xl font-black tracking-tighter text-primary">
                FILMHUB
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Your ultimate destination for cinematic excellence. Stream the latest movies and TV shows in stunning 4K quality.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="transition-colors hover:text-primary" aria-label="Facebook">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="transition-colors hover:text-primary" aria-label="Twitter">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="transition-colors hover:text-primary" aria-label="Instagram">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="transition-colors hover:text-primary" aria-label="Youtube">
                <Youtube size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-6 font-bold text-white">Explore</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/movies" className="transition-colors hover:text-primary">Movies</Link></li>
              <li><Link href="/tv-shows" className="transition-colors hover:text-primary">TV Shows</Link></li>
              <li><Link href="/korean-dramas" className="transition-colors hover:text-primary">Korean Dramas</Link></li>
              <li><Link href="/my-list" className="transition-colors hover:text-primary">My Watchlist</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-6 font-bold text-white">Support</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="#" className="transition-colors hover:text-primary">Help Center</Link></li>
              <li><Link href="#" className="transition-colors hover:text-primary">Account</Link></li>
              <li><Link href="#" className="transition-colors hover:text-primary">Subscription</Link></li>
              <li><Link href="#" className="transition-colors hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-6 font-bold text-white">Legal</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="#" className="transition-colors hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="transition-colors hover:text-primary">Terms of Service</Link></li>
              <li><Link href="#" className="transition-colors hover:text-primary">Cookie Preferences</Link></li>
              <li><Link href="#" className="transition-colors hover:text-primary">Corporate Info</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-zinc-800 pt-8 text-center text-xs">
          <p suppressHydrationWarning>&copy; {new Date().getFullYear()} FilmHub Inc. Design by Pramod Ravisanka.</p>
        </div>
      </div>
    </footer>
  );
}
