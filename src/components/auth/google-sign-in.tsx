"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function GoogleSignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      className="w-full gap-2 text-lg h-12 relative animate-shimmer items-center justify-center 
        rounded-md border border-slate-800 dark:border-slate-100 
        bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] 
        bg-[length:200%_100%] px-6 font-medium text-slate-100 
        transition-colors focus:outline-none focus:ring-2 
        focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
      size="lg"
    >
      <FcGoogle className="w-5 h-5" />
      {isLoading ? "Signing in..." : "Continue with Google"}
    </Button>
  );
}
