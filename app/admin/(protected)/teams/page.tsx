"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AdminError,
  AdminLoading,
  AdminShell,
  adminRequest,
} from "@/components/admin/admin-ui";

type Team = {
  id: string;
  teamNumber: number;
  name: string;
  createdAt: string;
  memberCount: number;
  members: { name: string; isLeader: boolean }[];
};
type Result = {
  teams: Team[];
  pagination: { page: number; totalPages: number; total: number };
};

export default function TeamsPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    adminRequest<{ data: Result }>(
      `/api/admin/teams?search=${encodeURIComponent(query)}&limit=20`,
    )
      .then((payload) => setResult(payload.data))
      .catch((reason: Error) => setError(reason.message));
  }, [query]);
  return (
    <AdminShell title="Teams">
      <div className="admin-card p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">Registration directory</p>
            <h2 className="mt-2 font-heading text-2xl font-semibold">
              Registered teams
            </h2>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setQuery(search);
            }}
            className="flex gap-2"
          >
            <input
              className="field min-w-0 sm:w-72"
              placeholder="Search teams or members"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button className="button-secondary" type="submit">
              Search
            </button>
          </form>
        </div>
        {error ? (
          <div className="mt-6">
            <AdminError message={error} />
          </div>
        ) : !result ? (
          <div className="mt-6">
            <AdminLoading />
          </div>
        ) : result.teams.length === 0 ? (
          <p className="mt-8 rounded-xl bg-black/5 p-6 text-center text-[#7B7B6A]">
            No teams match this search.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Members</th>
                  <th>Leader</th>
                  <th>Registered</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {result.teams.map((team) => (
                  <tr key={team.id}>
                    <td>
                      <span className="font-semibold">
                        #{team.teamNumber} {team.name}
                      </span>
                    </td>
                    <td>{team.memberCount}</td>
                    <td>
                      {team.members.find((member) => member.isLeader)?.name ||
                        "—"}
                    </td>
                    <td>{new Date(team.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link
                        className="text-sm font-semibold text-[#65734F]"
                        href={`/admin/teams/${team.id}`}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm text-[#7B7B6A]">
              {result.pagination.total} total teams
            </p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
