"use client";

import { createContext, useContext } from "react";
import type { User } from "@/types/api";

const AuthContext = createContext<{ user: User } | null>(null);

export function AuthProvider({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
