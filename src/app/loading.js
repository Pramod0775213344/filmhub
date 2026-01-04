"use client";

import { Play } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Loading Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo with Spinner */}
        <div className="relative">
          {/* Spinning Ring */}
          <div className="absolute inset-0 -m-4">
            <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>
          </div>
          
          {/* Logo */}
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-[0_0_40px_rgba(229,9,20,0.6)] animate-pulse">
            <Play size={32} fill="white" className="text-white ml-1" />
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="font-display text-2xl font-black tracking-tighter text-white">
            FILM<span className="text-primary">HUB</span>
          </h2>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-sm font-medium text-zinc-400 animate-pulse">Loading amazing content...</p>
      </div>
    </div>
  );
}
