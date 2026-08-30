"use client";

import { Copy, Eye, EyeOff, KeyRound, Link2, Loader2, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { showToast } from "@/components/admin/Toast";

type FamilyAccessAccount = {
  profileId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "ARCHIVED";
  relationship: "PARENT" | "LEGAL_GUARDIAN" | "PLAYER" | "OTHER";
  isPrimaryContact: boolean;
};

type SharedCredentials = { email: string; password: string };

function generatedPassword(): string {
  const values = new Uint32Array(1);
  window.crypto.getRandomValues(values);
  return `Viry-${String(values[0] % 1_000_000).padStart(6, "0")}`;
}

function accountName(account: FamilyAccessAccount): string {
  return [account.firstName, account.lastName].filter(Boolean).join(" ") || account.displayName || account.email || "Compte famille";
}

function apiError(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const error = (payload as { error?: { message?: unknown; details?: unknown } }).error;
  const message = typeof error?.message === "string" ? error.message : fallback;
  const details = Array.isArray(error?.details)
    ? error.details
        .map((item) => (item && typeof item === "object" && "message" in item ? String(item.message) : ""))
        .filter(Boolean)
        .join(" · ")
    : "";
  return details ? `${message} ${details}` : message;
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    showToast("Informations copiées.");
  } catch {
    showToast("Copie impossible sur cet appareil.", "error");
  }
}

