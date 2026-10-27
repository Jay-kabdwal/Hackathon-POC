"use client";

import Link from "next/link";
import { useState } from "react";
import { siteConfig } from "@/lib/site";

const links = [
  { href: "/", label: "Home" },
  { href: "/details", label: "Details" },
  { href: "/register", label: "Register" },
  { href: "/results", label: "Results" },
];

export function Mark() {
  return (
    <span className="cube-mark" aria-hidden="true">
      <span className="cube-face cube-face-left" />
      <span className="cube-face cube-face-right" />
      <span className="cube-face cube-face-top" />
    </span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-black/10 bg-white/80 px-4 py-3 shadow-xl shadow-[#3A3A3A]/10 backdrop-blur-xl sm:px-5">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Mark />
          <span className="font-heading text-lg font-semibold tracking-[-.04em] text-[#3A3A32]">{siteConfig.wordmark}</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-[#3A3A3A] transition hover:text-[#C08457]">
              {link.label}
            </Link>
          ))}
          <Link href="/register" className="button-primary !px-4 !py-2.5 text-sm">Register your team</Link>
        </div>
        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg border border-black/10 p-2 text-[#3A3A3A] md:hidden"
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1.5 block h-0.5 w-5 bg-current" />
          <span className="mt-1.5 block h-0.5 w-5 bg-current" />
        </button>
      </nav>
      {open && (
        <div className="mx-auto mt-2 max-w-7xl rounded-2xl border border-black/10 bg-white/95 p-3 shadow-xl backdrop-blur-xl md:hidden">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-[#3A3A3A] hover:bg-[#C08457]/10">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
