import { ApiGapsEvidence } from "@/components/api-gaps-evidence";
import { ApiGapsFilter } from "@/components/api-gaps-filter";
import { Ext, RichText } from "@/components/api-gaps-rich";
import { Synced } from "@/components/api-gaps-synced";
import { TeamPullsSection } from "@/components/api-gaps-team-prs";
import type { TeamPulls } from "@/lib/api-gaps/team-prs-parse";
import { TEAM_QUERY } from "@/lib/api-gaps/team-prs";
import { curated } from "@/lib/api-gaps/capabilities";
import { drifted, driftOf } from "@/lib/api-gaps/drift";
import external from "@/lib/api-gaps/external.json";
import { LIVE_GROUPS, summarize } from "@/lib/api-gaps/groups";
import { BOARD_URL, blobUrl, commitUrl, refUrl, shortCommit, sourceLabel } from "@/lib/api-gaps/links";
import { countByStatus, countLine, STATUSES } from "@/lib/api-gaps/status";
import type { Capability, EvidenceGroup, EvidenceSummary, LiveEvidence, RefBaseline, RefState, Status, Sync } from "@/lib/api-gaps/types";

const BADGE: Record<Status, string> = { Covered: "ag-covered", Partial: "ag-partial", Missing: "ag-missing", "Not applicable": "ag-na" };
const BAR: Record<Status, string> = {
  Covered: "bg-emerald-400",
  Partial: "bg-amber-400",
  Missing: "bg-rose-400",
  "Not applicable": "bg-white/35",
};
const CARD = "rounded-2xl border border-white/10 bg-white/[0.035]";
const H2 = "font-display text-[1.6rem] leading-tight font-semibold tracking-[-0.02em] text-white";

const dayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const reviewedOn = dayFormat.format(new Date(`${curated.reviewed.date}T00:00:00Z`));

function Badge({ status }: { status: Status }) {
  return <span className={`ag-badge ${BADGE[status]}`}>{status}</span>;
}

function Chevron() {
  return (
    <span aria-hidden className="ag-chev">
      ›
    </span>
  );
}

function RefChip({ base, live }: { base: RefBaseline; live: RefState | undefined }) {
  const state = live?.state ?? base.state;
  const tone = state === "open" ? "text-emerald-200" : state === "merged" ? "text-[#c4b5ff]" : "text-white/55";
  const holder = live ? (live.assignees.length ? `assigned to ${live.assignees.join(", ")}` : base.claim) : base.claim;
  return (
    <span className="ag-chip">
      <a href={refUrl(base.number)} title={live?.title} className="ag-link">
        {live?.kind === "pr" ? "PR " : ""}#{base.number}
      </a>
      <span className={tone}>{state}</span>
      {holder ? <span className="text-white/55">{holder}</span> : null}
    </span>
  );
}

