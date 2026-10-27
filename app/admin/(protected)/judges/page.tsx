"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AdminError,
  AdminLoading,
  AdminShell,
  adminRequest,
  StatusBadge,
} from "@/components/admin/admin-ui";

type Judge = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
};
type JudgeData = { judges: Judge[]; pagination: { total: number } };

export default function JudgesPage() {
  const [data, setData] = useState<JudgeData | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ name: "", email: "" });
  const load = () =>
    adminRequest<{ data: JudgeData }>("/api/admin/judges")
      .then((payload) => setData(payload.data))
      .catch((reason: Error) => setError(reason.message));
  useEffect(() => {
    load();
  }, []);
  async function addJudge(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      await adminRequest("/api/admin/judges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ name: "", email: "" });
      setNotice("Judge added successfully.");
      load();
    } catch (reason) {
      setError((reason as Error).message);
    }
  }
  async function toggle(judge: Judge) {
    setError("");
    try {
      await adminRequest(`/api/admin/judges/${judge.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !judge.isActive }),
      });
      load();
    } catch (reason) {
      setError((reason as Error).message);
    }
  }
  return (
    <AdminShell title="Judges">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl border border-[#E4E9DE] bg-[#EDF3E9] px-5 py-4 text-sm leading-6 text-[#59664A]">
          Judges can sign in with their company email and receive a one-time
          verification code. New judges are assigned to the current teams
          automatically.
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(280px,.72fr)_minmax(0,1.28fr)]">
          <form onSubmit={addJudge} className="admin-card h-fit p-5 sm:p-6">
            <p className="eyebrow">Add judge</p>
            <h2 className="mt-2 break-words font-heading text-2xl font-semibold">
              Invite an evaluator.
            </h2>
            <div className="mt-6 space-y-4">
              <label className="block text-sm font-semibold">
                Name
                <input
                  required
                  className="field mt-2"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-semibold">
                Email
                <input
                  required
                  type="email"
                  className="field mt-2"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                />
              </label>
              <button className="button-primary w-full">Add judge</button>
              {notice && (
                <p
                  role="status"
                  className="rounded-xl bg-[#EAF3E6] p-3 text-sm leading-5 text-[#50754A]"
                >
                  {notice}
                </p>
              )}
              {error && <AdminError message={error} />}
            </div>
          </form>
          <div className="admin-card min-w-0 overflow-hidden p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Directory</p>
                <h2 className="mt-2 break-words font-heading text-2xl font-semibold">
                  Judges
                </h2>
              </div>
              {data && (
                <span className="shrink-0 rounded-full bg-[#F0F3EC] px-3 py-1.5 text-xs font-semibold text-[#65734F]">
                  {data.pagination.total} total
                </span>
              )}
            </div>
            {!data ? (
              <div className="mt-6">
                <AdminLoading />
              </div>
            ) : data.judges.length === 0 ? (
              <p className="mt-6 rounded-xl bg-black/5 p-6 text-center text-sm text-[#7B7B6A]">
                No judges have been added yet.
              </p>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {data.judges.map((judge) => (
                      <tr key={judge.id}>
                        <td className="whitespace-nowrap font-semibold">
                          {judge.name}
                        </td>
                        <td className="max-w-[220px] break-all">
                          {judge.email}
                        </td>
                        <td>
                          <StatusBadge active={judge.isActive}>
                            {judge.isActive ? "Active" : "Inactive"}
                          </StatusBadge>
                        </td>
                        <td className="whitespace-nowrap">
                          <button
                            className="text-sm font-semibold text-[#65734F] hover:underline"
                            onClick={() => toggle(judge)}
                          >
                            {judge.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
