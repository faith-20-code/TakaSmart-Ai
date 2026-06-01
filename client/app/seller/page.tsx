"use client";

import { DashboardShell } from "@/src/components/DashboardShell";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import { useAuth } from "@/src/context/AuthContext";

export default function SellerPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedUserType="SELLER">
      <DashboardShell
        eyebrow="Seller dashboard"
        title={`Welcome${user ? `, ${user.name}` : ""}`}
        description="Manage recyclable material listings, buyer interest, and pickup coordination from one place."
        userName={user?.name}
        onLogout={() => void logout()}
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_0.7fr]">
          <section className="rounded-lg border border-[#d8e4dd] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1d9e75]">
              Sprint 2
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[#0b2318]">
              Post a listing - coming soon
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5e7569]">
              This will become the flow for adding material type, quantity,
              photos, location, and AI-assisted price suggestions.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Material details", "Pickup location", "Price guidance"].map(
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

          <aside className="rounded-lg border border-[#d8e4dd] bg-[#fffaf0] p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a6b16]">
              Setup status
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5e4b24]">
              <li>Profile state is connected.</li>
              <li>Protected routing is active.</li>
              <li>Backend auth is the next dependency.</li>
            </ul>
          </aside>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
