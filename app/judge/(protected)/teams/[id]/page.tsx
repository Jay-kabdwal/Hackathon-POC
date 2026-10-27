"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  JudgeError,
  JudgeLoading,
  JudgeShell,
  judgeRequest,
} from "@/components/judge/judge-ui";

type Round = "IDEA" | "SOLUTION";
type ResultStage = "HIDDEN" | "IDEA_REVEALED" | "FINAL_REVEALED";
type Team = {
  id: string;
  teamNumber: number;
  teamName: string;
  members: string[];
  memberCount: number;
};
type TeamResponse = {
  teams: Team[];
  pagination: { total: number };
  settings: {
    judgingEnabled: boolean;
    judgingRound: Round;
    resultStage: ResultStage;
  };
};

export default function JudgeTeamPage() {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [settings, setSettings] = useState<TeamResponse["settings"] | null>(null);
  const [round, setRound] = useState<Round>("IDEA");
  const [points, setPoints] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    judgeRequest<{ data: TeamResponse }>("/api/judge/teams?limit=100")
      .then((payload) => {
        const found = payload.data.teams.find((item) => item.id === id);
        if (!found) throw new Error("Team not found.");
        setTeam(found);
        setSettings(payload.data.settings);
        setRound(payload.data.settings.judgingRound);
      })
      .catch((reason: Error) => setError(reason.message));
  }, [id]);

  const roundLocked =
    settings?.resultStage === "FINAL_REVEALED" ||
    (round === "IDEA" && settings?.resultStage === "IDEA_REVEALED");
  const canSubmit =
    Boolean(settings?.judgingEnabled) &&
    settings?.judgingRound === round &&
    !roundLocked;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    const value = Number(points);
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      setError("Enter an integer score between 0 and 100.");
      return;
    }
    setSaving(true);
    try {
      await judgeRequest("/api/judge/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: id, round, points: value }),
      });
      setNotice("Score saved successfully.");
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <JudgeShell title="Team evaluation">
      <Link href="/judge/dashboard#teams" className="button-secondary text-sm">
        ← Back to teams
      </Link>
      {error && !team ? (
        <div className="mt-6"><JudgeError message={error} /></div>
      ) : !team ? (
        <div className="mt-6"><JudgeLoading /></div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_.8fr]">
          <div className="admin-card min-w-0 overflow-hidden p-6">
            <p className="eyebrow">Team #{team.teamNumber}</p>
            <h2 className="mt-2 break-words font-heading text-3xl font-semibold">
              {team.teamName}
            </h2>
            <p className="mt-3 text-[#7B7B6A]">{team.memberCount} members</p>
            <div className="mt-8">
              <h3 className="font-heading text-xl font-semibold">Team members</h3>
              <ul className="mt-4 space-y-3">
                {team.members.map((member) => (
                  <li key={member} className="break-words rounded-xl bg-[#E6E9DE] px-4 py-3 text-sm">
                    {member}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <form onSubmit={submit} className="admin-card h-fit min-w-0 p-6">
            <p className="eyebrow">Evaluation</p>
            <h2 className="mt-2 break-words font-heading text-2xl font-semibold">
              Submit a score.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#7B7B6A]">
              Only the active judging round accepts scores. Revealed rounds are locked.
            </p>
            <label className="mt-6 block text-sm font-semibold">
              Judging round
              <select
                className="field mt-2"
                value={round}
                onChange={(event) => setRound(event.target.value as Round)}
                disabled={!settings?.judgingEnabled}
              >
                <option value="IDEA">Idea</option>
                <option value="SOLUTION">Solution</option>
              </select>
            </label>
            <label className="mt-5 block text-sm font-semibold">
              Score
              <input
                className="field mt-2"
                type="number"
                min="0"
                max="100"
                step="1"
                required
                value={points}
                onChange={(event) => setPoints(event.target.value)}
                placeholder="0–100"
                disabled={!canSubmit}
              />
            </label>
            {settings && !canSubmit && (
              <p className="mt-5 rounded-xl bg-black/5 p-3 text-sm leading-5 text-[#7B7B6A]">
                {!settings.judgingEnabled
                  ? "Judging is currently disabled."
                  : settings.judgingRound !== round
                    ? `The ${settings.judgingRound} round is currently open.`
                    : "Scores for this round are locked after results are revealed."}
              </p>
            )}
            {error && <div className="mt-5"><JudgeError message={error} /></div>}
            {notice && <p className="mt-5 rounded-xl bg-[#A3B18A]/20 p-3 text-sm font-semibold text-[#59664A]">{notice}</p>}
            <button disabled={saving || !canSubmit} className="button-primary mt-6 w-full disabled:opacity-50">
              {saving ? "Saving score…" : canSubmit ? "Save score" : "Scoring unavailable"}
            </button>
          </form>
        </div>
      )}
    </JudgeShell>
  );
}
