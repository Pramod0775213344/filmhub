"use client";

import { motion } from "framer-motion";
import Link from "next/link";

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
  isLoading = false
}) {
  const baseStyles = "group relative px-8 py-4 rounded-2xl overflow-hidden transition-all flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.3em] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white shadow-[0_20px_40px_rgba(229,9,20,0.3)] hover:scale-105 active:scale-95",
    secondary: "bg-white/5 border border-white/10 text-white backdrop-blur-xl hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95",
    outline: "bg-transparent border-2 border-white/10 text-white hover:bg-white hover:text-black hover:border-white transition-all active:scale-95"
  };

  const content = (
    <>
      {/* Shimmer effect for primary */}
      {variant === "primary" && !disabled && !isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      )}
      
      <span className="relative z-10 flex items-center gap-3">
        {isLoading ? (
          <Loader />
        ) : Icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            variant === "primary" ? "bg-black/20 group-hover:bg-black/30" : "bg-white/5 group-hover:bg-white/10"
          }`}>
            <Icon size={16} className={variant === "primary" ? "ml-0.5" : ""} />
          </div>
        )}
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <Link 
        href={href}
        className={`${baseStyles} ${variants[variant]} ${className}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {content}
    </button>
  );
}
