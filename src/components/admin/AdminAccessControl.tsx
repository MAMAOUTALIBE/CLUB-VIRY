"use client";

import { Loader2, LogIn } from "lucide-react";
import { useState } from "react";

type LoginResponse =
  | {
      ok: true;
      data: {
        session: {
          expiresAt?: number;
        } | null;
      };
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
      };
    };

type AdminAccessControlProps = {
  loading: boolean;
  // Appelé après une connexion réussie : la session est désormais portée par le
  // cookie HttpOnly `admin_session` posé par /api/auth/login. Le parent recharge
  // alors ses données (le cookie part automatiquement avec les requêtes même origine).
  onAuthenticated: () => void;
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
    const session = data.session;

    if (session && typeof session === "object") {
      const payload = session as Record<string, unknown>;

      return {
        ok: true,
        data: {
          session: {
            expiresAt: typeof payload.expiresAt === "number" ? payload.expiresAt : undefined
          }
        }
      };
    }

    return { ok: true, data: { session: null } };
  }

  return { ok: false, error: { code: "INVALID_RESPONSE", message: "Reponse de connexion invalide." } };
}

export function AdminAccessControl({ loading, onAuthenticated }: AdminAccessControlProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState<"idle" | "loading" | "error">("idle");
  const [loginMessage, setLoginMessage] = useState("");

  async function handleLogin() {
    if (!email.trim() || !password) {
      setLoginStatus("error");
      setLoginMessage("Email et mot de passe requis.");
      return;
    }

    setLoginStatus("loading");
    setLoginMessage("");

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
        setLoginStatus("error");
        setLoginMessage(`${parsed.error.code} : ${parsed.error.message}`);
        return;
      }

      if (!parsed.data.session) {
        setLoginStatus("error");
        setLoginMessage("Session absente dans la reponse de connexion.");
        return;
      }

      setPassword("");
      setLoginStatus("idle");
      setLoginMessage("");
      // La session vit dans le cookie HttpOnly ; on déclenche simplement le rechargement.
      onAuthenticated();
    } catch (error) {
      setLoginStatus("error");
      setLoginMessage(error instanceof Error ? error.message : "Erreur de connexion inconnue.");
    }
  }

  return (
    <div className="grid gap-3">
      <form
        className="grid gap-3 sm:grid-cols-[minmax(0,240px)_minmax(0,220px)_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          void handleLogin();
        }}
      >
        <label className="grid gap-1">
          <span className="sr-only">Email administrateur</span>
          <input
            autoComplete="email"
            className="focus-ring min-h-11 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2 text-sm font-bold text-slate-900"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email admin"
            type="email"
            value={email}
          />
        </label>
        <label className="grid gap-1">
          <span className="sr-only">Mot de passe</span>
          <input
            autoComplete="current-password"
            className="focus-ring min-h-11 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2 text-sm font-bold text-slate-900"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mot de passe"
            type="password"
            value={password}
          />
        </label>
        <button
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#002f1d] px-4 text-sm font-black uppercase text-white hover:bg-[#07542f] disabled:cursor-wait disabled:opacity-70"
          disabled={loginStatus === "loading" || loading}
          type="submit"
        >
          {loginStatus === "loading" ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
          Connexion
        </button>
      </form>

      {loginMessage ? <p className="text-sm font-bold text-red-700">{loginMessage}</p> : null}
    </div>
  );
}
