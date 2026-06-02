"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type RevealVariant = "up" | "left" | "right" | "fade" | "scale";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Delay in ms before animation starts */
  delay?: number;
  variant?: RevealVariant;
  /** Play on mount (hero) instead of waiting for scroll */
  immediate?: boolean;
  /** Intersection ratio 0–1 */
  threshold?: number;
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
  immediate = false,
  threshold = 0.12,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (immediate) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -48px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate, threshold]);

  const style = { "--reveal-delay": `${delay}ms` } as CSSProperties;

  return (
    <div
      ref={ref}
      className={`scroll-reveal scroll-reveal--${variant} ${visible ? "scroll-reveal--visible" : ""} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}

