"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initializeAnalytics } from "@/lib/firebase/config";
import { logEvent, getAnalytics } from "firebase/analytics";

export function FirebaseAnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const initAnalytics = async () => {
      const analytics = await initializeAnalytics();
      if (analytics) {
        // Log page view when the route changes
        logEvent(analytics, "page_view", {
          page_path: pathname,
          page_location: window.location.href,
          page_title: document.title,
        });
      }
    };

    initAnalytics();
  }, [pathname, searchParams]);

  return <>{children}</>;
}

// Utility function to log custom events
export const logAnalyticsEvent = async (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  const analytics = await initializeAnalytics();
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  }
};
