"use client";

import { useMemo, useState } from "react";
import type { HorizonPerf } from "@/lib/perf/generated/horizon_perf";
import { at, num } from "@/lib/perf/format";
import { t } from "@/lib/perf/i18n";
import { spanId } from "@/lib/perf/info";
import { culprits, stepLines, tickFlame, usualTimes } from "@/lib/perf/slow-analysis";
import type { SpanRow, TickRow } from "@/lib/perf/types";
import { FlameGraph } from "./flame-graph";
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

/** Spans shorter than this are noise in a tick's tree. */
const VISIBLE_MS = 0.005;

/** A server tick over 50 ms misses the 20 ticks per second budget; the same line marks a frame under 20 FPS. */
const OVER_MS = 50;

/** Enough to reach past the pre-capture ring, whose unrecorded frames are left out of the list. */
const ALL_KEPT = 1000;

const LISTED = 30;

const CULPRITS = 6;

/** A step this far over its usual time is worth colouring. */
const OVER_USUAL_MS = 1;

function visibleSpans(tick: TickRow) {
  return tick.spans.filter(([, , wall]) => wall >= VISIBLE_MS);
}

function SlowTickLine({ tick, worst, opens }: { tick: TickRow; worst: number; opens: boolean }) {
  return (
    <>
      <span className={styles.tickMs} data-over={tick.wall_ms > OVER_MS}>
        {num(tick.wall_ms, 1)} ms
      </span>
      <span className={styles.tickAt}>
        {tick.before_capture ? t("ticks.before") : t("summary.at", { time: at(tick.t) })}
      </span>
      <span className={styles.meterTrack} aria-hidden="true">
        <span className={styles.meterFill} style={{ width: `${(tick.wall_ms / worst) * 100}%` }} />
      </span>
      <span className={styles.tickChevron} aria-hidden="true">
        {opens ? <Icons.chevronDown /> : null}
      </span>
    </>
  );
}

const NO_MODS: ReadonlySet<string> = new Set();

function signed(value: number): string {
  if (Math.abs(value) < 0.005) return "0.00 ms";
  return `${value > 0 ? "+" : ""}${num(value, 2)} ms`;
}

function SlowTickSteps({ tick, usual }: { tick: TickRow; usual: ReadonlyMap<string, number> }) {
  const lines = stepLines(tick, usual).filter((line) => line.wall >= VISIBLE_MS);
  return (
    <>
      <div className={styles.tickSpan} aria-hidden="true">
        <span className={styles.tickSpanName}>{t("spans.name")}</span>
        <span className={styles.tickSpanMs}>{t("ticks.wall")}</span>
        <span className={styles.tickSpanMs}>{t("ticks.usual")}</span>
        <span className={styles.tickSpanMs}>{t("ticks.extra")}</span>
        <span className={styles.tickSpanMs}>{t("ticks.cpu")}</span>
      </div>
      {lines.map((line, index) => (
        <div key={`${line.name}-${index}`} className={styles.tickSpan}>
          <span className={styles.tickSpanName} style={{ paddingLeft: line.depth * 12 }}>
            <span className={styles.nameText}>{line.name}</span>
            <RowTools id={spanId(line.name)} name={line.name} />
          </span>
          <span className={styles.tickSpanMs}>{num(line.wall, 2)} ms</span>
          <span className={styles.tickSpanMs}>{line.usual === null ? "—" : `${num(line.usual, 2)} ms`}</span>
          <span className={styles.tickSpanMs} data-over={line.extra !== null && line.extra >= OVER_USUAL_MS}>
            {line.extra === null ? "—" : signed(line.extra)}
          </span>
          <span className={styles.tickSpanMs}>{num(line.cpu, 2)} ms</span>
        </div>
      ))}
    </>
  );
}

