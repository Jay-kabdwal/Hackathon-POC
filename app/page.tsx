import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { SectionHeading } from "@/components/section-heading";

const glance = [
  ["01", "Team size", "1–4 members"],
  ["02", "Registration", "Team-based"],
  ["03", "Participants", "Company employees"],
  ["04", "Judging", "Multiple rounds"],
];
const steps = [
  [
    "01",
    "Register your team",
    "Bring together the people who will shape the idea.",
  ],
  [
    "02",
    "Develop your solution",
    "Explore the problem and turn your thinking into something real.",
  ],
  [
    "03",
    "Present your idea",
    "Give your team’s perspective a clear, compelling voice.",
  ],
  [
    "04",
    "Get evaluated",
    "Follow the journey and view results when organizers publish them.",
  ],
];

export default function Home() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden px-6 pb-24 pt-40 sm:pt-48">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative z-10">
            <p className="eyebrow">A corporate hackathon</p>
            <h1 className="mt-6 max-w-3xl font-heading text-5xl font-semibold leading-[1.02] tracking-[-.05em] text-white sm:text-7xl lg:text-8xl">
              Follow your curiosity<span className="text-cyan-200">.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400 sm:text-xl">
              Curio is a space to ask better questions, build with your team,
              and turn a strong desire to learn into something useful.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="button-primary">
                Register your team <span className="ml-3">↗</span>
              </Link>
              <Link href="/details" className="button-secondary">
                Explore the hackathon
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              Teams can be made up of 1–4 members.
            </p>
          </div>
          <div
            className="hero-stage group relative mx-auto h-[330px] w-full max-w-[460px]"
            tabIndex={0}
            aria-label="Interactive Curio cube illustration"
          >
            <div className="absolute inset-8 rounded-[42%] border border-cyan-200/20 bg-gradient-to-br from-cyan-200/15 via-transparent to-violet-300/15 blur-[1px] rotate-12 transition-transform duration-700 group-hover:scale-110" />
            <div className="hero-object absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2rem] border border-cyan-100/70 bg-cyan-200/10 shadow-[0_0_80px_rgba(163,177,138,.35)] transition-all duration-700 group-hover:scale-110 group-hover:rotate-[55deg] group-focus:scale-110 group-focus:rotate-[55deg]" />
            <div className="absolute left-[22%] top-[25%] h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_24px_#8ee8e5] transition-transform duration-700 group-hover:scale-150" />
            <div className="absolute right-[17%] top-[37%] h-2.5 w-2.5 rounded-full bg-violet-200 shadow-[0_0_20px_#c4b5fd] transition-transform duration-700 group-hover:-translate-y-2" />
            <div className="absolute bottom-[23%] left-[28%] h-2.5 w-2.5 rounded-full bg-cyan-200 shadow-[0_0_20px_#8ee8e5] transition-transform duration-700 group-hover:translate-y-2" />
            <svg
              className="absolute inset-0 h-full w-full opacity-40"
              viewBox="0 0 500 300"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M111 104L226 150 412 112M226 150L150 245"
                stroke="#9de7e2"
                strokeDasharray="4 9"
              />
              <circle
                cx="226"
                cy="150"
                r="52"
                stroke="#c4b5fd"
                strokeDasharray="2 12"
              />
            </svg>
            <div className="absolute bottom-4 right-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-xl transition-transform duration-500 group-hover:-translate-y-2">
              <p className="text-[10px] uppercase tracking-[.2em] text-slate-500">
                Curio / 01
              </p>
              <p className="mt-1 font-heading text-sm text-white">
                Ideas in motion
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-white/8 bg-white/[.025] px-6 py-10">
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {glance.map(([number, label, value]) => (
            <div key={number} className="flex items-start gap-4">
              <span className="font-heading text-sm text-cyan-200/70">
                {number}
              </span>
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 font-heading text-lg text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <SectionHeading
          eyebrow="The process"
          title="From first thought to real momentum."
          description="A clear path for teams to move with intention, build together, and make their ideas count."
        />
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
          {steps.map(([number, title, text]) => (
            <div key={number} className="bg-[#0d1829] p-6 sm:p-7">
              <span className="font-heading text-sm text-cyan-200">
                {number}
              </span>
              <h3 className="mt-12 font-heading text-xl text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="glass grid gap-8 rounded-3xl p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow">Make it matter</p>
            <h2 className="mt-4 max-w-xl font-heading text-3xl font-semibold text-white sm:text-5xl">
              Your next big idea starts here.
            </h2>
          </div>
          <Link href="/register" className="button-primary">
            Register your team <span className="ml-3">↗</span>
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
