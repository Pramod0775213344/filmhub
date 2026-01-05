import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Download, Shield, Zap, Globe, Share2, ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import { slugify } from "@/utils/slugify";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: movie } = await supabase.from("movies").select("title").eq("id", id).single();
  
  return {
    title: `Download ${movie?.title || 'Movie'} | FilmHub`,
    description: `Secure download links for ${movie?.title || 'Movie'}.`,
  };
}

export default async function DownloadPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: movie } = await supabase
    .from("movies")
    .select("*")
    .eq("id", id)
    .single();

  if (!movie) notFound();

  const { data: links } = await supabase
    .from("movie_links")
    .select("*")
    .eq("movie_id", id);

  return (
    <main className="min-h-screen bg-[#020202] text-white pt-24">
      <div className="container-custom max-w-4xl mx-auto px-4 py-12">
        
        {/* Back Link */}
        <Link 
          href={`/movies/${slugify(movie.title)}`} 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Movie</span>
        </Link>

        {/* Movie Header Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/40 p-8 md:p-12 mb-12">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Download size={120} />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="relative w-32 h-48 shrink-0 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    <Image 
                        src={movie.image_url || movie.image} 
                        alt={movie.title} 
                        fill 
                        className="object-cover" 
                    />
                </div>
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/10">Movie Download</span>
                        <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-white/5">{movie.year}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter">{movie.title}</h1>
                    <p className="text-zinc-400 font-medium max-w-xl">
                        Secure high-speed download mirrors are ready. Please select your preferred quality to proceed to the secure download servers.
                    </p>
                </div>
            </div>
        </div>

        {/* Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
                { icon: <Shield size={18} className="text-green-500" />, label: "Security", val: "Verified Safe" },
                { icon: <Zap size={18} className="text-yellow-500" />, label: "Speed", val: "No Limits" },
                { icon: <Globe size={18} className="text-blue-500" />, label: "Mirrors", val: "Active" }
            ].map((stat, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-white/5">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5">
                        {stat.icon}
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold leading-none mb-1">{stat.label}</p>
                        <p className="font-bold text-white leading-none">{stat.val}</p>
                    </div>
                </div>
            ))}
        </div>

        {/* Download Options */}
        <div className="space-y-8">
            <h2 className="text-2xl font-black uppercase tracking-wider flex items-center gap-4">
                <div className="h-1 w-8 bg-primary rounded-full"></div>
                Select Video Quality
            </h2>

            <div className="grid grid-cols-1 gap-10">
                {links && links.length > 0 ? (
                    Object.values(links.reduce((acc, link) => {
                        const q = link.quality || "Unknown";
                        if (!acc[q]) acc[q] = { quality: q, size: link.size, mirrors: [] };
                        acc[q].mirrors.push(link);
                        return acc;
                    }, {})).map((group, i) => (
                        <div 
                            key={i}
                            className="group relative flex flex-col items-stretch gap-8 rounded-[2.5rem] border border-white/5 bg-zinc-900/40 p-8 md:p-10 transition-all hover:bg-zinc-900/60 hover:border-primary/20 shadow-2xl"
                        >
                            {/* Quality & Size Header */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
                                <div className="flex items-center gap-6">
                                    <div className={`h-20 w-20 shrink-0 flex flex-col items-center justify-center rounded-2xl font-black ring-2 ring-white/5 shadow-xl ${
                                        group.quality.toLowerCase().includes('1080') || group.quality.toLowerCase().includes('4k')
                                        ? "bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 text-yellow-500"
                                        : "bg-gradient-to-br from-blue-500/20 to-blue-600/5 text-blue-500"
                                    }`}>
                                        <span className="text-2xl leading-none">{group.quality.replace(/p/i, '')}</span>
                                        <span className="text-[10px] uppercase tracking-[0.2em] opacity-80">{group.quality.toLowerCase().includes('p') ? 'p' : ''} HD</span>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                                            {group.quality} Quality
                                            <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest border border-green-500/20">Optimal</span>
                                        </h3>
                                        <div className="flex items-center gap-4 text-zinc-500 text-sm font-medium">
                                            <span className="flex items-center gap-2 text-primary font-bold">
                                                <Zap size={14} /> {group.size || "Unknown Size"}
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-zinc-700" />
                                            <span>Multiple Secure Mirrors</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                                    <Shield size={14} className="text-green-500" /> Secure Download
                                </div>
                            </div>

                            {/* Options Buttons Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {group.mirrors.map((mirror, idx) => (
                                    <a 
                                        key={idx}
                                        href={mirror.url} 
                                        target="_blank"
                                        className={`flex flex-col items-center justify-center gap-1 px-6 py-5 rounded-2xl transition-all group/btn shadow-lg border ${
                                            idx === 0 
                                            ? "bg-white text-black border-white hover:bg-primary hover:text-white hover:border-primary" 
                                            : "bg-zinc-800/50 text-white border-white/5 hover:border-primary/50 hover:bg-zinc-800"
                                        }`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 group-hover/btn:opacity-100 mb-1">
                                            Mirror 0{idx + 1}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-xs uppercase tracking-wider">{mirror.provider}</span>
                                            <Download size={14} className="opacity-50" />
                                        </div>
                                    </a>
                                ))}
                                
                                {/* Placeholder for better grid if few mirrors */}
                                {group.mirrors.length < 4 && Array(4 - group.mirrors.length).fill(null).map((_, idx) => (
                                    <div key={`empty-${idx}`} className="hidden md:flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl opacity-20 cursor-not-allowed">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Mirror Slot</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-20 text-center rounded-[3rem] border border-dashed border-white/10 bg-white/5">
                        <p className="text-zinc-500 italic">No specific mirrors found for this movie. Check back soon.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-24 p-8 rounded-3xl bg-zinc-900/20 border border-white/5 text-center">
            <p className="text-zinc-500 text-xs leading-relaxed max-w-2xl mx-auto">
                All download links are hosted on third-party servers. <b>FilmHub</b> does not host any media files. We recommend using a stable internet connection and an updated browser for the best experience. Proceeding means you agree to our terms of service regarding content safety.
            </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
