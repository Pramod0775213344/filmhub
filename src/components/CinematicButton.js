"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAdaptive } from "@/context/AdaptiveContext";
import { handleAdClick } from "@/utils/adUtils";

const Loader = () => (
  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
);

export default function CinematicButton({ 
  children, 
  onClick, 
  href,
  variant = "primary", 
  icon: Icon, 
  className = "",
  type = "button",
  disabled = false,
  isLoading = false,
  triggerAd = false
}) {
  const { isMobile, isHydrated } = useAdaptive();
  const mobileView = isMobile && isHydrated;
  const baseStyles = "group relative px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 ease-out flex items-center justify-center gap-3 md:gap-4 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white shadow-[0_10px_20px_rgba(229,9,20,0.2)] md:shadow-[0_20px_40px_rgba(229,9,20,0.3)] hover:shadow-[0_15px_30px_rgba(229,9,20,0.4)] hover:scale-[1.03] active:scale-[0.98]",
    secondary: "bg-white/5 border border-white/10 text-white backdrop-blur-xl hover:bg-white/10 hover:border-white/20 hover:scale-[1.03] active:scale-[0.98]",
    outline: "bg-transparent border-2 border-white/10 text-white hover:bg-white hover:text-black hover:border-white active:scale-[0.98]"
  };

  const content = (
    <>
      {/* Shimmer effect for primary */}
      {variant === "primary" && !disabled && !isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      )}
      
      <span className="relative z-10 flex items-center gap-2 md:gap-3">
        {isLoading ? (
          <Loader />
        ) : Icon && (
          <div className={`flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-lg transition-colors ${
            variant === "primary" ? "bg-black/20 group-hover:bg-black/30" : "bg-white/5 group-hover:bg-white/10"
          }`}>
            <Icon size={16} className={`w-3 h-3 md:w-4 md:h-4 ${variant === "primary" ? "ml-0.5" : ""}`} />
          </div>
        )}
        {children}
      </span>
    </>
  );

  const handleClick = (e) => {
    if (triggerAd) {
      handleAdClick();
    }
    if (onClick) {
      onClick(e);
    }
  };

  if (href) {
    return (
      <Link 
        href={href}
        onClick={(e) => {
          if (triggerAd) handleAdClick();
          if (onClick) onClick(e);
        }}
        className={`${baseStyles} ${variants[variant]} ${className}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button 
      type={type}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {content}
    </button>
  );
}
