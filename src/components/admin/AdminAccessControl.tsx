"use client";

import { Loader2, LogIn, RefreshCw } from "lucide-react";
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
  onClear?: () => void;
  onTokenSubmit: (token: string) => void;
  token: string;
  tokenLabel?: string;
  setToken: (token: string) => void;
};

export const ADMIN_TOKEN_STORAGE_KEY = "club_admin_access_token";

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

export function AdminAccessControl({ loading, onClear, onTokenSubmit, token, tokenLabel = "Charger", setToken }: AdminAccessControlProps) {
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

      setToken("");
      window.sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
      setLoginStatus("idle");
      setLoginMessage("");
      onTokenSubmit("");
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

      <form
        className="grid gap-3 sm:grid-cols-[minmax(0,320px)_auto_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          onTokenSubmit(token);
        }}
      >
        <label className="grid gap-1">
          <span className="sr-only">Token admin Supabase</span>
          <input
            className="focus-ring min-h-11 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2 text-sm font-bold text-slate-900"
            onChange={(event) => setToken(event.target.value)}
            placeholder="Bearer token admin"
            type="password"
            value={token}
          />
        </label>
        <button
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#f7c600] px-4 text-sm font-black uppercase text-[#002f1d] hover:bg-[#002f1d] hover:text-white disabled:cursor-wait disabled:opacity-70"
          disabled={loading || loginStatus === "loading"}
          type="submit"
        >
          {loading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <RefreshCw size={18} aria-hidden="true" />}
          {tokenLabel}
        </button>
        {onClear ? (
          <button
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-black uppercase text-slate-700 hover:border-[#f7c600]"
            onClick={onClear}
            type="button"
          >
            Demo
          </button>
        ) : null}
      </form>
    </div>
  );
}
