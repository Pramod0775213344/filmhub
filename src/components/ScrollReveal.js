"use client";

import { useScrollReveal } from '@/hooks/useScrollReveal';

/**
 * ScrollReveal Component
 * Wrapper component for scroll-triggered reveal animations
 * Premium, smooth animations similar to w3campus.lk
 */
export default function ScrollReveal({ 
  children, 
  animation = 'fadeUp', // fadeUp, fadeIn, fadeLeft, fadeRight, scale, blur
  delay = 0,
  duration = 0.6,
  className = '',
  as: Component = 'div',
  ...props 
}) {
  const { ref, isVisible } = useScrollReveal({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    triggerOnce: true,
  });

  // Animation presets
  const animations = {
    fadeUp: {
      hidden: { opacity: 0, transform: 'translateY(30px)' },
      visible: { opacity: 1, transform: 'translateY(0)' },
    },
    fadeIn: {
      hidden: { opacity: 0, transform: 'none' },
      visible: { opacity: 1, transform: 'none' },
    },
    fadeLeft: {
      hidden: { opacity: 0, transform: 'translateX(-30px)' },
      visible: { opacity: 1, transform: 'translateX(0)' },
    },
    fadeRight: {
      hidden: { opacity: 0, transform: 'translateX(30px)' },
      visible: { opacity: 1, transform: 'translateX(0)' },
    },
    scale: {
      hidden: { opacity: 0, transform: 'scale(0.9)' },
      visible: { opacity: 1, transform: 'scale(1)' },
    },
    blur: {
      hidden: { opacity: 0, filter: 'blur(10px)', transform: 'translateY(20px)' },
      visible: { opacity: 1, filter: 'blur(0)', transform: 'translateY(0)' },
    },
  };

  const selectedAnimation = animations[animation] || animations.fadeUp;
  const currentState = isVisible ? selectedAnimation.visible : selectedAnimation.hidden;

  const style = {
    ...currentState,
    transition: `opacity ${duration}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s, transform ${duration}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s, filter ${duration}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
    willChange: isVisible ? 'auto' : 'transform, opacity',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  };

  return (
    <Component 
      ref={ref} 
      className={className} 
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * StaggerContainer - For animating lists of items with stagger effect
 */
export function StaggerContainer({ 
  children, 
  staggerDelay = 0.08,
  className = '',
  as: Component = 'div',
  ...props 
}) {
  const { ref, isVisible } = useScrollReveal({
    threshold: 0.05,
    rootMargin: '0px 0px -30px 0px',
    triggerOnce: true,
  });

  return (
    <Component 
      ref={ref} 
      className={className}
      data-visible={isVisible}
      style={{
        '--stagger-delay': `${staggerDelay}s`,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
