// Shared visual language for TakaSmart: every listing, form, and account
// is framed as a "ticket" on a weighbridge manifest — the way a Nairobi
// scrapyard issues a paper slip when material is weighed in.
//
// This is the single source of truth for color, type, spacing, radius,
// shadow, and interaction states. Pages should import from here instead
// of redefining hex values — that's what keeps four separate screens
// looking like one product as the app grows.

// ---------------------------------------------------------------------
// COLOR
// ---------------------------------------------------------------------
// OCHRE is the brand accent but fails WCAG AA contrast at small text
// sizes on paper/cream (3.2:1 and 2.9:1 — needs 4.5:1). Use OCHRE for
// fills, borders, and badges (where it's paired with enough size/weight
// to qualify as "large text," ≥18px or ≥14px bold). Use OCHRE_TEXT for
// any small label, caption, or eyebrow that needs to actually be read.
export const INK = "#1B231F";
export const CREAM = "#F6F2E7";
export const PAPER = "#FFFDF8";
export const KRAFT = "#8B6F47";
export const KRAFT_LIGHT = "#DCD0B4";
export const OCHRE = "#C1801F";
export const OCHRE_TEXT = "#9C6816"; // 4.69:1 on paper — passes AA
export const OCHRE_ON_DARK = "#E0A94C"; // 7.61:1 on ink — for ochre labels on dark panels
export const TEAL = "#1F6E63";
export const RUST = "#AE4530";
export const SLATE = "#5B5B54";
export const INK_MUTED = "#B7C0BA";
export const INK_BORDER = "#3A453F";

// ---------------------------------------------------------------------
// TYPE
// ---------------------------------------------------------------------
export const FONT_DISPLAY = "'Fraunces', serif";
export const FONT_MONO = "'IBM Plex Mono', monospace";
export const FONT_BODY = "'IBM Plex Sans', sans-serif";

export const GOOGLE_FONTS_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');`;

export function TicketFonts() {
  return <style>{GOOGLE_FONTS_IMPORT}</style>;
}

// Formal type scale — use these class strings instead of picking a
// one-off size per page.
export const type = {
  heroH1: "text-[32px] sm:text-[44px] lg:text-[52px] leading-[1.05]",
  h2: "text-[22px] sm:text-[26px] leading-tight",
  h3: "text-[16px] sm:text-[18px] leading-snug",
  body: "text-sm leading-6",
  eyebrow: "text-[11px] font-semibold uppercase tracking-[0.16em]", // dialed back from 0.24em
  dataHero: "text-3xl sm:text-4xl tabular-nums",
  dataInline: "text-[12px] tabular-nums",
};

// ---------------------------------------------------------------------
// SPACING / RADIUS / SHADOW
// ---------------------------------------------------------------------
// 8pt-ish scale: 4 / 8 / 12 / 16 / 24 / 32 / 48. Card padding is always
// 24px (p-6); field gaps 16px (gap-4); section gaps 32px (gap-8).
export const radius = {
  control: "rounded-sm", // inputs, buttons — crisp like a printed slip
  card: "rounded-md", // panels, cards
  pill: "rounded-full", // status stamps, tags
};

export const shadow = {
  rest: "shadow-[0_1px_2px_rgba(27,35,31,0.06)]",
  hover: "shadow-[0_4px_12px_rgba(27,35,31,0.12)]",
};

// A card that's meant to be clickable — lifts slightly on hover, like
// picking a ticket up off the counter.
export const interactiveCardClass = `${radius.card} border ${shadow.rest} transition-all duration-150 ease-out hover:-translate-y-0.5 hover:${shadow.hover}`;

// ---------------------------------------------------------------------
// FOCUS RINGS
// ---------------------------------------------------------------------
// Every input/button/label previously used outline-none with nothing to
// replace it — invisible to keyboard users. These restore a visible
// focus state without bringing back the default blue browser outline.
export const focusRingLight =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFDF8] focus-visible:ring-[#1F6E63]";
export const focusRingDark =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B231F] focus-visible:ring-[#F6F2E7]";

// ---------------------------------------------------------------------
// BUTTONS
// ---------------------------------------------------------------------
const buttonBase = `${radius.control} text-sm font-semibold uppercase tracking-[0.08em] transition-all duration-150 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${focusRingLight}`;

export const buttonPrimaryClass = `${buttonBase} text-white`; // pair with style={{background: TEAL, fontFamily: FONT_MONO}}
export const buttonSecondaryClass = `${buttonBase} border bg-transparent`; // pair with style={{borderColor: KRAFT, color: INK, fontFamily: FONT_MONO}}
export const buttonDestructiveClass = `${buttonBase} border`; // pair with style={{borderColor: RUST, color: RUST, fontFamily: FONT_MONO}}

// ---------------------------------------------------------------------
// MATERIALS + STATUS
// ---------------------------------------------------------------------
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

export const materialStyles: Record<
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
  OTHER: { bg: "#F1F1EC", text: SLATE, border: "#D9D9CF", label: "Other" },
};

// status now returns an icon key too, so status is never color-only
export function statusStyle(status: string) {
  const s = status.toUpperCase();
  if (s === "OPEN" || s === "ACTIVE")
    return { text: TEAL, border: TEAL, icon: "check" as const };
  if (s === "PENDING" || s === "RESERVED")
    return { text: OCHRE_TEXT, border: OCHRE, icon: "clock" as const };
  if (s === "CLOSED" || s === "SOLD")
    return { text: RUST, border: RUST, icon: "x" as const };
  return { text: INK, border: KRAFT, icon: "dot" as const };
}

export function ticketSerial(id: string) {
  return id.replace(/-/g, "").slice(-6).toUpperCase();
}

// Small inline icon so status is never color-only — no icon library
// dependency required. 12x12, inherits currentColor.
export function StatusIcon({
  icon,
  className,
}: {
  icon: "check" | "clock" | "x" | "dot";
  className?: string;
}) {
  const common = { width: 12, height: 12, viewBox: "0 0 24 24", fill: "none" };
  if (icon === "check")
    return (
      <svg {...common} className={className} aria-hidden="true">
        <path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (icon === "clock")
    return (
      <svg {...common} className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      </svg>
    );
  if (icon === "x")
    return (
      <svg {...common} className={className} aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
      </svg>
    );
  return (
    <svg {...common} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="6" fill="currentColor" />
    </svg>
  );
}

// ---------------------------------------------------------------------
// FORM FIELDS
// ---------------------------------------------------------------------
export const fieldClass = `mt-2 h-11 w-full ${radius.control} border bg-white px-3 text-sm outline-none transition-colors duration-150 focus:border-[#1F6E63] ${focusRingLight}`;
export const fieldStyle = { borderColor: KRAFT_LIGHT, color: INK };
export const labelClass = type.eyebrow;
export const labelStyle = { color: OCHRE_TEXT, fontFamily: FONT_MONO };