export const materialTypes = [
  "PLASTIC",
  "METAL",
  "GLASS",
  "ELECTRONICS",
  "PAPER",
  "TEXTILE",
  "RUBBER",
  "OTHER",
] as const;

export type MaterialType = (typeof materialTypes)[number];

export const INK = "#1B231F";
export const CREAM = "#F6F2E7";
export const PAPER = "#FFFDF8";
export const KRAFT = "#8B6F47";
export const KRAFT_LIGHT = "#DCD0B4";
export const OCHRE = "#C1801F";
export const TEAL = "#1F6E63";
export const RUST = "#AE4530";
export const GREEN = "#1D9E75";

export const materialStyles: Record <
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

export function statusStyle(status: string) {
  const s = status.toUpperCase();
  if (s === "OPEN" || s === "ACTIVE") return { text: TEAL, border: TEAL };
  if (s === "PENDING" || s === "RESERVED")
    return { text: OCHRE, border: OCHRE };
  if (s === "CLOSED" || s === "SOLD") return { text: RUST, border: RUST };
  return { text: INK, border: KRAFT };
}

export function ticketSerial(id: string) {
  return id.replace(/-/g, "").slice(-6).toUpperCase();
}