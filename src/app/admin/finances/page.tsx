import { AdminModuleBoard } from "@/components/admin/AdminModuleBoard";

export const metadata = {
  title: "CRM Finances"
};

const orderStatuses = [
  { status: "PENDING", label: "En attente" },
  { status: "PAID", label: "Payée" },
  { status: "PREPARING", label: "En préparation" },
  { status: "READY", label: "Prête" },
  { status: "DELIVERED", label: "Livrée" },
  { status: "CANCELLED", label: "Annulée" },
  { status: "REFUNDED", label: "Remboursée" }
];

const paymentStatuses = [
  { status: "PENDING", label: "En attente" },
  { status: "SUCCEEDED", label: "Encaissé" },
  { status: "FAILED", label: "Échoué" },
  { status: "CANCELLED", label: "Annulé" },
  { status: "REFUNDED", label: "Remboursé" }
];

const allOrderStatuses = orderStatuses.map((entry) => entry.status);
const allPaymentStatuses = paymentStatuses.map((entry) => entry.status);

export default function AdminFinancesPage() {
  return (
    <>
          <header className="border-b border-slate-200 pb-4">
            <p className="text-xs font-black uppercase text-[#07542f]">Centre de pilotage</p>
            <h1 className="mt-1 text-3xl font-black uppercase text-[#002f1d]">Finances</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Cotisations, boutique et partenaires : suivi des commandes et des paiements, avec taux d&apos;encaissement et répartition par statut.
            </p>
          </header>

          <AdminModuleBoard
            title="Commandes boutique"
            description="Commandes de la boutique du club et leur état de traitement."
            endpoint="/api/admin/shop/orders?limit=100"
            exportHref="/api/admin/exports/orders"
            dataKey="orders"
            statuses={orderStatuses}
            titleFields={["customer_name"]}
            columns={[
              { label: "Email", field: "email" },
              { label: "Montant", field: "total_cents", format: "euro" }
            ]}
            kpis={[
              { label: "Réglées", numeratorStatuses: ["PAID", "PREPARING", "READY", "DELIVERED"], amountField: "total_cents", tone: "green" },
              { label: "En attente", numeratorStatuses: ["PENDING"], amountField: "total_cents", tone: "yellow" },
              { label: "Volume total", numeratorStatuses: allOrderStatuses, amountField: "total_cents", tone: "green" }
            ]}
          />

          <AdminModuleBoard
            title="Paiements"
            description="Paiements enregistrés (cotisations, boutique) et taux d'encaissement."
            endpoint="/api/admin/payments?limit=100"
            exportHref="/api/admin/exports/payments"
            dataKey="payments"
            statuses={paymentStatuses}
            titleFields={["provider", "provider_reference"]}
            columns={[
              { label: "Fournisseur", field: "provider" },
              { label: "Référence", field: "provider_reference" },
              { label: "Montant", field: "amount_cents", format: "euro" }
            ]}
            kpis={[
              { label: "Encaissé", numeratorStatuses: ["SUCCEEDED"], amountField: "amount_cents", tone: "green" },
              { label: "En attente", numeratorStatuses: ["PENDING"], amountField: "amount_cents", tone: "yellow" },
              { label: "Volume total", numeratorStatuses: allPaymentStatuses, amountField: "amount_cents", tone: "green" }
            ]}
          />
    </>
  );
}
