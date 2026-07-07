"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/src/components/DashboardShell";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import { useAuth } from "@/src/context/AuthContext";
import { apiClient } from "@/src/lib/api";
import {
  CREAM,
  FONT_BODY,
  FONT_DISPLAY,
  FONT_MONO,
  INK,
  KRAFT,
  KRAFT_LIGHT,
  MaterialType,
  OCHRE_ON_DARK,
  OCHRE_TEXT,
  PAPER,
  RUST,
  SLATE,
  StatusIcon,
  TicketFonts,
  fieldClass,
  fieldStyle,
  interactiveCardClass,
  materialStyles,
  materialTypes,
  statusStyle,
  ticketSerial,
  type,
} from "@/src/lib/ticket-theme";

type Listing = {
  id: string;
  title: string;
  description?: string | null;
  materialType: MaterialType;
  quantityKg: number;
  areaName?: string | null;
  status: string;
  createdAt: string;
  seller?: { name: string };
  _count?: { interests: number };
};

type ListingsResponse = {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
};

export default function BuyerPage() {
  const { user, logout } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [materialType, setMaterialType] = useState<MaterialType | "">("");
  const [loadingListings, setLoadingListings] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadListings() {
      try {
        setLoadingListings(true);
        setError("");
        const query = materialType
          ? `?materialType=${encodeURIComponent(materialType)}`
          : "";
        const response = await apiClient.get<ListingsResponse>(
          `/listings${query}`,
        );
        setListings(response.listings);
      } catch {
        setError("Could not load marketplace listings.");
      } finally {
        setLoadingListings(false);
      }
    }

    if (user?.userType === "BUYER") {
      void loadListings();
    }
  }, [materialType, user?.userType]);

  return (
    <ProtectedRoute allowedUserType="BUYER">
      <TicketFonts />
      <DashboardShell
        eyebrow="Weigh-in ledger"
        title={`Welcome${user ? `, ${user.name}` : ""}`}
        description="Browse verified material intake from sellers, track live weight, and open a ticket when you find a match."
        userName={user?.name}
        onLogout={() => void logout()}
      >
        <div
          className="min-h-full"
          style={{ fontFamily: FONT_BODY, background: CREAM }}
        >
          <div className="grid gap-6 p-1 lg:grid-cols-[1fr_0.62fr]">
            {/* Marketplace */}
            <section
              className="rounded-md border p-6"
              style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
            >
              <div
                className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between"
                style={{ borderColor: KRAFT_LIGHT }}
              >
                <div>
                  <p className={type.eyebrow} style={{ color: OCHRE_TEXT, fontFamily: FONT_MONO }}>
                    Manifest — active supply
                  </p>
                  <h2 className={`mt-2 ${type.h2}`} style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, color: INK }}>
                    Materials on the floor
                  </h2>
                  <p className={`mt-2 max-w-xl ${type.body}`} style={{ color: SLATE }}>
                    Every ticket below is a seller-listed batch, weighed in
                    kilograms and open for interest.
                  </p>
                </div>
                <label className="block w-full sm:w-56">
                  <span className={type.eyebrow} style={{ color: KRAFT, fontFamily: FONT_MONO }}>
                    Filter by material
                  </span>
                  <select
                    className={fieldClass}
                    style={fieldStyle}
                    value={materialType}
                    onChange={(event) =>
                      setMaterialType(event.target.value as MaterialType | "")
                    }
                  >
                    <option value="">All materials</option>
                    {materialTypes.map((type) => (
                      <option key={type} value={type}>
                        {materialStyles[type].label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {error ? (
                <p
                  className="mt-5 rounded-sm border px-3 py-2 text-sm"
                  role="alert"
                  aria-live="polite"
                  style={{ borderColor: RUST, color: RUST, background: "#FBEFEC" }}
                >
                  {error}
                </p>
              ) : null}

              {loadingListings ? (
                <p className="mt-6 text-sm" style={{ color: SLATE }}>
                  Pulling the latest weigh-ins...
                </p>
              ) : listings.length === 0 ? (
                <div className="mt-6 rounded-sm border border-dashed p-6 text-center" style={{ borderColor: KRAFT_LIGHT }}>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em]" style={{ color: INK, fontFamily: FONT_MONO }}>
                    No tickets on the floor
                  </p>
                  <p className="mt-2 text-sm leading-6" style={{ color: SLATE }}>
                    Clear the material filter, or check back once a seller
                    weighs in new supply.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {listings.map((listing) => {
                    const mat = materialStyles[listing.materialType];
                    const stat = statusStyle(listing.status);
                    return (
                      <article
                        key={listing.id}
                        className={`relative ${interactiveCardClass}`}
                        style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
                      >
                        {/* perforation notches */}
                        <span
                          aria-hidden="true"
                          className="absolute -left-[9px] top-16 h-4 w-4 rounded-full"
                          style={{ background: CREAM, border: `1px solid ${KRAFT_LIGHT}` }}
                        />
                        <span
                          aria-hidden="true"
                          className="absolute -right-[9px] top-16 h-4 w-4 rounded-full"
                          style={{ background: CREAM, border: `1px solid ${KRAFT_LIGHT}` }}
                        />

                        <div
                          className="flex items-center justify-between border-b border-dashed px-5 py-3"
                          style={{ borderColor: KRAFT_LIGHT }}
                        >
                          <span className="text-[11px] font-medium uppercase tracking-[0.16em]" style={{ color: KRAFT, fontFamily: FONT_MONO }}>
                            Ticket #{ticketSerial(listing.id)}
                          </span>
                          <span
                            className="flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                            style={{ color: stat.text, borderColor: stat.border }}
                          >
                            <StatusIcon icon={stat.icon} />
                            {listing.status}
                          </span>
                        </div>

                        <div className="px-5 pt-4">
                          <h3 className={type.h3} style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, color: INK }}>
                            {listing.title}
                          </h3>
                          <span
                            className="mt-2 inline-block rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em]"
                            style={{ background: mat.bg, color: mat.text, borderColor: mat.border }}
                          >
                            {mat.label}
                          </span>
                        </div>

                        {listing.description ? (
                          <p className="px-5 pt-3 text-sm leading-6" style={{ color: SLATE }}>
                            {listing.description}
                          </p>
                        ) : null}

                        <div className="flex items-end justify-between px-5 pt-4">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: KRAFT, fontFamily: FONT_MONO }}>
                              Net weight
                            </p>
                            <p className={type.dataHero} style={{ fontFamily: FONT_MONO, fontWeight: 600, color: INK }}>
                              {listing.quantityKg}
                              <span className="ml-1 text-sm font-medium" style={{ color: KRAFT }}>
                                kg
                              </span>
                            </p>
                          </div>
                        </div>

                        <div
                          className="mt-4 grid grid-cols-2 gap-2 border-t px-5 py-3 text-[11px] md:grid-cols-3"
                          style={{ borderColor: KRAFT_LIGHT, color: SLATE, fontFamily: FONT_MONO }}
                        >
                          <p className="truncate">
                            <span style={{ color: INK }}>SELLER </span>
                            {listing.seller?.name || "Unlisted"}
                          </p>
                          <p className="truncate">
                            <span style={{ color: INK }}>AREA </span>
                            {listing.areaName || "N/A"}
                          </p>
                          <p className="truncate md:text-right">
                            <span style={{ color: INK }}>INTEREST </span>
                            {listing._count?.interests ?? 0}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Sidebar */}
            <aside
              className="rounded-md border p-6"
              style={{ borderColor: KRAFT_LIGHT, background: INK }}
            >
              <p className={type.eyebrow} style={{ color: OCHRE_ON_DARK, fontFamily: FONT_MONO }}>
                How a weigh-in becomes yours
              </p>
              <ol className="mt-5 space-y-5">
                {[
                  { n: "01", t: "Listings load", d: "Live supply pulls straight from seller weigh-ins on the backend." },
                  { n: "02", t: "Filter by material", d: "Narrow the floor to plastic, metal, glass, or whatever you're sourcing." },
                  { n: "03", t: "Open a ticket", d: "Express interest to start the conversation — the next endpoint to ship." },
                ].map((step) => (
                  <li key={step.n} className="flex gap-4">
                    <span className="text-lg" style={{ fontFamily: FONT_MONO, color: OCHRE_ON_DARK, fontWeight: 600 }}>
                      {step.n}
                    </span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: CREAM }}>
                        {step.t}
                      </p>
                      <p className="mt-1 text-sm leading-6" style={{ color: "#B7C0BA" }}>
                        {step.d}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}