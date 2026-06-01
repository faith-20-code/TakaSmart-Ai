"use client";

import { DashboardShell } from "@/src/components/DashboardShell";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import { useAuth } from "@/src/context/AuthContext";

export default function AdminPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedUserType="ADMIN">
      <DashboardShell
        eyebrow="Admin dashboard"
        title={`Welcome${user ? `, ${user.name}` : ""}`}
        description="Monitor marketplace activity, user growth, and listing quality as the platform takes shape."
        userName={user?.name}
        onLogout={() => void logout()}
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            ["Users", "Review seller and buyer accounts."],
            ["Listings", "Moderate material posts and status."],
            ["Activity", "Track marketplace health signals."],
          ].map(([title, body]) => (
            <section
              className="rounded-lg border border-[#d8e4dd] bg-white p-6 shadow-sm"
              key={title}
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7b68a8]">
                Coming soon
              </p>
              <h2 className="mt-3 text-xl font-semibold text-[#0b2318]">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#5e7569]">{body}</p>
            </section>
          ))}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
