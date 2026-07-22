"use client";

import { useState } from "react";

type LocationPickerProps = {
  latitude: string;
  longitude: string;
  onChange: (latitude: string, longitude: string) => void;
  /** Optional label override for the button, e.g. "Use pickup location" */
  buttonLabel?: string;
};

type Status = "idle" | "loading" | "success" | "error";

function buildEmbedUrl(lat: number, lng: number) {
  // Zoomed-in bounding box around the point, with a marker at the exact
  // coordinates. No API key required.
  const delta = 0.0035;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox,
  )}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function LocationPicker({
  latitude,
  longitude,
  onChange,
  buttonLabel = "Use my current location",
}: LocationPickerProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const lat = Number(latitude);
  const lng = Number(longitude);
  const hasValidCoords =
    latitude !== "" &&
    longitude !== "" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);

  function handleUseLocation() {
    setErrorMessage("");

    if (!("geolocation" in navigator)) {
      setStatus("error");
      setErrorMessage("Your browser doesn't support location access.");
      return;
    }

    setStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLat = position.coords.latitude.toFixed(6);
        const nextLng = position.coords.longitude.toFixed(6);
        onChange(nextLat, nextLng);
        setStatus("success");
      },
      (error) => {
        setStatus("error");
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMessage(
            "Location access was denied. You can still enter coordinates manually below.",
          );
        } else {
          setErrorMessage(
            "Could not get your location. Try again or enter coordinates manually below.",
          );
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleUseLocation}
        disabled={status === "loading"}
        className="inline-flex h-11 items-center gap-2 rounded-md border border-[#1d9e75] bg-[#eaf6f0] px-4 text-sm font-semibold text-[#0b684d] transition hover:bg-[#dcefe5] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0b684d] border-t-transparent" />
        ) : (
          <span aria-hidden="true">📍</span>
        )}
        {status === "loading" ? "Getting your location..." : buttonLabel}
      </button>

      {errorMessage ? (
        <p className="text-sm text-[#AE4530]">{errorMessage}</p>
      ) : null}

      {hasValidCoords ? (
        <div className="overflow-hidden rounded-md border border-[#d8e4dd]">
          <iframe
            title="Selected location"
            src={buildEmbedUrl(lat, lng)}
            className="h-56 w-full border-0"
            loading="lazy"
          />
          <p className="border-t border-[#d8e4dd] bg-[#fbfcfa] px-3 py-2 text-xs text-[#5e7569]">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        </div>
      ) : null}
    </div>
  );
}