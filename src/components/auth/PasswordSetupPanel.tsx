"use client";

import { KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

/** Instantané rendu côté serveur : l'URL n'y est pas connue, la page affiche « vérification ». */
const SERVER_SNAPSHOT = "__serveur__";

function subscribeToUrl(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);

  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
}

/**
 * Le jeton arrive dans le fragment de l'URL (`#access_token=...`), ajouté par Supabase
 * en redirigeant après un lien d'invitation ou de réinitialisation. Le navigateur ne
 * transmet jamais le fragment au serveur : seule cette page peut le relire, et elle le
 * poste à l'API le temps d'une seule mise à jour.
 */
function parseUrl(snapshot: string): { reading: boolean; token: string; error: string } {
  if (snapshot === SERVER_SNAPSHOT) {
    return { reading: true, token: "", error: "" };
  }

  const [hashPart = "", queryPart = ""] = snapshot.split("?");
  const hash = new URLSearchParams(hashPart.replace(/^#/, ""));
  const query = new URLSearchParams(queryPart);

  return {
    reading: false,
    token: hash.get("access_token") ?? "",
    error: hash.get("error_description") ?? query.get("error_description") ?? ""
  };
}

export function PasswordSetupPanel() {
  const snapshot = useSyncExternalStore(
    subscribeToUrl,
    () => `${window.location.hash}${window.location.search}`,
    () => SERVER_SNAPSHOT
  );
  const link = useMemo(() => parseUrl(snapshot), [snapshot]);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rejected, setRejected] = useState("");

  const invalidMessage = rejected || link.error || (link.reading || link.token ? "" : "Ce lien est incomplet ou a expiré. Demandez un nouveau lien au club.");

  async function submit() {
    if (password !== confirmation) {
      setMessage("Les deux mots de passe ne sont pas identiques.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/password-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: link.token, password })
      });
      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.ok) {
        const details = Array.isArray(json?.error?.details)
          ? json.error.details.map((issue: { message?: string }) => issue.message).join(" · ")
          : "";
        const text = `${json?.error?.message ?? "Enregistrement impossible."}${details ? " — " + details : ""}`;

        if (response.status === 401) {
          setRejected(text);
          return;
        }

        setMessage(text);
        return;
      }

      setSaved(true);
      setPassword("");
      setConfirmation("");
      // Le jeton a servi : il quitte la barre d'adresse pour ne rester ni dans
      // l'historique ni dans un lien partagé par erreur.
      window.history.replaceState(null, "", window.location.pathname);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur réseau.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="official-card rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[#002f1d] text-[#f7c600]">
          <KeyRound size={22} aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-black uppercase text-[#07542f]">Compte club</p>
          <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Mon mot de passe</h2>
        </div>
      </div>

      {link.reading ? <p className="mt-6 text-sm font-bold text-slate-600">Vérification du lien…</p> : null}

      {saved ? (
        <div className="mt-6 grid gap-4">
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800" role="status">
            Mot de passe enregistré. Vous pouvez maintenant vous connecter.
          </p>
          <Link
            className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md bg-[#002f1d] px-5 text-sm font-black uppercase text-white hover:bg-[#07542f]"
            href="/connexion"
          >
            Se connecter
          </Link>
        </div>
      ) : null}

      {!saved && invalidMessage ? (
        <div className="mt-6 grid gap-4">
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700" role="alert">
            {invalidMessage}
          </p>
          <Link
            className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-[#002f1d]/15 px-4 text-sm font-black uppercase text-[#002f1d] hover:border-[#002f1d]"
            href="/connexion"
          >
            Retour à la connexion
          </Link>
        </div>
      ) : null}

      {!saved && !invalidMessage && !link.reading ? (
        <form
          className="mt-6 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase text-slate-600">Nouveau mot de passe</span>
            <input
              autoComplete="new-password"
              className="focus-ring min-h-12 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2 text-sm font-bold text-slate-900"
              minLength={10}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
            <span className="text-xs font-medium text-slate-500">10 caractères minimum, avec une majuscule, une minuscule et un chiffre.</span>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase text-slate-600">Confirmation</span>
            <input
              autoComplete="new-password"
              className="focus-ring min-h-12 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2 text-sm font-bold text-slate-900"
              minLength={10}
              onChange={(event) => setConfirmation(event.target.value)}
              required
              type="password"
              value={confirmation}
            />
          </label>

          {message ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700" role="alert">
              {message}
            </p>
          ) : null}

          <button
            className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#002f1d] px-5 text-sm font-black uppercase text-white hover:bg-[#07542f] disabled:cursor-wait disabled:opacity-70"
            disabled={saving}
            type="submit"
          >
            {saving ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <KeyRound size={18} aria-hidden="true" />}
            Enregistrer
          </button>
        </form>
      ) : null}
    </div>
  );
}
