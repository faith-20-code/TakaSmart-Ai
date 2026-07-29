"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/src/components/DashboardShell";
import { LocationPicker } from "@/src/components/LocationPicker";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import { TicketIntakeForm } from "@/src/components/tickets/TicketIntakeForm";
import { TicketsList } from "@/src/components/tickets/TicketsList";
import { NotificationsPanel } from "@/src/components/NotificationsPanel";
import { useAuth } from "@/src/context/AuthContext";
import { apiClient, ApiError } from "@/src/lib/api";
import {
  materialTypes,
  MaterialType,
  materialStyles,
  INK,
  CREAM,
  PAPER,
  KRAFT,
  KRAFT_LIGHT,
  OCHRE,
  TEAL,
  RUST,
  GREEN,
} from "@/src/lib/constants/materials";
import { useListings } from "@/src/hooks/useListings";
import { useNotifications } from "@/src/hooks/useNotifications";
import { useEPR } from "@/src/hooks/useEPR";

// ---------- business-only types ----------

type CollectionPoint = {
  id: string;
  name: string;
  address: string;
  locationLat: number;
  locationLng: number;
  areaName?: string | null;
  materials: MaterialType[];
  isActive: boolean;
  createdAt: string;
};

type MyCollectionPointsResponse = {
  points: CollectionPoint[];
};

const initialCollectionPointForm = {
  name: "",
  address: "",
  locationLat: "",
  locationLng: "",
  areaName: "",
  materials: [] as MaterialType[],
};

const fieldClass =
  "mt-2 h-11 w-full rounded-sm border bg-white px-3 text-sm outline-none transition";
const fieldStyle = { borderColor: KRAFT_LIGHT, color: INK };
const labelClass = "text-[11px] font-semibold uppercase tracking-[0.16em]";
const labelStyle = { color: KRAFT, fontFamily: "'IBM Plex Mono', monospace" };

type Tab = "overview" | "log-dropoff" | "collection-points" | "epr-reports";

// ---------- drop-off log types ----------

type DropoffLogResponse = {
  message: string;
  pointsAwarded: number;
  userName: string;
};

const initialDropoffForm = {
  uniqueCode: "",
  materialType: "PLASTIC" as MaterialType,
  quantityKg: "",
};

// ---------- page ----------

export default function BusinessDashboardPage() {
  return (
    <Suspense fallback={null}>
      <BusinessDashboard />
    </Suspense>
  );
}

