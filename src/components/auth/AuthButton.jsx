"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/client";

export default function AuthButton() {
  const supabase = createClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // get initial user on mount
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    // listen for login/logout
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Hey, {user?.email}!
        </span>
        <LogoutButton />
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
