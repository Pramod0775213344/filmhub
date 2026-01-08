export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white p-4 pt-24">
      <div className="container-custom space-y-8 animate-pulse">
        {/* Backdrop Skeleton */}
        <div className="relative h-[60vh] w-full rounded-2xl bg-zinc-900" />
        
        {/* Content Skeleton */}
        <div className="space-y-4 max-w-2xl mx-auto text-center">
          <div className="h-16 w-3/4 mx-auto rounded-xl bg-zinc-900" />
          <div className="h-6 w-1/2 mx-auto rounded-lg bg-zinc-900" />
          <div className="flex justify-center gap-4 pt-4">
            <div className="h-12 w-32 rounded-full bg-zinc-900" />
            <div className="h-12 w-32 rounded-full bg-zinc-900" />
          </div>
        </div>

        {/* Info Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-12">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-zinc-900" />
          ))}
        </div>
      </div>
    </div>
  );
}
