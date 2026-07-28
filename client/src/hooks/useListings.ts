"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { apiClient } from "@/src/lib/api";
import { uploadImage } from "@/src/lib/uploadImage";
import { MaterialType } from "@/src/lib/constants/materials";
import type { User } from "@/src/context/AuthContext";

// ---------- types ----------

export type AIAnalysis = {
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  conditionNote: string;
  materialMatch: boolean;
  materialNote: string;
  priceMin: number;
  priceMax: number;
  priceNote: string;
};

export type Listing = {
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
  // AI fields — null on older listings
  aiPriceMin?: number | null;
  aiPriceMax?: number | null;
  condition?: string | null;
  conditionNote?: string | null;
};

type MyListingsResponse = { listings: Listing[] };
type AIAnalyseResponse = { analysis: AIAnalysis };

export const MAX_IMAGES = 4;

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
  // AI-populated — seller can edit before posting
  aiPriceMin: "" as string | number,
  aiPriceMax: "" as string | number,
  condition: "",
  conditionNote: "",
};

export type IntakeFormState = typeof initialForm;

export function useListings(user: User | null) {
  const [form, setForm] = useState(initialForm);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // AI analysis
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [analyseError, setAnalyseError] = useState("");
  // controls which step of the two-step form is shown
  const [formStep, setFormStep] = useState<1 | 2>(1);

  // ---------- load listings ----------

  const loadListings = useCallback(async () => {
    try {
      setLoadingListings(true);
      const response = await apiClient.get<MyListingsResponse>("/listings/my");
      setListings(response.listings);
    } catch {
      setError("Could not load your listings yet.");
    } finally {
      setLoadingListings(false);
    }
  }, []);

  useEffect(() => {
    if (
      (user?.userType === "PERSONAL" || user?.userType === "BUSINESS") &&
      !user.id.startsWith("preview-")
    ) {
      void loadListings();
    } else {
      setLoadingListings(false);
    }
  }, [user?.id, user?.userType, loadListings]);

  // ---------- form helpers ----------

  function updateForm(field: keyof IntakeFormState, value: string) {
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

  // ---------- AI analysis ----------

  async function handleAnalyse() {
    setAnalyseError("");
    setAnalysing(true);
    try {
      const response = await apiClient.post<AIAnalyseResponse>("/ai/analyse", {
        imageUrl: form.images[0],
        materialType: form.materialType,
        quantityKg: form.quantityKg,
      });
      const a = response.analysis;
      setAnalysis(a);
      setForm((f) => ({
        ...f,
        aiPriceMin: a.priceMin,
        aiPriceMax: a.priceMax,
        condition: a.condition,
        conditionNote: a.conditionNote,
      }));
      // advance to step 2
      setFormStep(2);
    } catch {
      setAnalyseError("AI analysis failed. You can still post the listing without it.");
    } finally {
      setAnalysing(false);
    }
  }

  function skipToStep2() {
    setFormStep(2);
  }

  function backToStep1() {
    setFormStep(1);
  }

  // ---------- submit ----------

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
        aiPriceMin: form.aiPriceMin !== "" ? Number(form.aiPriceMin) : undefined,
        aiPriceMax: form.aiPriceMax !== "" ? Number(form.aiPriceMax) : undefined,
        condition: form.condition || undefined,
        conditionNote: form.conditionNote || undefined,
      });
      setForm(initialForm);
      setAnalysis(null);
      setFormStep(1);
      setMessage("Ticket posted. It's live on the buyer floor now.");
      await loadListings();
    } catch {
      setError("Could not post the listing. Check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return {
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
    // AI
    analysis,
    analysing,
    analyseError,
    handleAnalyse,
    formStep,
    skipToStep2,
    backToStep1,
  };
}
