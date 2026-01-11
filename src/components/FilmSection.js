"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import MovieCard from "./MovieCard";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

/**
 * Premium Film Section with Intersection Observer animations
 * Smooth reveal animations similar to w3campus.lk
 */
export default function FilmSection({ title, movies, href, isGrid = false, isPriority = false }) {
  const sectionRef = useRef(null);
  const itemsRef = useRef(null);
  const [sectionVisible, setSectionVisible] = useState(false);
  const [visibleItems, setVisibleItems] = useState(new Set());

  // Section reveal animation
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionVisible(true);
          observer.unobserve(section);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Staggered item reveal
  useEffect(() => {
    const container = itemsRef.current;
    if (!container || !sectionVisible) return;

    const items = container.children;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(items).indexOf(entry.target);
            // Stagger the visibility with animation frame for smooth batch updates
            requestAnimationFrame(() => {
              setTimeout(() => {
                setVisibleItems((prev) => new Set(prev).add(index));
              }, index * 50); // 50ms stagger
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );

    Array.from(items).forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [sectionVisible]);

  const getItemStyle = useCallback((index) => {
    const isVisible = visibleItems.has(index);
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(25px) scale(0.97)',
      transition: `opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)`,
    };
  }, [visibleItems]);

  const containerClasses = isGrid 
    ? "grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
    : "flex gap-4 overflow-x-auto pb-6 pt-2 px-4 -mx-4 md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 md:gap-4 md:overflow-visible md:pb-0 md:px-0 md:mx-0 snap-x snap-mandatory no-scrollbar";

  return (
    <section 
      ref={sectionRef}
      style={{
        opacity: sectionVisible ? 1 : 0,
        transform: sectionVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="space-y-8">
        {/* Section Header */}
        <div 
          className="flex items-center justify-between"
          style={{
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? 'translateX(0)' : 'translateX(-20px)',
            transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
          }}
        >
          <h2 className="font-display text-2xl font-black tracking-tight text-white md:text-3xl lg:text-4xl">
            {title}
          </h2>
          {href && (
            <Link 
              href={href}
              className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 transition-all hover:text-primary"
            >
              <span>Explore All</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                <ChevronRight size={16} />
              </div>
            </Link>
          )}
        </div>

        {/* Movie Cards Grid */}
        <div ref={itemsRef} className={containerClasses}>
          {movies.map((movie, index) => (
            <div 
              key={movie.id} 
              className={`${isGrid ? "" : "min-w-[150px] sm:min-w-[180px] md:min-w-0 snap-start"}`}
              style={getItemStyle(index)}
            >
              <MovieCard movie={movie} priority={isPriority && index < 4} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