function SlowTick({ tick, worst, usual }: { tick: TickRow; worst: number; usual: ReadonlyMap<string, number> }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"steps" | "flame">("steps");
  const opens = visibleSpans(tick).length > 0;
  return (
    <div className={styles.tickRow}>
      {!opens ? (
        <div className={styles.tickHead} data-static="true">
          <SlowTickLine tick={tick} worst={worst} opens={false} />
        </div>
      ) : (
        <details className={styles.tick} onToggle={(event) => setOpen(event.currentTarget.open)}>
          <summary className={styles.tickHead}>
            <SlowTickLine tick={tick} worst={worst} opens />
          </summary>
          {open ? (
            <div className={styles.tickBody}>
              <div className={styles.tickBodyBar}>
                <Segmented
                  label={t("ticks.view")}
                  options={[
                    { id: "steps", text: t("ticks.viewSteps") },
                    { id: "flame", text: t("ticks.viewFlame") },
                  ]}
                  value={view}
                  onChange={setView}
                />
              </div>
              {view === "steps" ? (
                <SlowTickSteps tick={tick} usual={usual} />
              ) : (
                <FlameGraph rows={tickFlame(tick)} mods={NO_MODS} kind="time" query="" />
              )}
            </div>
          ) : null}
        </details>
      )}
      <span className={styles.tickTools}>
        <RowTools id={tick.id} name={at(tick.t)} />
      </span>
    </div>
  );
}

function Culprits({ ticks, usual, frames }: { ticks: readonly TickRow[]; usual: ReadonlyMap<string, number>; frames: boolean }) {
  const found = culprits(ticks, usual, CULPRITS);
  if (found.length === 0) return null;
  const most = found[0].extra || 1;
  return (
    <section>
      <h3 className={styles.cardTitle}>{t("ticks.culprits")}</h3>
      <p className={styles.cardNote}>{t(frames ? "ticks.culpritsNoteFrames" : "ticks.culpritsNoteTicks")}</p>
      <div className={styles.meterList}>
        <div className={styles.meterHead}>
          <span>{t("spans.name")}</span>
          <span />
          <span>{t("ticks.extra")}</span>
          <span>{t("ticks.largestIn")}</span>
        </div>
        {found.map((culprit) => (
          <div key={`${culprit.parent}>${culprit.name}`} className={styles.meterRow}>
            <span className={styles.meterName}>
              <span className={styles.nameText}>{culprit.name}</span>
              <RowTools id={spanId(culprit.name)} name={culprit.name} />
            </span>
            <span className={styles.meterTrack} aria-hidden="true">
              <span className={styles.meterFill} data-tone="warn" style={{ width: `${(culprit.extra / most) * 100}%` }} />
            </span>
            <span className={styles.meterValue}>{signed(culprit.extra)}</span>
            <span className={styles.meterExtra}>
              {t("ticks.largestInValue", { count: culprit.largestIn, total: ticks.length })}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** The slowest ticks (or frames) the capture kept, each opening into the spans that made it slow. */
export function TicksPanel({ reader, capture }: Props) {
  const { rows, error } = useRows<TickRow>(reader, capture, "ticks", { worst: ALL_KEPT });
  const average = useRows<SpanRow>(reader, capture, "spans", { limit: 400 });
  const usual = useMemo(() => usualTimes(average.rows), [average.rows]);

  if (error) return <p className={styles.error}>{error}</p>;
  const unrecorded = rows.filter((tick) => tick.before_capture && visibleSpans(tick).length === 0);
  const shown = rows.filter((tick) => !unrecorded.includes(tick)).slice(0, LISTED);
  const frames = capture.side === "client";
  const skipped = unrecorded.length > 0 ? (
    <p className={styles.cardNote}>
      {t(frames ? "ticks.skippedFrames" : "ticks.skippedTicks", { count: unrecorded.length })}
    </p>
  ) : null;
  if (shown.length === 0) {
    return skipped ?? <p className={styles.empty}>{t("meta.empty")}</p>;
  }
  const worst = shown[0].wall_ms || 1;
  const opens = shown.some((tick) => visibleSpans(tick).length > 0);
  const note = frames ? (opens ? "ticks.noteFrames" : "ticks.noteFramesPlain") : "ticks.note";
  return (
    <div className={styles.summary}>
      <header>
        <h3 className={styles.cardTitle}>
          {t(frames ? "ticks.headingFrames" : "ticks.headingTicks", { count: shown.length })}
        </h3>
        <p className={styles.cardNote}>{t(note)}</p>
        {skipped}
      </header>
      <Culprits ticks={shown.filter((tick) => visibleSpans(tick).length > 0)} usual={usual} frames={frames} />
      <div className={styles.ticks}>
        {shown.map((tick) => (
          <SlowTick key={tick.id} tick={tick} worst={worst} usual={usual} />
        ))}
      </div>
    </div>
  );
}
