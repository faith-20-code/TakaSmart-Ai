import Link from "next/link";
import { BrandMark } from "@/src/components/BrandMark";

const materials = ["Plastic", "Metal", "Paper", "Glass", "E-waste"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f7f1] text-[#123526]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <BrandMark />
        <nav className="flex items-center gap-2">
          <Link
            className="hidden h-10 items-center rounded-md px-4 text-sm font-semibold text-[#123526] transition hover:bg-white sm:inline-flex"
            href="/login"
          >
            Sign in
          </Link>
          <Link
            className="inline-flex h-10 items-center rounded-md bg-[#123526] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2318]"
            href="/register"
          >
            Register
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-84px)] max-w-6xl gap-10 px-6 pb-12 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1d9e75]">
            Nairobi recycling marketplace
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-[#0b2318] sm:text-6xl">
            Match recyclable waste with buyers who can move it.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5e7569]">
            TakaSmart helps sellers post recyclable materials and helps buyers
            discover nearby supply with cleaner coordination and AI-assisted
            matching.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-md bg-[#1d9e75] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#177f60]"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-md border border-[#bfd2c9] bg-white px-6 text-sm font-semibold text-[#123526] transition hover:border-[#1d9e75]"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-[#d8e4dd] bg-white p-5 shadow-sm">
          <div className="rounded-md bg-[#123526] p-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#a8d8c5]">
                  Live marketplace preview
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  42 kg PET bottles
                </h2>
              </div>
              <span className="rounded-md bg-[#f2be4d] px-3 py-1 text-xs font-bold text-[#3b2b06]">
                KES
              </span>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                ["3.2 km", "nearest buyer"],
                ["18-25", "KES / kg"],
                ["12 min", "match time"],
              ].map(([value, label]) => (
                <div className="rounded-md bg-white/10 p-3" key={label}>
                  <p className="text-lg font-semibold">{value}</p>
                  <p className="mt-1 text-xs text-[#a8d8c5]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {materials.map((material, index) => (
              <div
                className="flex items-center justify-between rounded-md border border-[#e2ebe5] bg-[#fbfcfa] px-4 py-3"
                key={material}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={[
                      "h-3 w-3 rounded-full",
                      index === 0
                        ? "bg-[#1d9e75]"
                        : index === 1
                          ? "bg-[#3b82b7]"
                          : index === 2
                            ? "bg-[#b78a2f]"
                            : index === 3
                              ? "bg-[#7b68a8]"
                              : "bg-[#cc5f4a]",
                    ].join(" ")}
                  />
                  <span className="text-sm font-semibold text-[#123526]">
                    {material}
                  </span>
                </div>
                <span className="text-xs font-medium text-[#5e7569]">
                  ready for Sprint 2
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
