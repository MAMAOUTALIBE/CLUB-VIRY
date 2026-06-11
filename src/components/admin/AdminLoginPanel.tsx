"use client";

import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type LoginResponse =
  | {
      ok: true;
      data: {
        user: { id: string; email?: string } | null;
        session: { expiresAt?: number } | null;
      };
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
      };
    };

function parseLoginResponse(value: unknown): LoginResponse {
  if (!value || typeof value !== "object") {
    return { ok: false, error: { code: "INVALID_RESPONSE", message: "Reponse de connexion invalide." } };
  }

  const response = value as Record<string, unknown>;

  if (response.ok === false) {
    const error = response.error;

    if (error && typeof error === "object") {
      const payload = error as Record<string, unknown>;
      return {
        ok: false,
        error: {
          code: typeof payload.code === "string" ? payload.code : "AUTH_ERROR",
          message: typeof payload.message === "string" ? payload.message : "Connexion impossible."
        }
      };
    }
  }

  if (response.ok === true && response.data && typeof response.data === "object") {
    const data = response.data as Record<string, unknown>;
    const session = data.session && typeof data.session === "object" ? (data.session as Record<string, unknown>) : null;
    return {
      ok: true,
      data: {
        user: null,
        session: session ? { expiresAt: typeof session.expiresAt === "number" ? session.expiresAt : undefined } : null
      }
    };
  }

  return { ok: false, error: { code: "INVALID_RESPONSE", message: "Reponse de connexion invalide." } };
}

function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/admin";
  }

  return value;
}

export function AdminLoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => safeNextPath(searchParams.get("next")), [searchParams]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setStatus("error");
      setMessage("Email et mot de passe requis.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });
      const parsed = parseLoginResponse(await response.json());

      if (!parsed.ok) {
        setStatus("error");
        setMessage(`${parsed.error.code} : ${parsed.error.message}`);
        return;
      }

      if (!parsed.data.session) {
        setStatus("error");
        setMessage("Session absente dans la reponse de connexion.");
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Erreur de connexion inconnue.");
    }
  }

  return (
    <div className="official-card rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[#002f1d] text-[#f7c600]">
          <ShieldCheck size={22} aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-black uppercase text-[#07542f]">CRM</p>
          <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Se connecter</h2>
        </div>
      </div>

      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <label className="grid gap-2">
          <span className="text-xs font-black uppercase text-slate-600">Email administrateur</span>
          <input
            autoComplete="email"
            aria-describedby={status === "error" ? "login-error" : undefined}
            aria-invalid={status === "error" || undefined}
            className="focus-ring min-h-12 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2 text-sm font-bold text-slate-900"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@club.fr"
            required
            type="email"
            value={email}
          />
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-black uppercase text-slate-600">Mot de passe</span>
          <input
            autoComplete="current-password"
            aria-describedby={status === "error" ? "login-error" : undefined}
            aria-invalid={status === "error" || undefined}
            className="focus-ring min-h-12 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2 text-sm font-bold text-slate-900"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Votre mot de passe"
            required
            type="password"
            value={password}
          />
        </label>

        {message ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700" id="login-error" role="alert">{message}</p> : null}

        <button
          className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#002f1d] px-5 text-sm font-black uppercase text-white hover:bg-[#07542f] disabled:cursor-wait disabled:opacity-70"
          disabled={status === "loading"}
          type="submit"
        >
          {status === "loading" ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
          Connexion
        </button>
      </form>
    </div>
  );
}
