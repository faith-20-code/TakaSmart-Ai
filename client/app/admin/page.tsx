"use client";

import { DashboardShell } from "@/src/components/DashboardShell";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import { useAuth } from "@/src/context/AuthContext";
import {
  CREAM,
  FONT_BODY,
  FONT_DISPLAY,
  FONT_MONO,
  INK,
  INK_BORDER,
  INK_MUTED,
  KRAFT_LIGHT,
  OCHRE,
  PAPER,
  SLATE,
  TicketFonts,
} from "@/src/lib/ticket-theme";

const watchStats = [
  { label: "Sellers", value: "—" },
  { label: "Buyers", value: "—" },
  { label: "Open tickets", value: "—" },
  { label: "Interests logged", value: "—" },
];

const panels = [
  {
    title: "Users",
    body: "Review seller and buyer accounts, and step in on disputed sign-ups.",
  },
  {
    title: "Listings",
    body: "Moderate material posts, close stale tickets, and flag bad weigh-ins.",
  },
  {
    title: "Activity",
    body: "Track marketplace health: posting rate, response time, closed tickets.",
  },
];

export default function AdminPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedUserType="ADMIN">
      <TicketFonts />
      <DashboardShell
        eyebrow="Control ledger"
        title={`Welcome${user ? `, ${user.name}` : ""}`}
        description="This is the floor view for the whole marketplace. Wiring is in progress — sections below light up as each endpoint ships."
        userName={user?.name}
        onLogout={() => void logout()}
      >
        <div
          className="min-h-full"
          style={{ fontFamily: FONT_BODY, background: CREAM }}
        >
          {/* Live counters */}
          <div
            className="rounded-md border p-6"
            style={{ borderColor: INK_BORDER, background: INK }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.24em]"
              style={{ color: OCHRE, fontFamily: FONT_MONO }}
            >
              Floor totals
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {watchStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-sm border p-4"
                  style={{ borderColor: INK_BORDER }}
                >
                  <p
                    className="text-3xl"
                    style={{ fontFamily: FONT_MONO, fontWeight: 600, color: "#F6F2E7" }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="mt-1 text-[11px] uppercase tracking-[0.1em]"
                    style={{ color: INK_MUTED }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px]" style={{ color: INK_MUTED, fontFamily: FONT_MONO }}>
              Not wired yet — counters populate once the reporting endpoints ship.
            </p>
          </div>

          {/* Management panels */}
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {panels.map((panel) => (
              <section
                key={panel.title}
                className="rounded-md border p-6"
                style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
              >
                <span
                  className="inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: OCHRE, borderColor: OCHRE, transform: "rotate(-2deg)" }}
                >
                  Coming soon
                </span>
                <h2
                  className="mt-4 text-xl"
                  style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, color: INK }}
                >
                  {panel.title}
                </h2>
                <p className="mt-3 text-sm leading-7" style={{ color: SLATE }}>
                  {panel.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}