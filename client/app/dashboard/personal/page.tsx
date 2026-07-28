"use client";

import { DashboardShell } from "@/src/components/DashboardShell";
import { NotificationsPanel } from "@/src/components/NotificationsPanel";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import { TicketIntakeForm } from "@/src/components/tickets/TicketIntakeForm";
import { TicketsList } from "@/src/components/tickets/TicketsList";
import { useAuth } from "@/src/context/AuthContext";
import {
  CREAM,
  GREEN,
  INK,
  KRAFT,
  KRAFT_LIGHT,
  OCHRE,
  PAPER,
  RUST,
  TEAL,
  materialStyles,
} from "@/src/lib/constants/materials";
import { useListings } from "@/src/hooks/useListings";
import { useNotifications } from "@/src/hooks/useNotifications";
import { usePointsAndVouchers } from "@/src/hooks/usePointsAndVouchers";

// ---------- small shared style helpers ----------

const mono = "'IBM Plex Mono', monospace";
const serif = "'Fraunces', serif";
const eyebrowClass = "text-[11px] font-semibold uppercase tracking-[0.24em]";
const eyebrowStyle = { color: OCHRE, fontFamily: mono };

export default function PersonalDashboardPage() {
  const { user, logout } = useAuth();

  const {
    form,
    updateForm,
    listings,
    loadingListings,
    submitting,
    message,
    error,
    photoError,
    uploadingPhotos,
    handlePhotoSelect,
    removePhoto,
    handleSubmit,
    analysis,
    analysing,
    analyseError,
    handleAnalyse,
    formStep,
    skipToStep2,
    backToStep1,
  } = useListings(user);

  const {
    collectionPoints,
    loadingCollectionPoints,
    balances,
    loadingBalances,
    vouchers,
    loadingVouchers,
    registeringAt,
    registerMessage,
    registerError,
    registerAtCollectionPoint,
    redeemingAt,
    redeemMessage,
    redeemError,
    newVoucherCode,
    redeemPoints,
  } = usePointsAndVouchers(user?.id);

  const {
    notifications,
    unreadCount,
    loading: loadingNotifications,
    markRead,
    markAllRead,
  } = useNotifications(user?.id);

  const isPreview = !!user?.id.startsWith("preview-");
  const globalPoints = user?.sellerProfile?.points ?? 0;
  const uniqueCode = user?.sellerProfile?.uniqueCode;

  return (
    <ProtectedRoute allowedUserType="PERSONAL">
      <DashboardShell
        eyebrow="Personal dashboard"
        title={`Welcome${user ? `, ${user.name}` : ""}`}
        description="Weigh in a new batch, earn points at collection points, and redeem vouchers."
        userName={user?.name}
        userType={user?.userType}
        onLogout={() => void logout()}
      >
        <div
          className="min-h-full space-y-6"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: CREAM }}
        >

          {/* ── Row 1: Unique code + Points summary + Notifications ── */}
          <div className="grid gap-6 p-1 lg:grid-cols-3">

            {/* 1a — Unique drop-off code */}
            <section
              className="rounded-md border p-6"
              style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
            >
              <p className={eyebrowClass} style={eyebrowStyle}>
                Your drop-off code
              </p>
              {uniqueCode ? (
                <>
                  <p
                    className="mt-3 text-[40px] leading-none tracking-widest"
                    style={{ fontFamily: mono, fontWeight: 600, color: TEAL }}
                  >
                    {uniqueCode}
                  </p>
                  <p className="mt-3 text-sm leading-6" style={{ color: "#5B5B54" }}>
                    Show this code at any registered collection point when
                    dropping off recyclables.
                  </p>
                </>
              ) : (
                <>
                  <div
                    className="mt-3 h-10 w-32 animate-pulse rounded-sm"
                    style={{ background: KRAFT_LIGHT }}
                  />
                  <p className="mt-3 text-sm leading-6" style={{ color: "#5B5B54" }}>
                    Your code is being generated — refresh in a moment.
                  </p>
                </>
              )}
            </section>

            {/* 1b — Global points balance */}
            <section
              className="rounded-md border p-6"
              style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
            >
              <p className={eyebrowClass} style={eyebrowStyle}>
                Points balance
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span
                  className="text-[40px] leading-none"
                  style={{ fontFamily: serif, fontWeight: 600, color: INK }}
                >
                  {globalPoints.toLocaleString()}
                </span>
                <span
                  className="text-sm font-semibold uppercase tracking-[0.08em]"
                  style={{ color: KRAFT, fontFamily: mono }}
                >
                  pts total
                </span>
              </div>
              <p className="mt-2 text-sm leading-6" style={{ color: "#5B5B54" }}>
                {isPreview
                  ? "Preview accounts don't accrue real points."
                  : "Earned across all your registered collection points."}
              </p>
            </section>

            {/* 1c — Notifications */}
            <NotificationsPanel
              notifications={notifications}
              unreadCount={unreadCount}
              loading={loadingNotifications}
              isPreview={isPreview}
              onMarkRead={markRead}
              onMarkAllRead={markAllRead}
            />
          </div>

          {/* ── Row 2: Browse collection points ── */}
          <section className="p-1">
            <div
              className="rounded-md border p-6"
              style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
            >
              <p className={eyebrowClass} style={eyebrowStyle}>
                Collection points
              </p>
              <h2
                className="mt-2 text-[22px] leading-tight"
                style={{ fontFamily: serif, fontWeight: 600, color: INK }}
              >
                Browse &amp; register
              </h2>
              <p className="mt-1 text-sm leading-6" style={{ color: "#5B5B54" }}>
                Register at a collection point near you, then drop off
                recyclables to earn points.
              </p>

              {/* feedback banners */}
              {registerMessage ? (
                <p
                  className="mt-4 rounded-sm border px-3 py-2 text-sm"
                  style={{ borderColor: TEAL, color: TEAL, background: "#EAF3F1" }}
                >
                  {registerMessage}
                </p>
              ) : null}
              {registerError ? (
                <p
                  className="mt-4 rounded-sm border px-3 py-2 text-sm"
                  style={{ borderColor: RUST, color: RUST, background: "#FBEFEC" }}
                >
                  {registerError}
                </p>
              ) : null}

              {isPreview ? (
                <p className="mt-4 text-sm" style={{ color: "#5B5B54" }}>
                  Sign in to browse and register at collection points.
                </p>
              ) : loadingCollectionPoints ? (
                <p className="mt-4 text-sm" style={{ color: "#5B5B54" }}>
                  Loading collection points...
                </p>
              ) : collectionPoints.length === 0 ? (
                <div
                  className="mt-4 rounded-sm border border-dashed p-6 text-center"
                  style={{ borderColor: KRAFT_LIGHT }}
                >
                  <p
                    className="text-sm font-semibold uppercase tracking-[0.1em]"
                    style={{ color: KRAFT, fontFamily: mono }}
                  >
                    No collection points yet
                  </p>
                  <p className="mt-2 text-sm" style={{ color: "#5B5B54" }}>
                    Business partners haven&apos;t added any active sites yet.
                    Check back soon.
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {collectionPoints.map((cp) => (
                    <article
                      key={cp.id}
                      className="flex flex-col justify-between rounded-sm border p-4"
                      style={{ borderColor: KRAFT_LIGHT, background: CREAM }}
                    >
                      <div>
                        <h3
                          className="text-sm font-semibold leading-snug"
                          style={{ color: INK, fontFamily: serif }}
                        >
                          {cp.name}
                        </h3>
                        <p className="mt-1 text-[11px]" style={{ color: "#5B5B54" }}>
                          {cp.address}
                          {cp.areaName ? ` · ${cp.areaName}` : ""}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {cp.materials.map((m) => {
                            const mat = materialStyles[m as keyof typeof materialStyles];
                            return mat ? (
                              <span
                                key={m}
                                className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em]"
                                style={{ background: mat.bg, color: mat.text }}
                              >
                                {mat.label}
                              </span>
                            ) : (
                              <span
                                key={m}
                                className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em]"
                                style={{ background: "#F1F1EC", color: "#5B5B54" }}
                              >
                                {m}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => void registerAtCollectionPoint(cp.id)}
                        disabled={registeringAt === cp.id}
                        className="mt-4 h-9 rounded-sm px-3 text-xs font-semibold uppercase tracking-[0.08em] text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ background: TEAL, fontFamily: mono }}
                      >
                        {registeringAt === cp.id ? "Registering..." : "Register"}
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Row 3: My points balances ── */}
          <section className="p-1">
            <div
              className="rounded-md border p-6"
              style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
            >
              <p className={eyebrowClass} style={eyebrowStyle}>
                My points
              </p>
              <h2
                className="mt-2 text-[22px] leading-tight"
                style={{ fontFamily: serif, fontWeight: 600, color: INK }}
              >
                Points per collection point
              </h2>
              <p className="mt-1 text-sm leading-6" style={{ color: "#5B5B54" }}>
                Points are tracked per partner. You need 100 pts at a specific
                point to redeem a KES 500 voucher there.
              </p>

              {/* redeem feedback */}
              {newVoucherCode ? (
                <div
                  className="mt-4 rounded-sm border p-4"
                  style={{ borderColor: GREEN, background: "#EAF6F0" }}
                >
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: GREEN, fontFamily: mono }}
                  >
                    Voucher generated
                  </p>
                  <p
                    className="mt-2 text-[22px] font-bold tracking-wider"
                    style={{ fontFamily: mono, color: INK }}
                  >
                    {newVoucherCode}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: "#5B5B54" }}>
                    Show this code in-store to redeem your reward.
                  </p>
                </div>
              ) : redeemMessage ? (
                <p
                  className="mt-4 rounded-sm border px-3 py-2 text-sm"
                  style={{ borderColor: TEAL, color: TEAL, background: "#EAF3F1" }}
                >
                  {redeemMessage}
                </p>
              ) : null}
              {redeemError ? (
                <p
                  className="mt-4 rounded-sm border px-3 py-2 text-sm"
                  style={{ borderColor: RUST, color: RUST, background: "#FBEFEC" }}
                >
                  {redeemError}
                </p>
              ) : null}

              {isPreview ? (
                <p className="mt-4 text-sm" style={{ color: "#5B5B54" }}>
                  Sign in to see your points balances.
                </p>
              ) : loadingBalances ? (
                <p className="mt-4 text-sm" style={{ color: "#5B5B54" }}>
                  Loading balances...
                </p>
              ) : balances.length === 0 ? (
                <div
                  className="mt-4 rounded-sm border border-dashed p-6 text-center"
                  style={{ borderColor: KRAFT_LIGHT }}
                >
                  <p
                    className="text-sm font-semibold uppercase tracking-[0.1em]"
                    style={{ color: KRAFT, fontFamily: mono }}
                  >
                    No balances yet
                  </p>
                  <p className="mt-2 text-sm" style={{ color: "#5B5B54" }}>
                    Register at a collection point above to start earning.
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {balances.map((bal) => {
                    const canRedeem = bal.points >= 100;
                    return (
                      <article
                        key={bal.id}
                        className="rounded-sm border p-4"
                        style={{ borderColor: KRAFT_LIGHT, background: CREAM }}
                      >
                        <h3
                          className="text-sm font-semibold leading-snug"
                          style={{ color: INK, fontFamily: serif }}
                        >
                          {bal.collectionPoint.name}
                        </h3>
                        <p
                          className="mt-0.5 text-[11px]"
                          style={{ color: "#5B5B54" }}
                        >
                          {bal.collectionPoint.address}
                          {bal.collectionPoint.areaName
                            ? ` · ${bal.collectionPoint.areaName}`
                            : ""}
                        </p>
                        <div className="mt-3 flex items-baseline gap-1.5">
                          <span
                            className="text-[32px] leading-none"
                            style={{ fontFamily: mono, fontWeight: 600, color: TEAL }}
                          >
                            {bal.points}
                          </span>
                          <span
                            className="text-xs font-semibold uppercase tracking-[0.08em]"
                            style={{ color: KRAFT, fontFamily: mono }}
                          >
                            pts
                          </span>
                        </div>

                        {/* Progress bar toward 100 pts */}
                        <div
                          className="mt-2 h-1.5 w-full overflow-hidden rounded-full"
                          style={{ background: KRAFT_LIGHT }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(bal.points, 100)}%`,
                              background: canRedeem ? GREEN : TEAL,
                            }}
                          />
                        </div>
                        <p
                          className="mt-1 text-[10px]"
                          style={{ color: KRAFT, fontFamily: mono }}
                        >
                          {canRedeem
                            ? "Ready to redeem"
                            : `${100 - bal.points} pts to go`}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            void redeemPoints(
                              bal.collectionPoint.id,
                              100,
                              bal.points,
                            )
                          }
                          disabled={redeemingAt === bal.collectionPoint.id}
                          className="mt-3 h-9 w-full rounded-sm px-3 text-xs font-semibold uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-60"
                          style={{
                            fontFamily: mono,
                            background: canRedeem ? TEAL : "white",
                            color: canRedeem ? "white" : KRAFT,
                            border: canRedeem ? "none" : `1px solid ${KRAFT_LIGHT}`,
                          }}
                        >
                          {redeemingAt === bal.collectionPoint.id
                            ? "Redeeming..."
                            : "Redeem 100 pts → KES 500"}
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* ── Row 4: My vouchers ── */}
          <section className="p-1">
            <div
              className="rounded-md border p-6"
              style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
            >
              <p className={eyebrowClass} style={eyebrowStyle}>
                My vouchers
              </p>
              <h2
                className="mt-2 text-[22px] leading-tight"
                style={{ fontFamily: serif, fontWeight: 600, color: INK }}
              >
                Redeemable rewards
              </h2>
              <p className="mt-1 text-sm leading-6" style={{ color: "#5B5B54" }}>
                Show the voucher code in-store to redeem. Redemption is
                confirmed by the partner.
              </p>

              {isPreview ? (
                <p className="mt-4 text-sm" style={{ color: "#5B5B54" }}>
                  Sign in to see your vouchers.
                </p>
              ) : loadingVouchers ? (
                <p className="mt-4 text-sm" style={{ color: "#5B5B54" }}>
                  Loading vouchers...
                </p>
              ) : vouchers.length === 0 ? (
                <div
                  className="mt-4 rounded-sm border border-dashed p-6 text-center"
                  style={{ borderColor: KRAFT_LIGHT }}
                >
                  <p
                    className="text-sm font-semibold uppercase tracking-[0.1em]"
                    style={{ color: KRAFT, fontFamily: mono }}
                  >
                    No vouchers yet
                  </p>
                  <p className="mt-2 text-sm" style={{ color: "#5B5B54" }}>
                    Earn 100 points at a collection point to generate your first
                    voucher.
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {vouchers.map((v) => (
                    <article
                      key={v.id}
                      className="rounded-sm border p-4"
                      style={{
                        borderColor: v.redeemed ? KRAFT_LIGHT : TEAL,
                        background: v.redeemed ? CREAM : "#EAF3F1",
                        opacity: v.redeemed ? 0.7 : 1,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p
                            className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                            style={{ color: OCHRE, fontFamily: mono }}
                          >
                            {v.partner}
                          </p>
                          <p
                            className="mt-1 text-lg font-bold tracking-wider"
                            style={{ fontFamily: mono, color: INK }}
                          >
                            {v.code}
                          </p>
                        </div>
                        <span
                          className="rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em]"
                          style={{
                            color: v.redeemed ? RUST : TEAL,
                            borderColor: v.redeemed ? RUST : TEAL,
                          }}
                        >
                          {v.redeemed ? "Redeemed" : "Active"}
                        </span>
                      </div>
                      <p
                        className="mt-3 text-[22px] font-bold leading-none"
                        style={{ fontFamily: serif, color: INK }}
                      >
                        KES {v.value.toLocaleString()}
                      </p>
                      <p className="mt-1 text-[11px]" style={{ color: "#5B5B54" }}>
                        {v.pointsUsed} pts used ·{" "}
                        {new Date(v.createdAt).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Row 5: Intake form + ticket list ── */}
          <div className="grid gap-6 p-1 lg:grid-cols-[1fr_0.62fr]">
            <TicketIntakeForm
              form={form}
              formStep={formStep}
              submitting={submitting}
              uploadingPhotos={uploadingPhotos}
              photoError={photoError}
              message={message}
              error={error}
              isPreview={isPreview}
              analysis={analysis}
              analysing={analysing}
              analyseError={analyseError}
              onUpdate={updateForm}
              onPhotoSelect={handlePhotoSelect}
              onRemovePhoto={removePhoto}
              onSubmit={handleSubmit}
              onAnalyse={handleAnalyse}
              onSkipToStep2={skipToStep2}
              onBackToStep1={backToStep1}
            />
            <TicketsList
              listings={listings}
              loadingListings={loadingListings}
              isPreview={isPreview}
            />
          </div>

        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
