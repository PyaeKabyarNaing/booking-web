"use client";

import { useAuth } from "./auth-provider";
import { LogIn, LogOut, User } from "lucide-react";

export function AuthButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <div className="h-10 w-24 animate-pulse rounded-full bg-white/10" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt=""
              className="h-8 w-8 rounded-full border border-gold/30"
            />
          ) : (
            <User className="h-5 w-5 text-gold" />
          )}
          <span className="hidden text-sm text-cream/80 sm:inline">
            {user.user_metadata?.full_name?.split(" ")[0] || "Account"}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-sm text-cream/70 transition-colors hover:border-gold/30 hover:text-gold"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    // <button
    //   onClick={() => signInOptions()}
    //   className="flex items-center gap-2 rounded-full border border-gold/30 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
    // >
    //   <LogIn className="h-4 w-4" />
    //   Sign In
    // </button>
    <button
      onClick={() => signInWithGoogle()}
      className="flex items-center gap-2 rounded-full border border-gold/30 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
    >
      <LogIn className="h-4 w-4" />
      Sign In With Google
    </button>
  );
}
