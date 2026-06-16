"use client";

import { useId, useState } from "react";
import { Mail, Send } from "lucide-react";

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const fieldId = useId();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();

    if (email.length === 0) {
      setStatus("error");
      setMessage("Renseignez votre adresse email.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.ok) {
        setStatus("error");
        setMessage(result?.error?.message ?? "Inscription impossible. Réessayez plus tard.");
        return;
      }

      form.reset();
      setStatus("success");
      setMessage("Merci ! Votre inscription à la newsletter est bien enregistrée.");
    } catch {
      setStatus("error");
      setMessage("Connexion impossible. Vérifiez votre réseau puis réessayez.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      <label htmlFor={`${fieldId}-email`} className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#f7c600]">
        <Mail size={14} aria-hidden="true" /> Newsletter du club
      </label>
      <p className="mt-2 text-sm text-white/70">Actus, matchs et temps forts : recevez l'essentiel de l'ES Viry-Châtillon par email.</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          id={`${fieldId}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          maxLength={160}
          placeholder="votre@email.fr"
          className="focus-ring min-h-11 flex-1 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#f7c600] px-4 py-2 text-sm font-black uppercase text-[#001c10] transition hover:bg-white disabled:cursor-wait disabled:opacity-70"
        >
          {status === "loading" ? (
            "Envoi…"
          ) : (
            <>
              <Send size={16} aria-hidden="true" /> S'inscrire
            </>
          )}
        </button>
      </div>
      <div aria-live="polite" className="mt-2 empty:mt-0">
        {status === "success" ? (
          <p className="text-sm font-bold text-green-300">{message}</p>
        ) : status === "error" ? (
          <p className="text-sm font-bold text-red-300" role="alert">
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
