import Link from "next/link";

export function BrandMark({ href = "/" }: { href?: string }) {
  return (
    <Link className="inline-flex items-center gap-3" href={href}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#123526] text-sm font-bold text-white shadow-sm">
        TS
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-[#0b2318]">
          TakaSmart
        </span>
        <span className="block text-xs font-medium text-[#5e7569]">
          AI marketplace
        </span>
      </span>
    </Link>
  );
}
