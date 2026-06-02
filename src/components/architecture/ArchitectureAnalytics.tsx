"use client";

import { useEffect } from "react";
import { trackLandingEvent } from "@/components/landing/landing-analytics";

export default function ArchitectureAnalytics() {
  useEffect(() => {
    trackLandingEvent("architecture_view");

    const sectionNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-track-section]"));
    const seen = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const id = (entry.target as HTMLElement).dataset.trackSection;
          if (!id || seen.has(id)) return;

          seen.add(id);
          trackLandingEvent("section_view", { section: id, page: "architecture" });
        });
      },
      { threshold: 0.45 }
    );

    sectionNodes.forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
