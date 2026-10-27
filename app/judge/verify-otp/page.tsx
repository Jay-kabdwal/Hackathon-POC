"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const email = sessionStorage.getItem("judge_email") || "";
    if (!email) {
      setError("Return to login and request a new code.");
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the six-digit verification code.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/judge/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
      };
      if (!response.ok || !payload.success) {
        setError(payload.message || "The verification code could not be accepted.");
        return;
      }
      sessionStorage.removeItem("judge_email");
      router.replace("/judge/dashboard");
      router.refresh();
    } catch {
      setError("Unable to reach the verification service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <span className="cube-mark" aria-hidden="true">
            <span className="cube-face cube-face-left" />
            <span className="cube-face cube-face-right" />
            <span className="cube-face cube-face-top" />
          </span>
        </div>
        <div className="admin-card mt-8 p-7 sm:p-10">
          <p className="eyebrow">Email verification</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold">Verify your email.</h1>
          <p className="mt-4 leading-7 text-[#7B7B6A]">
            Enter the six-digit code sent to your registered company email.
          </p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block text-sm font-semibold">
              Verification code
              <input
                className="field mt-2 text-center font-heading text-2xl tracking-[.35em]"
                inputMode="numeric"
                maxLength={6}
                required
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                autoComplete="one-time-code"
              />
            </label>
            {error && <p role="alert" className="rounded-xl bg-[#A3B18A]/20 p-3 text-sm text-[#59654A]">{error}</p>}
            <button disabled={loading} className="button-primary w-full disabled:opacity-50">
              {loading ? "Verifying…" : "Verify and continue"}
            </button>
          </form>
          <Link href="/judge/login" className="mt-6 block text-center text-sm text-[#7B7B6A] hover:text-[#59664A]">
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
