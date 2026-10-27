"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { SiteShell } from "@/components/site-shell";

type Member = {
  name: string;
  email: string;
  employeeId: string;
  isLeader: boolean;
};
type SuccessData = { teamName?: string; teamNumber?: number };

const blankMember = (): Member => ({
  name: "",
  email: "",
  employeeId: "",
  isLeader: false,
});

function validate(teamName: string, members: Member[]): string | null {
  if (!teamName.trim()) return "Give your team a name before continuing.";
  if (members.length < 1 || members.length > 4)
    return "A team must have between 1 and 4 members.";
  if (members.filter((member) => member.isLeader).length !== 1)
    return "Select exactly one team leader.";
  const emails = members.map((member) => member.email.trim().toLowerCase());
  if (emails.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))
    return "Enter a valid company email for every member.";
  if (new Set(emails).size !== emails.length)
    return "Each member must have a unique email address.";
  const employeeIds = members.map((member) =>
    member.employeeId.trim().toLowerCase(),
  );
  if (
    members.some((member) => !member.name.trim() || !member.employeeId.trim())
  )
    return "Complete every member field before submitting.";
  if (new Set(employeeIds).size !== employeeIds.length)
    return "Each member must have a unique employee ID.";
  return null;
}

export default function RegisterPage() {
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<Member[]>([blankMember()]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessData | null>(null);

  const updateMember = (index: number, patch: Partial<Member>) =>
    setMembers((current) =>
      current.map((member, i) =>
        i === index ? { ...member, ...patch } : member,
      ),
    );
  const addMember = () => {
    if (members.length < 4)
      setMembers((current) => [...current, blankMember()]);
  };
  const removeMember = (index: number) => {
    if (members.length > 1)
      setMembers((current) => current.filter((_, i) => i !== index));
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validate(teamName, members);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: teamName.trim(),
          members: members.map((member) => ({
            ...member,
            name: member.name.trim(),
            email: member.email.trim().toLowerCase(),
            employeeId: member.employeeId.trim(),
          })),
        }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: SuccessData;
      };
      if (!response.ok || !payload.success) {
        setError(
          payload.message ||
            "We could not register your team. Please try again.",
        );
        return;
      }
      setSuccess(payload.data || {});
    } catch {
      setError(
        "We could not reach the registration service. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell>
      <section className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pb-24 pt-40 sm:pt-48">
        <div className="ambient ambient-two" />
        <div className="relative z-10 max-w-3xl text-center">
          <p className="eyebrow">Team registration</p>
          <h1 className="mt-6 font-heading text-5xl font-semibold tracking-[-.04em] text-white sm:text-7xl">
            Bring your team together<span className="text-cyan-200">.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-400">
            Register a team of one to four employees. You can save your place in
            the flow, then return to the work that matters.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[.15em] text-cyan-100">
            ● 1–4 members per team
          </div>
        </div>
        {success ? (
          <div className="glass relative z-10 mt-14 w-full max-w-2xl rounded-3xl p-8 sm:p-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-200 text-2xl text-[#102331]">
              ✓
            </div>
            <p className="eyebrow mt-8">Registration confirmed</p>
            <h2 className="mt-3 font-heading text-3xl text-white">
              You&apos;re officially in.
            </h2>
            <p className="mt-4 leading-7 text-slate-400">
              Your team{" "}
              {success.teamName ? (
                <strong className="text-white">{success.teamName}</strong>
              ) : (
                "has"
              )}{" "}
              been registered successfully.
            </p>
            {success.teamNumber !== undefined && (
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[.2em] text-slate-500">
                  Your team number
                </p>
                <p className="mt-2 font-heading text-5xl text-cyan-200">
                  {success.teamNumber}
                </p>
              </div>
            )}
            <Link href="/" className="button-secondary mt-8">
              Back to home
            </Link>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="relative z-10 mt-14 w-full max-w-3xl"
          >
            <div className="glass rounded-3xl p-6 sm:p-10">
              <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <p className="eyebrow">01 / Team information</p>
                  <h2 className="mt-2 font-heading text-2xl text-white">
                    Start with the big picture.
                  </h2>
                </div>
                <span className="text-sm text-slate-500">
                  Required fields *
                </span>
              </div>
              <label
                className="mt-8 block text-sm font-medium text-slate-200"
                htmlFor="teamName"
              >
                Team name *
              </label>
              <input
                id="teamName"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                placeholder="e.g. Northstar"
                className="field mt-2"
              />
              <div className="mt-12 flex items-end justify-between border-b border-white/10 pb-6">
                <div>
                  <p className="eyebrow">02 / Team members</p>
                  <h2 className="mt-2 font-heading text-2xl text-white">
                    Who&apos;s building with you?
                  </h2>
                </div>
                <span className="text-sm text-slate-500">
                  {members.length} / 4
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {members.map((member, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/10 bg-[#0b1626]/70 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-heading text-lg text-white">
                        Member {index + 1}
                      </p>
                      {members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMember(index)}
                          className="text-xs text-slate-500 transition hover:text-rose-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <label className="text-sm text-slate-300">
                        Full name *
                        <input
                          value={member.name}
                          onChange={(event) =>
                            updateMember(index, { name: event.target.value })
                          }
                          className="field mt-2"
                          placeholder="Your full name"
                        />
                      </label>
                      <label className="text-sm text-slate-300">
                        Company email *
                        <input
                          type="email"
                          value={member.email}
                          onChange={(event) =>
                            updateMember(index, { email: event.target.value })
                          }
                          className="field mt-2"
                          placeholder="you@company.com"
                        />
                      </label>
                      <label className="text-sm text-slate-300">
                        Employee ID *
                        <input
                          value={member.employeeId}
                          onChange={(event) =>
                            updateMember(index, {
                              employeeId: event.target.value,
                            })
                          }
                          className="field mt-2"
                          placeholder="EMP001"
                        />
                      </label>
                      <label className="flex cursor-pointer items-center gap-3 self-end rounded-xl border border-white/10 p-3 text-sm text-slate-200">
                        <input
                          type="radio"
                          name="leader"
                          checked={member.isLeader}
                          onChange={() =>
                            setMembers((current) =>
                              current.map((item, i) => ({
                                ...item,
                                isLeader: i === index,
                              })),
                            )
                          }
                          className="h-4 w-4 accent-cyan-200"
                        />
                        Team leader
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              {members.length < 4 && (
                <button
                  type="button"
                  onClick={addMember}
                  className="button-secondary mt-5 w-full border-dashed"
                >
                  + Add team member
                </button>
              )}
              {error && (
                <div
                  role="alert"
                  className="mt-6 rounded-xl border border-rose-300/20 bg-rose-300/8 px-4 py-3 text-sm leading-6 text-rose-100"
                >
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="button-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Registering your team…" : "Submit registration"}
                <span className="ml-3">↗</span>
              </button>
              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                By submitting, you confirm that the information provided is
                accurate.
              </p>
            </div>
          </form>
        )}
      </section>
    </SiteShell>
  );
}
