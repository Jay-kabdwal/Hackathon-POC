"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminError, AdminLoading, AdminShell, adminRequest, StatusBadge } from "@/components/admin/admin-ui";

type Dashboard = { totalTeams: number; totalParticipants: number; totalJudges: number; activeJudges: number; settings: { judgingEnabled: boolean; resultStage: string } };

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { adminRequest<{ data: Dashboard }>("/api/admin/dashboard").then((payload) => setData(payload.data)).catch((reason: Error) => setError(reason.message)); }, []);
  if (error) return <AdminShell title="Overview"><AdminError message={error} /></AdminShell>;
  if (!data) return <AdminShell title="Overview"><AdminLoading /></AdminShell>;
  const stats = [["Registered teams", data.totalTeams], ["Participants", data.totalParticipants], ["Total judges", data.totalJudges], ["Active judges", data.activeJudges]];
  return <AdminShell title="Overview"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value]) => <div className="admin-card min-w-0 p-5 sm:p-6" key={label as string}><p className="min-h-10 max-w-[10rem] text-sm leading-5 text-[#7B7B6A]">{label}</p><p className="mt-2 font-heading text-4xl font-semibold">{value}</p></div>)}</div><div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,.8fr)]"><div className="admin-card min-w-0 p-5 sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="eyebrow">Workspace</p><h2 className="mt-2 break-words font-heading text-2xl font-semibold leading-tight sm:text-3xl">Keep the momentum visible.</h2></div><Link href="/admin/teams" className="button-secondary w-full shrink-0 text-sm sm:w-auto">View teams</Link></div><p className="mt-5 max-w-xl text-sm leading-7 text-[#7B7B6A] sm:text-base">Manage registrations, judges, and publication settings from one calm, focused workspace.</p></div><div className="admin-card min-w-0 p-5 sm:p-7"><p className="eyebrow">Current status</p><div className="mt-5 space-y-3"><div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F7F8F4] px-3 py-3"><span className="text-sm font-medium">Judging</span><StatusBadge active={data.settings.judgingEnabled}>{data.settings.judgingEnabled ? "Enabled" : "Disabled"}</StatusBadge></div><div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F7F8F4] px-3 py-3"><span className="text-sm font-medium">Results</span><StatusBadge active={data.settings.resultStage !== "HIDDEN"}>{data.settings.resultStage.replace("_", " ")}</StatusBadge></div></div><Link href="/admin/settings" className="mt-6 inline-block text-sm font-semibold text-[#65734F] hover:underline">Manage settings →</Link></div></div></AdminShell>;
}
