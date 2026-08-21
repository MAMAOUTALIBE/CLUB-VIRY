"use client";

import { Copy, Loader2, MailPlus, ShieldOff, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { AdminCrud } from "@/components/admin/AdminCrud";
import { showToast } from "@/components/admin/Toast";

const ROLES = [
  { value: "SUPER_ADMIN", label: "Super admin" },
  { value: "ADMIN_CLUB", label: "Admin club" },
  { value: "DIRIGEANT", label: "Dirigeant" },
  { value: "EDITEUR", label: "Éditeur" },
  { value: "RESP_SPORTIF", label: "Responsable sportif" },
  { value: "RESP_BOUTIQUE", label: "Responsable boutique" },
  { value: "CONTRIBUTEUR", label: "Contributeur" },
  { value: "EDUCATEUR", label: "Éducateur" },
  { value: "FAMILLE", label: "Famille" },
  { value: "JOUEUR", label: "Joueur" },
  { value: "MEMBRE", label: "Membre" },
  { value: "PARTENAIRE", label: "Partenaire" },
  { value: "VISITEUR", label: "Visiteur" }
];

// Inviter un « visiteur » n'a pas de sens : c'est le rôle des personnes sans compte.
const INVITABLE_ROLES = ROLES.filter((role) => role.value !== "VISITEUR");

const STATUSES = [
  { value: "ACTIVE", label: "Actif" },
  { value: "PENDING", label: "En attente" },
  { value: "SUSPENDED", label: "Suspendu" },
  { value: "ARCHIVED", label: "Archivé" }
];

function userName(row: Record<string, unknown>): string {
  const display = (row.display_name as string | null)?.trim();
  if (display && !display.includes("@")) return display;
  const name = `${(row.first_name as string | null) ?? ""} ${(row.last_name as string | null) ?? ""}`.trim();
  return name || (row.email as string | null) || "—";
}

/**
 * Invitation d'un compte. Le club reçoit un email Supabase avec un lien de création
 * de mot de passe ; si l'envoi échoue (SMTP non configuré sur le Supabase du club),
 * l'API renvoie le lien et on l'affiche ici pour le transmettre à la main.
 */
function InviteUserCard({ onInvited }: { onInvited: () => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBRE");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [manualLink, setManualLink] = useState("");

  async function invite() {
    setPending(true);
    setError("");
    setManualLink("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
          ...(lastName.trim() ? { lastName: lastName.trim() } : {})
        })
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        const details = Array.isArray(json?.error?.details)
          ? json.error.details.map((issue: { field?: string; message?: string }) => `${issue.field}: ${issue.message}`).join(" · ")
          : "";
        setError(`${json?.error?.message ?? "Invitation impossible."}${details ? " — " + details : ""}`);
        return;
      }

      setEmail("");
      setFirstName("");
      setLastName("");
      onInvited();

      if (json.data?.invitationSent) {
        setOpen(false);
        showToast("Invitation envoyée par email.");
        return;
      }

      setManualLink(typeof json.data?.invitationLink === "string" ? json.data.invitationLink : "");
      showToast("Compte créé, mais l'email n'a pas pu être envoyé.", "error");
    } catch (networkError) {
      setError(networkError instanceof Error ? networkError.message : "Erreur réseau.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-[#07542f]">Module CRM</p>
          <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Inviter un compte</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            L&apos;invité reçoit un email l&apos;invitant à choisir son mot de passe, puis accède directement à l&apos;espace correspondant à
            son rôle. Vous ne pouvez pas inviter un rôle supérieur ou égal au vôtre.
          </p>
        </div>
        <button
          onClick={() => setOpen((value) => !value)}
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-[#002f1d] px-4 text-sm font-black uppercase text-white hover:bg-[#07542f]"
          type="button"
        >
          <MailPlus size={18} aria-hidden="true" /> {open ? "Fermer" : "Inviter"}
        </button>
      </div>

      {open ? (
        <form
          className="mt-5 grid gap-4 rounded-lg border border-[#002f1d]/15 bg-[#fbfcf8] p-5 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void invite();
          }}
        >
          <label className="grid gap-2 sm:col-span-2">
            <span className="text-xs font-black uppercase text-slate-600">Email</span>
            <input
              className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="prenom.nom@club.fr"
              required
              type="email"
              value={email}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase text-slate-600">Rôle</span>
            <select
              className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900"
              onChange={(event) => setRole(event.target.value)}
              value={role}
            >
              {INVITABLE_ROLES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase text-slate-600">Prénom</span>
            <input
              className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900"
              onChange={(event) => setFirstName(event.target.value)}
              type="text"
              value={firstName}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase text-slate-600">Nom</span>
            <input
              className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900"
              onChange={(event) => setLastName(event.target.value)}
              type="text"
              value={lastName}
            />
          </label>

          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700 sm:col-span-2" role="alert">
              {error}
            </p>
          ) : null}

          {manualLink ? (
            <div className="grid gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 sm:col-span-2">
              <p className="text-sm font-bold text-amber-900">
                Le compte est créé mais l&apos;email n&apos;a pas pu partir. Transmettez ce lien à la personne concernée — il est personnel et
                temporaire.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded bg-white px-2 py-1 text-xs text-slate-700">{manualLink}</code>
                <button
                  className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-amber-300 px-2.5 py-1.5 text-xs font-black uppercase text-amber-900 hover:bg-amber-100"
                  onClick={() => {
                    void navigator.clipboard
                      ?.writeText(manualLink)
                      .then(() => showToast("Lien copié."))
                      .catch(() => showToast("Copie impossible — sélectionnez le lien.", "error"));
                  }}
                  type="button"
                >
                  <Copy size={14} aria-hidden="true" /> Copier
                </button>
              </div>
            </div>
          ) : null}

          <div className="sm:col-span-2">
            <button
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#002f1d] px-5 text-sm font-black uppercase text-white hover:bg-[#07542f] disabled:cursor-wait disabled:opacity-70"
              disabled={pending}
              type="submit"
            >
              {pending ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <MailPlus size={16} aria-hidden="true" />}
              Envoyer l&apos;invitation
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

/** Désactivation immédiate d'un compte : suspend l'accès sans effacer l'historique. */
function AccountAccessAction({ row, onDone }: { row: Record<string, unknown>; onDone: () => Promise<void> }) {
  const [pending, setPending] = useState(false);
  const id = typeof row.id === "string" ? row.id : "";
  const name = userName(row);
  const isSuspended = row.status === "SUSPENDED";

  if (!id) return null;

  async function toggleAccess() {
    if (!isSuspended && !window.confirm(`Désactiver le compte de ${name} ? La personne ne pourra plus se connecter.`)) {
      return;
    }

    setPending(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: isSuspended ? "ACTIVE" : "SUSPENDED" })
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        showToast(json?.error?.message ?? "Modification impossible.", "error");
        return;
      }

      await onDone();
      showToast(isSuspended ? "Compte réactivé." : "Compte désactivé.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Erreur réseau.", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggleAccess()}
      disabled={pending}
      aria-label={`${isSuspended ? "Réactiver" : "Désactiver"} le compte de ${name}`}
      className={`focus-ring inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-black uppercase disabled:cursor-wait disabled:opacity-70 ${
        isSuspended ? "border-[#002f1d]/20 bg-[#002f1d] text-white hover:bg-[#07542f]" : "border-amber-200 text-amber-800 hover:bg-amber-50"
      }`}
    >
      {pending ? (
        <Loader2 className="animate-spin" size={14} aria-hidden="true" />
      ) : isSuspended ? (
        <ShieldCheck size={14} aria-hidden="true" />
      ) : (
        <ShieldOff size={14} aria-hidden="true" />
      )}
      {isSuspended ? "Réactiver" : "Désactiver"}
    </button>
  );
}

export function UtilisateursAdmin() {
  // Remonter la liste après une invitation : c'est le seul moyen de la recharger
  // depuis l'extérieur du module CRUD, qui gère son chargement lui-même.
  const [listVersion, setListVersion] = useState(0);

  return (
    <div className="grid gap-6">
      <InviteUserCard onInvited={() => setListVersion((value) => value + 1)} />
      <AdminCrud
        key={listVersion}
        title="Utilisateurs & rôles"
        description="Gérez les comptes, leurs rôles et leur accès. Un compte désactivé (suspendu ou archivé) ne peut plus se connecter ni utiliser une session déjà ouverte. Garde anti-élévation : vous ne pouvez pas attribuer un rôle supérieur ou égal au vôtre (sauf SUPER_ADMIN)."
        endpoint="/api/admin/users"
        listEndpoint="/api/admin/users?limit=200"
        listKey="users"
        itemKey="profile"
        disableCreate
        rowActions={(row, { reload }) => <AccountAccessAction row={row} onDone={reload} />}
        fields={[
          { name: "role", label: "Rôle", type: "select", options: ROLES },
          { name: "status", label: "Statut", type: "select", options: STATUSES },
          { name: "displayName", label: "Nom affiché", rowKey: "display_name", fullWidth: true },
          { name: "firstName", label: "Prénom", rowKey: "first_name" },
          { name: "lastName", label: "Nom", rowKey: "last_name" },
          { name: "phone", label: "Téléphone" }
        ]}
        columns={[
          { label: "Utilisateur", render: (r) => <span className="font-bold text-[#002f1d]">{userName(r)}</span> },
          { label: "Email", render: (r) => String(r.email ?? "—") },
          { label: "Rôle", render: (r) => ROLES.find((x) => x.value === r.role)?.label ?? String(r.role ?? "—") },
          { label: "Statut", render: (r) => STATUSES.find((x) => x.value === r.status)?.label ?? String(r.status ?? "—") }
        ]}
      />
    </div>
  );
}
