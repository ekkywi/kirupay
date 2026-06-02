"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { trackLandingEvent } from "@/components/landing/landing-analytics";

interface TrackingLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  eventName: string;
  eventData?: Record<string, string | number | boolean | null>;
}

export default function TrackingLink({ href, className, children, eventName, eventData }: TrackingLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackLandingEvent(eventName, {
          href,
          ...eventData,
        });
      }}
    >
      {children}
    </Link>
  );
}
