"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, ExternalLink, Eye, EyeOff, Loader2, Save, Upload, UserCircle2 } from "lucide-react";

type ProfileData = {
  displayName: string;
  avatarUrl: string | null;
  publicProfile: boolean;
  publicTitle: string;
  publicDiploma: string;
  publicJoinedYear: number | null;
  publicDiplomas: string[];
  publicSpecialties: string[];
  publicQuote: string;
  publicBio: string;
  publicSlug: string;
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const inputCls =
  "focus-ring w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-[#002f1d] outline-none placeholder:text-black/35";
const labelCls = "text-xs font-black uppercase tracking-wide text-black/55";

export function EducatorPublicProfileEditor() {
  const [loaded, setLoaded] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [publicSlug, setPublicSlug] = useState("");
  const [title, setTitle] = useState("");
  const [diploma, setDiploma] = useState("");
  const [joinedYear, setJoinedYear] = useState("");
  const [diplomas, setDiplomas] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [quote, setQuote] = useState("");
  const [bio, setBio] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/educator/profile", { credentials: "same-origin" });
        const json = await res.json().catch(() => null);
        if (!active || !res.ok || !json?.data?.profile) return;
        const p = json.data.profile as ProfileData;
        setPublicProfile(Boolean(p.publicProfile));
        setDisplayName(p.displayName ?? "");
        setAvatarUrl(p.avatarUrl ?? null);
        setTitle(p.publicTitle ?? "");
        setDiploma(p.publicDiploma ?? "");
        setJoinedYear(p.publicJoinedYear ? String(p.publicJoinedYear) : "");
        setDiplomas((p.publicDiplomas ?? []).join("\n"));
        setSpecialties((p.publicSpecialties ?? []).join(", "));
        setQuote(p.publicQuote ?? "");
        setBio(p.publicBio ?? "");
        setPublicSlug(p.publicSlug ?? "");
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/educator/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          publicProfile,
          displayName: displayName.trim() || undefined,
          publicTitle: title,
          publicDiploma: diploma,
          publicJoinedYear: joinedYear,
          publicDiplomas: diplomas,
          publicSpecialties: specialties,
          publicQuote: quote,
          publicBio: bio
        })
      });
      const json = await res.json().catch(() => null);
      if (res.ok) {
        setStatus("saved");
        window.setTimeout(() => setStatus("idle"), 2500);
      } else {
        setStatus("error");
        setError(json?.error?.message ?? "Enregistrement impossible.");
      }
    } catch {
      setStatus("error");
      setError("Connexion impossible. Réessayez.");
    }
  }

  async function handlePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Format invalide : JPEG, PNG ou WebP.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image trop lourde (2 Mo maximum).");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/educator/profile/photo", { method: "POST", credentials: "same-origin", body: form });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.data?.avatarUrl) {
        setAvatarUrl(json.data.avatarUrl);
      } else {
        setError(json?.error?.message ?? "Upload impossible.");
      }
    } catch {
      setError("Upload impossible. Réessayez.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // Slug canonique renvoyé par l'API (source de vérité) ; repli local au cas où.
  const slug = publicSlug || slugify(displayName);

  return (
    <details className="official-card group mb-8 overflow-hidden rounded-2xl bg-white shadow-lg">
      <summary className="focus-ring flex cursor-pointer items-center justify-between gap-3 p-5 text-[#002f1d] [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-3">
          <UserCircle2 className="text-[#07542f]" size={22} aria-hidden="true" />
          <span>
            <span className="block text-base font-black uppercase leading-tight">Ma fiche publique</span>
            <span className="block text-xs font-semibold text-black/50">
              {publicProfile ? "Visible sur le site Encadrement" : "Masquée — activez l'affichage pour apparaître"}
            </span>
          </span>
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase ${
            publicProfile ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
          }`}
        >
          {publicProfile ? <Eye size={12} aria-hidden="true" /> : <EyeOff size={12} aria-hidden="true" />}
          {publicProfile ? "En ligne" : "Masquée"}
        </span>
      </summary>

      <form onSubmit={handleSave} className="border-t border-black/5 p-5" noValidate>
        {!loaded ? (
          <p className="flex items-center gap-2 text-sm text-black/50">
            <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Chargement…
          </p>
        ) : (
          <div className="space-y-4">
            {/* Photo */}
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Aperçu" onError={() => setAvatarUrl(null)} className="h-16 w-16 rounded-full object-cover ring-2 ring-[#f7c600]" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#07542f] text-[#f7c600] ring-2 ring-[#f7c600]" aria-hidden="true">
                  <UserCircle2 size={28} />
                </span>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="focus-ring inline-flex items-center gap-2 rounded-full bg-[#07542f] px-4 py-2 text-xs font-black uppercase text-white transition hover:bg-[#002f1d] disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Upload size={14} aria-hidden="true" />}
                  {uploading ? "Envoi…" : "Changer la photo"}
                </button>
                <p className="mt-1 text-[11px] text-black/40">JPEG / PNG / WebP — 2 Mo max</p>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choisir une photo de profil" onChange={handlePhoto} className="hidden" />
              </div>
            </div>

            <label className="flex items-center gap-2.5 rounded-xl bg-[#f7f7f5] p-3">
              <input type="checkbox" checked={publicProfile} onChange={(e) => setPublicProfile(e.target.checked)} className="h-4 w-4 accent-[#07542f]" />
              <span className="text-sm font-bold text-[#002f1d]">Afficher ma fiche sur la page Encadrement</span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="ed-name">Nom affiché</label>
                <input id="ed-name" className={`mt-1 ${inputCls}`} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Prénom Nom" />
              </div>
              <div>
                <label className={labelCls} htmlFor="ed-title">Titre / rôle</label>
                <input id="ed-title" className={`mt-1 ${inputCls}`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Éducateur U13" />
              </div>
              <div>
                <label className={labelCls} htmlFor="ed-diploma">Diplôme principal (badge)</label>
                <input id="ed-diploma" className={`mt-1 ${inputCls}`} value={diploma} onChange={(e) => setDiploma(e.target.value)} placeholder="UEFA C" />
              </div>
              <div>
                <label className={labelCls} htmlFor="ed-year">Au club depuis (année)</label>
                <input id="ed-year" type="number" inputMode="numeric" className={`mt-1 ${inputCls}`} value={joinedYear} onChange={(e) => setJoinedYear(e.target.value)} placeholder="2019" />
              </div>
            </div>

            <div>
              <label className={labelCls} htmlFor="ed-diplomas">Diplômes &amp; certifications (un par ligne)</label>
              <textarea id="ed-diplomas" className={`mt-1 ${inputCls} min-h-[70px] resize-y`} value={diplomas} onChange={(e) => setDiplomas(e.target.value)} placeholder={"UEFA C (2022)\nPSC1 (2019)"} />
            </div>

            <div>
              <label className={labelCls} htmlFor="ed-spe">Spécialités (séparées par des virgules)</label>
              <input id="ed-spe" className={`mt-1 ${inputCls}`} value={specialties} onChange={(e) => setSpecialties(e.target.value)} placeholder="Technique, Mental, Gardiens" />
            </div>

            <div>
              <label className={labelCls} htmlFor="ed-quote">Citation / mot</label>
              <textarea id="ed-quote" className={`mt-1 ${inputCls} min-h-[60px] resize-y`} value={quote} maxLength={280} onChange={(e) => setQuote(e.target.value)} placeholder="Une phrase qui vous représente…" />
            </div>

            <div>
              <label className={labelCls} htmlFor="ed-bio">Biographie</label>
              <textarea id="ed-bio" className={`mt-1 ${inputCls} min-h-[90px] resize-y`} value={bio} maxLength={600} onChange={(e) => setBio(e.target.value)} placeholder="Quelques lignes de présentation…" />
            </div>

            {error ? <p role="alert" className="text-sm font-semibold text-red-600">{error}</p> : null}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={status === "saving"}
                className="focus-ring inline-flex items-center gap-2 rounded-full bg-[#f7c600] px-5 py-2.5 text-sm font-black uppercase text-[#001c10] transition hover:-translate-y-0.5 hover:bg-[#ffd84d] disabled:opacity-50"
              >
                {status === "saving" ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
                Enregistrer
              </button>
              {status === "saved" ? (
                <span role="status" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                  <CheckCircle2 size={16} aria-hidden="true" /> Enregistré
                </span>
              ) : null}
              {publicProfile && slug ? (
                <Link href={`/le-club/encadrement/${slug}`} target="_blank" className="focus-ring inline-flex items-center gap-1.5 text-sm font-bold text-[#07542f] hover:text-[#002f1d]">
                  Voir ma fiche <ExternalLink size={14} aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </form>
    </details>
  );
}
