"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { DashboardShell } from "@/src/components/DashboardShell";
import { LocationPicker } from "@/src/components/LocationPicker";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import { useAuth } from "@/src/context/AuthContext";
import { apiClient } from "@/src/lib/api";

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) throw new Error("upload failed");
  const { url } = await res.json();
  return url;
}

const materialTypes = [
  "PLASTIC",
  "METAL",
  "GLASS",
  "ELECTRONICS",
  "PAPER",
  "TEXTILE",
  "RUBBER",
  "OTHER",
] as const;

type MaterialType = (typeof materialTypes)[number];

type Listing = {
  id: string;
  title: string;
  description?: string | null;
  materialType: MaterialType;
  quantityKg: number;
  areaName?: string | null;
  status: string;
  createdAt: string;
  images?: string[];
  _count?: { interests: number };
};

type MyListingsResponse = {
  listings: Listing[];
};

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

const MAX_IMAGES = 4;

const initialForm = {
  title: "",
  description: "",
  materialType: "PLASTIC" as MaterialType,
  quantityKg: "",
  locationLat: "",
  locationLng: "",
  plusCode: "",
  areaName: "",
  images: [] as string[],
};

const initialCollectionPointForm = {
  name: "",
  address: "",
  locationLat: "",
  locationLng: "",
  areaName: "",
  materials: [] as MaterialType[],
};

const INK = "#1B231F";
const CREAM = "#F6F2E7";
const PAPER = "#FFFDF8";
const KRAFT = "#8B6F47";
const KRAFT_LIGHT = "#DCD0B4";
const OCHRE = "#C1801F";
const TEAL = "#1F6E63";
const RUST = "#AE4530";
const GREEN = "#1D9E75";

const materialStyles: Record<
  MaterialType,
  { bg: string; text: string; border: string; label: string }
> = {
  PLASTIC: { bg: "#EAF3F1", text: TEAL, border: "#BFDCD5", label: "Plastic" },
  METAL: { bg: "#EEEEEE", text: "#4A4A48", border: "#D2D2CE", label: "Metal" },
  GLASS: { bg: "#EAF1F6", text: "#2B5E7A", border: "#C4DBE7", label: "Glass" },
  ELECTRONICS: {
    bg: "#EFEDF6",
    text: "#4B3E82",
    border: "#D2CBE9",
    label: "Electronics",
  },
  PAPER: { bg: "#F6F0E3", text: KRAFT, border: KRAFT_LIGHT, label: "Paper" },
  TEXTILE: {
    bg: "#F7EBEA",
    text: "#8C3B33",
    border: "#E7C9C5",
    label: "Textile",
  },
  RUBBER: { bg: "#EAEAE6", text: INK, border: "#D3D3CB", label: "Rubber" },
  OTHER: { bg: "#F1F1EC", text: "#5B5B54", border: "#D9D9CF", label: "Other" },
};

function statusStyle(status: string) {
  const s = status.toUpperCase();
  if (s === "OPEN" || s === "ACTIVE") return { text: TEAL, border: TEAL };
  if (s === "PENDING" || s === "RESERVED")
    return { text: OCHRE, border: OCHRE };
  if (s === "CLOSED" || s === "SOLD") return { text: RUST, border: RUST };
  return { text: INK, border: KRAFT };
}

function ticketSerial(id: string) {
  return id.replace(/-/g, "").slice(-6).toUpperCase();
}

const fieldClass =
  "mt-2 h-11 w-full rounded-sm border bg-white px-3 text-sm outline-none transition";
const fieldStyle = { borderColor: KRAFT_LIGHT, color: INK };
const labelClass = "text-[11px] font-semibold uppercase tracking-[0.16em]";
const labelStyle = { color: KRAFT, fontFamily: "'IBM Plex Mono', monospace" };

type Tab = "overview" | "collection-points" | "epr-reports";

