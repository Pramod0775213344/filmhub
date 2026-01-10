export default function MovieSkeleton() {
  return (
    <div className="w-full space-y-4">
      {/* 
         Enhanced Skeleton with a subtle shimmer effect and better visibility 
         on dark backgrounds. Uses zinc-800 to be seen on #050505.
      */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-800/80 ring-1 ring-white/5">
         <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      <div className="space-y-3 px-1">
        <div className="relative h-4 w-5/6 overflow-hidden rounded-md bg-zinc-800/80">
           <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
        <div className="relative h-3 w-2/4 overflow-hidden rounded-md bg-zinc-800/80">
           <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
      </div>
      
    </div>
  );
}
