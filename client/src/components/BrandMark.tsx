import Link from "next/link";

export function BrandMark({
  href = "/",
  dark = false,
}: {
  href?: string;
  dark?: boolean;
}) {
  return (
    <Link className="inline-flex items-center gap-2.5 group" href={href}>
      {/* Icon mark — recycling-inspired tri-arrow */}
      <span
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: dark ? "rgba(255,255,255,0.12)" : "var(--ts-green-800)" }}
      >
        {/* Three-arrow recycle symbol drawn with SVG */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          {/* Simplified recycling arrows */}
          <path
            d="M12 4L15 8H13V13H11V8H9L12 4Z"
            fill="white"
            opacity="0.95"
          />
          <path
            d="M17.5 9.5L20 13.5L18.2 13L16.7 16.5H13.5V14.5H15.8L17 11.5L15.2 11L17.5 9.5Z"
            fill="white"
            opacity="0.85"
          />
          <path
            d="M6.5 9.5L4 13.5L5.8 13L7.3 16.5H10.5V14.5H8.2L7 11.5L8.8 11L6.5 9.5Z"
            fill="white"
            opacity="0.75"
          />
        </svg>
      </span>

      {/* Wordmark */}
      <span className="leading-none">
        <span
          className="block text-[15px] font-semibold tracking-[-0.01em]"
          style={{
            color: dark ? "white" : "var(--ts-green-900)",
            fontFamily: "var(--ts-font-display)",
          }}
        >
          TakaSmart
        </span>
        <span
          className="block text-[11px] font-medium tracking-[0.04em] uppercase mt-0.5"
          style={{
            color: dark ? "rgba(255,255,255,0.6)" : "var(--ts-muted)",
            fontFamily: "var(--ts-font-mono)",
          }}
        >
          AI Marketplace
        </span>
      </span>
    </Link>
  );
}
