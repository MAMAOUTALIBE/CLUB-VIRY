"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

// Toaster léger, sans dépendance. Montez <ToastHost/> une fois (layout admin) et
// appelez showToast("...") depuis n'importe quel composant client.

export type ToastTone = "success" | "error";
type ToastItem = { id: number; message: string; tone: ToastTone };

const TOAST_EVENT = "admin-toast";
let counter = 0;

export function showToast(message: string, tone: ToastTone = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, tone } }));
}

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    function onToast(event: Event) {
      const detail = (event as CustomEvent).detail as { message?: string; tone?: ToastTone } | undefined;
      if (!detail?.message) return;
      counter += 1;
      const id = counter;
      const item: ToastItem = { id, message: detail.message, tone: detail.tone === "error" ? "error" : "success" };
      setItems((current) => [...current, item]);
      window.setTimeout(() => setItems((current) => current.filter((entry) => entry.id !== id)), 3500);
    }
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,360px)] flex-col gap-2" role="status" aria-live="polite">
      {items.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto flex items-start gap-2.5 rounded-lg px-4 py-3 text-sm font-bold shadow-lg ${
            item.tone === "error" ? "bg-red-700 text-white" : "bg-[#002f1d] text-white"
          }`}
        >
          {item.tone === "error" ? (
            <XCircle size={18} className="mt-0.5 shrink-0 text-red-200" aria-hidden="true" />
          ) : (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#f7c600]" aria-hidden="true" />
          )}
          <span>{item.message}</span>
        </div>
      ))}
    </div>
  );
}
