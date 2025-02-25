"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initializeAnalytics } from "@/lib/firebase/config";
import { logEvent } from "firebase/analytics";

export function FirebaseAnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const initAnalytics = async () => {
      try {
        const analytics = await initializeAnalytics();
        if (analytics) {
          // Log page view when the route changes
          logEvent(analytics, "page_view", {
            page_path: pathname,
            page_location: window.location.href,
            page_title: document.title,
          });
        }
      } catch (error) {
        console.error("Error logging page view:", error);
      }
    };

    initAnalytics();
  }, [pathname]); // Removed searchParams dependency

  return <>{children}</>;
}

// Utility function to log custom events
export const logAnalyticsEvent = async (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  try {
    const analytics = await initializeAnalytics();
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
    }
  } catch (error) {
    console.error(`Error logging event ${eventName}:`, error);
  }
};
