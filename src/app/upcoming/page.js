import { getUpcomingMovies } from "@/utils/tmdb";
import Image from "next/image";
import { Calendar, Star } from "lucide-react";
import Link from "next/link";

export default async function UpcomingPage() {
  const upcomingMovies = await getUpcomingMovies();

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="container-custom page-pt pb-20">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
              Coming <span className="text-primary italic">Soon</span>
            </h1>
            <p className="mt-2 text-sm font-medium text-zinc-500 md:text-base">
              Get a sneak peek at the most anticipated movies hitting theaters soon.
            </p>
          </div>
        </div>

        {upcomingMovies.length === 0 ? (
          <div className="flex h-60 items-center justify-center rounded-3xl border border-white/5 bg-white/5 text-zinc-500 font-bold uppercase tracking-widest">
            No upcoming movies found at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                <Link key={movie.id} href={`/upcoming/${movie.id}`} className="group relative w-full">
                  <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 shadow-2xl relative transition-all duration-300 group-hover:ring-2 group-hover:ring-primary/50 group-hover:shadow-[0_0_30px_rgba(229,9,20,0.3)]">
                    {/* Movie Image */}
                    <Image
                      src={movie.image_url || "/placeholder-card.jpg"}
                      alt={movie.title}
                      fill
                      className="object-cover transition-transform duration-700 md:group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />
  
                    {/* Date Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md border border-white/10">
                         <Calendar size={10} className="text-primary" /> {movie.release_date}
                      </span>
                    </div>
                  </div>
  
                  {/* Info */}
                  <div className="mt-4">
                    <h3 className="font-display text-sm font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-wider">
                       <span className="flex items-center gap-1 text-primary">
                          <Star size={10} fill="currentColor" /> {movie.rating}
                       </span>
                       <span className="h-0.5 w-0.5 rounded-full bg-zinc-700" />
                       <span>TMDB</span>
                    </div>
                  </div>
                </Link>
          </div>
        )}
      </div>
    </main>
  );
}
