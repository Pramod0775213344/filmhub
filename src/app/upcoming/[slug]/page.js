import { getTMDBDetails } from "@/utils/tmdb";
import Image from "next/image";
import { Calendar, Star, Clock, Globe, User, Video, Info } from "lucide-react";
import Link from "next/link";

export default async function UpcomingDetailsPage({ params }) {
  const { slug } = await params;
  
  // The slug here is the TMDB ID (passed from upcoming list)
  const movie = await getTMDBDetails(slug, "movie");

  if (!movie) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-white">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black italic text-primary">404</h2>
          <p className="text-zinc-500">චිත්‍රපට විස්තර සොයාගත නොහැක.</p>
          <Link href="/upcoming" className="inline-block bg-primary px-8 py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-transform active:scale-95">බලාපොරොත්තු වන්න</Link>
        </div>
      </div>
    );
  }

  // Generate Sinhala description (Upcoming style)
  const sinhalaDescription = `ආයුබෝවන් කියලා පිළිගන්නවා අපේ වෙබ් අඩවියට එන ඔබ සැමදෙනාම! සිනමා ලෝකයේ ඉදිරියේදී දිගහැරෙන්නට නියමිත අතිශය උද්වේගකර සිනමා නිර්මාණයක් වන ''${movie.title}'' පිළිබඳ තොරතුරු තමයි අද අපි ඔබ වෙත අරගෙන ආවේ. තවමත් තිරගත වීමට සූදානම් වෙමින් පවතින මෙම නිර්මාණය, ලොව පුරා රසිකයන් දැඩි උනන්දුවකින් බලාපොරොත්තුවෙන් සිටින එකක් බව නිසැකයි.

මෙහි කතාව සහ ලබා දී ඇති තොරතුරු අනුව, මෙය අපව කුතුහලයෙන් සහ ආවේගයෙන් පිනා යන අත්දැකීමකට අරගෙන යනවා පමණක් නොව, සිනමා ලෝකයේ අලුත් සන්ධිස්ථානයක් වනු ඇත. තවමත් මෙය තිරගත වී නොමැති අතර, නුදුරු අනාගතයේදී මෙය අපගේ වෙබ් අඩවිය හරහා ඔබට නැරඹීමට අවස්ථාව ලැබෙනු ඇත.

එහෙනම් යාලුවනේ, මේ මහා සිනමා නිර්මාණය පැමිණෙන තෙක් අපි හැමෝම නොඉවසිල්ලෙන් බලා සිටිමු. මෙය තිරගත වූ සැනින් සිංහල උපසිරැසි සමඟින් නරඹන්න ඔබත් අදම අප සමඟ එකතු වී රැඳී සිටින්න. ජය වේවා!`;

  return (
    <main className="min-h-screen bg-background text-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden md:h-[80vh]">
        <Image
          src={movie.backdrop_url || movie.image_url}
          alt={movie.title}
          fill
          priority
          className="object-cover transition-transform duration-1000 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-background to-transparent" />
        
        {/* Release Date Focus */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="inline-flex items-center gap-3 rounded-full bg-primary/20 px-6 py-2 backdrop-blur-xl border border-primary/30 text-primary mb-6 animate-bounce">
                <Calendar size={20} className="fill-current" />
                <span className="text-sm font-black uppercase tracking-[0.2em]">ළඟදීම බලාපොරොත්තු වන්න</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter sm:text-6xl md:text-8xl lg:text-9xl drop-shadow-2xl mb-4">
                {movie.title}
            </h1>
            <div className="flex flex-col items-center gap-4">
                <p className="text-xl font-medium text-zinc-400 uppercase tracking-[0.3em]">Release Date</p>
                <span className="text-5xl md:text-7xl font-black text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                    {movie.year || "COMING SOON"}
                </span>
            </div>
        </div>
      </div>

      <div className="container-custom relative z-10 -mt-32 pb-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          
          {/* Left Column: Poster & Quick Info */}
          <div className="space-y-8">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10 group">
              <Image
                src={movie.image_url}
                alt={movie.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            
            <div className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Rating</span>
                    <span className="flex items-center gap-2 text-yellow-500 font-black">
                        <Star size={18} fill="currentColor" /> {movie.rating}
                    </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Category</span>
                    <span className="text-white font-bold">{movie.category}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Duration</span>
                    <span className="text-white font-bold">{movie.duration || "TBA"}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Language</span>
                    <span className="text-white font-bold">{movie.language}</span>
                </div>
            </div>
          </div>

          {/* Right Column: Descriptions & Details */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Storyline Section */}
            <section className="space-y-8">
                <div className="rounded-3xl border border-white/5 bg-white/5 p-8 md:p-12 backdrop-blur-sm">
                    <h3 className="mb-8 text-2xl font-black text-white uppercase tracking-wider flex items-center gap-4">
                        <Info className="text-primary w-8 h-8" /> 
                        අභිරහස් දිගහැරුම (Storyline)
                    </h3>
                    <div className="space-y-8">
                        {sinhalaDescription.split('\n\n').map((para, i) => (
                            <p key={i} className={`text-xl leading-relaxed ${i === 0 ? "text-primary font-bold" : "text-zinc-300"}`}>
                                {para}
                            </p>
                        ))}
                    </div>

                    <div className="mt-12 pt-12 border-t border-white/5">
                        <h4 className="text-zinc-500 font-bold uppercase tracking-widest text-sm mb-4">Original Overview (EN)</h4>
                        <p className="text-zinc-400 italic text-lg leading-relaxed">
                            {movie.description}
                        </p>
                    </div>
                </div>
            </section>

            {/* Cast Section */}
            <section className="space-y-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-4">
                    <User className="text-primary w-8 h-8" /> 
                    රංගනය (Cast)
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {movie.cast_details?.map((actor, idx) => (
                        <div key={idx} className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/5 p-3 transition-all hover:bg-white/10">
                            <div className="relative aspect-square w-full overflow-hidden rounded-xl mb-3">
                                <Image
                                    src={actor.image || "/placeholder-actor.jpg"}
                                    alt={actor.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <p className="text-sm font-bold text-white line-clamp-1">{actor.name}</p>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider line-clamp-1">{actor.character}</p>
                        </div>
                    ))}
                </div>
            </section>

          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-20 rounded-3xl bg-gradient-to-r from-primary/20 via-zinc-900 to-primary/20 p-1 lg:p-1">
            <div className="rounded-[22px] bg-zinc-950 p-8 md:p-16 text-center space-y-8">
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
                    තිරගත වූ සැනින් අපගේ <span className="text-primary">FilmHub</span> හරහා නරඹන්න!
                </h2>
                <p className="text-xl text-zinc-500 max-w-2xl mx-auto font-medium">
                    අලුත්ම සිනමා තොරතුරු සහ උපසිරැසි පිළිබඳ දැනුවත් වීමට අපේ වෙබ් අඩවිය සමඟ නිරන්තරයෙන් රැඳී සිටින්න.
                </p>
                <Link href="/" className="inline-block bg-white text-black px-12 py-5 rounded-full font-black uppercase tracking-widest text-sm transition-all hover:bg-primary hover:text-white active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    Home Page එකට යන්න
                </Link>
            </div>
        </div>
      </div>
    </main>
  );
}
