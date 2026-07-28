import Link from "next/link";
import { BrandMark } from "@/src/components/BrandMark";

const stats = [
  { value: "2,400+", label: "kg collected" },
  { value: "180+", label: "active sellers" },
  { value: "40+", label: "buyers sourcing" },
];

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 4L15 8H13V13H11V8H9L12 4Z" /><path d="M17.5 9.5L20 13.5H18L16.5 16.5H13.5V14.5H15.5L17 11.5H15.2L17.5 9.5Z" /><path d="M6.5 9.5L4 13.5H6L7.5 16.5H10.5V14.5H8.5L7 11.5H8.8L6.5 9.5Z" />
      </svg>
    ),
    title: "Post recyclable material",
    body: "Sellers list batches by weight and material type. The AI analyses your photo and suggests a market-rate price.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
    ),
    title: "Buyers discover supply",
    body: "Buyers browse live listings filtered by material, location, and quantity — and express interest with one tap.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: "Earn points at drop-offs",
    body: "Personal sellers earn points when they drop off materials at registered collection points. Redeem for KES vouchers.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    title: "EPR compliance reports",
    body: "Business accounts generate monthly EPR reports showing all incoming and outgoing waste — audit-ready PDF in one click.",
  },
];

const materials = ["Plastic", "Metal", "Glass", "Electronics", "Paper", "Textile", "Rubber"];

export default function Home() {
  return (
    <div style={{ background: "var(--ts-bg)", minHeight: "100vh", fontFamily: "var(--ts-font-body)" }}>

      {/* ── Nav ── */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{ background: "rgba(240,247,244,0.92)", backdropFilter: "blur(8px)", borderColor: "var(--ts-border)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <BrandMark />
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden h-9 items-center rounded-lg px-4 text-sm font-semibold transition hover:bg-white sm:inline-flex"
              style={{ color: "var(--ts-body)" }}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-semibold text-white shadow-sm transition"
              style={{ background: "var(--ts-green-600)" }}
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 lg:pt-24">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ borderColor: "var(--ts-green-100)", background: "var(--ts-green-50)", color: "var(--ts-green-600)", fontFamily: "var(--ts-font-mono)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--ts-green-600)" }} />
              Nairobi · Live marketplace
            </span>
            <h1
              className="mt-5 text-4xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-5xl lg:text-6xl"
              style={{ color: "var(--ts-green-900)", fontFamily: "var(--ts-font-display)" }}
            >
              Recyclable waste,{" "}
              <span style={{ color: "var(--ts-green-600)" }}>matched and</span>{" "}
              moved faster.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8" style={{ color: "var(--ts-muted)" }}>
              TakaSmart connects sellers who have recyclable material with buyers
              who need it — with AI pricing, drop-off points, and EPR compliance
              built in.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex h-11 items-center rounded-lg px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                style={{ background: "var(--ts-green-600)" }}
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center rounded-lg border px-6 text-sm font-semibold transition hover:bg-white"
                style={{ borderColor: "var(--ts-border)", color: "var(--ts-body)" }}
              >
                Sign in
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-10 flex flex-wrap gap-8 border-t pt-8" style={{ borderColor: "var(--ts-border)" }}>
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold" style={{ color: "var(--ts-green-700)", fontFamily: "var(--ts-font-display)" }}>{s.value}</p>
                  <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.1em]" style={{ color: "var(--ts-muted)", fontFamily: "var(--ts-font-mono)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Preview card */}
          <div
            className="rounded-2xl border p-6 shadow-lg"
            style={{ background: "var(--ts-surface)", borderColor: "var(--ts-border)" }}
          >
            <div className="rounded-xl p-5 text-white" style={{ background: "var(--ts-green-800)" }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium" style={{ color: "rgba(168,216,197,0.8)", fontFamily: "var(--ts-font-mono)" }}>Live listing — PET Plastic</p>
                  <h2 className="mt-1.5 text-xl font-semibold" style={{ fontFamily: "var(--ts-font-display)" }}>42 kg PET bottles</h2>
                </div>
                <span className="rounded-lg px-2.5 py-1 text-xs font-bold" style={{ background: "var(--ts-green-600)" }}>OPEN</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[["42 kg", "net weight"], ["KES 150–250", "AI price range"], ["Westlands", "pickup area"]].map(([v, l]) => (
                  <div key={l} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <p className="text-sm font-semibold">{v}</p>
                    <p className="mt-1 text-[10px]" style={{ color: "rgba(168,216,197,0.7)", fontFamily: "var(--ts-font-mono)" }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2.5" style={{ color: "var(--ts-muted)", fontFamily: "var(--ts-font-mono)" }}>Materials accepted</p>
              <div className="flex flex-wrap gap-1.5">
                {materials.map((m) => (
                  <span
                    key={m}
                    className="rounded-full border px-2.5 py-1 text-[11px] font-medium"
                    style={{ borderColor: "var(--ts-green-100)", background: "var(--ts-green-50)", color: "var(--ts-green-700)" }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-y py-16" style={{ borderColor: "var(--ts-border)", background: "var(--ts-surface)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--ts-green-600)", fontFamily: "var(--ts-font-mono)" }}>Platform features</p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl" style={{ color: "var(--ts-green-900)", fontFamily: "var(--ts-font-display)" }}>Everything the waste chain needs</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border p-5" style={{ borderColor: "var(--ts-border)", background: "var(--ts-surface-alt)" }}>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "var(--ts-green-100)", color: "var(--ts-green-700)" }}>{f.icon}</span>
                <h3 className="mt-4 text-sm font-semibold" style={{ color: "var(--ts-green-900)" }}>{f.title}</h3>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--ts-muted)" }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl" style={{ color: "var(--ts-green-900)", fontFamily: "var(--ts-font-display)" }}>Ready to move more material?</h2>
          <p className="mx-auto mt-3 max-w-md text-base leading-7" style={{ color: "var(--ts-muted)" }}>Join sellers and buyers already using TakaSmart to coordinate recyclable supply in Nairobi.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="inline-flex h-11 items-center rounded-lg px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90" style={{ background: "var(--ts-green-600)" }}>Create account</Link>
            <Link href="/login" className="inline-flex h-11 items-center rounded-lg border px-6 text-sm font-semibold transition hover:bg-white" style={{ borderColor: "var(--ts-border)", color: "var(--ts-body)" }}>Sign in</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-8" style={{ borderColor: "var(--ts-border)" }}>
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <BrandMark />
          <p className="text-xs" style={{ color: "var(--ts-muted)", fontFamily: "var(--ts-font-mono)" }}>© {new Date().getFullYear()} TakaSmart AI · Nairobi</p>
        </div>
      </footer>
    </div>
  );
}