export default function BusinessDashboardPage() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");

  // --- Listings / intake form state (same as personal dashboard) ---
  const [form, setForm] = useState(initialForm);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // --- Collection points state ---
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [loadingCollectionPoints, setLoadingCollectionPoints] = useState(true);
  const [cpForm, setCpForm] = useState(initialCollectionPointForm);
  const [cpSubmitting, setCpSubmitting] = useState(false);
  const [cpMessage, setCpMessage] = useState("");
  const [cpError, setCpError] = useState("");

  const isPreview = !!user?.id.startsWith("preview-");
  const points = user?.accountProfile?.points ?? 0;
  const isVerified = !!user?.accountProfile?.registrationNo;

  async function loadListings() {
    try {
      setLoadingListings(true);
      const response = await apiClient.get<MyListingsResponse>("/listings/my");
      setListings(response.listings);
    } catch {
      setError("Could not load your listings yet.");
    } finally {
      setLoadingListings(false);
    }
  }

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
    if (user?.userType === "BUSINESS" && !isPreview) {
      void loadListings();
      void loadCollectionPoints();
    } else {
      setLoadingListings(false);
      setLoadingCollectionPoints(false);
    }
  }, [user?.id, user?.userType, isPreview]);

  function updateForm(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handlePhotoSelect(event: ChangeEvent<HTMLInputElement>) {
    setPhotoError("");
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - form.images.length;
    if (remainingSlots <= 0) {
      setPhotoError(`You've attached the maximum of ${MAX_IMAGES} photos.`);
      event.target.value = "";
      return;
    }

    const selected = Array.from(files).slice(0, remainingSlots);

    try {
      setUploadingPhotos(true);
      const urls = await Promise.all(selected.map((file) => uploadImage(file)));
      setForm((current) => ({
        ...current,
        images: [...current.images, ...urls],
      }));
    } catch {
      setPhotoError("Could not upload one of those photos. Try again.");
    } finally {
      setUploadingPhotos(false);
      event.target.value = "";
    }
  }

  function removePhoto(index: number) {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      await apiClient.post("/listings", {
        ...form,
        quantityKg: Number(form.quantityKg),
        locationLat: Number(form.locationLat),
        locationLng: Number(form.locationLng),
        images: form.images,
        description: form.description || undefined,
        plusCode: form.plusCode || undefined,
        areaName: form.areaName || undefined,
      });
      setForm(initialForm);
      setMessage("Ticket posted. It's live on the buyer floor now.");
      await loadListings();
    } catch {
      setError("Could not post the listing. Check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  }

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
    { id: "collection-points", label: "Collection points" },
    { id: "epr-reports", label: "EPR reports" },
  ];

  return (
    <ProtectedRoute allowedUserType="BUSINESS">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
      `}</style>
      <DashboardShell
        eyebrow="Intake ledger"
        title={`Welcome${user ? `, ${user.name}` : ""}`}
        description="Weigh in a new batch, manage collection points, and track every ticket you've opened on the buyer floor."
        userName={user?.name}
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
                {user?.accountProfile?.businessName || "Business name not set"}
              </p>
              <p className="mt-1 text-[11px]" style={{ color: "#5B5B54" }}>
                Reg. No. {user?.accountProfile?.registrationNo || "—"}
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
                Points balance
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span
                  className="text-[40px] leading-none"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: INK }}
                >
                  {points.toLocaleString()}
                </span>
                <span
                  className="text-sm font-semibold uppercase tracking-[0.08em]"
                  style={{ color: KRAFT, fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  pts
                </span>
              </div>
              <p className="mt-2 text-sm leading-6" style={{ color: "#5B5B54" }}>
                {isPreview
                  ? "Preview accounts don't accrue real points."
                  : "Earned from completed tickets on the buyer floor."}
              </p>
            </section>

            <section
              className="rounded-md border p-6"
              style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.24em]"
                style={{ color: OCHRE, fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Notifications
              </p>
              <div
                className="mt-3 rounded-sm border border-dashed p-5 text-center"
                style={{ borderColor: KRAFT_LIGHT }}
              >
                <p
                  className="text-sm font-semibold uppercase tracking-[0.1em]"
                  style={{ color: KRAFT, fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Coming soon
                </p>
                <p className="mt-2 text-sm leading-6" style={{ color: "#5B5B54" }}>
                  Notifications aren&apos;t live yet — this panel is ready for
                  when the backend endpoint ships.
                </p>
              </div>
            </section>
          </div>

          {/* Tabs */}
          <div
            className="mt-6 flex gap-1 border-b px-1"
            style={{ borderColor: KRAFT_LIGHT }}
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className="relative px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: tab === t.id ? TEAL : "#5B5B54",
                }}
              >
                {t.label}
                {tab === t.id ? (
                  <span
                    className="absolute inset-x-0 -bottom-px h-0.5"
                    style={{ background: TEAL }}
                  />
                ) : null}
              </button>
            ))}
          </div>

          {tab === "overview" ? (
            <div className="mt-6 grid gap-6 p-1 lg:grid-cols-[1fr_0.62fr]">
              {/* Intake form */}
              <section
                className="rounded-md border p-6"
                style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.24em]"
                  style={{ color: OCHRE, fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Open a new ticket
                </p>
                <h2
                  className="mt-2 text-[26px] leading-tight"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: INK }}
                >
                  Weigh in a batch
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6" style={{ color: "#5B5B54" }}>
                  Fill in the slip below. Once posted, buyers see it live on the
                  marketplace floor.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 grid gap-6">
                  <fieldset className="grid gap-4 border-t pt-5" style={{ borderColor: KRAFT_LIGHT }}>
                    <legend className={labelClass} style={labelStyle}>
                      01 — Batch details
                    </legend>

                    <label className="block">
                      <span className="text-sm font-semibold" style={{ color: INK }}>
                        Title
                      </span>
                      <input
                        className={fieldClass}
                        style={fieldStyle}
                        value={form.title}
                        onChange={(event) => updateForm("title", event.target.value)}
                        placeholder="42 kg PET bottles"
                        required
                      />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-semibold" style={{ color: INK }}>
                          Material
                        </span>
                        <select
                          className={fieldClass}
                          style={fieldStyle}
                          value={form.materialType}
                          onChange={(event) =>
                            updateForm("materialType", event.target.value)
                          }
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
                          value={form.quantityKg}
                          onChange={(event) =>
                            updateForm("quantityKg", event.target.value)
                          }
                          required
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-sm font-semibold" style={{ color: INK }}>
                        Description
                      </span>
                      <textarea
                        className="mt-2 min-h-24 w-full rounded-sm border bg-white px-3 py-3 text-sm outline-none transition"
                        style={fieldStyle}
                        value={form.description}
                        onChange={(event) =>
                          updateForm("description", event.target.value)
                        }
                        placeholder="Condition, packaging, pickup notes"
                      />
                    </label>
                  </fieldset>

                  <fieldset className="grid gap-4 border-t pt-5" style={{ borderColor: KRAFT_LIGHT }}>
                    <legend className={labelClass} style={labelStyle}>
                      02 — Pickup location
                    </legend>

                    <LocationPicker
                      latitude={form.locationLat}
                      longitude={form.locationLng}
                      onChange={(lat, lng) => {
                        updateForm("locationLat", lat);
                        updateForm("locationLng", lng);
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
                            value={form.locationLat}
                            onChange={(event) =>
                              updateForm("locationLat", event.target.value)
                            }
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
                            value={form.locationLng}
                            onChange={(event) =>
                              updateForm("locationLng", event.target.value)
                            }
                            required
                          />
                        </label>
                      </div>
                    </details>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-semibold" style={{ color: INK }}>
                          Area name
                        </span>
                        <input
                          className={fieldClass}
                          style={fieldStyle}
                          value={form.areaName}
                          onChange={(event) =>
                            updateForm("areaName", event.target.value)
                          }
                          placeholder="Westlands"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-semibold" style={{ color: INK }}>
                          Plus code
                        </span>
                        <input
                          className={fieldClass}
                          style={fieldStyle}
                          value={form.plusCode}
                          onChange={(event) =>
                            updateForm("plusCode", event.target.value)
                          }
                          placeholder="Optional"
                        />
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="grid gap-3 border-t pt-5" style={{ borderColor: KRAFT_LIGHT }}>
                    <legend className={labelClass} style={labelStyle}>
                      03 — Photos ({form.images.length}/{MAX_IMAGES})
                    </legend>
                    <p className="text-sm leading-6" style={{ color: "#5B5B54" }}>
                      Clear photos help buyers trust the weight and condition
                      before they commit.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {form.images.map((src, index) => (
                        <div
                          key={index}
                          className="relative h-24 w-24 overflow-hidden rounded-sm border"
                          style={{
                            borderColor: KRAFT_LIGHT,
                            transform: index % 2 === 0 ? "rotate(-2deg)" : "rotate(2deg)",
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt={`Attached photo ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white"
                            style={{ background: RUST }}
                            aria-label={`Remove photo ${index + 1}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      {form.images.length < MAX_IMAGES ? (
                        <label
                          className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-dashed text-center"
                          style={{ borderColor: KRAFT, color: KRAFT }}
                        >
                          <span className="text-xl leading-none">+</span>
                          <span
                            className="text-[10px] font-semibold uppercase tracking-[0.08em]"
                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                          >
                            Add photo
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handlePhotoSelect}
                          />
                        </label>
                      ) : null}
                    </div>

                    {uploadingPhotos ? (
                      <p className="text-sm" style={{ color: KRAFT }}>
                        Uploading photo...
                      </p>
                    ) : null}

                    {photoError ? (
                      <p className="text-sm" style={{ color: RUST }}>
                        {photoError}
                      </p>
                    ) : null}
                  </fieldset>

                  {message ? (
                    <p
                      className="rounded-sm border px-3 py-2 text-sm"
                      style={{ borderColor: TEAL, color: TEAL, background: "#EAF3F1" }}
                    >
                      {message}
                    </p>
                  ) : null}
                  {error ? (
                    <p
                      className="rounded-sm border px-3 py-2 text-sm"
                      style={{ borderColor: RUST, color: RUST, background: "#FBEFEC" }}
                    >
                      {error}
                    </p>
                  ) : null}

                  <button
                    className="h-11 rounded-sm px-4 text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: TEAL, fontFamily: "'IBM Plex Mono', monospace" }}
                    disabled={submitting || uploadingPhotos || isPreview}
                    type="submit"
                  >
                    {submitting ? "Posting..." : "Post ticket"}
                  </button>
                </form>
              </section>

              {/* My tickets */}
              <aside
                className="rounded-md border p-6"
                style={{ borderColor: KRAFT_LIGHT, background: INK }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.24em]"
                  style={{ color: OCHRE, fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  My tickets
                </p>

                {isPreview ? (
                  <p className="mt-4 text-sm leading-6" style={{ color: "#B7C0BA" }}>
                    Preview accounts can't load real tickets. Sign in with your
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
                      style={{ color: CREAM, fontFamily: "'IBM Plex Mono', monospace" }}
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
                                  fontFamily: "'IBM Plex Mono', monospace",
                                }}
                              >
                                No photo
                              </div>
                            )}
                            <div className="flex-1 px-3 py-2">
                              <div className="flex items-start justify-between gap-2">
                                <h3
                                  className="text-sm font-semibold leading-snug"
                                  style={{ color: INK, fontFamily: "'Fraunces', serif" }}
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
                                style={{ color: KRAFT, fontFamily: "'IBM Plex Mono', monospace" }}
                              >
                                {mat.label} · {listing.quantityKg} kg · #
                                {ticketSerial(listing.id)}
                              </p>
                              <p className="mt-1 text-[11px]" style={{ color: "#5B5B54" }}>
                                {listing.areaName || "No area added"} ·{" "}
                                {listing._count?.interests ?? 0} interested
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </aside>
            </div>
          ) : null}

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
                  <fieldset className="grid gap-4 border-t pt-5" style={{ borderColor: KRAFT_LIGHT }}>
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
                        onChange={(event) => updateCpForm("name", event.target.value)}
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
                        onChange={(event) => updateCpForm("address", event.target.value)}
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
                        onChange={(event) => updateCpForm("areaName", event.target.value)}
                        placeholder="Westlands"
                      />
                    </label>
                  </fieldset>

                  <fieldset className="grid gap-4 border-t pt-5" style={{ borderColor: KRAFT_LIGHT }}>
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
                            onChange={(event) =>
                              updateCpForm("locationLat", event.target.value)
                            }
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
                            onChange={(event) =>
                              updateCpForm("locationLng", event.target.value)
                            }
                            required
                          />
                        </label>
                      </div>
                    </details>
                  </fieldset>

                  <fieldset className="grid gap-3 border-t pt-5" style={{ borderColor: KRAFT_LIGHT }}>
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

              {/* Existing collection points */}
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
                    Preview accounts can't load real collection points.
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

          {tab === "epr-reports" ? (
            <div className="mt-6 p-1">
              <section
                className="rounded-md border p-10 text-center"
                style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.24em]"
                  style={{ color: OCHRE, fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  EPR reports
                </p>
                <h2
                  className="mt-3 text-2xl"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: INK }}
                >
                  Monthly reports coming soon
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6" style={{ color: "#5B5B54" }}>
                  Extended Producer Responsibility reporting is planned for
                  Sprint 4. This tab is a placeholder until that ships.
                </p>
              </section>
            </div>
          ) : null}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}