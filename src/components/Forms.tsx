"use client";

import { useId, useState } from "react";

type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  fullWidth?: boolean;
  as?: "input" | "select";
  options?: string[];
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  max?: string;
  maxLength?: number;
};

type FormConfig = {
  title: string;
  submitLabel: string;
  endpoint: string;
  fields: Field[];
  withMessage?: boolean;
  messageLabel?: string;
  messageRequired?: boolean;
  messageMaxLength?: number;
  successMessage?: string;
  buildPayload: (values: Record<string, string>) => Record<string, unknown>;
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const contactFields: Field[] = [
  { name: "firstName", label: "Prénom", required: true, autoComplete: "given-name", maxLength: 80 },
  { name: "lastName", label: "Nom", required: true, autoComplete: "family-name", maxLength: 80 },
  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email", inputMode: "email", maxLength: 160 },
  { name: "phone", label: "Téléphone", type: "tel", autoComplete: "tel", inputMode: "tel", maxLength: 32 },
  { name: "subject", label: "Sujet", required: true, fullWidth: true, maxLength: 180 }
];

function FormShell({
  title,
  submitLabel,
  endpoint,
  fields,
  withMessage = true,
  messageLabel = "Message",
  messageRequired = true,
  // Aligné sur la borne serveur (validation.ts) : 1500 pour les demandes
  // (inscription/recrutement/partenariat), 3000 pour le contact.
  messageMaxLength = 3000,
  successMessage = "Votre demande a bien été envoyée. Le club vous recontacte rapidement.",
  buildPayload
}: FormConfig) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formId = useId();

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

    // Honeypot anti-bot : champ invisible qui doit rester vide.
    if (values.company) {
      form.reset();
      setStatus("success");
      setFeedback(successMessage);
      return;
    }

    setStatus("loading");
    setFeedback("");
    setFieldErrors({});

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(values))
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.ok) {
        const details = Array.isArray(result?.error?.details) ? result.error.details : [];
        const nextFieldErrors: Record<string, string> = {};
        for (const issue of details) {
          if (issue && typeof issue.field === "string" && typeof issue.message === "string") {
            nextFieldErrors[issue.field] = issue.message;
          }
        }
        // Le contact envoie un seul `fullName` au serveur mais affiche deux champs
        // (firstName/lastName) : on rabat l'erreur serveur sur les champs reellement rendus.
        if (nextFieldErrors.fullName) {
          nextFieldErrors.firstName = nextFieldErrors.firstName ?? nextFieldErrors.fullName;
          nextFieldErrors.lastName = nextFieldErrors.lastName ?? nextFieldErrors.fullName;
        }
        setFieldErrors(nextFieldErrors);
        // Deplace le focus vers le premier champ en erreur (a11y).
        const firstErrorField = fields.find((field) => nextFieldErrors[field.name]);
        if (firstErrorField) {
          requestAnimationFrame(() => document.getElementById(`${formId}-${firstErrorField.name}`)?.focus());
        }
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
      <p className="text-xs font-black uppercase text-[#664d00]">Formulaire officiel</p>
      <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">{title}</h2>
      <div className="gold-divider mt-3" aria-hidden="true" />
      {/* Honeypot anti-bot (masqué aux humains et aux lecteurs d'écran) */}
      <div aria-hidden="true" className="hidden">
        <label>
          Ne pas remplir
          <input autoComplete="off" name="company" tabIndex={-1} type="text" />
        </label>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const fieldId = `${formId}-${field.name}`;
          const errorId = `${fieldId}-error`;
          const hasError = Boolean(fieldErrors[field.name]);
          const commonProps = {
            id: fieldId,
            name: field.name,
            required: field.required,
            "aria-invalid": hasError || undefined,
            "aria-describedby": hasError ? errorId : undefined,
            className: `focus-ring min-h-11 rounded-md border bg-[#fbfcf8] px-3 py-2 ${hasError ? "border-red-500" : "border-slate-300"}`
          };

          return (
            <label
              className={`grid gap-2 text-sm font-bold text-slate-800 ${field.fullWidth ? "sm:col-span-2" : ""}`}
              htmlFor={fieldId}
              key={field.name}
            >
              <span>
                {field.label}
                {field.required ? <span className="text-red-600"> *</span> : null}
              </span>
              {field.as === "select" ? (
                <select {...commonProps} defaultValue="">
                  <option disabled value="">
                    Sélectionner…
                  </option>
                  {(field.options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  {...commonProps}
                  autoComplete={field.autoComplete}
                  inputMode={field.inputMode}
                  max={field.max}
                  maxLength={field.maxLength}
                  type={field.type ?? "text"}
                />
              )}
              {hasError ? (
                <span className="text-xs font-bold text-red-700" id={errorId}>
                  {fieldErrors[field.name]}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
      {withMessage ? (
        <label className="mt-4 grid gap-2 text-sm font-bold text-slate-800" htmlFor={`${formId}-message`}>
          <span>
            {messageLabel}
            {messageRequired ? <span className="text-red-600"> *</span> : null}
          </span>
          <textarea
            aria-describedby={fieldErrors.message ? `${formId}-message-error` : undefined}
            aria-invalid={Boolean(fieldErrors.message) || undefined}
            className={`focus-ring min-h-32 rounded-md border bg-[#fbfcf8] px-3 py-2 ${fieldErrors.message ? "border-red-500" : "border-slate-300"}`}
            id={`${formId}-message`}
            maxLength={messageMaxLength}
            name="message"
            required={messageRequired}
          />
          {fieldErrors.message ? (
            <span className="text-xs font-bold text-red-700" id={`${formId}-message-error`}>
              {fieldErrors.message}
            </span>
          ) : null}
        </label>
      ) : null}
      <button
        className="focus-ring mt-5 inline-flex min-h-11 rounded-md bg-[#f7c600] px-5 py-3 text-sm font-black uppercase text-[#002f1d] shadow-[0_10px_24px_rgba(247,198,0,0.22)] hover:bg-[#002f1d] hover:text-white disabled:cursor-wait disabled:opacity-70"
        disabled={status === "loading"}
        type="submit"
      >
        {status === "loading" ? "Envoi..." : submitLabel}
      </button>
      {/* Region live toujours montee : l'insertion de texte est annoncee de maniere fiable. */}
      <div aria-live="polite" className="mt-3 empty:mt-0">
        {status === "success" ? (
          <p className="text-sm font-bold text-green-700">{feedback}</p>
        ) : status === "error" ? (
          <p className="text-sm font-bold text-red-700" role="alert">
            {feedback}
          </p>
        ) : null}
      </div>
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
        { name: "firstName", label: "Prénom du joueur", required: true, autoComplete: "given-name", maxLength: 80 },
        { name: "lastName", label: "Nom du joueur", required: true, autoComplete: "family-name", maxLength: 80 },
        { name: "email", label: "Email du responsable", type: "email", required: true, autoComplete: "email", inputMode: "email", maxLength: 160 },
        { name: "phone", label: "Téléphone", type: "tel", required: true, autoComplete: "tel", inputMode: "tel", maxLength: 32 },
        { name: "birthDate", label: "Date de naissance", type: "date", required: true, autoComplete: "bday", max: today() },
        {
          name: "category",
          label: "Catégorie souhaitée",
          required: true,
          as: "select",
          options: ["U6 / U7", "U8 / U9", "U10 / U11", "U12 / U13", "U14 / U15", "U16 / U17", "U18", "Seniors", "Féminines", "Futsal", "Loisir"]
        }
      ]}
      messageLabel="Message (facultatif)"
      messageRequired={false}
      messageMaxLength={1500}
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
        position: values.position,
        currentClub: values.currentClub,
        message: values.message || undefined
      })}
      endpoint="/api/recruitment/applications"
      fields={[
        { name: "firstName", label: "Prénom", required: true, autoComplete: "given-name", maxLength: 80 },
        { name: "lastName", label: "Nom", required: true, autoComplete: "family-name", maxLength: 80 },
        { name: "email", label: "Email", type: "email", required: true, autoComplete: "email", inputMode: "email", maxLength: 160 },
        { name: "phone", label: "Téléphone", type: "tel", autoComplete: "tel", inputMode: "tel", maxLength: 32 },
        { name: "birthDate", label: "Date de naissance", type: "date", required: true, autoComplete: "bday", max: today() },
        {
          name: "position",
          label: "Poste",
          required: true,
          as: "select",
          options: ["Gardien", "Défenseur", "Milieu", "Attaquant", "Polyvalent"]
        },
        { name: "currentClub", label: "Club actuel", required: true, autoComplete: "organization", maxLength: 120 }
      ]}
      messageLabel="Message (facultatif)"
      messageRequired={false}
      messageMaxLength={1500}
      submitLabel="Envoyer ma candidature"
      successMessage="Votre candidature est bien envoyée. La cellule sportive du club l'étudiera et vous recontactera."
      title="Formulaire de candidature"
    />
  );
}

export function PartnerForm() {
  return (
    <FormShell
      buildPayload={(values) => ({
        companyName: values.companyName,
        contactName: values.contactName,
        email: values.email,
        phone: values.phone || undefined,
        message: values.message || undefined
      })}
      endpoint="/api/partners/requests"
      fields={[
        { name: "companyName", label: "Entreprise / structure", required: true, fullWidth: true, autoComplete: "organization", maxLength: 180 },
        { name: "contactName", label: "Votre nom", required: true, autoComplete: "name", maxLength: 120 },
        { name: "email", label: "Email", type: "email", required: true, autoComplete: "email", inputMode: "email", maxLength: 160 },
        { name: "phone", label: "Téléphone", type: "tel", autoComplete: "tel", inputMode: "tel", maxLength: 32 }
      ]}
      messageLabel="Votre projet de partenariat (facultatif)"
      messageRequired={false}
      messageMaxLength={1500}
      submitLabel="Envoyer ma demande"
      successMessage="Votre demande de partenariat est bien envoyée. Le club vous recontacte rapidement."
      title="Devenir partenaire"
    />
  );
}
