"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { DashboardShell } from "@/src/components/DashboardShell";
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

const INK = "#1B231F";
const CREAM = "#F6F2E7";
const PAPER = "#FFFDF8";
const KRAFT = "#8B6F47";
const KRAFT_LIGHT = "#DCD0B4";
const OCHRE = "#C1801F";
const TEAL = "#1F6E63";
const RUST = "#AE4530";

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
const labelClass =
  "text-[11px] font-semibold uppercase tracking-[0.16em]";
const labelStyle = { color: KRAFT, fontFamily: "'IBM Plex Mono', monospace" };

export default function SellerPage() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

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

  useEffect(() => {
    if (user?.userType === "SELLER" && !user.id.startsWith("preview-")) {
      void loadListings();
    } else {
      setLoadingListings(false);
    }
  }, [user?.id, user?.userType]);

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

  return (
    <ProtectedRoute allowedUserType="SELLER">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
      `}</style>
      <DashboardShell
        eyebrow="Intake ledger"
        title={`Welcome${user ? `, ${user.name}` : ""}`}
        description="Weigh in a new batch, attach photos, and track every ticket you've opened on the buyer floor."
        userName={user?.name}
        onLogout={() => void logout()}
      >
        <div
          className="min-h-full"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: CREAM }}
        >
          <div className="grid gap-6 p-1 lg:grid-cols-[1fr_0.62fr]">
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
                {/* 01 Batch details */}
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

                {/* 02 Location */}
                <fieldset className="grid gap-4 border-t pt-5" style={{ borderColor: KRAFT_LIGHT }}>
                  <legend className={labelClass} style={labelStyle}>
                    02 — Pickup location
                  </legend>

                  <div className="grid gap-4 sm:grid-cols-2">
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

                {/* 03 Photos */}
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
                  disabled={submitting || uploadingPhotos || user?.id.startsWith("preview-")}
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

              {user?.id.startsWith("preview-") ? (
                <p className="mt-4 text-sm leading-6" style={{ color: "#B7C0BA" }}>
                  Preview accounts can't load real tickets. Sign in with a
                  seller account to post and manage material batches.
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
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}