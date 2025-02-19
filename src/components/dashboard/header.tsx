"use client";

import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="text-lg font-semibold text-foreground">
            ValidateMe
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">{user.email}</div>
            <ThemeSwitcher />
            <Button
              variant="ghost"
              onClick={handleSignOut}
              disabled={isLoading}
            >
              {isLoading ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
