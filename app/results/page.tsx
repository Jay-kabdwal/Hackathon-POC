"use client";

import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";

type Result = {
  teamNumber: number;
  teamName: string;
  ideaScore: number;
  solutionScore?: number;
  totalScore: number;
  rank: number;
};

type ResultsResponse = {
  success?: boolean;
  message?: string;
  data?: { released: boolean; results: Result[] };
};

export default function ResultsPage() {
  const [payload, setPayload] = useState<ResultsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/results")
      .then(async (response) => {
        const data = (await response.json()) as ResultsResponse;
        if (!response.ok || !data.success) throw new Error(data.message);
        setPayload(data);
      })
      .catch(() =>
        setError("Results are currently unavailable. Please try again later."),
      );
  }, []);

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-40 sm:pt-48">
        <p className="eyebrow">Published results</p>
        <h1 className="mt-6 font-heading text-5xl font-semibold tracking-[-.04em] text-white sm:text-7xl">
          See what teams built<span className="text-cyan-200">.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          Results appear here when the organizers release them.
        </p>
        {error && (
          <p role="alert" className="mt-10 text-sm text-[#A66D43]">
            {error}
          </p>
        )}
        {!payload && !error && (
          <p className="mt-10 text-sm text-slate-400">Loading results…</p>
        )}
        {payload && !payload.data?.released && (
          <div className="glass mt-10 rounded-3xl p-8 text-slate-400">
            Results have not been released yet.
          </div>
        )}
        {payload?.data?.released && payload.data.results.length === 0 && (
          <div className="glass mt-10 rounded-3xl p-8 text-slate-400">
            No results are available yet.
          </div>
        )}
        {payload?.data?.released && payload.data.results.length > 0 && (
          <div className="glass mt-10 overflow-hidden rounded-3xl">
            <div className="grid grid-cols-[4rem_1fr_6rem] gap-4 border-b border-black/10 px-6 py-4 text-xs font-bold uppercase tracking-[.15em] text-slate-500">
              <span>Rank</span>
              <span>Team</span>
              <span className="text-right">Score</span>
            </div>
            {payload.data.results.map((result) => (
              <div
                key={result.teamNumber}
                className="grid grid-cols-[4rem_1fr_6rem] gap-4 border-b border-black/10 px-6 py-5 last:border-0"
              >
                <span className="font-heading text-lg text-cyan-200">
                  {result.rank}
                </span>
                <span>
                  <strong className="block font-heading text-lg text-white">
                    {result.teamName}
                  </strong>
                  <small className="text-slate-500">
                    Team {result.teamNumber}
                  </small>
                </span>
                <span className="text-right font-heading text-lg text-white">
                  {result.totalScore}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
