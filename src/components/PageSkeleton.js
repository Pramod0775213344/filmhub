
import MovieSkeleton from "@/components/MovieSkeleton";

export default function PageSkeleton({ showFilters = true }) {
  return (
    <div className="container-custom pb-20 px-4">
      {/* Filter Section Placeholder */}
      <div className={`mb-8 pt-8 flex flex-col justify-between gap-4 md:flex-row md:items-end ${!showFilters ? 'opacity-0' : ''}`}>
        <div className="flex gap-4 overflow-hidden">
             {/* Simulate chips or dropdowns */}
             <div className="h-10 w-24 shrink-0 animate-pulse rounded-full bg-zinc-900/50" />
             <div className="h-10 w-24 shrink-0 animate-pulse rounded-full bg-zinc-900/50" />
             <div className="h-10 w-24 shrink-0 animate-pulse rounded-full bg-zinc-900/50" />
        </div>
        
        {/* Search/Sort Placeholder */}
        <div className="hidden h-10 w-48 animate-pulse rounded-lg bg-zinc-900/50 md:block" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 lg:gap-6">
        {Array.from({ length: 24 }).map((_, i) => (
          <MovieSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
