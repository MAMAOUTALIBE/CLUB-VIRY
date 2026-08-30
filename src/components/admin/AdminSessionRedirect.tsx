"use client";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export function AdminSessionRedirect() {
  useEffect(() => {
    const nextPath = `${window.location.pathname}${window.location.search}`;
    window.location.replace(`/connexion?next=${encodeURIComponent(nextPath)}`);
  }, []);

  return (
    <p className="flex items-center gap-2 text-sm font-bold text-amber-900" role="status">
      <Loader2 className="animate-spin" size={18} aria-hidden="true" /> Session expirée. Redirection vers la connexion…
    </p>
  );
}
