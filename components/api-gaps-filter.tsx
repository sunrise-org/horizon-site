"use client";

import { useRef, useState } from "react";
import type { Status } from "@/lib/api-gaps/types";

const FIELD = "rounded-lg border border-white/12 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus-visible:border-[#c4b5ff]/70";

// Hides rows and empty areas of the server-rendered list (#api-gaps-areas) by search text and status.
export function ApiGapsFilter({ statuses, total }: { statuses: readonly Status[]; total: number }) {
  const [shown, setShown] = useState(total);
  const search = useRef<HTMLInputElement>(null);
  const status = useRef<HTMLSelectElement>(null);

  function apply() {
    const terms = (search.current?.value ?? "").trim().toLowerCase().split(/\s+/).filter(Boolean);
    const wanted = status.current?.value ?? "";
    let count = 0;
    for (const area of document.querySelectorAll<HTMLElement>("#api-gaps-areas [data-area]")) {
      const rows = [...area.querySelectorAll<HTMLElement>("[data-row]")];
      const heading = (area.querySelector("h3")?.textContent ?? "").toLowerCase();
      let visible = 0;
      for (const row of rows) {
        const text = `${heading} ${row.textContent ?? ""}`.toLowerCase();
        row.hidden = (wanted !== "" && row.dataset.status !== wanted) || !terms.every((t) => text.includes(t));
        visible += Number(!row.hidden);
      }
      area.hidden = visible === 0;
      const line = area.querySelector<HTMLElement>("[data-count]");
      if (line) line.hidden = visible !== rows.length;
      count += visible;
    }
    setShown(count);
  }

  function reset() {
    if (search.current) search.current.value = "";
    if (status.current) status.current.value = "";
    apply();
    search.current?.focus();
  }

  return (
    <>
      <div className="sticky top-[4.5rem] z-10 mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-white/10 bg-[#171029]/90 p-3 backdrop-blur">
        <label className="flex min-w-0 flex-1 basis-56 items-center gap-2 text-sm text-white/60">
          <span className="sr-only sm:not-sr-only">Search</span>
          <input ref={search} type="search" onInput={apply} placeholder="Feature, file or issue" className={`${FIELD} min-w-0 flex-1`} />
        </label>
        <label className="flex items-center gap-2 text-sm text-white/60">
          Status
          <select ref={status} onChange={apply} className={FIELD}>
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <button type="button" onClick={reset} className={`${FIELD} cursor-pointer hover:border-white/30`}>
          Reset
        </button>
        <span aria-live="polite" className="ml-auto text-sm font-medium text-[#c4b5ff]">
          {shown} {shown === 1 ? "feature" : "features"}
        </span>
      </div>
      <p hidden={shown !== 0} className="mt-6 text-white/60">
        No features match these filters.
      </p>
    </>
  );
}
