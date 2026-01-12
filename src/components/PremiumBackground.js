"use client";

export default function PremiumBackground() {
  return (
    <div className="fixed inset-0 -z-50 h-screen w-full overflow-hidden bg-[#020202] pointer-events-none">
      
      {/* 1. Ambient Dynamic Glows (Top Left & Bottom Right) - Use fixed positioning for children to be extra safe */}
      <div className="fixed -top-[20%] -left-[10%] h-[50vh] w-[50vh] rounded-full bg-primary opacity-[0.04] blur-[100px] sm:blur-[180px]" />
      <div className="fixed top-[40%] -right-[10%] h-[40vh] w-[40vh] rounded-full bg-blue-900 opacity-[0.06] blur-[100px] sm:blur-[160px]" />
      
      {/* 2. Central Subtle Spotlight */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#020202_100%)] opacity-80" />

      {/* 3. Cinematic Film Grain (Optional - kept extremely subtle) */}
      <div 
        className="absolute inset-0 opacity-[0.015]" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      
      {/* 4. Vignette Overlay for Focus */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-[#020202]/80" />
    </div>
  );
}
