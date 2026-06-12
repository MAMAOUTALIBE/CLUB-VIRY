"use client";

import { Check, Loader2, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminAccessControl } from "@/components/admin/AdminAccessControl";

type Field = { name: string; label: string; type?: "text" | "url" | "textarea" | "boolean"; placeholder?: string };
type SettingDef = { key: string; title: string; description?: string; fields: Field[] };

const DEFS: SettingDef[] = [
  {
    key: "socials",
    title: "Réseaux sociaux",
    description: "Renseignez les URLs : les icônes deviennent cliquables sur le site (header + footer). Laissez vide = icône décorative.",
    fields: [
      { name: "facebook", label: "Facebook (URL)", type: "url", placeholder: "https://www.facebook.com/…" },
      { name: "instagram", label: "Instagram (URL)", type: "url", placeholder: "https://www.instagram.com/…" },
      { name: "youtube", label: "YouTube (URL)", type: "url", placeholder: "https://www.youtube.com/@…" },
      { name: "tiktok", label: "TikTok (URL)", type: "url", placeholder: "https://www.tiktok.com/@…" },
      { name: "whatsapp", label: "WhatsApp (URL)", type: "url", placeholder: "https://wa.me/33629670433" }
    ]
  },
  {
    key: "contact",
    title: "Coordonnées du club",
    fields: [
      { name: "phone1", label: "Téléphone 1" },
      { name: "phone2", label: "Téléphone 2" },
      { name: "email", label: "Email" },
      { name: "address", label: "Adresse" }
    ]
  },
  {
    key: "president",
    title: "Mot du président",
    fields: [
      { name: "name", label: "Nom du président" },
      { name: "photoUrl", label: "Photo (URL)", type: "url", placeholder: "https://…" },
      { name: "message", label: "Message", type: "textarea" }
    ]
  },
  {
    key: "inscriptions_banner",
    title: "Bannière inscriptions (bandeau défilant du haut)",
    fields: [
      { name: "text", label: "Texte du bandeau", type: "textarea" },
      { name: "active", label: "Bandeau affiché", type: "boolean" }
    ]
  }
];

function buildForm(def: SettingDef, value: Record<string, unknown> | undefined): Record<string, string> {
  const next: Record<string, string> = {};
  for (const f of def.fields) {
    const raw = value?.[f.name];
    next[f.name] = f.type === "boolean" ? (raw === false ? "false" : "true") : raw == null ? "" : String(raw);
  }
  return next;
}

function SettingCard({ def, value, onAuth }: { def: SettingDef; value: Record<string, unknown> | undefined; onAuth: () => void }) {
  const [form, setForm] = useState<Record<string, string>>(() => buildForm(def, value));
  const [lastValue, setLastValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Resynchronise le formulaire quand les valeurs chargées depuis l'API changent
  // (pattern React « ajuster l'état pendant le rendu », sans effet).
  if (value !== lastValue) {
    setLastValue(value);
    setForm(buildForm(def, value));
  }

  async function save() {
    setSaving(true);
    setError("");
    setDone(false);
    const payload: Record<string, unknown> = {};
    for (const f of def.fields) payload[f.name] = f.type === "boolean" ? form[f.name] === "true" : form[f.name] ?? "";
    try {
      const res = await fetch(`/api/admin/settings/${def.key}`, {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.status === 401) {
        onAuth();
        return;
      }
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error?.message ?? "Échec de l'enregistrement.");
        return;
      }
      setDone(true);
      window.setTimeout(() => setDone(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black uppercase text-[#002f1d]">{def.title}</h2>
      {def.description ? <p className="mt-1 text-sm text-slate-600">{def.description}</p> : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {def.fields.map((f) => {
          const id = `set-${def.key}-${f.name}`;
          const common = {
            id,
            value: form[f.name] ?? "",
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((s) => ({ ...s, [f.name]: e.target.value })),
            className: "focus-ring min-h-11 w-full rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2 text-sm font-bold text-slate-900"
          };
          return (
            <label key={f.name} className={`grid gap-1.5 text-sm font-bold text-slate-800 ${f.type === "textarea" ? "sm:col-span-2" : ""}`} htmlFor={id}>
              <span>{f.label}</span>
              {f.type === "textarea" ? (
                <textarea {...common} rows={3} placeholder={f.placeholder} />
              ) : f.type === "boolean" ? (
                <select {...common}>
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              ) : (
                <input {...common} type={f.type === "url" ? "url" : "text"} placeholder={f.placeholder} />
              )}
            </label>
          );
        })}
      </div>
      {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}
      <div className="mt-4 flex items-center gap-3">
        <button onClick={() => void save()} disabled={saving} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-[#f7c600] px-5 text-sm font-black uppercase text-[#002f1d] hover:bg-[#002f1d] hover:text-white disabled:cursor-wait disabled:opacity-70" type="button">
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Enregistrer
        </button>
        {done ? <span className="inline-flex items-center gap-1 text-sm font-black text-emerald-700"><Check size={16} /> Enregistré</span> : null}
      </div>
    </section>
  );
}

export function SettingsAdmin() {
  const [settings, setSettings] = useState<Record<string, Record<string, unknown>>>({});
  const [state, setState] = useState<"loading" | "ready" | "auth" | "error">("loading");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch("/api/admin/settings", { credentials: "same-origin" });
      if (res.status === 401) {
        setState("auth");
        return;
      }
      const json = await res.json();
      if (!json?.ok) {
        setState("error");
        setMessage(json?.error?.message ?? "Chargement impossible.");
        return;
      }
      setSettings(json.data?.settings ?? {});
      setState("ready");
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "Erreur réseau.");
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(t);
  }, [load]);

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs font-black uppercase text-[#07542f]">Paramètres du site</p>
        <h1 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Identité & contenus du club</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">Réseaux sociaux, coordonnées, mot du président, bandeau d'inscriptions. Ces éléments alimentent l'ensemble du site public.</p>
      </div>

      {state === "loading" ? (
        <p className="flex items-center gap-2 text-sm font-bold text-slate-500"><Loader2 className="animate-spin" size={18} /> Chargement…</p>
      ) : null}
      {state === "auth" ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="mb-3 text-sm font-bold text-amber-900">Session expirée — reconnectez-vous.</p>
          <AdminAccessControl loading={false} onAuthenticated={() => void load()} />
        </div>
      ) : null}
      {message ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{message}</p> : null}

      {state === "ready" ? DEFS.map((def) => <SettingCard key={def.key} def={def} value={settings[def.key]} onAuth={() => setState("auth")} />) : null}
    </div>
  );
}
