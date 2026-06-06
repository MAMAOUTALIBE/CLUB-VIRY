"use client";

import { useState } from "react";

type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
};

const textFields: Field[] = [
  { name: "firstName", label: "Prénom", required: true },
  { name: "lastName", label: "Nom", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Téléphone", type: "tel", required: true }
];

function FormShell({
  title,
  submitLabel,
  fields = textFields,
  withMessage = true
}: {
  title: string;
  submitLabel: string;
  fields?: Field[];
  withMessage?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      setStatus("error");
      form.reportValidity();
      return;
    }

    setStatus("loading");
    window.setTimeout(() => {
      form.reset();
      setStatus("success");
    }, 500);
  }

  return (
    <form className="official-card rounded-lg bg-white p-5 sm:p-6" onSubmit={handleSubmit}>
      <p className="text-xs font-black uppercase text-[#f7c600]">Formulaire officiel</p>
      <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">{title}</h2>
      <div className="gold-divider mt-3" aria-hidden="true" />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label className="grid gap-2 text-sm font-bold text-slate-800" key={field.name}>
            {field.label}
            <input
              className="focus-ring min-h-11 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2"
              name={field.name}
              required={field.required}
              type={field.type ?? "text"}
            />
          </label>
        ))}
      </div>
      {withMessage ? (
        <label className="mt-4 grid gap-2 text-sm font-bold text-slate-800">
          Message
          <textarea className="focus-ring min-h-32 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2" name="message" required />
        </label>
      ) : null}
      <button
        className="focus-ring mt-5 inline-flex min-h-11 rounded-md bg-[#f7c600] px-5 py-3 text-sm font-black uppercase text-[#002f1d] shadow-[0_10px_24px_rgba(247,198,0,0.22)] hover:bg-[#002f1d] hover:text-white disabled:cursor-wait disabled:opacity-70"
        disabled={status === "loading"}
        type="submit"
      >
        {status === "loading" ? "Envoi..." : submitLabel}
      </button>
      {status === "success" ? <p className="mt-3 text-sm font-bold text-green-700">Votre demande a bien été enregistrée.</p> : null}
      {status === "error" ? <p className="mt-3 text-sm font-bold text-red-700">Merci de compléter les champs obligatoires.</p> : null}
    </form>
  );
}

export function ContactForm() {
  return <FormShell submitLabel="Envoyer" title="Contactez-nous" />;
}

export function RegistrationForm() {
  return (
    <FormShell
      fields={[
        ...textFields,
        { name: "birthDate", label: "Date de naissance", type: "date", required: true },
        { name: "category", label: "Catégorie souhaitée", required: true }
      ]}
      submitLabel="Je m'inscris en ligne"
      title="Formulaire d'inscription"
    />
  );
}

export function RecruitmentForm() {
  return (
    <FormShell
      fields={[
        ...textFields,
        { name: "birthDate", label: "Date de naissance", type: "date", required: true },
        { name: "position", label: "Poste", required: true },
        { name: "currentClub", label: "Club actuel", required: true }
      ]}
      submitLabel="Envoyer ma candidature"
      title="Formulaire de candidature"
    />
  );
}

export function AuthMockForm({ role }: { role: "membre" | "éducateur" | "administrateur" }) {
  return (
    <FormShell
      fields={[
        { name: "email", label: "Email", type: "email", required: true },
        { name: "password", label: "Mot de passe", type: "password", required: true }
      ]}
      submitLabel="Se connecter"
      title={`Espace ${role}`}
      withMessage={false}
    />
  );
}
