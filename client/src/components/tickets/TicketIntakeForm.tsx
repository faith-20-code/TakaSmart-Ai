"use client";

import { ChangeEvent, FormEvent } from "react";
import { LocationPicker } from "@/src/components/LocationPicker";
import {
  materialTypes,
  materialStyles,
  INK,
  CREAM,
  KRAFT,
  KRAFT_LIGHT,
  OCHRE,
  TEAL,
  RUST,
  GREEN,
} from "@/src/lib/constants/materials";
import { MAX_IMAGES, type AIAnalysis, type IntakeFormState } from "@/src/hooks/useListings";

// ---------- types ----------

type Props = {
  form: IntakeFormState;
  formStep: 1 | 2;
  submitting: boolean;
  uploadingPhotos: boolean;
  photoError: string;
  message: string;
  error: string;
  isPreview: boolean;
  analysis: AIAnalysis | null;
  analysing: boolean;
  analyseError: string;
  onUpdate: (field: keyof IntakeFormState, value: string) => void;
  onPhotoSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (index: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onAnalyse: () => void;
  onSkipToStep2: () => void;
  onBackToStep1: () => void;
};

// ---------- shared style tokens ----------

const fieldClass =
  "mt-2 h-11 w-full rounded-sm border bg-white px-3 text-sm outline-none transition";
const fieldStyle = { borderColor: KRAFT_LIGHT, color: INK };
const labelClass = "text-[11px] font-semibold uppercase tracking-[0.16em]";
const labelStyle = { color: KRAFT, fontFamily: "'IBM Plex Mono', monospace" };
const mono = "'IBM Plex Mono', monospace";
const serif = "'Fraunces', serif";

// ---------- condition badge colour ----------

function conditionColor(condition: AIAnalysis["condition"]) {
  if (condition === "Excellent") return { text: GREEN, border: GREEN, bg: "#EAF6F0" };
  if (condition === "Good") return { text: TEAL, border: TEAL, bg: "#EAF3F1" };
  if (condition === "Fair") return { text: "#B07A10", border: "#D4A017", bg: "#FEF9E7" };
  return { text: RUST, border: RUST, bg: "#FBEFEC" };
}

// ---------- AI results card ----------

function AICard({ analysis }: { analysis: AIAnalysis }) {
  const cc = conditionColor(analysis.condition);
  return (
    <div
      className="rounded-sm border p-4"
      style={{ borderColor: TEAL, background: "#EAF3F1" }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-[0.2em]"
        style={{ color: TEAL, fontFamily: mono }}
      >
        AI analysis
      </p>

      {/* condition */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: cc.text, borderColor: cc.border, background: cc.bg }}
        >
          {analysis.condition}
        </span>
        <span className="text-sm" style={{ color: INK }}>
          condition
        </span>
      </div>
      <p className="mt-1 text-[12px] leading-5" style={{ color: "#5B5B54" }}>
        {analysis.conditionNote}
      </p>

      {/* price */}
      <div className="mt-3 flex items-baseline gap-1">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: KRAFT, fontFamily: mono }}
        >
          Suggested price
        </span>
      </div>
      <p
        className="mt-0.5 text-lg font-bold"
        style={{ fontFamily: mono, color: INK }}
      >
        KES {analysis.priceMin.toLocaleString()} —{" "}
        {analysis.priceMax.toLocaleString()}
      </p>
      <p className="mt-0.5 text-[12px] leading-5" style={{ color: "#5B5B54" }}>
        {analysis.priceNote}
      </p>

      {/* material mismatch warning */}
      {!analysis.materialMatch ? (
        <p
          className="mt-3 rounded-sm border px-3 py-2 text-[12px] font-semibold"
          style={{ borderColor: RUST, color: RUST, background: "#FBEFEC" }}
        >
          ⚠ {analysis.materialNote}
        </p>
      ) : null}
    </div>
  );
}

