"use client";

import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  package_type?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        setUser({
          id: profile.id,
          email: profile.email,
          package_type: profile.package_type,
        });
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoading,
    signOut: () => supabase.auth.signOut(),
  };
}
