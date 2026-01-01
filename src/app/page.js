import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FilmSection from "@/components/FilmSection";
import Footer from "@/components/Footer";
import { movies } from "@/components/data";

export default function Home() {
  const trendingMovies = movies.slice(0, 6);
  const newReleases = movies.slice(2, 8); // Just as a demonstration
  const actionMovies = movies.filter(m => m.category === "Action" || m.category === "Sci-Fi");

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      
      <div className="container-custom relative z-10 -mt-20 space-y-20 pb-28 md:-mt-32 md:space-y-32">
        <FilmSection title="Trending Now" movies={trendingMovies} />
        <FilmSection title="New Releases" movies={newReleases} />
        <FilmSection title="Action & Sci-Fi" movies={actionMovies} />
        <FilmSection title="Most Popular" movies={movies} />
      </div>

      <Footer />
    </main>
  );
}


