import MovieSkeleton from "@/components/MovieSkeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background text-white pt-32">
      <div className="container-custom pb-20">
        <div className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="h-20 w-full animate-pulse rounded-2xl bg-zinc-900/50" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 lg:gap-6">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <MovieSkeleton />
              <div className="h-4 w-3/4 rounded bg-zinc-900/50" />
              <div className="h-3 w-1/2 rounded bg-zinc-900/50" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
