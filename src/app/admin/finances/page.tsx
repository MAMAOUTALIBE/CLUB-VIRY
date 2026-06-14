import { AdminModuleBoard } from "@/components/admin/AdminModuleBoard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

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

const ordersDemo = [
  { id: "o1", customer_name: "Famille Diallo", email: "diallo@example.com", status: "PAID", total_cents: 9000, created_at: "2026-06-01T10:00:00Z" },
  { id: "o2", customer_name: "Famille Martin", email: "martin@example.com", status: "DELIVERED", total_cents: 4500, created_at: "2026-05-28T10:00:00Z" },
  { id: "o3", customer_name: "Famille Keita", email: "keita@example.com", status: "PENDING", total_cents: 6000, created_at: "2026-05-25T10:00:00Z" },
  { id: "o4", customer_name: "Famille Bernard", email: "bernard@example.com", status: "PREPARING", total_cents: 3000, created_at: "2026-05-20T10:00:00Z" }
];

const paymentsDemo = [
  { id: "y1", provider: "stripe", provider_reference: "pi_001", status: "SUCCEEDED", amount_cents: 9000, created_at: "2026-06-01T10:05:00Z" },
  { id: "y2", provider: "stripe", provider_reference: "pi_002", status: "SUCCEEDED", amount_cents: 4500, created_at: "2026-05-28T10:05:00Z" },
  { id: "y3", provider: "virement", provider_reference: "vir_011", status: "PENDING", amount_cents: 6000, created_at: "2026-05-25T10:05:00Z" },
  { id: "y4", provider: "stripe", provider_reference: "pi_003", status: "FAILED", amount_cents: 3000, created_at: "2026-05-20T10:05:00Z" }
];

const allOrderStatuses = orderStatuses.map((entry) => entry.status);
const allPaymentStatuses = paymentStatuses.map((entry) => entry.status);

export default function AdminFinancesPage() {
  return (
    <div className="crm-shell-page min-h-screen bg-[#f4f6f1] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <main id="contenu" className="grid gap-6 px-4 py-5 sm:px-6 lg:px-8">
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
            demo={ordersDemo}
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
            demo={paymentsDemo}
          />
        </main>
      </div>
    </div>
  );
}
