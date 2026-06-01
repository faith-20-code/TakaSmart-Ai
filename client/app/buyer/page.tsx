"use client";

import { DashboardShell } from "@/src/components/DashboardShell";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import { useAuth } from "@/src/context/AuthContext";

export default function BuyerPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedUserType="BUYER">
      <DashboardShell
        eyebrow="Buyer dashboard"
        title={`Welcome${user ? `, ${user.name}` : ""}`}
        description="Review available recyclable materials, express interest, and keep supplier conversations organized."
        userName={user?.name}
        onLogout={() => void logout()}
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_0.7fr]">
          <section className="rounded-lg border border-[#d8e4dd] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3b82b7]">
              Sprint 2
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[#0b2318]">
              Marketplace - coming soon
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5e7569]">
              This will become the browsing surface for material listings,
              proximity filters, seller details, and buyer interest actions.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Nearby listings", "Material filters", "Seller messages"].map(
                (item) => (
                  <div className="rounded-md bg-[#f4f7f1] p-4" key={item}>
                    <p className="text-sm font-semibold text-[#123526]">
                      {item}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>

          <aside className="rounded-lg border border-[#d8e4dd] bg-[#eef6fb] p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2f6f9c]">
              Setup status
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#36586b]">
              <li>Role-based dashboard routing is active.</li>
              <li>Marketplace UI is scaffolded.</li>
              <li>Listing APIs are still pending.</li>
            </ul>
          </aside>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