export function FamilyAccessAdmin({ familyId }: { familyId: string }) {
  const endpoint = `/api/admin/families/${familyId}/access`;
  const [accounts, setAccounts] = useState<FamilyAccessAccount[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "forbidden" | "error">("loading");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"closed" | "create" | "link">("closed");
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sharedCredentials, setSharedCredentials] = useState<SharedCredentials | null>(null);
  const [resetProfileId, setResetProfileId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  const loadAccounts = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetch(endpoint, { credentials: "same-origin" });
      const payload = await response.json().catch(() => null);

      if (response.status === 403) {
        setStatus("forbidden");
        return;
      }
      if (!response.ok || !payload?.ok) {
        setMessage(apiError(payload, "Chargement des accès impossible."));
        setStatus("error");
        return;
      }

      setAccounts(Array.isArray(payload.data?.accounts) ? payload.data.accounts : []);
      setStatus("ready");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur réseau.");
      setStatus("error");
    }
  }, [endpoint]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAccounts(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAccounts]);

  function openCreate() {
    setMode("create");
    setMessage("");
    setSharedCredentials(null);
    setPassword(generatedPassword());
  }

  function openLink() {
    setMode("link");
    setMessage("");
    setSharedCredentials(null);
  }

  async function submitCreate(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const credentials = { email: email.trim().toLowerCase(), password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: credentials.email, password, firstName: firstName.trim(), lastName: lastName.trim() })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.ok) {
        setMessage(apiError(payload, "Création du compte impossible."));
        return;
      }

      setSharedCredentials(credentials);
      setEmail("");
      setFirstName("");
      setLastName("");
      setPassword("");
      setMode("closed");
      await loadAccounts();
      showToast("Accès famille créé.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur réseau.");
    } finally {
      setPending(false);
    }
  }

  async function submitLink(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.ok) {
        setMessage(apiError(payload, "Rattachement impossible."));
        return;
      }

      setEmail("");
      setMode("closed");
      await loadAccounts();
      showToast("Compte rattaché à la famille.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur réseau.");
    } finally {
      setPending(false);
    }
  }

  function openReset(profileId: string) {
    setResetProfileId(profileId);
    setResetPassword(generatedPassword());
    setSharedCredentials(null);
    setMessage("");
  }

  async function submitReset(account: FamilyAccessAccount) {
    setPending(true);
    setMessage("");

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: account.profileId, password: resetPassword })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.ok) {
        setMessage(apiError(payload, "Modification du mot de passe impossible."));
        return;
      }

      setSharedCredentials({ email: account.email ?? "", password: resetPassword });
      setResetProfileId(null);
      setResetPassword("");
      showToast("Nouveau mot de passe enregistré.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur réseau.");
    } finally {
      setPending(false);
    }
  }

  async function unlink(account: FamilyAccessAccount) {
    if (!window.confirm(`Retirer l’accès de ${accountName(account)} à cette famille ?`)) return;
    setPending(true);
    setMessage("");

    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: account.profileId })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.ok) {
        setMessage(apiError(payload, "Suppression du rattachement impossible."));
        return;
      }

      await loadAccounts();
      showToast("Accès retiré de la famille.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur réseau.");
    } finally {
      setPending(false);
    }
  }

  if (status === "forbidden") return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="family-access-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-[#07542f]">Espace sécurisé</p>
          <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]" id="family-access-title">Accès famille</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Créez les identifiants du parent. Une fois connecté, il voit uniquement les ressources autorisées par le Pass Famille Média.
          </p>
        </div>
        <Link className="focus-ring inline-flex min-h-11 items-center rounded-md border border-[#002f1d]/20 px-4 text-xs font-black uppercase text-[#002f1d] hover:border-[#f7c600]" href="/espace-famille" rel="noreferrer" target="_blank">
          Ouvrir l’espace famille
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-[#002f1d] px-4 text-sm font-black uppercase text-white hover:bg-[#07542f]" type="button" onClick={openCreate}>
          <UserPlus size={17} aria-hidden="true" /> Créer un accès
        </button>
        <button className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-[#002f1d]/20 px-4 text-sm font-black uppercase text-[#002f1d] hover:border-[#f7c600]" type="button" onClick={openLink}>
          <Link2 size={17} aria-hidden="true" /> Rattacher un compte existant
        </button>
      </div>

      {mode === "create" ? (
        <form className="mt-5 grid gap-3 rounded-lg border border-[#002f1d]/15 bg-[#fbfcf8] p-4 sm:grid-cols-2" onSubmit={submitCreate}>
          <label className="grid gap-1"><span className="text-xs font-black uppercase text-slate-600">Prénom du parent</span><input className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold" value={firstName} onChange={(event) => setFirstName(event.target.value)} /></label>
          <label className="grid gap-1"><span className="text-xs font-black uppercase text-slate-600">Nom du parent</span><input className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold" value={lastName} onChange={(event) => setLastName(event.target.value)} /></label>
          <label className="grid gap-1 sm:col-span-2"><span className="text-xs font-black uppercase text-slate-600">Email de connexion</span><input autoComplete="email" className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-xs font-black uppercase text-slate-600">Mot de passe temporaire</span>
            <span className="flex gap-2">
              <input autoComplete="new-password" className="focus-ring min-h-11 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold" required type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} />
              <button className="focus-ring flex size-11 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-[#002f1d]" type="button" title={showPassword ? "Masquer" : "Afficher"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              <button className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 text-xs font-black uppercase text-[#002f1d]" type="button" onClick={() => setPassword(generatedPassword())}>Générer</button>
            </span>
            <span className="text-xs font-semibold text-slate-500">10 caractères minimum, avec majuscule, minuscule et chiffre.</span>
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2"><button className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-[#f7c600] px-5 text-sm font-black uppercase text-[#002f1d] disabled:opacity-60" disabled={pending} type="submit">{pending ? <Loader2 className="animate-spin" size={16} /> : <KeyRound size={16} />} Créer</button><button className="focus-ring min-h-11 px-4 text-sm font-bold text-slate-600" type="button" onClick={() => setMode("closed")}>Annuler</button></div>
        </form>
      ) : null}

      {mode === "link" ? (
        <form className="mt-5 flex flex-col gap-3 rounded-lg border border-[#002f1d]/15 bg-[#fbfcf8] p-4 sm:flex-row sm:items-end" onSubmit={submitLink}>
          <label className="grid min-w-0 flex-1 gap-1"><span className="text-xs font-black uppercase text-slate-600">Email du compte Famille existant</span><input className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <button className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#002f1d] px-5 text-sm font-black uppercase text-white disabled:opacity-60" disabled={pending} type="submit">{pending ? <Loader2 className="animate-spin" size={16} /> : <Link2 size={16} />} Rattacher</button>
          <button className="focus-ring min-h-11 px-3 text-sm font-bold text-slate-600" type="button" onClick={() => setMode("closed")}>Annuler</button>
        </form>
      ) : null}

      {sharedCredentials ? (
        <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-black uppercase text-amber-950">À transmettre au parent</p>
          <p className="mt-2 text-sm font-bold text-amber-950">Email : {sharedCredentials.email}</p>
          <p className="mt-1 text-sm font-bold text-amber-950">Mot de passe : {sharedCredentials.password}</p>
          <button className="focus-ring mt-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-amber-400 px-3 text-xs font-black uppercase text-amber-950 hover:bg-amber-100" type="button" onClick={() => void copyText(`Connexion : ${sharedCredentials.email}\nMot de passe : ${sharedCredentials.password}\nEspace famille : ${window.location.origin}/espace-famille`)}><Copy size={15} /> Copier les identifiants</button>
        </div>
      ) : null}

      {message ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700" role="alert">{message}</p> : null}

      <div className="mt-5 grid gap-3">
        {status === "loading" ? <p className="inline-flex items-center gap-2 text-sm font-bold text-slate-600"><Loader2 className="animate-spin" size={17} /> Chargement des comptes…</p> : null}
        {status === "ready" && accounts.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 bg-[#fbfcf8] p-5 text-center text-sm font-semibold text-slate-500">Aucun parent ne peut encore se connecter pour cette famille.</p> : null}
        {accounts.map((account) => (
          <article className="rounded-lg border border-slate-200 bg-[#fbfcf8] p-4" key={account.profileId}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="font-black text-[#002f1d]">{accountName(account)}</h3><p className="mt-1 text-sm font-semibold text-slate-600">{account.email ?? "Email non renseigné"}</p></div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-black uppercase ${account.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{account.status === "ACTIVE" ? "Actif" : account.status}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-md border border-[#002f1d]/20 px-3 text-xs font-black uppercase text-[#002f1d]" type="button" onClick={() => openReset(account.profileId)}><KeyRound size={15} /> Nouveau mot de passe</button>
              <button className="focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-md border border-red-200 px-3 text-xs font-black uppercase text-red-700 hover:bg-red-50" disabled={pending} type="button" onClick={() => void unlink(account)}><Trash2 size={15} /> Retirer l’accès</button>
            </div>
            {resetProfileId === account.profileId ? (
              <div className="mt-3 flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3 sm:flex-row sm:items-end">
                <label className="grid min-w-0 flex-1 gap-1"><span className="text-xs font-black uppercase text-slate-600">Nouveau mot de passe</span><input className="focus-ring min-h-11 rounded-md border border-slate-300 px-3 text-sm font-bold" value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} /></label>
                <button className="focus-ring min-h-11 rounded-md bg-[#f7c600] px-4 text-xs font-black uppercase text-[#002f1d] disabled:opacity-60" disabled={pending} type="button" onClick={() => void submitReset(account)}>Enregistrer</button>
                <button className="focus-ring min-h-11 px-3 text-sm font-bold text-slate-600" type="button" onClick={() => setResetProfileId(null)}>Annuler</button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
