"use client";

import { useEffect } from "react";
import { trackLandingEvent } from "@/components/landing/landing-analytics";

export default function PricingAnalytics() {
  useEffect(() => {
    trackLandingEvent("pricing_view");

    const sectionNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-track-section]"));
    const seen = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const id = (entry.target as HTMLElement).dataset.trackSection;
          if (!id || seen.has(id)) return;

          seen.add(id);
          trackLandingEvent("section_view", { section: id, page: "pricing" });
        });
      },
      { threshold: 0.45 }
    );

    sectionNodes.forEach((node) => observer.observe(node));

    const faqHandler = (event: Event) => {
      const target = event.target as HTMLDetailsElement;
      const key = target.dataset.faqItem;
      if (!key || !target.open) return;

      trackLandingEvent("faq_open", { faq: key, page: "pricing" });
    };

    const faqNodes = Array.from(document.querySelectorAll<HTMLDetailsElement>("details[data-faq-item]"));
    faqNodes.forEach((node) => node.addEventListener("toggle", faqHandler));

    return () => {
      observer.disconnect();
      faqNodes.forEach((node) => node.removeEventListener("toggle", faqHandler));
    };
  }, []);

  return null;
}
