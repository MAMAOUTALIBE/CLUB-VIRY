"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";

import { useShop } from "@/components/shop/ShopProvider";

export function CartDrawer() {
  const { items, count, setQuantity, removeItem, clear } = useShop();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (items.length === 0) {
      setStatus("error");
      setFeedback("Votre panier est vide.");
      return;
    }

    const data = new FormData(form);
    setStatus("loading");
    setFeedback("");

    try {
      const response = await fetch("/api/order-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: String(data.get("fullName") ?? "").trim(),
          email: String(data.get("email") ?? "").trim(),
          phone: String(data.get("phone") ?? "").trim() || undefined,
          message: String(data.get("message") ?? "").trim() || undefined,
          items: items.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price ?? undefined }))
        })
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.ok) {
        setStatus("error");
        setFeedback(result?.error?.message ?? "Envoi impossible. Réessayez ou contactez le club.");
        return;
      }

      form.reset();
      clear();
      setStatus("success");
      setFeedback("Votre demande de commande est bien envoyée. Le club vous recontacte pour la finaliser.");
    } catch {
      setStatus("error");
      setFeedback("Connexion impossible. Vérifiez votre réseau puis réessayez.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Ouvrir le panier (${count} article${count > 1 ? "s" : ""})`}
        className="focus-ring fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#f7c600] text-[#001c10] shadow-[0_14px_30px_rgba(247,198,0,0.4)] transition hover:scale-105"
      >
        <ShoppingCart size={24} aria-hidden="true" />
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#e11d48] px-1.5 text-xs font-black text-white">{count}</span>
        ) : null}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[90] flex justify-end bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Panier"
        >
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-black uppercase text-[#002f1d]">Mon panier</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer le panier" className="focus-ring rounded-md p-1 text-slate-500 hover:bg-slate-100">
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {status === "success" ? (
                <div className="mt-6 text-center">
                  <p className="text-sm font-bold text-green-700">{feedback}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setOpen(false);
                    }}
                    className="focus-ring mt-4 inline-flex rounded-md bg-[#002f1d] px-4 py-2 text-sm font-black uppercase text-white"
                  >
                    Fermer
                  </button>
                </div>
              ) : items.length === 0 ? (
                <p className="mt-6 text-center text-sm text-slate-500">Votre panier est vide. Ajoutez des produits depuis la boutique.</p>
              ) : (
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.name} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black uppercase text-[#002f1d]">{item.name}</p>
                        {item.price ? <p className="text-sm font-bold text-slate-600">{item.price}</p> : null}
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setQuantity(item.name, item.quantity - 1)} aria-label="Diminuer la quantité" className="focus-ring rounded border border-slate-300 p-1 hover:bg-slate-100">
                          <Minus size={14} aria-hidden="true" />
                        </button>
                        <span className="min-w-7 text-center text-sm font-black" aria-label={`Quantité : ${item.quantity}`}>
                          {item.quantity}
                        </span>
                        <button type="button" onClick={() => setQuantity(item.name, item.quantity + 1)} aria-label="Augmenter la quantité" className="focus-ring rounded border border-slate-300 p-1 hover:bg-slate-100">
                          <Plus size={14} aria-hidden="true" />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeItem(item.name)} aria-label={`Retirer ${item.name}`} className="focus-ring rounded p-1 text-red-600 hover:bg-red-50">
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && status !== "success" ? (
              <form onSubmit={handleSubmit} noValidate className="border-t border-slate-200 px-5 py-4">
                <p className="text-xs font-bold text-slate-500">Commande à régler et à retirer au club. Le club vous recontacte pour la finaliser.</p>
                <div className="mt-3 grid gap-2">
                  <input name="fullName" required maxLength={160} autoComplete="name" placeholder="Nom complet *" className="focus-ring min-h-11 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2 text-sm" />
                  <input name="email" type="email" required maxLength={160} autoComplete="email" inputMode="email" placeholder="Email *" className="focus-ring min-h-11 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2 text-sm" />
                  <input name="phone" type="tel" maxLength={32} autoComplete="tel" inputMode="tel" placeholder="Téléphone" className="focus-ring min-h-11 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2 text-sm" />
                  <textarea name="message" maxLength={1500} placeholder="Tailles, précisions… (facultatif)" className="focus-ring min-h-20 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2 text-sm" />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="focus-ring mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#f7c600] px-4 py-3 text-sm font-black uppercase text-[#002f1d] transition hover:bg-[#002f1d] hover:text-white disabled:cursor-wait disabled:opacity-70"
                >
                  {status === "loading" ? "Envoi…" : "Envoyer ma demande de commande"}
                </button>
                <div aria-live="polite" className="mt-2 empty:mt-0">
                  {status === "error" ? (
                    <p className="text-sm font-bold text-red-700" role="alert">
                      {feedback}
                    </p>
                  ) : null}
                </div>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
