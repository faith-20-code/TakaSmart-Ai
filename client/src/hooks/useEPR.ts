"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/src/lib/api";

// ---------- types ----------

export type IncomingWasteLog = {
  id: string;
  materialType: string;
  quantityKg: number;
  loggedAt: string;
  collectionPoint: { name: string };
};

export type OutgoingWasteLog = {
  id: string;
  materialType: string;
  quantityKg: number;
  loggedAt: string;
  buyer: {
    name: string;
    buyerProfile: { companyName: string };
  };
};

export type DailyLogResponse = {
  logs: IncomingWasteLog[] | OutgoingWasteLog[];
  summary: Record<string, number>;
  totalKg: number;
  date: string;
};

export type MonthlyEPRResponse = {
  report: {
    business: { name: string; registrationNo: string };
    period: { month: number; year: number; from: string; to: string };
    incoming: {
      totalKg: number;
      byMaterial: Record<string, number>;
      entries: number;
    };
    outgoing: {
      totalKg: number;
      byMaterial: Record<string, number>;
      entries: number;
    };
    netWaste: number;
  };
};

// ---------- hook ----------

export function useEPR(isEligible: boolean) {
  // daily logs
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().slice(0, 10),
  );
  const [incoming, setIncoming] = useState<DailyLogResponse | null>(null);
  const [outgoing, setOutgoing] = useState<DailyLogResponse | null>(null);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [dailyError, setDailyError] = useState("");

  // monthly report
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [monthlyReport, setMonthlyReport] = useState<MonthlyEPRResponse | null>(null);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [monthlyError, setMonthlyError] = useState("");

  // pdf download
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  // ---------- daily ----------

  const loadDaily = useCallback(
    async (date: string) => {
      if (!isEligible) return;
      setLoadingDaily(true);
      setDailyError("");
      try {
        const [inc, out] = await Promise.all([
          apiClient.get<DailyLogResponse>(`/epr/incoming?date=${date}`),
          apiClient.get<DailyLogResponse>(`/epr/outgoing?date=${date}`),
        ]);
        setIncoming(inc);
        setOutgoing(out);
      } catch {
        setDailyError("Could not load daily activity. Try again.");
      } finally {
        setLoadingDaily(false);
      }
    },
    [isEligible],
  );

  // load on mount and whenever date changes
  useEffect(() => {
    void loadDaily(selectedDate);
  }, [selectedDate, loadDaily]);

  function changeDate(date: string) {
    setSelectedDate(date);
  }

  // ---------- monthly ----------

  async function loadMonthly() {
    if (!isEligible) return;
    setLoadingMonthly(true);
    setMonthlyError("");
    setMonthlyReport(null);
    try {
      const res = await apiClient.get<MonthlyEPRResponse>(
        `/epr/monthly?month=${selectedMonth}&year=${selectedYear}`,
      );
      setMonthlyReport(res);
    } catch {
      setMonthlyError("Could not load the monthly report. Try again.");
    } finally {
      setLoadingMonthly(false);
    }
  }

  // ---------- PDF download ----------

  async function downloadPDF() {
    setDownloading(true);
    setDownloadError("");
    try {
      const apiBase = (
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"
      ).replace(/\/$/, "");
      const url = `${apiBase}/epr/download?month=${selectedMonth}&year=${selectedYear}`;

      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `EPR_Report_${selectedYear}_${selectedMonth}.pdf`;
      link.click();
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      setDownloadError("Could not download the PDF. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  return {
    // daily
    selectedDate,
    incoming,
    outgoing,
    loadingDaily,
    dailyError,
    changeDate,
    refreshDaily: () => void loadDaily(selectedDate),
    // monthly
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    monthlyReport,
    loadingMonthly,
    monthlyError,
    loadMonthly,
    // pdf
    downloading,
    downloadError,
    downloadPDF,
  };
}
