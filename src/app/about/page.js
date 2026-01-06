import { Play, Film, Users, Shield, Globe, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About Us | FilmHub",
  description: "Learn more about FilmHub, your ultimate destination for discovering movies, TV shows, and Korean dramas.",
};

export default function AboutPage() {
  const stats = [
    { label: "Movies", value: "5,000+", icon: Film },
    { label: "Happy Users", value: "50K+", icon: Users },
    { label: "High Quality", value: "4K UHD", icon: Play },
  ];

  const values = [
    {
      title: "Our Mission",
      description: "To provide the best cinematic experience for film enthusiasts worldwide, making high-quality content discoverable and accessible.",
      icon: Globe,
    },
    {
      title: "Content Quality",
      description: "We curate only the highest quality content with a focus on premium visuals, accurate subtitles, and smooth streaming.",
      icon: Shield,
    },
    {
      title: "Community First",
      description: "Everything we build is centered around our users, ensuring a personalized and intuitive experience for every movie lover.",
      icon: Heart,
    },
  ];

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="container-custom pt-48 pb-32">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-20 text-center">
            <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-6xl lg:text-7xl">
              About <span className="text-primary italic">FilmHub</span>
            </h1>
            <p className="mt-8 text-xl font-medium text-zinc-500 max-w-3xl mx-auto leading-relaxed">
              We are a passionate team dedicated to bringing the magic of cinema directly to your screen with a premium, seamless experience.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
            {stats.map((stat, i) => (
              <div key={i} className="glass group rounded-3xl p-8 text-center transition-transform hover:scale-[1.02]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <stat.icon size={32} />
                </div>
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Core Values */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32 items-center">
            <div>
              <h2 className="font-display text-3xl font-black mb-12 tracking-tight">Our Core <span className="text-primary">Values</span></h2>
              <div className="space-y-10">
                {values.map((v, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-primary ring-1 ring-white/10">
                      <v.icon size={28} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
                      <p className="text-zinc-500 leading-relaxed font-medium">{v.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-video rounded-3xl overflow-hidden glass p-2">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent z-10" />
              <Image 
                src="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop" 
                alt="Cinema Experience" 
                fill
                className="w-full h-full object-cover rounded-2xl grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>

          {/* Call to Action */}
          <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-black mb-6">Ready to start your journey?</h2>
              <p className="text-zinc-400 mb-10 max-w-xl mx-auto font-medium">
                Join thousands of movie enthusiasts and start building your ultimate watchlist today.
              </p>
              <Link 
                href="/register" 
                className="cinematic-glow inline-flex items-center gap-3 rounded-2xl bg-primary px-10 py-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover active:scale-95"
              >
                Join Now <Play size={18} fill="white" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

