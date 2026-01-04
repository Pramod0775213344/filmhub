"use client";

import { Play } from "lucide-react";

export default function LoadingSpinner({ fullScreen = false, size = "default", message = "Loading..." }) {
  const sizes = {
    small: {
      container: "w-12 h-12",
      logo: "w-8 h-8",
      icon: 16,
      ring: "w-16 h-16 border-2",
    },
    default: {
      container: "w-16 h-16",
      logo: "w-12 h-12",
      icon: 24,
      ring: "w-24 h-24 border-4",
    },
    large: {
      container: "w-20 h-20",
      logo: "w-16 h-16",
      icon: 32,
      ring: "w-32 h-32 border-4",
    },
  };

  const currentSize = sizes[size] || sizes.default;

  // Define the loading content JSX once to avoid repetition
  const loadingContentJsx = (
    <div className="flex flex-col items-center gap-6">
      {/* Logo with Spinner */}
      <div className="relative">
        {/* Spinning Ring */}
        <div className="absolute inset-0 -m-4 flex items-center justify-center">
          <div className={`${currentSize.ring} rounded-full border-transparent border-t-primary border-r-primary animate-spin`}></div>
        </div>
        
        {/* Logo */}
        <div className={`relative flex items-center justify-center ${currentSize.container} rounded-2xl bg-primary shadow-[0_0_40px_rgba(229,9,20,0.6)] animate-pulse`}>
          <Play size={currentSize.icon} fill="white" className="text-white ml-0.5" />
        </div>
      </div>

      {/* Text */}
      {message && (
        <div className="flex flex-col items-center gap-3">
          <h2 className="font-display text-xl md:text-2xl font-black tracking-tighter text-white">
            FILM<span className="text-primary">HUB</span>
          </h2>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-sm font-medium text-zinc-400 animate-pulse">{message}</p>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Loading Content */}
        <div className="relative z-10">
          {loadingContentJsx}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {loadingContentJsx}
    </div>
  );
}

// Simple inline spinner for buttons, forms, etc.
export function InlineSpinner({ size = 16, className = "" }) {
  return (
    <div 
      className={`inline-block rounded-full border-2 border-transparent border-t-current border-r-current animate-spin ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// Skeleton loading for content placeholders
export function SkeletonLoader({ className = "", count = 1 }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}