function CapabilityRow({ capability, sync, missing, refs }: { capability: Capability; sync: Sync; missing: ReadonlySet<string>; refs: ReadonlyMap<number, RefState> }) {
  const drift = driftOf(capability, missing, refs);
  const reasons = [...drift.missing.map((p) => `${sourceLabel(p)} is no longer on main`), ...drift.changed.map((r) => `#${r.number} is now ${r.state}`)];
  const commit = sync.commit || curated.reviewed.commit;
  return (
    <article data-row data-status={capability.status} className="ag-row">
      <div>
        <h4 className="ag-title">{capability.title}</h4>
        <p className="ag-note">{capability.note}</p>
      </div>
      <div className="ag-tags">
        {drifted(drift) ? (
          <span title={reasons.join("; ")} className="inline-flex items-center rounded-md bg-amber-300/10 px-2 py-0.5 text-xs font-medium text-amber-200 ring-1 ring-amber-300/30 ring-inset">
            Status may have changed
          </span>
        ) : null}
        <Badge status={capability.status} />
      </div>
      {capability.refs.length ? (
        <div className="ag-wide flex flex-wrap gap-2">
          {capability.refs.map((ref) => (
            <RefChip key={ref.number} base={ref} live={refs.get(ref.number)} />
          ))}
        </div>
      ) : null}
      {reasons.length ? <p className="ag-wide text-sm text-amber-200/80">{reasons.join(". ")}.</p> : null}
      <details className="group ag-more">
        <summary className="ag-sum text-[#c4b5ff]">
          <Chevron />
          Sources and counterpart
        </summary>
        <ul className="ag-list">
          {capability.sources.map((path) => (
            <li key={path}>
              {missing.has(path) ? (
                <span className="font-mono text-[13px] text-amber-200/90" title={path}>
                  <s>{sourceLabel(path)}</s> (not on main)
                </span>
              ) : (
                <a href={blobUrl(commit, path)} className="ag-src">
                  {sourceLabel(path)}
                </a>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-2 space-y-1">
          {capability.counterpart.map((line, i) => (
            <p key={i}>
              <RichText rich={line} />
            </p>
          ))}
        </div>
      </details>
    </article>
  );
}

function summaryOf(group: EvidenceGroup): EvidenceSummary {
  if (group.kind === "topics") return { name: group.name, detail: `${group.items.length} topics` };
  if (group.kind === "changelog") return { name: group.name, detail: `${group.sections.reduce((n, s) => n + s.entries.length, 0)} entries` };
  return summarize(group);
}

export function ApiGapsView({ sync, evidence, teamPulls }: { sync: Sync; evidence: LiveEvidence; teamPulls: TeamPulls | null }) {
  const counts = countByStatus(curated.capabilities);
  const total = curated.capabilities.length;
  const refs = new Map(sync.refs.map((r) => [r.number, r]));
  const missing = new Set(sync.missing);
  const live = new Map(evidence.groups.map((g) => [g.name, g]));
  const groups = [
    ...LIVE_GROUPS.map((name) => {
      const group = live.get(name);
      return { ...(group ? summarize(group) : { name, detail: "" }), source: "live" as const };
    }),
    ...(external.groups as EvidenceGroup[]).map((g) => ({ ...summaryOf(g), source: "external" as const })),
  ];
  const stale = sync.commit !== "" && !sync.fresh;

  return (
    <main>
      <article className="mx-auto w-full max-w-5xl px-6 pt-32 pb-20 text-[16px] leading-relaxed text-pretty text-white/70 sm:pt-40 sm:pb-28 lg:px-10">
        <p className="text-sm font-medium text-white/60">{curated.eyebrow}</p>
        <h1 className="mt-4 font-display text-[clamp(2.25rem,6vw,4rem)] leading-[1.04] font-semibold tracking-[-0.035em] text-white">{curated.title}</h1>
        <p className="mt-6 max-w-3xl text-lg text-white/70">{curated.lede}</p>
        <p className="mt-5 text-sm text-white/55">
          Statuses reviewed {reviewedOn} against <Ext href={commitUrl(curated.reviewed.commit)}>{shortCommit(curated.reviewed.commit)}</Ext>
          {" · "}
          {sync.commit ? (
            <>
              Horizon main <Ext href={commitUrl(sync.commit)}>{shortCommit(sync.commit)}</Ext>, synced <Synced iso={sync.syncedAt} />
              {stale ? " (GitHub could not be reached just now)" : sync.refsFresh ? "" : " (issue and pull request states are as reviewed: GitHub would not list them just now)"}
            </>
          ) : (
            "GitHub could not be reached just now, so nothing is synced from main"
          )}
          {" · "}
          {curated.docs}
        </p>

        <aside className="mt-8 flex flex-col gap-4 rounded-2xl border border-[#c4b5ff]/30 bg-[#c4b5ff]/[0.08] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="text-lg font-medium text-white">Want to help? Pick something from the project board and open a PR.</p>
          <a
            href={BOARD_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#171029] transition-colors hover:bg-[#e9e3ff]"
          >
            Open the project board<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </aside>

        <TeamPullsSection data={teamPulls} query={TEAM_QUERY} />

        <section aria-labelledby="summary" className="mt-12">
          <h2 id="summary" className="sr-only">
            Summary
          </h2>
          <div role="img" aria-label={STATUSES.map((s) => `${counts[s]} ${s.toLowerCase()}`).join(", ")} className="flex h-3 overflow-hidden rounded-full bg-white/10">
            {STATUSES.filter((s) => counts[s] > 0).map((s) => (
              <span key={s} className={BAR[s]} style={{ width: `${(counts[s] / total) * 100}%` }} />
            ))}
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATUSES.map((s) => (
              <div key={s} className={`${CARD} px-4 py-3`}>
                <dt className="flex items-center gap-2 text-sm text-white/60">
                  <span aria-hidden className={`size-2.5 rounded-full ${BAR[s]}`} />
                  {s}
                </dt>
                <dd className="mt-1 font-display text-3xl font-semibold text-white">{counts[s]}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {curated.hub.map((link) => (
              <li key={link.href}>
                <Ext href={link.href}>{link.text}</Ext>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="claimable" className="mt-14">
          <h2 id="claimable" className={H2}>
            Claimable now
          </h2>
          <p className="mt-3 max-w-3xl">
            <RichText rich={curated.claimable.intro} />
          </p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {curated.claimable.items.map((item) => {
              const live = refs.get(item.number);
              const open = (live?.state ?? "open") === "open";
              const taken = (live?.assignees.length ?? 0) > 0;
              return (
                <li key={item.number} className={`${CARD} p-5`}>
                  <Ext href={refUrl(item.number)} className="font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
                    #{item.number} {live?.title ?? item.title}
                  </Ext>
                  <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    <span className={open ? "text-emerald-200" : "text-amber-200"}>{live?.state ?? "open"}</span>
                    <span className={taken ? "text-amber-200" : "text-white/50"}>{taken ? `assigned to ${live?.assignees.join(", ")}` : "no assignee"}</span>
                    {!open || taken ? <span className="text-amber-200">Status may have changed: check before claiming</span> : null}
                  </p>
                  <p className="mt-3 text-[15px]">
                    <RichText rich={item.note} />
                  </p>
                </li>
              );
            })}
          </ul>
          <details className={`group mt-4 ${CARD} px-5 py-3`}>
            <summary className="ag-sum text-[15px] font-medium text-white">
              <Chevron />
              Other issues and claim history
            </summary>
            <div className="mt-3 space-y-3 text-[15px]">
              {curated.claimable.more.map((rich, i) => (
                <p key={i}>
                  <RichText rich={rich} />
                </p>
              ))}
            </div>
          </details>
        </section>

        <section aria-labelledby="comparison" className="mt-14 scroll-mt-24">
          <h2 id="comparison" className={H2}>
            Capability comparison
          </h2>
          <p className="mt-3 max-w-3xl">
            <RichText rich={curated.comparison.intro} />
          </p>
          <details className={`group mt-5 ${CARD} px-5 py-3`}>
            <summary className="ag-sum text-[15px] font-medium text-white">
              <Chevron />
              Jump to an area
            </summary>
            <nav aria-label="Capability areas" className="mt-3 flex flex-wrap gap-2">
              {curated.areas.map((area) => (
                <a key={area.id} href={`#${area.id}`} className="rounded-md border border-white/12 px-2.5 py-1 text-sm text-white/75 transition-colors hover:border-[#c4b5ff]/60 hover:text-white">
                  {area.name}
                </a>
              ))}
            </nav>
          </details>

          <ApiGapsFilter statuses={STATUSES} total={total} />

          <div id="api-gaps-areas" className="mt-8 space-y-8">
            {curated.areas.map((area) => {
              const rows = curated.capabilities.filter((c) => c.area === area.id);
              return (
                <section key={area.id} data-area id={area.id} aria-labelledby={`${area.id}-name`} className="scroll-mt-40">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-1">
                    <h3 id={`${area.id}-name`} className="font-display text-xl font-semibold text-white">
                      {area.name}
                    </h3>
                    <p data-count className="text-sm text-white/50">
                      {countLine(rows)}
                    </p>
                  </div>
                  <div className={`${CARD} mt-3 overflow-hidden`}>
                    {rows.map((capability) => (
                      <CapabilityRow key={capability.title} capability={capability} sync={sync} missing={missing} refs={refs} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="evidence" className="mt-16 scroll-mt-24">
          <h2 id="evidence" className={H2}>
            Evidence inventory
          </h2>
          <p className="mt-3 max-w-3xl">
            Read from {sync.commit ? <Ext href={commitUrl(sync.commit)}>main at {shortCommit(sync.commit)}</Ext> : "main"} when a group is opened, with links to the exact lines.
          </p>
          <ApiGapsEvidence groups={groups} />
        </section>

        <p className="mt-14 max-w-3xl text-sm text-white/55">
          <RichText rich={curated.foot} />
        </p>
      </article>
    </main>
  );
}