function BusinessDashboard() {
  const { user, logout } = useAuth();

  // drive active tab from the URL ?tab= query param so sidebar links work
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const VALID_TABS: Tab[] = ["overview", "log-dropoff", "collection-points", "epr-reports"];
  const tab: Tab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : "overview";

  // shared listings logic
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

  // business-only: collection points
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [loadingCollectionPoints, setLoadingCollectionPoints] = useState(true);
  const [cpForm, setCpForm] = useState(initialCollectionPointForm);
  const [cpSubmitting, setCpSubmitting] = useState(false);
  const [cpMessage, setCpMessage] = useState("");
  const [cpError, setCpError] = useState("");

  // business-only: log drop-off
  const [dropoffForm, setDropoffForm] = useState(initialDropoffForm);
  const [dropoffSubmitting, setDropoffSubmitting] = useState(false);
  const [dropoffMessage, setDropoffMessage] = useState("");
  const [dropoffError, setDropoffError] = useState("");

  function updateDropoffForm(field: keyof typeof initialDropoffForm, value: string) {
    setDropoffForm((curr) => ({ ...curr, [field]: value }));
  }

  async function handleDropoffSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDropoffMessage("");
    setDropoffError("");
    setDropoffSubmitting(true);
    try {
      const res = await apiClient.post<DropoffLogResponse>("/dropoffs/log", {
        uniqueCode: dropoffForm.uniqueCode.trim().toUpperCase(),
        materialType: dropoffForm.materialType,
        quantityKg: Number(dropoffForm.quantityKg),
      });
      setDropoffMessage(
        res.message ??
          `Drop-off logged. ${res.pointsAwarded} points awarded to ${res.userName}.`,
      );
      setDropoffForm(initialDropoffForm);
      // keep daily EPR log current
      refreshDaily();
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { error?: string } | null;
        setDropoffError(
          data?.error ?? "Could not log the drop-off. Check the details and try again.",
        );
      } else {
        setDropoffError("Could not log the drop-off. Check the details and try again.");
      }
    } finally {
      setDropoffSubmitting(false);
    }
  }

  const isPreview = !!user?.id.startsWith("preview-");
  const points = user?.sellerProfile?.points ?? 0;

  const {
    notifications,
    unreadCount,
    loading: loadingNotifications,
    markRead,
    markAllRead,
  } = useNotifications(user?.id);

  const {
    selectedDate,
    incoming,
    outgoing,
    loadingDaily,
    dailyError,
    changeDate,
    refreshDaily,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    monthlyReport,
    loadingMonthly,
    monthlyError,
    loadMonthly,
    downloading,
    downloadError,
    downloadPDF,
  } = useEPR(user?.userType === "BUSINESS" && !isPreview);

  // TODO: `registrationNo` no longer exists on User.sellerProfile after the
  // recent main merge — it was replaced by `uniqueCode` in AuthContext.tsx.
  // Using uniqueCode as a stand-in for now; confirm with the team whether
  // this is the correct replacement or whether registrationNo should be
  // restored to the User type / API response.
  const isVerified = !!user?.sellerProfile?.uniqueCode;

  async function loadCollectionPoints() {
    try {
      setLoadingCollectionPoints(true);
      const response = await apiClient.get<MyCollectionPointsResponse>(
        "/collection-points/my",
      );
      setCollectionPoints(response.points);
    } catch {
      setCpError("Could not load your collection points yet.");
    } finally {
      setLoadingCollectionPoints(false);
    }
  }

  useEffect(() => {
    if ((user?.userType === "PERSONAL" || user?.userType === "BUSINESS") && !isPreview) {
      void loadCollectionPoints();
    } else {
      setLoadingCollectionPoints(false);
    }
  }, [user?.id, user?.userType, isPreview]);

  function updateCpForm(
    field: keyof typeof initialCollectionPointForm,
    value: string,
  ) {
    setCpForm((current) => ({ ...current, [field]: value }));
  }

  function toggleCpMaterial(material: MaterialType) {
    setCpForm((current) => ({
      ...current,
      materials: current.materials.includes(material)
        ? current.materials.filter((m) => m !== material)
        : [...current.materials, material],
    }));
  }

  async function handleCpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCpError("");
    setCpMessage("");

    if (cpForm.materials.length === 0) {
      setCpError("Select at least one material this point accepts.");
      return;
    }

    setCpSubmitting(true);
    try {
      await apiClient.post("/collection-points", {
        name: cpForm.name,
        address: cpForm.address,
        locationLat: Number(cpForm.locationLat),
        locationLng: Number(cpForm.locationLng),
        areaName: cpForm.areaName || undefined,
        materials: cpForm.materials,
      });
      setCpForm(initialCollectionPointForm);
      setCpMessage("Collection point added.");
      await loadCollectionPoints();
    } catch {
      setCpError("Could not add the collection point. Check the fields and try again.");
    } finally {
      setCpSubmitting(false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "log-dropoff", label: "Log drop-off" },
    { id: "collection-points", label: "Collection points" },
    { id: "epr-reports", label: "EPR reports" },
  ];

  return (
    <ProtectedRoute allowedUserType="BUSINESS">
      <DashboardShell
        eyebrow="Business dashboard"
        title={`Welcome${user ? `, ${user.name}` : ""}`}
        description="Weigh in a new batch, manage collection points, and track every ticket you've opened on the buyer floor."
        userName={user?.name}
        userType={user?.userType}
        onLogout={() => void logout()}
      >
        <div
          className="min-h-full"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: CREAM }}
        >
          {/* Business profile + points + notifications */}
          <div className="grid gap-6 p-1 lg:grid-cols-3">
            <section
              className="rounded-md border p-6"
              style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.24em]"
                style={{ color: OCHRE, fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Business profile
              </p>
              <p
                className="mt-3 text-lg leading-tight"
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: INK }}
              >
                {user?.sellerProfile?.businessName || "Business name not set"}
              </p>
              <p className="mt-1 text-[11px]" style={{ color: "#5B5B54" }}>
                Code: {user?.sellerProfile?.uniqueCode || "—"}
              </p>
              {isVerified ? (
                <span
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: GREEN, borderColor: GREEN, background: "#EAF6F0" }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: GREEN }}
                  />
                  Business verified
                </span>
              ) : (
                <p className="mt-3 text-[11px]" style={{ color: KRAFT }}>
                  Add a registration number to get verified.
                </p>
              )}
            </section>

            <section
  className="rounded-md border p-6"
  style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
