"use client";

import { Check, Loader2, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminAccessControl } from "@/components/admin/AdminAccessControl";

type Field = { name: string; label: string; type?: "text" | "url" | "textarea" | "boolean" | "json"; placeholder?: string; help?: string };
type SettingDef = { key: string; title: string; description?: string; fields: Field[] };

const ICON_HELP = "Icônes : Users, Award, Shield, Building2, CalendarDays, Handshake, Dumbbell, HeartHandshake, Target, Trophy, Flag, GraduationCap, TrendingUp, Sparkles, Star…";

/** Définition standard d'une page éditoriale simple : résumé mobile + paragraphes. */
function editorialPageDef(key: string, title: string, description: string): SettingDef {
  return {
    key,
    title,
    description,
    fields: [
      { name: "mobileSummary", label: "Résumé (affiché sur mobile)", type: "textarea" },
      { name: "paragraphs", label: "Paragraphes (JSON)", type: "json", help: `Liste de textes, un par paragraphe. Ex : ["Premier paragraphe.", "Second paragraphe."]` }
    ]
  };
}

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
  },
  {
    key: "club_stats",
    title: "Chiffres clés (accueil + page Le Club)",
    description: "Liste des statistiques affichées dans la barre du club. Format JSON : label, value (texte libre), iconName.",
    fields: [
      { name: "items", label: "Statistiques (JSON)", type: "json", help: `Ex : [{ "label": "Licenciés", "value": "+600", "iconName": "Users" }]. ${ICON_HELP}` }
    ]
  },
  {
    key: "values",
    title: "Valeurs du club (accueil + Le Club)",
    description: "Liste des valeurs affichées. Format JSON : title, text, iconName.",
    fields: [
      { name: "items", label: "Valeurs (JSON)", type: "json", help: `Ex : [{ "title": "Respect", "text": "Le respect de chacun.", "iconName": "Handshake" }]. ${ICON_HELP}` }
    ]
  },
  {
    key: "histoire",
    title: "Page « Notre histoire »",
    description: "Introduction + frise chronologique de la page /le-club/histoire.",
    fields: [
      { name: "eyebrow", label: "Sur-titre", placeholder: "Notre parcours" },
      { name: "title", label: "Titre", placeholder: "Depuis 1958" },
      { name: "intro", label: "Introduction", type: "textarea" },
      { name: "timeline", label: "Frise (JSON)", type: "json", help: `Ex : [{ "year": "1958", "title": "Naissance du club", "text": "…", "iconName": "Flag" }]. ${ICON_HELP}` }
    ]
  },
  {
    key: "organigramme",
    title: "Page « Organigramme »",
    description: "Titre + pôles de la page /le-club/organigramme.",
    fields: [
      { name: "title", label: "Titre", placeholder: "Structure du club" },
      { name: "intro", label: "Introduction", type: "textarea" },
      { name: "groups", label: "Pôles (JSON)", type: "json", help: `Ex : [{ "title": "Bureau", "text": "Président, trésorerie…" }]` }
    ]
  },
  {
    key: "stade",
    title: "Page « Stade Henri Longuet »",
    description: "Adresse, carte et galerie de la page /le-club/stade-henri-longuet.",
    fields: [
      { name: "address", label: "Adresse", placeholder: "Stade Henri Longuet, Avenue de l'Armée Leclerc, 91170 Viry-Châtillon" },
      { name: "mapsQuery", label: "Recherche Google Maps", placeholder: "Stade Henri Longuet, Viry-Châtillon", help: "Texte utilisé pour la carte intégrée." },
      { name: "infrastructures", label: "Infrastructures (JSON)", type: "json", help: `Liste de textes. Ex : ["2 terrains", "Vestiaires modernes"]` },
      { name: "gallery", label: "Galerie photos (JSON)", type: "json", help: `Ex : [{ "src": "/stade/tribune.jpg", "alt": "…", "caption": "…" }]. URLs autorisées : chemin local /…, Supabase Storage (*.supabase.co) ou Unsplash.` }
    ]
  },
  {
    key: "installations",
    title: "Page « Installations »",
    description: "Liste des installations de la page /le-club/installations.",
    fields: [
      { name: "items", label: "Installations (JSON)", type: "json", help: `Ex : [{ "name": "Stade Henri Longuet", "address": "…", "type": "Matchs officiels", "usage": "…", "teams": ["Seniors"], "image": "/…", "mapsUrl": "https://…" }]` }
    ]
  },
  {
    key: "codes_conduite",
    title: "Page « Codes de conduite »",
    description: "Codes de bonne conduite (par public) et règlement intérieur de la page /le-club/codes-de-conduite. Alimente aussi le PDF.",
    fields: [
      { name: "blocks", label: "Codes de conduite (JSON)", type: "json", help: `Ex : [{ "title": "Jeune joueur", "audience": "Joueurs", "icon": "Trophy", "intro": "…", "essentials": ["…"], "rules": ["…"] }]. ${ICON_HELP}` },
      { name: "regulation", label: "Règlement intérieur (JSON)", type: "json", help: `Ex : [{ "title": "Adhésion", "text": "…" }]` }
    ]
  },
  {
    key: "formation_educateurs",
    title: "Formation — éducateurs (école de foot & football à 11)",
    description: "Annuaires affichés sur /formation/ecole-de-foot et /formation/football-a-11. Contacts centralisés via le secrétariat.",
    fields: [
      { name: "ecoleFoot", label: "Éducateurs école de foot (JSON)", type: "json", help: `Ex : [{ "name": "Nadia Ait Ali", "role": "Responsable", "category": "U6-U13", "pole": "Coordination", "contact": "contact via secretariat", "photo": "/…", "tags": ["…"] }]` },
      { name: "footA11", label: "Éducateurs football à 11 (JSON)", type: "json", help: "Même format que ci-dessus." }
    ]
  },
  {
    key: "formation_creneaux",
    title: "Formation — créneaux d'entraînement",
    description: "Créneaux indicatifs affichés sur /formation/ecole-de-foot.",
    fields: [
      { name: "items", label: "Créneaux (JSON)", type: "json", help: `Ex : [{ "category": "U6-U7", "time": "Mercredi 14h00 - 15h30", "place": "Terrain synthétique" }]` }
    ]
  },
  {
    key: "formation_projet",
    title: "Formation — projet école de foot (feuille de route)",
    description: "Frise « objectifs structurants » de /formation/projet-ecole-de-foot.",
    fields: [
      { name: "items", label: "Étapes (JSON)", type: "json", help: `Ex : [{ "year": "2026", "title": "Cadre commun", "text": "…" }]` }
    ]
  },
  {
    key: "formation_stages",
    title: "Formation — stages",
    description: "Stages proposés sur /formation/stages.",
    fields: [
      { name: "items", label: "Stages (JSON)", type: "json", help: `Ex : [{ "title": "Stage vacances", "audience": "U8-U13", "dates": "Vacances scolaires", "places": "36 places", "status": "Ouvert", "description": "…" }]. status : "Ouvert", "Bientot" ou "Complet".` }
    ]
  },
  {
    key: "galerie_archives",
    title: "Page « Galerie photos historiques »",
    description: "Photos d'archives affichées sur /le-club/galerie (et l'aperçu sur /le-club/histoire).",
    fields: [
      { name: "items", label: "Photos (JSON)", type: "json", help: `Ex : [{ "title": "1964 · Équipe du collège", "image": "/historique/historique-51.jpeg" }]. Titre = légende + texte alternatif.` }
    ]
  },
  editorialPageDef("mentions_legales", "Page « Mentions légales »", "Contenu de la page /mentions-legales."),
  editorialPageDef("politique_confidentialite", "Page « Politique de confidentialité »", "Contenu de la page /politique-confidentialite."),
  editorialPageDef("boutique_cgv", "Boutique — Conditions générales", "Contenu de la page /boutique/conditions-generales."),
  editorialPageDef("boutique_livraison", "Boutique — Livraison & retour", "Contenu de la page /boutique/livraison-retour."),
  {
    key: "inscriptions_page",
    title: "Page « Inscriptions »",
    description: "Texte d'accroche, étapes et atouts de la page /inscriptions (le formulaire reste géré automatiquement).",
    fields: [
      { name: "heroDescription", label: "Accroche (sous le titre)", type: "textarea" },
      { name: "steps", label: "Étapes « Comment s'inscrire ? » (JSON)", type: "json", help: `Liste de textes. Ex : ["Choisir sa catégorie", "Remplir le formulaire"]` },
      { name: "features", label: "Atouts (JSON)", type: "json", help: `Ex : [{ "title": "Catégories", "text": "…", "iconName": "Users" }]. ${ICON_HELP}` }
    ]
  },
  {
    key: "detections_page",
    title: "Page « Détections / Recrutement »",
    description: "Texte d'accroche, catégories concernées et étapes du process de la page /detections-recrutement.",
    fields: [
      { name: "heroDescription", label: "Accroche (sous le titre)", type: "textarea" },
      { name: "categories", label: "Catégories concernées (JSON)", type: "json", help: `Liste de textes. Ex : ["Football à 11", "Seniors", "Féminines"]` },
      { name: "features", label: "Étapes du process (JSON)", type: "json", help: `Ex : [{ "title": "Candidater", "text": "…", "iconName": "Send" }]. ${ICON_HELP}` }
    ]
  }
];

