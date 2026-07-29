"use client";

import { useState } from "react";
import {
  materialStyles,
  statusStyle,
  ticketSerial,
  INK,
  CREAM,
  KRAFT,
  KRAFT_LIGHT,
  OCHRE,
  PAPER,
  RUST,
  TEAL,
  GREEN,
} from "@/src/lib/constants/materials";
import type { Listing } from "@/src/hooks/useListings";
import {
  useListingInterests,
  type ExpressInterest,
} from "@/src/hooks/useListingInterests";

// ---------- types ----------

type Props = {
  listings: Listing[];
  loadingListings: boolean;
  isPreview: boolean;
};

// ---------- sub-component: interests drawer ----------

const mono = "'IBM Plex Mono', monospace";
const serif = "'Fraunces', serif";

function statusBadgeStyle(status: ExpressInterest["status"]) {
  if (status === "ACCEPTED") return { color: TEAL, borderColor: TEAL };
  if (status === "REJECTED") return { color: RUST, borderColor: RUST };
  return { color: KRAFT, borderColor: KRAFT };
}

function InterestsDrawer({
  listingId,
  interestsByListing,
  loadingListing,
  actingOn,
  actionError,
  loadInterests,
  updateInterestStatus,
}: {
  listingId: string;
  interestsByListing: Record<string, ExpressInterest[]>;
  loadingListing: Record<string, boolean>;
  actingOn: string | null;
  actionError: Record<string, string>;
  loadInterests: (id: string) => Promise<void>;
  updateInterestStatus: (
    listingId: string,
    interestId: string,
    status: "ACCEPTED" | "REJECTED",
  ) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const interests = interestsByListing[listingId];
  const loading = loadingListing[listingId] ?? false;

  function toggle() {
    if (!open && !interests) {
      void loadInterests(listingId);
    }
    setOpen((v) => !v);
  }

  return (
    <div className="border-t" style={{ borderColor: "#3A453F" }}>
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition hover:opacity-80"
        style={{ color: OCHRE, fontFamily: mono }}
      >
        <span>View interested buyers</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div className="px-3 pb-3">
          {loading ? (
            <p className="text-[11px]" style={{ color: "#B7C0BA" }}>
              Loading...
            </p>
          ) : !interests || interests.length === 0 ? (
            <p className="text-[11px]" style={{ color: "#B7C0BA" }}>
              No buyers have expressed interest yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {interests.map((interest) => {
                const badge = statusBadgeStyle(interest.status);
                const isPending = interest.status === "PENDING";
                const err = actionError[interest.id];
                return (
                  <li
                    key={interest.id}
                    className="rounded-sm border p-3"
                    style={{ borderColor: "#3A453F", background: PAPER }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className="text-sm font-semibold leading-snug"
                          style={{ color: INK, fontFamily: serif }}
                        >
                          {interest.buyer.buyerProfile?.companyName ?? "Company name not set"}
                        </p>
                        <p
                          className="mt-0.5 text-[11px]"
                          style={{ color: KRAFT, fontFamily: mono }}
                        >
                          {interest.buyer.phoneNumber}
                        </p>
                      </div>
                      <span
                        className="shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em]"
                        style={badge}
                      >
                        {interest.status}
                      </span>
                    </div>

                    {interest.message ? (
                      <p
                        className="mt-2 text-[11px] leading-5 italic"
                        style={{ color: "#5B5B54" }}
                      >
                        &ldquo;{interest.message}&rdquo;
                      </p>
                    ) : null}

                    {err ? (
                      <p
                        className="mt-2 text-[11px]"
                        style={{ color: RUST }}
                      >
                        {err}
                      </p>
                    ) : null}

                    {isPending ? (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          disabled={actingOn === interest.id}
                          onClick={() =>
                            void updateInterestStatus(
                              listingId,
                              interest.id,
                              "ACCEPTED",
                            )
                          }
                          className="h-7 rounded-sm px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                          style={{ background: TEAL, fontFamily: mono }}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          disabled={actingOn === interest.id}
                          onClick={() =>
                            void updateInterestStatus(
                              listingId,
                              interest.id,
                              "REJECTED",
                            )
                          }
                          className="h-7 rounded-sm border px-3 text-[11px] font-semibold uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-60"
                          style={{
                            borderColor: RUST,
                            color: RUST,
                            background: "white",
                            fontFamily: mono,
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ---------- main component ----------

export function TicketsList({ listings, loadingListings, isPreview }: Props) {
  const {
    interestsByListing,
    loadingListing,
    actingOn,
    actionError,
    loadInterests,
    updateInterestStatus,
  } = useListingInterests();

  return (
    <aside
      className="rounded-md border p-6"
      style={{ borderColor: KRAFT_LIGHT, background: INK }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.24em]"
        style={{ color: OCHRE, fontFamily: mono }}
      >
        My tickets
      </p>

      {isPreview ? (
        <p className="mt-4 text-sm leading-6" style={{ color: "#B7C0BA" }}>
          Preview accounts can&apos;t load real tickets. Sign in with your
          account to post and manage material batches.
        </p>
      ) : loadingListings ? (
        <p className="mt-4 text-sm" style={{ color: "#B7C0BA" }}>
          Pulling your ledger...
        </p>
      ) : listings.length === 0 ? (
        <div
          className="mt-4 rounded-sm border border-dashed p-5 text-center"
          style={{ borderColor: "#3A453F" }}
        >
          <p
            className="text-sm font-semibold uppercase tracking-[0.1em]"
            style={{ color: CREAM, fontFamily: mono }}
          >
            No tickets yet
          </p>
          <p className="mt-2 text-sm leading-6" style={{ color: "#B7C0BA" }}>
            Post your first batch to start receiving buyer interest.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {listings.map((listing) => {
            const mat = materialStyles[listing.materialType];
            const stat = statusStyle(listing.status);
            return (
              <article
                key={listing.id}
                className="overflow-hidden rounded-sm border"
                style={{ borderColor: "#3A453F", background: PAPER }}
              >
                {/* listing summary row */}
                <div className="flex">
                  {listing.images && listing.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="h-full w-20 flex-shrink-0 object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-20 w-20 flex-shrink-0 items-center justify-center text-[10px] uppercase tracking-[0.08em]"
                      style={{
                        background: mat.bg,
                        color: mat.text,
                        fontFamily: mono,
                      }}
                    >
                      No photo
                    </div>
                  )}
                  <div className="flex-1 px-3 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="text-sm font-semibold leading-snug"
                        style={{ color: INK, fontFamily: serif }}
                      >
                        {listing.title}
                      </h3>
                      <span
                        className="rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em]"
                        style={{ color: stat.text, borderColor: stat.border }}
                      >
                        {listing.status}
                      </span>
                    </div>
                    <p
                      className="mt-1 text-[11px] font-medium uppercase tracking-[0.06em]"
                      style={{ color: KRAFT, fontFamily: mono }}
                    >
                      {mat.label} · {listing.quantityKg} kg · #
                      {ticketSerial(listing.id)}
                    </p>
                    <p
                      className="mt-1 text-[11px]"
                      style={{ color: "#5B5B54" }}
                    >
                      {listing.areaName || "No area added"} ·{" "}
                      {listing._count?.interests ?? 0} interested
                    </p>
                  </div>
                </div>

                {/* interests drawer — only when there are interests */}
                {(listing._count?.interests ?? 0) > 0 ? (
                  <InterestsDrawer
                    listingId={listing.id}
                    interestsByListing={interestsByListing}
                    loadingListing={loadingListing}
                    actingOn={actingOn}
                    actionError={actionError}
                    loadInterests={loadInterests}
                    updateInterestStatus={updateInterestStatus}
                  />
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </aside>
  );
}
