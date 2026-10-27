import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { SectionHeading } from "@/components/section-heading";

const guidelines = [
  "Registration is team-based.",
  "Each team must have 1–4 members.",
  "Every member provides their full name, company email, and employee ID.",
  "Exactly one member must be designated as team leader.",
  "Company emails and employee IDs must be unique across registered teams.",
  "A team number is assigned automatically after successful registration.",
];
const process = [
  "Open the registration page.",
  "Enter the team name.",
  "Add 1–4 team members.",
  "Enter each member’s required information.",
  "Designate exactly one team leader.",
  "Submit and receive your team number.",
];
const faqs = [
  [
    "How many members can a team have?",
    "Each team can have between one and four members.",
  ],
  [
    "Can a team have more than one leader?",
    "No. Exactly one member must be designated as the team leader.",
  ],
  [
    "Can an employee join multiple teams?",
    "No. Company email addresses and employee IDs must be unique.",
  ],
  [
    "Can the same email or employee ID be registered twice?",
    "No. The backend prevents duplicate emails and employee IDs.",
  ],
  [
    "How do we know our registration was successful?",
    "You will see a confirmation with your automatically assigned team number.",
  ],
  [
    "When can we view results?",
    "Results become visible when the organizers publish them.",
  ],
];

export default function DetailsPage() {
  return (
    <SiteShell>
      <div className="ambient ambient-one" />
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-40 sm:pt-48">
        <p className="eyebrow">The event</p>
        <h1 className="mt-6 max-w-3xl font-heading text-5xl font-semibold tracking-[-.04em] text-white sm:text-7xl">
          Everything you need to know<span className="text-cyan-200">.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          A practical space to develop meaningful ideas, connect across teams,
          and explore what your collective thinking can make possible.
        </p>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-24 lg:grid-cols-[1.1fr_.9fr]">
        <div className="glass rounded-3xl p-7 sm:p-10">
          <SectionHeading
            eyebrow="01 / About"
            title="Ideas are better in motion."
          />
          <p className="mt-6 leading-7 text-slate-400">
            The hackathon is an invitation to look at meaningful challenges with
            fresh eyes. Bring your perspective, work alongside your team, and
            develop a practical solution that can move an idea forward.
          </p>
        </div>
        <div className="rounded-3xl border border-cyan-200/15 bg-cyan-200/[.06] p-7 sm:p-10">
          <p className="eyebrow">A useful constraint</p>
          <p className="mt-5 font-heading text-3xl leading-tight text-white">
            Small teams.
            <br />
            Big perspective.
          </p>
          <p className="mt-5 text-sm leading-6 text-slate-400">
            Build with focus, listen closely, and let every member bring
            something distinct to the table.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[.035] p-7 sm:p-10">
            <SectionHeading eyebrow="02 / Guidelines" title="The essentials." />
            <ul className="mt-7 space-y-4">
              {guidelines.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-6 text-slate-300"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-200" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[.035] p-7 sm:p-10">
            <SectionHeading
              eyebrow="03 / Registration"
              title="A simple path in."
            />
            <ol className="mt-7 space-y-4">
              {process.map((item, index) => (
                <li
                  key={item}
                  className="flex gap-4 text-sm leading-6 text-slate-300"
                >
                  <span className="font-heading text-cyan-200">
                    0{index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="glass rounded-3xl p-7 sm:p-10">
          <SectionHeading
            eyebrow="04 / Judging & results"
            title="Results, when they are ready."
            description="Teams may be evaluated across different judging rounds. Results are displayed only when organizers publish them, so you can focus on the work until then."
          />
          <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400">
            <strong className="text-white">Curio</strong> means a strong desire
            to know or learn something — the instinct behind every thoughtful
            idea.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <SectionHeading
          eyebrow="05 / FAQ"
          title="Good questions are part of the process."
        />{" "}
        <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-heading text-base text-white">
                <span>{question}</span>
                <span className="text-xl text-cyan-200 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="max-w-2xl pt-3 text-sm leading-6 text-slate-400">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-cyan-200/15 to-violet-300/10 p-8 sm:p-12">
          <h2 className="font-heading text-3xl text-white sm:text-5xl">
            Ready to bring your team together?
          </h2>
          <Link href="/register" className="button-primary mt-8">
            Register your team <span className="ml-3">↗</span>
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
