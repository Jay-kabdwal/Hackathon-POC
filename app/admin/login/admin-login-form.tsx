"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
      };
      if (!response.ok || !payload.success) {
        setError(payload.message || "Unable to sign in.");
        return;
      }
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Unable to reach the authentication service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="ambient ambient-one" />
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
          <p className="eyebrow">Admin portal</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold">Welcome back.</h1>
          <p className="mt-4 leading-7 text-[#7B7B6A]">Sign in to manage your hackathon.</p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block text-sm font-semibold">
              Email
              <input className="field mt-2" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
            </label>
            <label className="block text-sm font-semibold">
              Password
              <div className="relative mt-2">
                <input className="field pr-20" required type={show ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7B7B6A]">{show ? "Hide" : "Show"}</button>
              </div>
            </label>
            {error && <p role="alert" className="rounded-xl bg-[#A3B18A]/20 p-3 text-sm text-[#59654A]">{error}</p>}
            <button disabled={loading} className="button-primary w-full disabled:opacity-50">{loading ? "Signing in…" : "Sign in"}</button>
          </form>
          <Link href="/" className="mt-6 block text-center text-sm text-[#7B7B6A]">Return to public website</Link>
        </div>
      </div>
    </main>
  );
}
