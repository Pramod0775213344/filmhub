export default function MovieSkeleton() {
  return (
    <div className="w-full space-y-3">
      <div className="aspect-[2/3] w-full animate-pulse rounded-xl bg-zinc-900/50 ring-1 ring-white/5" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-900/50" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-900/50" />
      </div>
    </div>
  );
}