>
  <p
    className="text-[11px] font-semibold uppercase tracking-[0.24em]"
    style={{ color: OCHRE, fontFamily: "'IBM Plex Mono', monospace" }}
  >
    Collection Points
  </p>

  <div className="mt-3">
    <span
      className="text-[40px] leading-none"
      style={{
        fontFamily: "'Fraunces', serif",
        fontWeight: 600,
        color: INK,
      }}
    >
      {loadingCollectionPoints ? "..." : collectionPoints.length}
    </span>
  </div>

  <p className="mt-2 text-sm leading-6" style={{ color: "#5B5B54" }}>
    Your registered drop-off locations where personal users can bring recyclable
    materials.
  </p>
</section>

            {/* Notifications */}
            <NotificationsPanel
              notifications={notifications}
              unreadCount={unreadCount}
              loading={loadingNotifications}
              isPreview={isPreview}
              onMarkRead={markRead}
              onMarkAllRead={markAllRead}
            />
          </div>

          {/* Tab bar */}
          <div
            className="mt-6 flex gap-1 border-b px-1"
            style={{ borderColor: KRAFT_LIGHT }}
          >
            {tabs.map((t) => (
              <Link
                key={t.id}
                href={t.id === "overview" ? "/dashboard/business" : `/dashboard/business?tab=${t.id}`}
                className="relative px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: tab === t.id ? TEAL : "#5B5B54",
                  textDecoration: "none",
                }}
              >
                {t.label}
                {tab === t.id ? (
                  <span
                    className="absolute inset-x-0 -bottom-px h-0.5"
                    style={{ background: TEAL }}
                  />
                ) : null}
              </Link>
            ))}
          </div>

          {/* Overview tab — shared intake form + ticket list */}
          {tab === "overview" ? (
            <div className="mt-6 grid gap-6 p-1 lg:grid-cols-[1fr_0.62fr]">
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
          ) : null}

          {/* Log drop-off tab — business-only */}
          {tab === "log-dropoff" ? (
            <div className="mt-6 grid gap-6 p-1 lg:grid-cols-[1fr_0.62fr]">
              <section
                className="rounded-md border p-6"
                style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.24em]"
                  style={{ color: OCHRE, fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Log a drop-off
                </p>
                <h2
                  className="mt-2 text-[26px] leading-tight"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: INK }}
                >
                  Record a material hand-in
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6" style={{ color: "#5B5B54" }}>
                  Enter the seller&apos;s unique code, select the material they
                  brought, and weigh it in. Points are awarded automatically.
                </p>

                <form onSubmit={handleDropoffSubmit} className="mt-6 grid gap-6">
                  <fieldset
                    className="grid gap-4 border-t pt-5"
                    style={{ borderColor: KRAFT_LIGHT }}
                  >
                    <legend className={labelClass} style={labelStyle}>
                      01 — Seller identification
                    </legend>

                    <label className="block">
                      <span className="text-sm font-semibold" style={{ color: INK }}>
                        Unique code
                      </span>
                      <input
                        className={fieldClass}
                        style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: "0.12em" }}
                        value={dropoffForm.uniqueCode}
                        onChange={(e) => updateDropoffForm("uniqueCode", e.target.value)}
                        placeholder="TK-1234"
                        required
                      />
                      <p className="mt-1 text-[11px]" style={{ color: "#5B5B54" }}>
                        Ask the seller to show their code from their personal dashboard.
                      </p>
                    </label>
                  </fieldset>

                  <fieldset
                    className="grid gap-4 border-t pt-5"
                    style={{ borderColor: KRAFT_LIGHT }}
                  >
                    <legend className={labelClass} style={labelStyle}>
                      02 — Material details
                    </legend>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-semibold" style={{ color: INK }}>
                          Material type
                        </span>
                        <select
                          className={fieldClass}
                          style={fieldStyle}
                          value={dropoffForm.materialType}
                          onChange={(e) =>
                            updateDropoffForm("materialType", e.target.value)
                          }
                          required
                        >
                          {materialTypes.map((type) => (
                            <option key={type} value={type}>
                              {materialStyles[type].label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-sm font-semibold" style={{ color: INK }}>
                          Quantity (kg)
                        </span>
                        <input
                          className={fieldClass}
                          style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono', monospace" }}
                          min="0.1"
                          step="0.1"
                          type="number"
                          value={dropoffForm.quantityKg}
                          onChange={(e) => updateDropoffForm("quantityKg", e.target.value)}
                          required
                        />
                        <p className="mt-1 text-[11px]" style={{ color: "#5B5B54" }}>
                          Points = kg × 10. E.g. 5 kg = 50 pts.
                        </p>
                      </label>
                    </div>
                  </fieldset>

                  {dropoffMessage ? (
                    <p
                      className="rounded-sm border px-3 py-2 text-sm"
                      style={{ borderColor: TEAL, color: TEAL, background: "#EAF3F1" }}
                    >
                      {dropoffMessage}
                    </p>
                  ) : null}
                  {dropoffError ? (
                    <p
                      className="rounded-sm border px-3 py-2 text-sm"
                      style={{ borderColor: RUST, color: RUST, background: "#FBEFEC" }}
                    >
                      {dropoffError}
                    </p>
                  ) : null}

                  <button
                    className="h-11 rounded-sm px-4 text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: TEAL, fontFamily: "'IBM Plex Mono', monospace" }}
                    disabled={dropoffSubmitting || isPreview}
                    type="submit"
                  >
                    {dropoffSubmitting ? "Logging..." : "Log drop-off"}
                  </button>
                </form>
              </section>

              {/* How it works — reference panel */}
              <aside
                className="rounded-md border p-6"
                style={{ borderColor: KRAFT_LIGHT, background: INK }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.24em]"
                  style={{ color: OCHRE, fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  How it works
                </p>
                <div className="mt-4 space-y-4">
                  {[
                    {
                      step: "01",
                      title: "Seller arrives with recyclables",
                      body: "They show their unique code (e.g. TK-1234) from their personal dashboard.",
                    },
                    {
                      step: "02",
                      title: "You enter the details above",
                      body: "Enter the code, select the material type, and weigh the batch in kg.",
                    },
                    {
                      step: "03",
                      title: "Points are awarded automatically",
                      body: "1 kg = 10 points. The seller's balance updates instantly. 100 pts = KES 500 voucher.",
                    },
                    {
                      step: "04",
                      title: "Errors explained",
                      body: '"User code not found" — code doesn\'t exist. "Not registered here" — seller hasn\'t registered at your collection point.',
                    },
                  ].map(({ step, title, body }) => (
                    <div key={step} className="flex gap-3">
                      <span
                        className="mt-0.5 shrink-0 text-[11px] font-semibold"
                        style={{ color: OCHRE, fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        {step}
                      </span>
                      <div>
                        <p
                          className="text-sm font-semibold leading-snug"
                          style={{ color: "#E8E4D8", fontFamily: "'Fraunces', serif" }}
                        >
                          {title}
                        </p>
                        <p
                          className="mt-1 text-[11px] leading-5"
                          style={{ color: "#B7C0BA" }}
                        >
                          {body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          ) : null}

          {/* Collection points tab — business-only */}
          {tab === "collection-points" ? (
            <div className="mt-6 grid gap-6 p-1 lg:grid-cols-[1fr_0.62fr]">
              {/* Add collection point form */}
              <section
                className="rounded-md border p-6"
                style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.24em]"
                  style={{ color: OCHRE, fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Add a collection point
                </p>
                <h2
                  className="mt-2 text-[26px] leading-tight"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: INK }}
                >
                  New drop-off site
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6" style={{ color: "#5B5B54" }}>
                  Register a physical location where sellers or buyers can drop
                  off or collect materials.
                </p>

                <form onSubmit={handleCpSubmit} className="mt-6 grid gap-6">
                  <fieldset
                    className="grid gap-4 border-t pt-5"
                    style={{ borderColor: KRAFT_LIGHT }}
                  >
                    <legend className={labelClass} style={labelStyle}>
                      01 — Site details
                    </legend>

                    <label className="block">
                      <span className="text-sm font-semibold" style={{ color: INK }}>
                        Name
                      </span>
                      <input
                        className={fieldClass}
                        style={fieldStyle}
                        value={cpForm.name}
                        onChange={(e) => updateCpForm("name", e.target.value)}
                        placeholder="Westlands Drop-off Depot"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold" style={{ color: INK }}>
                        Address
                      </span>
                      <input
                        className={fieldClass}
                        style={fieldStyle}
                        value={cpForm.address}
                        onChange={(e) => updateCpForm("address", e.target.value)}
                        placeholder="Waiyaki Way, next to..."
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold" style={{ color: INK }}>
                        Area name
                      </span>
                      <input
                        className={fieldClass}
                        style={fieldStyle}
                        value={cpForm.areaName}
                        onChange={(e) => updateCpForm("areaName", e.target.value)}
                        placeholder="Westlands"
                      />
                    </label>
                  </fieldset>

                  <fieldset
                    className="grid gap-4 border-t pt-5"
                    style={{ borderColor: KRAFT_LIGHT }}
                  >
                    <legend className={labelClass} style={labelStyle}>
                      02 — Location
                    </legend>

                    <LocationPicker
                      latitude={cpForm.locationLat}
                      longitude={cpForm.locationLng}
                      onChange={(lat, lng) => {
                        updateCpForm("locationLat", lat);
                        updateCpForm("locationLng", lng);
                      }}
                      buttonLabel="Use my current location"
                    />

                    <details className="group">
                      <summary
                        className="cursor-pointer text-sm font-semibold"
                        style={{ color: KRAFT }}
                      >
                        Enter coordinates manually instead
                      </summary>
                      <div className="mt-3 grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-sm font-semibold" style={{ color: INK }}>
                            Latitude
                          </span>
                          <input
                            className={fieldClass}
                            style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono', monospace" }}
                            step="any"
                            type="number"
                            value={cpForm.locationLat}
                            onChange={(e) => updateCpForm("locationLat", e.target.value)}
                            required
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-semibold" style={{ color: INK }}>
                            Longitude
                          </span>
                          <input
                            className={fieldClass}
                            style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono', monospace" }}
                            step="any"
                            type="number"
                            value={cpForm.locationLng}
                            onChange={(e) => updateCpForm("locationLng", e.target.value)}
                            required
                          />
                        </label>
                      </div>
                    </details>
                  </fieldset>

                  <fieldset
                    className="grid gap-3 border-t pt-5"
                    style={{ borderColor: KRAFT_LIGHT }}
                  >
                    <legend className={labelClass} style={labelStyle}>
                      03 — Materials accepted
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {materialTypes.map((type) => {
                        const active = cpForm.materials.includes(type);
                        const mat = materialStyles[type];
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleCpMaterial(type)}
                            className="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                            style={{
                              borderColor: active ? mat.text : KRAFT_LIGHT,
                              background: active ? mat.bg : "white",
                              color: active ? mat.text : "#5B5B54",
                            }}
                          >
                            {mat.label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {cpMessage ? (
                    <p
                      className="rounded-sm border px-3 py-2 text-sm"
                      style={{ borderColor: TEAL, color: TEAL, background: "#EAF3F1" }}
                    >
                      {cpMessage}
                    </p>
                  ) : null}
                  {cpError ? (
                    <p
                      className="rounded-sm border px-3 py-2 text-sm"
                      style={{ borderColor: RUST, color: RUST, background: "#FBEFEC" }}
                    >
                      {cpError}
                    </p>
                  ) : null}

                  <button
                    className="h-11 rounded-sm px-4 text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: TEAL, fontFamily: "'IBM Plex Mono', monospace" }}
                    disabled={cpSubmitting || isPreview}
                    type="submit"
                  >
                    {cpSubmitting ? "Adding..." : "Add collection point"}
                  </button>
                </form>
              </section>

              {/* Existing collection points list */}
              <aside
                className="rounded-md border p-6"
                style={{ borderColor: KRAFT_LIGHT, background: INK }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.24em]"
                  style={{ color: OCHRE, fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  My collection points
                </p>

                {isPreview ? (
                  <p className="mt-4 text-sm leading-6" style={{ color: "#B7C0BA" }}>
                    Preview accounts can&apos;t load real collection points.
                  </p>
                ) : loadingCollectionPoints ? (
                  <p className="mt-4 text-sm" style={{ color: "#B7C0BA" }}>
                    Pulling your sites...
                  </p>
                ) : collectionPoints.length === 0 ? (
                  <div
                    className="mt-4 rounded-sm border border-dashed p-5 text-center"
                    style={{ borderColor: "#3A453F" }}
                  >
                    <p
                      className="text-sm font-semibold uppercase tracking-[0.1em]"
                      style={{ color: CREAM, fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      No collection points yet
                    </p>
                    <p className="mt-2 text-sm leading-6" style={{ color: "#B7C0BA" }}>
                      Add your first site so buyers know where to reach you.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {collectionPoints.map((cp) => (
                      <article
                        key={cp.id}
                        className="rounded-sm border p-3"
                        style={{ borderColor: "#3A453F", background: PAPER }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className="text-sm font-semibold leading-snug"
                            style={{ color: INK, fontFamily: "'Fraunces', serif" }}
                          >
                            {cp.name}
                          </h3>
                          <span
                            className="rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em]"
                            style={{
                              color: cp.isActive ? TEAL : RUST,
                              borderColor: cp.isActive ? TEAL : RUST,
                            }}
                          >
                            {cp.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px]" style={{ color: "#5B5B54" }}>
                          {cp.address}
                          {cp.areaName ? ` · ${cp.areaName}` : ""}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {cp.materials.map((m) => (
                            <span
                              key={m}
                              className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em]"
                              style={{
                                background: materialStyles[m].bg,
                                color: materialStyles[m].text,
                              }}
                            >
                              {materialStyles[m].label}
                            </span>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </aside>
            </div>
          ) : null}

          {/* EPR reports tab — Sprint 5 */}
          {tab === "epr-reports" ? (
            <div className="mt-6 space-y-6 p-1">

              {/* ── Section 1: Daily Activity Log ── */}
              <section
                className="rounded-md border p-6"
                style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.24em]"
                      style={{ color: OCHRE, fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      Daily activity
                    </p>
                    <h2
                      className="mt-1 text-[22px] leading-tight"
                      style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: INK }}
                    >
                      Waste log
                    </h2>
                  </div>
                  <label className="block">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: KRAFT, fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      Date
                    </span>
                    <input
                      type="date"
                      className="mt-1 h-10 rounded-sm border bg-white px-3 text-sm outline-none transition"
                      style={{ borderColor: KRAFT_LIGHT, color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                      value={selectedDate}
                      onChange={(e) => changeDate(e.target.value)}
                    />
                  </label>
                </div>

                {isPreview ? (
                  <p className="mt-4 text-sm" style={{ color: "#5B5B54" }}>
                    Sign in with a real business account to view activity logs.
                  </p>
                ) : dailyError ? (
                  <p
                    className="mt-4 rounded-sm border px-3 py-2 text-sm"
                    style={{ borderColor: RUST, color: RUST, background: "#FBEFEC" }}
                  >
                    {dailyError}
                  </p>
                ) : loadingDaily ? (
                  <p className="mt-4 text-sm" style={{ color: "#5B5B54" }}>
                    Loading...
                  </p>
                ) : (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {/* Incoming */}
                    <div
                      className="rounded-sm border p-4"
                      style={{ borderColor: KRAFT_LIGHT, background: CREAM }}
                    >
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                        style={{ color: TEAL, fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        Incoming today
                      </p>
                      <p
                        className="mt-2 text-[32px] leading-none"
                        style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: INK }}
                      >
                        {incoming?.totalKg ?? 0}
                        <span
                          className="ml-1 text-sm font-medium"
                          style={{ color: KRAFT }}
                        >
                          kg
                        </span>
                      </p>
                      {incoming?.summary && Object.keys(incoming.summary).length > 0 ? (
                        <ul className="mt-3 space-y-1">
                          {Object.entries(incoming.summary).map(([mat, kg]) => {
                            const style = materialStyles[mat as MaterialType];
                            return (
                              <li key={mat} className="flex items-center justify-between gap-2">
                                <span
                                  className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em]"
                                  style={{ background: style?.bg ?? "#F1F1EC", color: style?.text ?? "#5B5B54" }}
                                >
                                  {style?.label ?? mat}
                                </span>
                                <span
                                  className="text-[11px] font-medium tabular-nums"
                                  style={{ color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                                >
                                  {kg} kg
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="mt-3 text-[11px]" style={{ color: "#5B5B54" }}>
                          No incoming material on this date.
                        </p>
                      )}
                    </div>

                    {/* Outgoing */}
                    <div
                      className="rounded-sm border p-4"
                      style={{ borderColor: KRAFT_LIGHT, background: CREAM }}
                    >
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                        style={{ color: RUST, fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        Outgoing today
                      </p>
                      <p
                        className="mt-2 text-[32px] leading-none"
                        style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: INK }}
                      >
                        {outgoing?.totalKg ?? 0}
                        <span
                          className="ml-1 text-sm font-medium"
                          style={{ color: KRAFT }}
                        >
                          kg
                        </span>
                      </p>
                      {outgoing?.summary && Object.keys(outgoing.summary).length > 0 ? (
                        <ul className="mt-3 space-y-1">
                          {Object.entries(outgoing.summary).map(([mat, kg]) => {
                            const style = materialStyles[mat as MaterialType];
                            return (
                              <li key={mat} className="flex items-center justify-between gap-2">
                                <span
                                  className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em]"
                                  style={{ background: style?.bg ?? "#F1F1EC", color: style?.text ?? "#5B5B54" }}
                                >
                                  {style?.label ?? mat}
                                </span>
                                <span
                                  className="text-[11px] font-medium tabular-nums"
                                  style={{ color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                                >
                                  {kg} kg
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="mt-3 text-[11px]" style={{ color: "#5B5B54" }}>
                          No outgoing material on this date.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* ── Section 2: Monthly EPR Report Preview ── */}
              <section
                className="rounded-md border p-6"
                style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.24em]"
                  style={{ color: OCHRE, fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Monthly report
                </p>
                <h2
                  className="mt-1 text-[22px] leading-tight"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: INK }}
                >
                  EPR summary
                </h2>
                <p className="mt-1 text-sm leading-6" style={{ color: "#5B5B54" }}>
                  Select a month and year, preview the data, then download the
                  audit-ready PDF.
                </p>

                {/* month + year selectors */}
                <div className="mt-5 flex flex-wrap items-end gap-4">
                  <label className="block">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: KRAFT, fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      Month
                    </span>
                    <select
                      className="mt-1 h-10 rounded-sm border bg-white px-3 text-sm outline-none"
                      style={{ borderColor: KRAFT_LIGHT, color: INK }}
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                      {[
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December",
                      ].map((name, i) => (
                        <option key={name} value={i + 1}>{name}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: KRAFT, fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      Year
                    </span>
                    <select
                      className="mt-1 h-10 rounded-sm border bg-white px-3 text-sm outline-none"
                      style={{ borderColor: KRAFT_LIGHT, color: INK }}
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                      {[2025, 2026, 2027].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={() => void loadMonthly()}
                    disabled={loadingMonthly || isPreview}
                    className="h-10 rounded-sm px-5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: TEAL, fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {loadingMonthly ? "Loading..." : "Preview report"}
                  </button>
                </div>

                {monthlyError ? (
                  <p
                    className="mt-4 rounded-sm border px-3 py-2 text-sm"
                    style={{ borderColor: RUST, color: RUST, background: "#FBEFEC" }}
                  >
                    {monthlyError}
                  </p>
                ) : null}

                {/* Report preview */}
                {monthlyReport ? (
                  <div
                    className="mt-6 rounded-sm border p-5"
                    style={{ borderColor: KRAFT_LIGHT, background: CREAM }}
                  >
                    {/* header */}
                    <div
                      className="flex flex-col gap-1 border-b pb-4 sm:flex-row sm:items-start sm:justify-between"
                      style={{ borderColor: KRAFT_LIGHT }}
                    >
                      <div>
                        <p
                          className="text-base font-semibold"
                          style={{ fontFamily: "'Fraunces', serif", color: INK }}
                        >
                          {monthlyReport.report.business.name}
                        </p>
                        <p
                          className="mt-0.5 text-[11px]"
                          style={{ color: "#5B5B54", fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                          Reg: {monthlyReport.report.business.registrationNo || "—"}
                        </p>
                      </div>
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.1em]"
                        style={{ color: KRAFT, fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        {new Date(monthlyReport.report.period.from).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                        {" — "}
                        {new Date(monthlyReport.report.period.to).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>

                    {/* summary cards */}
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {[
                        { label: "Total incoming", value: monthlyReport.report.incoming.totalKg, color: TEAL },
                        { label: "Total outgoing", value: monthlyReport.report.outgoing.totalKg, color: RUST },
                        { label: "Net retained", value: monthlyReport.report.netWaste, color: INK },
                      ].map(({ label, value, color }) => (
                        <div
                          key={label}
                          className="rounded-sm border p-3 text-center"
                          style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
                        >
                          <p
                            className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                            style={{ color: KRAFT, fontFamily: "'IBM Plex Mono', monospace" }}
                          >
                            {label}
                          </p>
                          <p
                            className="mt-1 text-2xl font-bold leading-none"
                            style={{ fontFamily: "'IBM Plex Mono', monospace", color }}
                          >
                            {value}
                            <span className="ml-1 text-xs font-medium" style={{ color: KRAFT }}>kg</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* material breakdown tables */}
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      {(["incoming", "outgoing"] as const).map((direction) => {
                        const data = monthlyReport.report[direction];
                        const accent = direction === "incoming" ? TEAL : RUST;
                        return (
                          <div key={direction}>
                            <p
                              className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                              style={{ color: accent, fontFamily: "'IBM Plex Mono', monospace" }}
                            >
                              {direction} by material · {data.entries} entries
                            </p>
                            {Object.keys(data.byMaterial).length === 0 ? (
                              <p className="mt-2 text-[11px]" style={{ color: "#5B5B54" }}>
                                No data for this period.
                              </p>
                            ) : (
                              <table className="mt-2 w-full text-sm">
                                <tbody>
                                  {Object.entries(data.byMaterial).map(([mat, kg]) => {
                                    const ms = materialStyles[mat as MaterialType];
                                    return (
                                      <tr key={mat} className="border-b last:border-0" style={{ borderColor: KRAFT_LIGHT }}>
                                        <td className="py-1.5 pr-3">
                                          <span
                                            className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em]"
                                            style={{ background: ms?.bg ?? "#F1F1EC", color: ms?.text ?? "#5B5B54" }}
                                          >
                                            {ms?.label ?? mat}
                                          </span>
                                        </td>
                                        <td
                                          className="py-1.5 text-right tabular-nums"
                                          style={{ color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                                        >
                                          {kg} kg
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* ── Section 3: Download PDF ── */}
                    <div
                      className="mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"
                      style={{ borderColor: KRAFT_LIGHT }}
                    >
                      <div>
                        <p className="text-sm font-semibold" style={{ color: INK }}>
                          Ready for EPR audit submission
                        </p>
                        <p className="mt-0.5 text-[11px]" style={{ color: "#5B5B54" }}>
                          Single-page PDF with business info, period, all
                          material breakdowns, and a branded footer.
                        </p>
                      </div>
                      <div className="flex flex-col items-start gap-2 sm:items-end">
                        <button
                          type="button"
                          onClick={() => void downloadPDF()}
                          disabled={downloading}
                          className="h-10 rounded-sm px-5 text-sm font-semibold uppercase tracking-[0.08em] text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
                          style={{ background: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                          {downloading ? "Generating PDF..." : "Download PDF"}
                        </button>
                        {downloadError ? (
                          <p className="text-[11px]" style={{ color: RUST }}>
                            {downloadError}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}
              </section>

            </div>
          ) : null}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