function buildForm(def: SettingDef, value: Record<string, unknown> | undefined): Record<string, string> {
  const next: Record<string, string> = {};
  for (const f of def.fields) {
    const raw = value?.[f.name];
    if (f.type === "json") {
      next[f.name] = JSON.stringify(Array.isArray(raw) ? raw : raw ?? [], null, 2);
    } else if (f.type === "boolean") {
      next[f.name] = raw === false ? "false" : "true";
    } else {
      next[f.name] = raw == null ? "" : String(raw);
    }
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
    setError("");
    setDone(false);
    const payload: Record<string, unknown> = {};
    for (const f of def.fields) {
      if (f.type === "json") {
        let parsed: unknown;
        try {
          parsed = JSON.parse((form[f.name] ?? "").trim() || "[]");
        } catch {
          setError(`Le champ « ${f.label} » contient un JSON invalide. Vérifiez la syntaxe (guillemets, virgules, crochets).`);
          return;
        }
        if (!Array.isArray(parsed)) {
          setError(`Le champ « ${f.label} » doit être une liste JSON entre crochets [ … ], pas un objet.`);
          return;
        }
        payload[f.name] = parsed;
      } else if (f.type === "boolean") {
        payload[f.name] = form[f.name] === "true";
      } else {
        payload[f.name] = form[f.name] ?? "";
      }
    }
    setSaving(true);
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
            <label key={f.name} className={`grid gap-1.5 text-sm font-bold text-slate-800 ${f.type === "textarea" || f.type === "json" ? "sm:col-span-2" : ""}`} htmlFor={id}>
              <span>{f.label}</span>
              {f.type === "json" ? (
                <textarea {...common} rows={8} spellCheck={false} className={`${common.className} font-mono text-xs leading-5`} placeholder={f.placeholder} />
              ) : f.type === "textarea" ? (
                <textarea {...common} rows={3} placeholder={f.placeholder} />
              ) : f.type === "boolean" ? (
                <select {...common}>
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              ) : (
                <input {...common} type={f.type === "url" ? "url" : "text"} placeholder={f.placeholder} />
              )}
              {f.help ? <span className="text-xs font-medium text-slate-500">{f.help}</span> : null}
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
        <p className="mt-1 max-w-2xl text-sm text-slate-600">Réseaux sociaux, coordonnées, mot du président, bandeau d'inscriptions, chiffres clés, valeurs et pages « Le Club » (histoire, organigramme, stade). Ces éléments alimentent l'ensemble du site public.</p>
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
