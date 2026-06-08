"use client";

import { useState } from "react";

type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  fullWidth?: boolean;
};

type FormConfig = {
  title: string;
  submitLabel: string;
  endpoint: string;
  fields: Field[];
  withMessage?: boolean;
  messageLabel?: string;
  messageRequired?: boolean;
  successMessage?: string;
  buildPayload: (values: Record<string, string>) => Record<string, unknown>;
};

const contactFields: Field[] = [
  { name: "firstName", label: "Prénom", required: true },
  { name: "lastName", label: "Nom", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Téléphone", type: "tel" },
  { name: "subject", label: "Sujet", required: true, fullWidth: true }
];

function FormShell({
  title,
  submitLabel,
  endpoint,
  fields,
  withMessage = true,
  messageLabel = "Message",
  messageRequired = true,
  successMessage = "Votre demande a bien été envoyée. Le club vous recontacte rapidement.",
  buildPayload
}: FormConfig) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string>("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      setStatus("error");
      setFeedback("Merci de compléter correctement les champs obligatoires.");
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const values: Record<string, string> = {};
    formData.forEach((value, key) => {
      values[key] = typeof value === "string" ? value.trim() : "";
    });

    setStatus("loading");
    setFeedback("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(values))
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.ok) {
        const apiMessage = result?.error?.message as string | undefined;
        setStatus("error");
        setFeedback(
          apiMessage && apiMessage.length > 0
            ? apiMessage
            : "Une erreur est survenue. Réessayez ou contactez le club par téléphone."
        );
        return;
      }

      form.reset();
      setStatus("success");
      setFeedback(successMessage);
    } catch {
      setStatus("error");
      setFeedback("Connexion impossible. Vérifiez votre réseau puis réessayez.");
    }
  }

  return (
    <form className="official-card rounded-lg bg-white p-5 sm:p-6" noValidate onSubmit={handleSubmit}>
      <p className="text-xs font-black uppercase text-[#f7c600]">Formulaire officiel</p>
      <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">{title}</h2>
      <div className="gold-divider mt-3" aria-hidden="true" />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label
            className={`grid gap-2 text-sm font-bold text-slate-800 ${field.fullWidth ? "sm:col-span-2" : ""}`}
            key={field.name}
          >
            {field.label}
            {field.required ? <span className="text-red-600"> *</span> : null}
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
          {messageLabel}
          {messageRequired ? <span className="text-red-600"> *</span> : null}
          <textarea
            className="focus-ring min-h-32 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2"
            name="message"
            required={messageRequired}
          />
        </label>
      ) : null}
      <button
        className="focus-ring mt-5 inline-flex min-h-11 rounded-md bg-[#f7c600] px-5 py-3 text-sm font-black uppercase text-[#002f1d] shadow-[0_10px_24px_rgba(247,198,0,0.22)] hover:bg-[#002f1d] hover:text-white disabled:cursor-wait disabled:opacity-70"
        disabled={status === "loading"}
        type="submit"
      >
        {status === "loading" ? "Envoi..." : submitLabel}
      </button>
      <p aria-live="polite" className="sr-only">
        {status === "loading" ? "Envoi en cours" : feedback}
      </p>
      {status === "success" ? <p className="mt-3 text-sm font-bold text-green-700">{feedback}</p> : null}
      {status === "error" ? <p className="mt-3 text-sm font-bold text-red-700">{feedback}</p> : null}
    </form>
  );
}

export function ContactForm() {
  return (
    <FormShell
      buildPayload={(values) => ({
        fullName: `${values.firstName ?? ""} ${values.lastName ?? ""}`.trim(),
        email: values.email,
        phone: values.phone || undefined,
        subject: values.subject,
        message: values.message
      })}
      endpoint="/api/contact-requests"
      fields={contactFields}
      submitLabel="Envoyer"
      title="Contactez-nous"
    />
  );
}

export function RegistrationForm() {
  return (
    <FormShell
      buildPayload={(values) => ({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        birthDate: values.birthDate,
        category: values.category,
        message: values.message || undefined
      })}
      endpoint="/api/inscriptions"
      fields={[
        { name: "firstName", label: "Prénom du joueur", required: true },
        { name: "lastName", label: "Nom du joueur", required: true },
        { name: "email", label: "Email du responsable", type: "email", required: true },
        { name: "phone", label: "Téléphone", type: "tel", required: true },
        { name: "birthDate", label: "Date de naissance", type: "date", required: true },
        { name: "category", label: "Catégorie souhaitée", required: true }
      ]}
      messageLabel="Message (facultatif)"
      messageRequired={false}
      submitLabel="Envoyer ma demande d'inscription"
      successMessage="Votre demande d'inscription est bien envoyée. Le club vous recontacte pour finaliser la licence."
      title="Formulaire d'inscription"
    />
  );
}

export function RecruitmentForm() {
  return (
    <FormShell
      buildPayload={(values) => ({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || undefined,
        birthDate: values.birthDate,
        position: values.position || undefined,
        currentClub: values.currentClub || undefined,
        message: values.message || undefined
      })}
      endpoint="/api/recruitment/applications"
      fields={[
        { name: "firstName", label: "Prénom", required: true },
        { name: "lastName", label: "Nom", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Téléphone", type: "tel" },
        { name: "birthDate", label: "Date de naissance", type: "date", required: true },
        { name: "position", label: "Poste", required: true },
        { name: "currentClub", label: "Club actuel", required: true }
      ]}
      messageLabel="Message (facultatif)"
      messageRequired={false}
      submitLabel="Envoyer ma candidature"
      successMessage="Votre candidature est bien envoyée. La cellule sportive du club l'étudiera et vous recontactera."
      title="Formulaire de candidature"
    />
  );
}
