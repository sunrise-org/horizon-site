"use client";

import { useState } from "react";
import type { HorizonPerf } from "@/lib/perf/generated/horizon_perf";
import { num } from "@/lib/perf/format";
import { t } from "@/lib/perf/i18n";
import type { GroupRow, HotRow, TreeRow } from "@/lib/perf/types";
import { useChanges } from "./comparison";
import { Delta, NewRows } from "./delta";
import { Icons } from "./icons";
import { RowTools } from "./row-tools";
import { Segmented } from "./segmented";
import { useRows } from "./use-capture";
import type { LoadedCapture } from "./use-capture";
import styles from "./page.module.css";

interface Props {
  reader: HorizonPerf;
  capture: LoadedCapture;
}

type SortKey = "self" | "total";
type Mode = "flat" | "mods";
type Direction = "down" | "up";

const CALLER_DEPTH = 3;
const CALLER_LIMIT = 20;

function CallerRows({ rows, depth, max }: { rows: readonly TreeRow[]; depth: number; max: number }) {
  return (
    <>
      {rows.map((row) => (
        <div key={row.id}>
          <div className={styles.meterRow} title={row.name}>
            <span className={styles.meterName} style={{ paddingLeft: depth * 14 }}>
              <span className={styles.nameText}>{row.name}</span>
              <RowTools id={row.function} name={row.name} />
            </span>
            <span className={styles.meterTrack} aria-hidden="true">
              <span className={styles.meterFill} style={{ width: `${(row.total / max) * 100}%` }} />
            </span>
            <span className={styles.meterValue}>{num(row.total, 2)} ms</span>
            <span className={styles.meterExtra}>{num(row.pct, 1)}%</span>
          </div>
          {row.children?.length ? <CallerRows rows={row.children} depth={depth + 1} max={max} /> : null}
        </div>
      ))}
    </>
  );
}

/** Who called a function, innermost first: the bottom-up reading of the flat list. */
function Callers({ reader, capture, id, max }: Props & { id: string; max: number }) {
  const { rows, error } = useRows<TreeRow>(
    reader,
    capture,
    "callers",
    { depth: CALLER_DEPTH, limit: CALLER_LIMIT },
    true,
    [id],
  );
  if (error) return <p className={styles.error}>{error}</p>;
  if (rows.length === 0) return <p className={styles.note}>{t("hot.noCallers")}</p>;
  return <CallerRows rows={rows} depth={2} max={max} />;
}

function largest(values: number[]): number {
  return values.reduce((a, b) => Math.max(a, b), 0) || 1;
}

export function HotPanel({ reader, capture }: Props) {
  const [sort, setSort] = useState<SortKey>("total");
  const [mode, setMode] = useState<Mode>("flat");
  const [direction, setDirection] = useState<Direction>("down");
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const meta = capture.meta.rows.find((row) => row.side === capture.side);
  const hasMods = meta?.mods.some((item) => item.kind === "native") ?? false;
  const view: Mode = hasMods ? mode : "flat";

  const { rows, error } = useRows<HotRow>(reader, capture, "hot", { limit: 250, by: sort });
  const compare = useChanges();
  const mods = useRows<GroupRow>(reader, capture, "group", { by: "mod", limit: 100 }, view === "mods");
  const max = largest(rows.map((row) => row[sort]));
  const modMax = largest(mods.rows.map((row) => row.value));

  const toggle = (id: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const problem = error ?? mods.error;
  if (problem) return <p className={styles.error}>{problem}</p>;
  if (rows.length === 0) return <p className={styles.empty}>{t("meta.empty")}</p>;
  return (
    <div>
      <div className={styles.toolbar}>
        {hasMods ? (
          <Segmented
            label={t("hot.view")}
            options={[
              { id: "flat", text: t("hot.flat") },
              { id: "mods", text: t("hot.mods") },
            ]}
            value={view}
            onChange={setMode}
          />
        ) : null}
        {view === "flat" ? (
          <Segmented
            label={t("hot.sort")}
            options={[
              { id: "total", text: t("hot.total") },
              { id: "self", text: t("hot.self") },
            ]}
            value={sort}
            onChange={setSort}
          />
        ) : null}
        {view === "flat" ? (
          <Segmented
            label={t("hot.direction")}
            options={[
              { id: "down", text: t("hot.topDown") },
              { id: "up", text: t("hot.bottomUp") },
            ]}
            value={direction}
            onChange={setDirection}
          />
        ) : null}
      </div>
      {view === "flat" && direction === "up" ? <p className={styles.cardNote}>{t("hot.bottomUpNote")}</p> : null}
      {view === "flat" ? (
        <>
        <div className={styles.meterList} data-delta={compare ? "last" : undefined}>
          <div className={styles.meterHead}>
            <span>{t("hot.function")}</span>
            <span />
            <span>{t("hot.self")}</span>
            <span>{t("hot.total")}</span>
            {compare ? <span>{t("compare.columnTotalChange")}</span> : null}
          </div>
          {rows.map((row) => (
            <div key={row.id}>
            <div className={styles.meterRow} title={row.full}>
              <span className={styles.meterName}>
                {direction === "up" ? (
                  <button
                    type="button"
                    className={styles.disclosure}
                    aria-expanded={open.has(row.id)}
                    aria-label={t("hot.expand", { name: row.name })}
                    onClick={() => toggle(row.id)}
                  >
                    {open.has(row.id) ? <Icons.chevronDown /> : <Icons.chevronRight />}
                  </button>
                ) : null}
                <span className={styles.nameText}>{row.name}</span>
                <RowTools id={row.id} name={row.name} />
              </span>
              <span className={styles.meterTrack} aria-hidden="true">
                <span className={styles.meterFill} style={{ width: `${(row[sort] / max) * 100}%` }} />
              </span>
              <span className={styles.meterValue}>{num(row.self, 2)} ms</span>
              <span className={styles.meterExtra}>{num(row.total, 2)} ms</span>
              {compare ? <Delta row={compare.changes.get(row.id)} /> : null}
            </div>
            {direction === "up" && open.has(row.id) ? (
              <Callers reader={reader} capture={capture} id={row.id} max={max} />
            ) : null}
            </div>
          ))}
        </div>
        {compare ? <NewRows rows={compare.rows} prefix="f:" shown={new Set(rows.map((row) => row.id))} /> : null}
        </>
      ) : (
        <div className={styles.meterList}>
          {mods.rows.map((row) => {
            const label = row.key === null ? t("hot.game") : row.label;
            return (
              <div key={row.key ?? ""} className={styles.meterRow} title={label}>
                <span className={styles.meterName}>
                  <span className={styles.nameText}>{label}</span>
                  <RowTools id={row.key} name={label} />
                </span>
                <span className={styles.meterTrack} aria-hidden="true">
                  <span className={styles.meterFill} style={{ width: `${(row.value / modMax) * 100}%` }} />
                </span>
                <span className={styles.meterValue}>{num(row.value, 2)} ms</span>
                <span className={styles.meterExtra}>{num(row.pct, 1)}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
