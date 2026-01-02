"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Film, 
  Tv, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  Bell,
  User,
  ChevronRight,
  Play,
  Clapperboard,
  Globe
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const menuItems = [
  { name: "Analytics", href: "/admin/dashboard", icon: BarChart3 },
  { name: "Movies", href: "/admin/dashboard/movies", icon: Film },
  { name: "Sinhala Movies", href: "/admin/dashboard/sinhala-movies", icon: Clapperboard },
  { name: "Korean Dramas", href: "/admin/dashboard/korean-dramas", icon: Globe },
  { name: "TV Shows", href: "/admin/dashboard/tv-shows", icon: Tv },
  { name: "Users", href: "/admin/dashboard/users", icon: Users },
  { name: "Settings", href: "/admin/dashboard/settings", icon: Settings },
];

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== "admin@gmail.com") {
        router.push("/");
        return;
      }
      setUser(user);
      setLoading(false);
    };
    checkAuth();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050505] text-zinc-400">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-zinc-950/50 backdrop-blur-3xl ring-1 ring-white/5 transition-transform duration-300 md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-24 items-center gap-3 px-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_rgba(229,9,20,0.4)]">
            <Play size={20} fill="white" className="text-white ml-1" />
          </div>
          <span className="font-display text-xl font-black tracking-tighter text-white">
            ADMIN<span className="text-primary">HUB</span>
          </span>
        </div>

        <nav className="flex-grow space-y-2 px-4 py-8">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all ${
                  isActive 
                    ? "bg-primary text-white shadow-[0_0_20px_rgba(229,9,20,0.2)]" 
                    : "hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                <span className="flex-grow">{item.name}</span>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleSignOut}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/10"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-grow flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="flex h-24 items-center justify-between px-8 border-b border-white/5 bg-zinc-950/30 backdrop-blur-xl">
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-white">
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className="relative hidden w-96 flex-shrink-0 md:block">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Quick search..."
              className="h-11 w-full rounded-xl bg-white/5 pl-12 pr-4 text-sm font-bold outline-none ring-1 ring-white/5 transition-all focus:bg-white/10 focus:ring-primary/40"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-zinc-500 transition-colors hover:text-white">
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-zinc-950" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white uppercase tracking-tighter">Admin User</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{user?.email}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-zinc-800 ring-1 ring-white/10 flex items-center justify-center overflow-hidden">
                <User size={20} className="text-zinc-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