// ---------- step indicator ----------

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2">
      {([1, 2] as const).map((n) => (
        <div key={n} className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold"
            style={{
              background: step === n ? TEAL : KRAFT_LIGHT,
              color: step === n ? "white" : KRAFT,
              fontFamily: mono,
            }}
          >
            {n}
          </span>
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: step === n ? TEAL : KRAFT, fontFamily: mono }}
          >
            {n === 1 ? "Details & photo" : "Review & post"}
          </span>
          {n === 1 ? (
            <span className="text-[11px]" style={{ color: KRAFT_LIGHT }}>
              /
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

// ---------- main component ----------

export function TicketIntakeForm({
  form,
  formStep,
  submitting,
  uploadingPhotos,
  photoError,
  message,
  error,
  isPreview,
  analysis,
  analysing,
  analyseError,
  onUpdate,
  onPhotoSelect,
  onRemovePhoto,
  onSubmit,
  onAnalyse,
  onSkipToStep2,
  onBackToStep1,
}: Props) {
  const canAnalyse =
    form.images.length > 0 &&
    !!form.materialType &&
    !!form.quantityKg &&
    !uploadingPhotos;

  return (
    <section
      className="rounded-md border p-6"
      style={{ borderColor: KRAFT_LIGHT, background: CREAM }}
    >
      {/* header */}
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.24em]"
        style={{ color: OCHRE, fontFamily: mono }}
      >
        Open a new ticket
      </p>
      <h2
        className="mt-2 text-[26px] leading-tight"
        style={{ fontFamily: serif, fontWeight: 600, color: INK }}
      >
        Weigh in a batch
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-6" style={{ color: "#5B5B54" }}>
        Fill in the slip below. Once posted, buyers see it live on the
        marketplace floor.
      </p>

      <div className="mt-4">
        <StepIndicator step={formStep} />
      </div>

      {/* ══════════════════════════════════════
          STEP 1 — Basic details + photo upload
          ══════════════════════════════════════ */}
      {formStep === 1 ? (
        <div className="mt-6 grid gap-6">
          {/* 01 — Batch details */}
          <fieldset
            className="grid gap-4 border-t pt-5"
            style={{ borderColor: KRAFT_LIGHT }}
          >
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
                onChange={(e) => onUpdate("title", e.target.value)}
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
                  onChange={(e) => onUpdate("materialType", e.target.value)}
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
                  style={{ ...fieldStyle, fontFamily: mono }}
                  min="0.1"
                  step="0.1"
                  type="number"
                  value={form.quantityKg}
                  onChange={(e) => onUpdate("quantityKg", e.target.value)}
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
                onChange={(e) => onUpdate("description", e.target.value)}
                placeholder="Condition, packaging, pickup notes"
              />
            </label>
          </fieldset>

          {/* 02 — Pickup location */}
          <fieldset
            className="grid gap-4 border-t pt-5"
            style={{ borderColor: KRAFT_LIGHT }}
          >
            <legend className={labelClass} style={labelStyle}>
              02 — Pickup location
            </legend>

            <LocationPicker
              latitude={form.locationLat}
              longitude={form.locationLng}
              onChange={(lat, lng) => {
                onUpdate("locationLat", lat);
                onUpdate("locationLng", lng);
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
                    style={{ ...fieldStyle, fontFamily: mono }}
                    step="any"
                    type="number"
                    value={form.locationLat}
                    onChange={(e) => onUpdate("locationLat", e.target.value)}
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold" style={{ color: INK }}>
                    Longitude
                  </span>
                  <input
                    className={fieldClass}
                    style={{ ...fieldStyle, fontFamily: mono }}
                    step="any"
                    type="number"
                    value={form.locationLng}
                    onChange={(e) => onUpdate("locationLng", e.target.value)}
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
                  onChange={(e) => onUpdate("areaName", e.target.value)}
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
                  onChange={(e) => onUpdate("plusCode", e.target.value)}
                  placeholder="Optional"
                />
              </label>
            </div>
          </fieldset>

          {/* 03 — Photos */}
          <fieldset
            className="grid gap-3 border-t pt-5"
            style={{ borderColor: KRAFT_LIGHT }}
          >
            <legend className={labelClass} style={labelStyle}>
              03 — Photos ({form.images.length}/{MAX_IMAGES})
            </legend>
            <p className="text-sm leading-6" style={{ color: "#5B5B54" }}>
              Upload at least one photo — the AI will analyse your first
              image to suggest a price and verify the material.
            </p>

            <div className="flex flex-wrap gap-3">
              {form.images.map((src, index) => (
                <div
                  key={index}
                  className="relative h-24 w-24 overflow-hidden rounded-sm border"
                  style={{
                    borderColor: index === 0 ? TEAL : KRAFT_LIGHT,
                    transform: index % 2 === 0 ? "rotate(-2deg)" : "rotate(2deg)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Attached photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {index === 0 ? (
                    <span
                      className="absolute bottom-0 left-0 right-0 py-0.5 text-center text-[9px] font-bold uppercase tracking-[0.06em] text-white"
                      style={{ background: TEAL }}
                    >
                      AI uses this
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onRemovePhoto(index)}
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
                    style={{ fontFamily: mono }}
                  >
                    Add photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={onPhotoSelect}
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

          {/* Analyse button + skip link */}
          <div
            className="flex flex-col gap-3 border-t pt-5"
            style={{ borderColor: KRAFT_LIGHT }}
          >
            {analyseError ? (
              <p
                className="rounded-sm border px-3 py-2 text-sm"
                style={{ borderColor: RUST, color: RUST, background: "#FBEFEC" }}
              >
                {analyseError}
              </p>
            ) : null}

            <button
              type="button"
              onClick={onAnalyse}
              disabled={!canAnalyse || analysing || isPreview}
              className="h-11 rounded-sm px-4 text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: TEAL, fontFamily: mono }}
            >
              {analysing ? "Analysing your waste..." : "Analyse with AI →"}
            </button>

            {!canAnalyse && !analysing ? (
              <p className="text-[11px]" style={{ color: KRAFT, fontFamily: mono }}>
                Upload a photo and fill in material + quantity to enable AI
                analysis.
              </p>
            ) : null}

            <button
              type="button"
              onClick={onSkipToStep2}
              disabled={!form.title || !form.quantityKg || !form.locationLat}
              className="text-[11px] font-semibold uppercase tracking-[0.1em] underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
              style={{ color: KRAFT, fontFamily: mono }}
            >
              Skip AI and post manually →
            </button>
          </div>
        </div>
      ) : null}

      {/* ══════════════════════════════════════
          STEP 2 — AI results + review + post
          ══════════════════════════════════════ */}
      {formStep === 2 ? (
        <form onSubmit={onSubmit} className="mt-6 grid gap-6">

          {/* AI results card */}
          {analysis ? (
            <AICard analysis={analysis} />
          ) : (
            <div
              className="rounded-sm border border-dashed p-4 text-center"
              style={{ borderColor: KRAFT_LIGHT }}
            >
              <p className="text-sm" style={{ color: KRAFT }}>
                No AI analysis — you can still post manually.
              </p>
            </div>
          )}

          {/* Editable AI fields */}
          <fieldset
            className="grid gap-4 border-t pt-5"
            style={{ borderColor: KRAFT_LIGHT }}
          >
            <legend className={labelClass} style={labelStyle}>
              Review &amp; edit AI suggestions
            </legend>
            <p className="text-sm leading-6" style={{ color: "#5B5B54" }}>
              These were pre-filled by the AI. Edit anything before posting.
            </p>

            <label className="block">
              <span className="text-sm font-semibold" style={{ color: INK }}>
                Condition
              </span>
              <select
                className={fieldClass}
                style={fieldStyle}
                value={form.condition}
                onChange={(e) => onUpdate("condition", e.target.value)}
              >
                <option value="">— Select condition —</option>
                {["Excellent", "Good", "Fair", "Poor"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold" style={{ color: INK }}>
                  AI price min (KES)
                </span>
                <input
                  className={fieldClass}
                  style={{ ...fieldStyle, fontFamily: mono }}
                  min="0"
                  step="1"
                  type="number"
                  value={form.aiPriceMin}
                  onChange={(e) => onUpdate("aiPriceMin", e.target.value)}
                  placeholder="e.g. 150"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold" style={{ color: INK }}>
                  AI price max (KES)
                </span>
                <input
                  className={fieldClass}
                  style={{ ...fieldStyle, fontFamily: mono }}
                  min="0"
                  step="1"
                  type="number"
                  value={form.aiPriceMax}
                  onChange={(e) => onUpdate("aiPriceMax", e.target.value)}
                  placeholder="e.g. 250"
                />
              </label>
            </div>
          </fieldset>

          {/* Status messages */}
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

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              className="h-11 rounded-sm px-4 text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: TEAL, fontFamily: mono }}
              disabled={submitting || isPreview}
              type="submit"
            >
              {submitting ? "Posting..." : "Post ticket"}
            </button>

            <button
              type="button"
              onClick={onBackToStep1}
              className="text-[11px] font-semibold uppercase tracking-[0.1em] underline-offset-2 hover:underline"
              style={{ color: KRAFT, fontFamily: mono }}
            >
              ← Back to step 1
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
