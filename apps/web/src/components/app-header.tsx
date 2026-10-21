"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export function AppHeader() {
  const { user } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onLogout() {
    setPending(true);
    try {
      await api.auth.logout();
    } catch {
      toast.error("Could not log out. Please try again.");
      setPending(false);
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <span className="font-semibold">Review Dashboard</span>
        <div className="flex items-center gap-3">
          <div className="hidden text-right text-sm leading-tight sm:block">
            <p className="font-medium">{user.name}</p>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <Badge variant="secondary" className="hidden min-[400px]:inline-flex">
            {user.role}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            disabled={pending}
          >
            {pending ? "Logging out..." : "Log out"}
          </Button>
        </div>
      </div>
    </header>
  );
}
