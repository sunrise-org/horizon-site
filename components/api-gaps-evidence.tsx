"use client";

import { useRef, useState } from "react";
import { blobUrl, sourceLabel } from "@/lib/api-gaps/links";
import { Ext, LINK, RichText } from "@/components/api-gaps-rich";
import type { EvidenceGroup, EvidenceSummary, LiveEvidence } from "@/lib/api-gaps/types";

type Loaded = { groups: Map<string, EvidenceGroup>; commit: string; fresh: boolean };
type Entry = { state: "loading" } | { state: "error" } | { state: "ready"; group: EvidenceGroup; commit: string; fresh: boolean };

// Both sources load on first use: the live groups from the server, the NeoForge reference as a code-split chunk.
async function loadLive(): Promise<Loaded> {
  const res = await fetch("/api-gaps/evidence.json");
  if (!res.ok) throw new Error(`evidence answered ${res.status}`);
  const body = (await res.json()) as LiveEvidence;
  return { groups: new Map(body.groups.map((g) => [g.name, g])), commit: body.commit, fresh: body.fresh };
}

async function loadExternal(): Promise<Loaded> {
  const body = (await import("@/lib/api-gaps/external.json")).default as { groups: EvidenceGroup[] };
  return { groups: new Map(body.groups.map((g) => [g.name, g])), commit: "", fresh: true };
}

function GroupBody({ group, commit }: { group: EvidenceGroup; commit: string }) {
  if (group.kind === "symbols") {
    return (
      <div className="space-y-4">
        {group.files.map((file) => {
          const noted = file.symbols.some((s) => s.note);
          return (
            <div key={file.path}>
              <Ext href={blobUrl(commit, file.path)} title={file.path}>
                <span className="font-mono text-[13px]">{sourceLabel(file.path)}</span>
              </Ext>
              <ul className={noted ? "mt-1 space-y-0.5 font-mono text-[12px]" : "mt-1 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[12px]"}>
                {file.symbols.map((s) => (
                  <li key={`${s.name}:${s.line}`}>
                    <Ext href={blobUrl(commit, file.path, s.line)}>{s.name}</Ext>
                    {s.note ? <span className="text-white/45"> · {s.note}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    );
  }
  if (group.kind === "docs") {
    return (
      <ul className="space-y-1 text-[13px]">
        {group.files.map((file) => (
          <li key={file.path}>
            <Ext href={blobUrl(commit, file.path)} title={file.path}>
              <span className="font-mono">{sourceLabel(file.path)}</span>
            </Ext>
            {file.title ? <span className="text-white/55"> · {file.title}</span> : null}
          </li>
        ))}
      </ul>
    );
  }
  if (group.kind === "topics") {
    return (
      <ul className="space-y-2 text-[13px]">
        {group.items.map((item) => (
          <li key={item.link.href}>
            <Ext href={item.link.href}>{item.link.text}</Ext>
            {item.headings.length ? <span className="text-white/55"> · {item.headings.join(" / ")}</span> : null}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="space-y-4 text-[13px]">
      <p>
        <RichText rich={group.intro} />
      </p>
      {group.sections.map((section) => (
        <div key={section.name}>
          <h4 className="font-medium text-white/85">
            {section.name} <span className="text-white/45">· {section.entries.length}</span>
          </h4>
          <p className="mt-1 text-white/60">
            {section.entries.map((entry, i) => (
              <span key={entry.version}>
                {i > 0 ? " · " : ""}
                {entry.version}
                {entry.prs.map((pr) => (
                  <span key={pr.href}>
                    {" "}
                    <Ext href={pr.href}>{pr.text}</Ext>
                  </span>
                ))}
              </span>
            ))}
          </p>
        </div>
      ))}
    </div>
  );
}

// The inventory's headings come with the page; a group's contents are read when it is first opened.
export function ApiGapsEvidence({ groups }: { groups: Array<EvidenceSummary & { source: "live" | "external" }> }) {
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const loads = useRef<{ live?: Promise<Loaded>; external?: Promise<Loaded> }>({});

  function open(group: EvidenceSummary & { source: "live" | "external" }) {
    if (entries[group.name]?.state === "ready" || entries[group.name]?.state === "loading") return;
    setEntries((e) => ({ ...e, [group.name]: { state: "loading" } }));
    loads.current[group.source] ??= group.source === "live" ? loadLive() : loadExternal();
    loads.current[group.source]!
      .then(({ groups: byName, commit, fresh }) => {
        const found = byName.get(group.name);
        if (!found) throw new Error(`no group ${group.name}`);
        setEntries((e) => ({ ...e, [group.name]: { state: "ready", group: found, commit, fresh } }));
      })
      .catch(() => {
        loads.current[group.source] = undefined;
        setEntries((e) => ({ ...e, [group.name]: { state: "error" } }));
      });
  }

  return (
    <div className="mt-6 space-y-3">
      {groups.map((group) => {
        const entry = entries[group.name];
        return (
          <details
            key={group.name}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] open:bg-white/[0.045]"
            onToggle={(event) => {
              if (event.currentTarget.open) open(group);
            }}
          >
            <summary className="cursor-pointer list-none px-5 py-4 text-[15px] font-medium text-white marker:hidden [&::-webkit-details-marker]:hidden">
              <span aria-hidden className="mr-2 inline-block text-white/40 transition-transform group-open:rotate-90">
                ›
              </span>
              {group.name}
              {group.detail ? <span className="font-normal text-white/50"> · {group.detail}</span> : null}
            </summary>
            <div className="border-t border-white/10 px-5 py-4">
              {entry?.state === "ready" ? (
                <>
                  {entry.fresh ? null : <p className="mb-3 text-sm text-amber-200/80">GitHub could not be reached just now; this is the last inventory that was read.</p>}
                  <GroupBody group={entry.group} commit={entry.commit} />
                </>
              ) : entry?.state === "error" ? (
                <p className="text-sm text-white/65">
                  The inventory did not load.{" "}
                  <button type="button" className={`${LINK} cursor-pointer`} onClick={() => open(group)}>
                    Try again
                  </button>
                </p>
              ) : (
                <p className="text-sm text-white/55" aria-live="polite">
                  Loading…
                </p>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}
