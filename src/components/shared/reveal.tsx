'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode, type Ref } from 'react';

/**
 * Scroll reveal: fade + rise 24px, once, when 20% of the element is in view,
 * with a 60ms stagger between siblings (PROMPT.md §5).
 *
 * Implemented with one shared IntersectionObserver plus two CSS rules rather
 * than an animation library — on this site the animation budget competes
 * directly with the Lighthouse mobile target on mid-range Android.
 * `prefers-reduced-motion` is handled in CSS, and without JS everything renders
 * visible (the hiding rule is scoped to `html[data-js='1']`).
 */

let sharedObserver: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return null;
  sharedObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        sharedObserver?.unobserve(entry.target);
      }
    },
    { threshold: 0.2, rootMargin: '0px 0px -5% 0px' },
  );
  return sharedObserver;
}

function useReveal() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = getObserver();
    if (!observer) {
      node.classList.add('is-visible');
      return;
    }

    observer.observe(node);
    return () => observer.unobserve(node);
  }, []);

  return ref;
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Extra delay in seconds, on top of the group stagger. */
  delay?: number;
  as?: 'div' | 'li' | 'section' | 'article' | 'ul' | 'ol';
};

function delayStyle(delay?: number): CSSProperties | undefined {
  return delay
    ? ({ '--reveal-delay': `${Math.round(delay * 1000)}ms` } as CSSProperties)
    : undefined;
}

export function Reveal({ children, className, delay, as: Component = 'div' }: RevealProps) {
  const ref = useReveal();

  return (
    <Component
      ref={ref as Ref<never>}
      className={className ? `reveal ${className}` : 'reveal'}
      style={delayStyle(delay)}
    >
      {children}
    </Component>
  );
}

/** Staggers its direct `RevealItem` children by 60ms each (see globals.css). */
export function RevealGroup({ children, className, as: Component = 'div' }: RevealProps) {
  return (
    <Component className={className ? `reveal-group ${className}` : 'reveal-group'}>
      {children}
    </Component>
  );
}

export function RevealItem({ children, className, delay, as: Component = 'div' }: RevealProps) {
  const ref = useReveal();

  return (
    <Component
      ref={ref as Ref<never>}
      className={className ? `reveal ${className}` : 'reveal'}
      style={delayStyle(delay)}
    >
      {children}
    </Component>
  );
}
