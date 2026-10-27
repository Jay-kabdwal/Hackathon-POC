"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export async function judgeRequest<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, { ...init, credentials: "include" });
  const payload = (await response.json()) as T & { message?: string };
  if (!response.ok) throw new Error(payload.message || "Request failed.");
  return payload;
}

export function JudgeShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/judge/logout", {
      method: "POST",
      credentials: "include",
    });
    router.replace("/judge/login");
    router.refresh();
  }

  return (
    <div className="judge-shell min-h-screen">
      <div className="judge-content judge-content-full">
        <header className="judge-header">
          <div className="min-w-0">
            <p className="eyebrow">Curio / Judge workspace</p>
            <h1 className="truncate font-heading text-2xl font-semibold">
              {title}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              className="button-secondary hidden text-xs sm:inline-flex"
            >
              Return to website
            </Link>
            <button
              type="button"
              onClick={logout}
              className="button-primary text-xs"
            >
              Log out
            </button>
          </div>
        </header>
        <main className="page-enter p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

export function JudgeError({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-[#A3B18A]/50 bg-[#A3B18A]/15 p-5 text-sm text-[#59664A]"
    >
      {message}
      {retry && (
        <button
          type="button"
          onClick={retry}
          className="ml-3 font-semibold underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function JudgeLoading() {
  return (
    <div className="space-y-4">
      <div className="admin-skeleton h-28" />
      <div className="admin-skeleton h-64" />
    </div>
  );
}
