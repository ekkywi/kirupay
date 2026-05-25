"use client";

import { type ReactNode } from "react";
import { trackLandingEvent } from "@/components/landing/landing-analytics";

interface ScrollToSectionButtonProps {
  targetId: string;
  className?: string;
  children: ReactNode;
  eventName: string;
}

export default function ScrollToSectionButton({ targetId, className, children, eventName }: ScrollToSectionButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        trackLandingEvent(eventName, { targetId });
      }}
    >
      {children}
    </button>
  );
}
