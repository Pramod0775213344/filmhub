"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Premium Scroll Reveal Hook
 * Uses Intersection Observer for buttery smooth reveal animations
 * Similar to WOW.js but optimized for React/Next.js
 */
export function useScrollReveal(options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
  } = options;
  
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

/**
 * Stagger reveal for lists/grids
 * Returns refs and visibility states for multiple items
 */
export function useStaggerReveal(itemCount, options = {}) {
  const { baseDelay = 0.05, maxDelay = 0.5 } = options;
  const containerRef = useRef(null);
  const [visibleItems, setVisibleItems] = useState(new Set());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.children;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(items).indexOf(entry.target);
            setVisibleItems((prev) => new Set(prev).add(index));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    Array.from(items).forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [itemCount]);

  const getItemStyle = useCallback((index) => {
    const isVisible = visibleItems.has(index);
    const delay = Math.min(index * baseDelay, maxDelay);
    
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
    };
  }, [visibleItems, baseDelay, maxDelay]);

  return { containerRef, getItemStyle, visibleItems };
}
