"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function JudgeLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid company email.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/judge/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: { email: string };
      };
      if (!response.ok || !payload.success) {
        setError(payload.message || "Unable to send a verification code.");
        return;
      }
      sessionStorage.setItem(
        "judge_email",
        payload.data?.email || email.trim().toLowerCase(),
      );
      router.push("/judge/verify-otp");
    } catch {
      setError("Unable to reach the judge authentication service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="ambient ambient-two" />
      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-3">
          <span className="cube-mark" aria-hidden="true">
            <span className="cube-face cube-face-left" />
            <span className="cube-face cube-face-right" />
            <span className="cube-face cube-face-top" />
          </span>
          <span className="font-heading text-2xl font-semibold">curio.</span>
        </Link>
        <div className="admin-card mt-8 p-7 sm:p-10">
          <p className="eyebrow">Judge workspace</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold">
            Welcome, Judge.
          </h1>
          <p className="mt-4 leading-7 text-[#7B7B6A]">
            Sign in to evaluate teams and submit your scores.
          </p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block text-sm font-semibold">
              Company email
              <input
                className="field mt-2"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-[#A3B18A]/20 p-3 text-sm text-[#59664A]"
              >
                {error}
              </p>
            )}
            <button
              disabled={loading}
              className="button-primary w-full disabled:opacity-50"
            >
              {loading ? "Sending code…" : "Send OTP"}
            </button>
          </form>
          <Link
            href="/"
            className="mt-6 block text-center text-sm text-[#7B7B6A]"
          >
            Back to public website
          </Link>
        </div>
      </div>
    </main>
  );
}
