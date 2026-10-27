"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminError, AdminLoading, AdminShell, adminRequest, StatusBadge } from "@/components/admin/admin-ui";

type Team = { teamNumber: number; name: string; createdAt: string; members: { name: string; email: string; employeeId: string; isLeader: boolean }[] };
export default function TeamDetailsPage() {
  const params = useParams<{ id: string }>(); const [team, setTeam] = useState<Team | null>(null); const [error, setError] = useState("");
  useEffect(() => { adminRequest<{ data: Team }>(`/api/admin/teams/${params.id}`).then((payload) => setTeam(payload.data)).catch((reason: Error) => setError(reason.message)); }, [params.id]);
  return <AdminShell title="Team details"><Link href="/admin/teams" className="button-secondary text-sm">← Back to teams</Link>{error ? <div className="mt-6"><AdminError message={error} /></div> : !team ? <div className="mt-6"><AdminLoading /></div> : <><div className="admin-card mt-6 min-w-0 overflow-hidden p-5 sm:p-7"><p className="eyebrow">Team #{team.teamNumber}</p><h2 className="mt-2 break-words font-heading text-3xl font-semibold leading-tight">{team.name}</h2><p className="mt-3 break-words text-sm text-[#7B7B6A]">Registered {new Date(team.createdAt).toLocaleString()}</p></div><div className="admin-card mt-6 min-w-0 overflow-hidden p-5 sm:p-6"><h3 className="mb-5 font-heading text-xl font-semibold">Members</h3><div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Employee ID</th><th>Role</th></tr></thead><tbody>{team.members.map((member) => <tr key={member.email}><td className="max-w-[180px] break-words font-semibold">{member.name}</td><td className="max-w-[240px] break-all">{member.email}</td><td className="max-w-[180px] break-all">{member.employeeId}</td><td className="whitespace-nowrap"><StatusBadge active={member.isLeader}>{member.isLeader ? "Team leader" : "Member"}</StatusBadge></td></tr>)}</tbody></table></div></div></>}</AdminShell>;
}
