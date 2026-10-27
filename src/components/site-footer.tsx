import Link from "next/link";
import { Mark } from "./site-header";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-[#F1EAE2]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Mark />
            <span className="font-heading text-lg font-semibold tracking-[-.04em] text-[#3A3A32]">
              {siteConfig.wordmark}
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#7A7A7A]">
            {siteConfig.description}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#7B7B6A]">
            {siteConfig.meaning}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A7A7A]">
            Explore
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[#3A3A3A]">
            <Link href="/">Home</Link>
            <Link href="/details">Details</Link>
            <Link href="/register">Register</Link>
            <Link href="/results">Results</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A7A7A]">
            Portals
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link
              href="/admin/login"
              className="text-[#A3B18A] transition hover:text-[#3A3A32]"
            >
              Admin Portal ↗
            </Link>
            <Link
              href="/judge/login"
              className="text-[#A3B18A] transition hover:text-[#3A3A32]"
            >
              Judges Portal ↗
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl border-t border-black/10 px-6 py-5 text-xs text-[#7A7A7A] lg:px-8">
        © {new Date().getFullYear()} {siteConfig.name}. Built for better ideas.
      </div>
    </footer>
  );
}
