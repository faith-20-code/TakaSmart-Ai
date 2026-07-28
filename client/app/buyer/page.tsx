"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/src/components/DashboardShell";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import { useAuth } from "@/src/context/AuthContext";
import { apiClient, ApiError } from "@/src/lib/api";
import {
  CREAM,
  FONT_BODY,
  FONT_DISPLAY,
  FONT_MONO,
  INK,
  INK_BORDER,
  INK_MUTED,
  KRAFT,
  KRAFT_LIGHT,
  MaterialType,
  OCHRE_ON_DARK,
  OCHRE_TEXT,
  PAPER,
  RUST,
  SLATE,
  StatusIcon,
  TEAL,
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

// ---------- types ----------

type InterestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

type MyInterest = {
  id: string;
  status: InterestStatus;
};

type Listing = {
  id: string;
  title: string;
  description?: string | null;
  materialType: MaterialType;
  quantityKg: number;
  areaName?: string | null;
  status: string;
  createdAt: string;
  seller?: { name: string; phoneNumber?: string };
  _count?: { interests: number };
  // AI fields — null on older listings
  aiPriceMin?: number | null;
  aiPriceMax?: number | null;
  condition?: string | null;
  conditionNote?: string | null;
  // injected client-side after fetching my interests
  myInterest?: MyInterest;
};

type ListingsResponse = {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
};

type MyInterestsResponse = {
  interests: { listingId: string; id: string; status: InterestStatus }[];
};

type ExpressInterestResponse = {
  interest: { id: string; status: InterestStatus };
  message?: string;
};

// ---------- interest status indicator ----------

function InterestIndicator({
  interest,
  sellerPhone,
}: {
  interest: MyInterest;
  sellerPhone?: string;
}) {
  if (interest.status === "PENDING") {
    return (
      <div
        className="mt-3 rounded-sm border px-3 py-2 text-xs"
        style={{ borderColor: KRAFT_LIGHT, color: SLATE, fontFamily: FONT_MONO }}
      >
        Interest sent — waiting for seller response.
      </div>
    );
  }
  if (interest.status === "ACCEPTED") {
    return (
      <div
        className="mt-3 rounded-sm border px-3 py-2 text-xs"
        style={{ borderColor: TEAL, background: "#EAF3F1" }}
      >
        <p className="font-semibold" style={{ color: TEAL, fontFamily: FONT_MONO }}>
          Accepted — contact the seller to arrange collection.
        </p>
        {sellerPhone ? (
          <p className="mt-1 font-bold" style={{ color: INK, fontFamily: FONT_MONO }}>
            {sellerPhone}
          </p>
        ) : null}
      </div>
    );
  }
  // REJECTED
  return (
    <div
      className="mt-3 rounded-sm border px-3 py-2 text-xs"
      style={{ borderColor: RUST, color: RUST, background: "#FBEFEC", fontFamily: FONT_MONO }}
    >
      The seller has declined this request.
    </div>
  );
}

// ---------- page ----------

export default function BuyerPage() {
  const { user, logout } = useAuth();

  // listings
  const [listings, setListings] = useState<Listing[]>([]);
  const [materialFilter, setMaterialFilter] = useState<MaterialType | "">("");
  const [loadingListings, setLoadingListings] = useState(true);
  const [listingsError, setListingsError] = useState("");

  // express interest state — keyed by listingId
  const [interestMessage, setInterestMessage] = useState<Record<string, string>>({});
  const [expressing, setExpressing] = useState<string | null>(null);
  const [interestError, setInterestError] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState<string | null>(null);

  // ---------- load listings + merge my interests ----------

  async function loadListings() {
    try {
      setLoadingListings(true);
      setListingsError("");
      const query = materialFilter
        ? `?materialType=${encodeURIComponent(materialFilter)}`
        : "";
      const [listingsRes, myInterestsRes] = await Promise.all([
        apiClient.get<ListingsResponse>(`/listings${query}`),
        user?.userType === "BUYER" && !user.id.startsWith("preview-")
          ? apiClient.get<MyInterestsResponse>("/listings/my-interests").catch(() => null)
          : Promise.resolve(null),
      ]);

      // build a lookup map: listingId → { id, status }
      const interestMap = new Map<string, MyInterest>();
      if (myInterestsRes?.interests) {
        for (const i of myInterestsRes.interests) {
          interestMap.set(i.listingId, { id: i.id, status: i.status });
        }
      }

      const merged = listingsRes.listings.map((l) => ({
        ...l,
        myInterest: interestMap.get(l.id),
      }));
      setListings(merged);
    } catch {
      setListingsError("Could not load marketplace listings.");
    } finally {
      setLoadingListings(false);
    }
  }

  useEffect(() => {
    if (user?.userType === "BUYER") {
      void loadListings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialFilter, user?.userType]);

  // ---------- express interest ----------

  async function handleExpressInterest(listing: Listing) {
    setInterestError((prev) => ({ ...prev, [listing.id]: "" }));
    setExpressing(listing.id);
    try {
      const res = await apiClient.post<ExpressInterestResponse>(
        `/listings/${listing.id}/interest`,
        { message: interestMessage[listing.id] ?? "" },
      );
      // update the listing in place
      setListings((prev) =>
        prev.map((l) =>
          l.id === listing.id
            ? { ...l, myInterest: { id: res.interest.id, status: res.interest.status } }
            : l,
        ),
      );
      setShowForm(null);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? ((err.data as { error?: string })?.error ?? "Could not send interest. Try again.")
          : "Could not send interest. Try again.";
      setInterestError((prev) => ({ ...prev, [listing.id]: msg }));
    } finally {
      setExpressing(null);
    }
  }

  // ---------- render ----------

  return (
    <ProtectedRoute allowedUserType="BUYER">
      <DashboardShell
        eyebrow="Buyer marketplace"
        title={`Welcome${user ? `, ${user.name}` : ""}`}
        description="Browse verified material intake from sellers, track live weight, and open a ticket when you find a match."
        userName={user?.name}
        userType={user?.userType}
        onLogout={() => void logout()}
      >
        <div className="min-h-full" style={{ fontFamily: FONT_BODY, background: CREAM }}>
          <div className="grid gap-6 p-1 lg:grid-cols-[1fr_0.62fr]">

            {/* ── Marketplace ── */}
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
                  <h2
                    className={`mt-2 ${type.h2}`}
                    style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, color: INK }}
                  >
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
                    value={materialFilter}
                    onChange={(e) => setMaterialFilter(e.target.value as MaterialType | "")}
                  >
                    <option value="">All materials</option>
                    {materialTypes.map((t) => (
                      <option key={t} value={t}>
                        {materialStyles[t].label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {listingsError ? (
                <p
                  className="mt-5 rounded-sm border px-3 py-2 text-sm"
                  role="alert"
                  style={{ borderColor: RUST, color: RUST, background: "#FBEFEC" }}
                >
                  {listingsError}
                </p>
              ) : null}

              {loadingListings ? (
                <p className="mt-6 text-sm" style={{ color: SLATE }}>
                  Pulling the latest weigh-ins...
                </p>
              ) : listings.length === 0 ? (
                <div
                  className="mt-6 rounded-sm border border-dashed p-6 text-center"
                  style={{ borderColor: KRAFT_LIGHT }}
                >
                  <p
                    className="text-sm font-semibold uppercase tracking-[0.14em]"
                    style={{ color: INK, fontFamily: FONT_MONO }}
                  >
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
                    const alreadyInterested = !!listing.myInterest;
                    const isExpressing = expressing === listing.id;
                    const formOpen = showForm === listing.id;
                    const err = interestError[listing.id];

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

                        {/* ticket header */}
                        <div
                          className="flex items-center justify-between border-b border-dashed px-5 py-3"
                          style={{ borderColor: KRAFT_LIGHT }}
                        >
                          <span
                            className="text-[11px] font-medium uppercase tracking-[0.16em]"
                            style={{ color: KRAFT, fontFamily: FONT_MONO }}
                          >
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

                        {/* ticket body */}
                        <div className="px-5 pt-4">
                          <h3
                            className={type.h3}
                            style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, color: INK }}
                          >
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
                            <p
                              className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                              style={{ color: KRAFT, fontFamily: FONT_MONO }}
                            >
                              Net weight
                            </p>
                            <p
                              className={type.dataHero}
                              style={{ fontFamily: FONT_MONO, fontWeight: 600, color: INK }}
                            >
                              {listing.quantityKg}
                              <span className="ml-1 text-sm font-medium" style={{ color: KRAFT }}>
                                kg
                              </span>
                            </p>
                          </div>
                          {/* AI price range */}
                          {listing.aiPriceMin && listing.aiPriceMax ? (
                            <div className="text-right">
                              <p
                                className="text-[10px] font-semibold uppercase tracking-[0.12em]"
                                style={{ color: KRAFT, fontFamily: FONT_MONO }}
                              >
                                Suggested price
                              </p>
                              <p
                                className="mt-0.5 text-sm font-bold"
                                style={{ color: "#1A6B43", fontFamily: FONT_MONO }}
                              >
                                KES {listing.aiPriceMin.toLocaleString()} — {listing.aiPriceMax.toLocaleString()}
                              </p>
                            </div>
                          ) : null}
                        </div>

                        {/* AI condition assessment */}
                        {listing.condition ? (
                          <div
                            className="mx-5 mt-3 rounded-sm border p-3"
                            style={{ borderColor: KRAFT_LIGHT, background: "#F6F2E7" }}
                          >
                            <p
                              className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                              style={{ color: KRAFT, fontFamily: FONT_MONO }}
                            >
                              AI assessment
                            </p>
                            <p
                              className="mt-1 text-sm font-semibold"
                              style={{ color: INK }}
                            >
                              {listing.condition}
                            </p>
                            {listing.conditionNote ? (
                              <p className="mt-0.5 text-[12px] leading-5" style={{ color: SLATE }}>
                                {listing.conditionNote}
                              </p>
                            ) : null}
                          </div>
                        ) : null}

                        {/* metadata strip */}
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

                        {/* ── Interest section ── */}
                        <div
                          className="border-t px-5 pb-5 pt-4"
                          style={{ borderColor: KRAFT_LIGHT }}
                        >
                          {alreadyInterested ? (
                            <InterestIndicator
                              interest={listing.myInterest!}
                              sellerPhone={
                                listing.myInterest?.status === "ACCEPTED"
                                  ? listing.seller?.phoneNumber
                                  : undefined
                              }
                            />
                          ) : formOpen ? (
                            <div className="space-y-3">
                              <label className="block">
                                <span
                                  className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                                  style={{ color: KRAFT, fontFamily: FONT_MONO }}
                                >
                                  Message (optional)
                                </span>
                                <textarea
                                  className="mt-2 min-h-20 w-full rounded-sm border bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600"
                                  style={{ borderColor: KRAFT_LIGHT, color: INK }}
                                  placeholder="Tell the seller what you need..."
                                  value={interestMessage[listing.id] ?? ""}
                                  onChange={(e) =>
                                    setInterestMessage((prev) => ({
                                      ...prev,
                                      [listing.id]: e.target.value,
                                    }))
                                  }
                                />
                              </label>
                              {err ? (
                                <p className="text-xs" style={{ color: RUST }}>
                                  {err}
                                </p>
                              ) : null}
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  disabled={isExpressing}
                                  onClick={() => void handleExpressInterest(listing)}
                                  className="h-9 rounded-sm px-4 text-xs font-semibold uppercase tracking-[0.08em] text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                                  style={{ background: TEAL, fontFamily: FONT_MONO }}
                                >
                                  {isExpressing ? "Sending..." : "Send interest"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowForm(null)}
                                  className="h-9 rounded-sm border px-4 text-xs font-semibold uppercase tracking-[0.08em] transition"
                                  style={{
                                    borderColor: KRAFT_LIGHT,
                                    color: SLATE,
                                    fontFamily: FONT_MONO,
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowForm(listing.id)}
                              className="h-9 w-full rounded-sm text-xs font-semibold uppercase tracking-[0.08em] text-white transition"
                              style={{ background: TEAL, fontFamily: FONT_MONO }}
                            >
                              Express interest
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Sidebar ── */}
            <aside
              className="rounded-md border p-6"
              style={{ borderColor: KRAFT_LIGHT, background: INK }}
            >
              <p
                className={type.eyebrow}
                style={{ color: OCHRE_ON_DARK, fontFamily: FONT_MONO }}
              >
                How a weigh-in becomes yours
              </p>
              <ol className="mt-5 space-y-5">
                {[
                  {
                    n: "01",
                    t: "Browse the floor",
                    d: "Live supply pulls straight from seller weigh-ins on the backend.",
                  },
                  {
                    n: "02",
                    t: "Filter by material",
                    d: "Narrow the floor to plastic, metal, glass, or whatever you're sourcing.",
                  },
                  {
                    n: "03",
                    t: "Express interest",
                    d: "Click the button on a ticket to send the seller a signal — with an optional message.",
                  },
                  {
                    n: "04",
                    t: "Wait for acceptance",
                    d: "The seller reviews all interested buyers and accepts or rejects. You'll be notified either way.",
                  },
                  {
                    n: "05",
                    t: "Contact to collect",
                    d: "Once accepted, the seller's phone number appears so you can arrange collection directly.",
                  },
                ].map((step) => (
                  <li key={step.n} className="flex gap-4">
                    <span
                      className="text-lg"
                      style={{ fontFamily: FONT_MONO, color: OCHRE_ON_DARK, fontWeight: 600 }}
                    >
                      {step.n}
                    </span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: CREAM }}>
                        {step.t}
                      </p>
                      <p className="mt-1 text-sm leading-6" style={{ color: INK_MUTED }}>
                        {step.d}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* interest status legend */}
              <div
                className="mt-8 border-t pt-6"
                style={{ borderColor: INK_BORDER }}
              >
                <p
                  className={type.eyebrow}
                  style={{ color: OCHRE_ON_DARK, fontFamily: FONT_MONO }}
                >
                  Interest status
                </p>
                <ul className="mt-4 space-y-3">
                  {[
                    { label: "Pending", desc: "Sent — waiting for the seller.", color: KRAFT },
                    { label: "Accepted", desc: "Seller said yes. Phone number shown.", color: TEAL },
                    { label: "Rejected", desc: "Seller has declined this time.", color: RUST },
                  ].map((s) => (
                    <li key={s.label} className="flex items-start gap-2">
                      <span
                        className="mt-0.5 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em]"
                        style={{ color: s.color, borderColor: s.color }}
                      >
                        {s.label}
                      </span>
                      <p className="text-[12px] leading-5" style={{ color: INK_MUTED }}>
                        {s.desc}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
