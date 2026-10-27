"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navigation = [
  {
    href: "/admin/dashboard",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/admin/teams",
    label: "Teams",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/admin/judges",
    label: "Judges",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="m12 3 2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5L12 3Z" />
        <path d="m19 14 1.5 3.5L24 19l-3.5 1.5L19 24l-1.5-3.5L14 19l3.5-1.5L19 14Z" transform="translate(-1 -2) scale(.9)" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="12" cy="12" r="3" />
        <path d="m19.4 15 .1.1 1.4 1.1-1.5 2.6-1.7-.7a8 8 0 0 1-2 .9l-.3 1.8h-3l-.3-1.8a8 8 0 0 1-2-.9l-1.7.7-1.5-2.6 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.5-2.6 1.7.7a8 8 0 0 1 2-.9l.3-1.8h3l.3 1.8a8 8 0 0 1 2 .9l1.7-.7 1.5 2.6-1.4 1.1a8 8 0 0 1 0 1.9Z" transform="translate(-1 -1)" />
      </svg>
    ),
  },
];

export async function adminRequest<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
  });

  const payload = (await response.json()) as T & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}

export function AdminShell({
  children,
  title,
  hideSidebar = false,
}: {
  children: React.ReactNode;
  title: string;
  hideSidebar?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed.");
      }

      router.replace("/admin/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#263329]">
      {/* Mobile overlay */}
      {!hideSidebar && open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* Sidebar */}
      {!hideSidebar && <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#E8EBE4] bg-white px-4 transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <Link
          href="/admin/dashboard"
          onClick={() => setOpen(false)}
          className="flex h-[78px] items-center gap-3 px-2"
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF2E9] text-[#405A40]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
            >
              <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" />
              <path d="m3 7 9 5 9-5M12 12v10" />
            </svg>
            <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full border-2 border-[#EDF2E9] bg-[#90AD79]" />
          </span>

          <span className="text-[26px] font-bold tracking-[-1.5px] text-[#28392C]">
            curio<span className="text-[#91A77C]">.</span>
          </span>
        </Link>

        {/* Workspace */}
        <div className="mb-8 mt-3 flex items-center gap-3 rounded-xl border border-[#EDF0E9] bg-[#F8F9F6] p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#607B59] text-sm font-bold text-white">
            C
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[#344235]">
              Curio Inc.
            </p>
            <p className="mt-1 text-[10px] text-[#8A9186]">
              Hackathon workspace
            </p>
          </div>

          <span className="h-2 w-2 rounded-full bg-[#80A66F]" />
        </div>

        {/* Navigation */}
        <div>
          <p className="mb-3 px-3 text-[10px] font-bold tracking-[1.5px] text-[#9A9F95]">
            WORKSPACE
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-h-11 items-center gap-3 rounded-xl border px-3 text-[13px] transition-colors ${
                    active
                      ? "border-[#E3EBDD] bg-[#EDF3E9] font-semibold text-[#405A40]"
                      : "border-transparent text-[#788078] hover:bg-[#F5F7F2] hover:text-[#405A40]"
                  }`}
                >
                  <span className="h-[19px] w-[19px] shrink-0">
                    {item.icon}
                  </span>

                  <span className="flex-1">{item.label}</span>

                  {active && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4 text-[#809576]"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="mt-auto">
          <div className="mb-4 rounded-xl border border-[#EDF0E9] bg-[#F7F8F4] p-4">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8EEE2] text-[#536D4B]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-[18px] w-[18px]"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
              </svg>
            </div>

            <p className="text-xs font-semibold text-[#364536]">
              Your event, organized.
            </p>
            <p className="mt-1.5 text-[11px] leading-5 text-[#858C80]">
              Manage registrations, judges, and results in one place.
            </p>
          </div>

          <Link
            href="/"
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-xs text-[#747D74] transition hover:bg-[#F5F7F2] hover:text-[#344D37]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[18px] w-[18px]">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a15 15 0 0 1 0 18" />
            </svg>
            Return to website
          </Link>

          <button
            type="button"
            disabled={loggingOut}
            onClick={logout}
            className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-xs text-[#747D74] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[18px] w-[18px]">
              <path d="M10 17l5-5-5-5M15 12H3" />
              <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
            </svg>
            {loggingOut ? "Logging out..." : "Log out"}
          </button>

          <div className="mt-3 flex items-center gap-3 border-t border-[#E9ECE6] px-2 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E7ECDF] text-xs font-bold text-[#5A6C4E]">
              A
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#344235]">
                Administrator
              </p>
              <p className="mt-1 text-[10px] text-[#858D85]">
                Super admin
              </p>
            </div>

            <span className="h-2 w-2 rounded-full bg-[#80A66F]" />
          </div>
        </div>
      </aside>}

      {/* Main content */}
      <div className={`min-h-screen min-w-0 ${hideSidebar ? "" : "md:ml-[260px]"}`}>
        <header className="sticky top-0 z-30 flex min-h-[88px] items-center justify-between gap-4 border-b border-[#E8EBE4] bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {!hideSidebar && <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8EBE4] bg-[#F7F8F5] text-[#526352] transition hover:bg-[#EDF3E9] md:hidden"
            >
              {open ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>}

            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-[#92998F]">
                <span>Workspace</span>
                <span>/</span>
                <span className="truncate text-[#637360]">{title}</span>
              </div>

              <h1 className="truncate text-xl font-bold tracking-[-0.7px] text-[#28362B] sm:text-2xl">
                {title}
              </h1>
            </div>
          </div>

          {hideSidebar ? (
            <div className="flex shrink-0 items-center gap-2">
              <Link href="/" className="button-secondary hidden text-xs sm:inline-flex">
                Return to public site
              </Link>
              <button
                type="button"
                disabled={loggingOut}
                onClick={logout}
                className="button-primary text-xs disabled:opacity-50"
              >
                {loggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          ) : (
            <div className="hidden shrink-0 items-center gap-2 rounded-full border border-[#E9EEE3] bg-[#F6F8F3] px-3 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#7CA66E]" />
              <span className="text-[11px] font-medium text-[#65745E]">
                Management portal
              </span>
            </div>
          )}
        </header>

        <main className="animate-[fadeIn_.25s_ease-out] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
      {message}
    </div>
  );
}

export function AdminLoading() {
  return (
    <div className="space-y-5" aria-label="Loading content">
      <div className="h-20 animate-pulse rounded-2xl bg-[#E9ECE5]" />
      <div className="h-32 animate-pulse rounded-2xl bg-[#E9ECE5]" />
      <div className="h-64 animate-pulse rounded-2xl bg-[#E9ECE5]" />
    </div>
  );
}

export function StatusBadge({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
        active
          ? "bg-[#EAF3E6] text-[#50754A]"
          : "bg-[#F0F1ED] text-[#7D8178]"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
