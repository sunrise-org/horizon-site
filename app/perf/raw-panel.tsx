"use client";

import { useMemo, useState } from "react";
import type { HorizonPerf } from "@/lib/perf/generated/horizon_perf";
import { t } from "@/lib/perf/i18n";
import type { QueryRequest } from "@/lib/perf/types";
import { QUERY_FILE } from "./use-capture";
import type { LoadedCapture } from "./use-capture";
import styles from "./page.module.css";

interface Props {
  reader: HorizonPerf;
  capture: LoadedCapture;
}

const DEFAULT_REQUEST = `{
  "op": "hot",
  "filters": { "limit": 25 }
}`;

/** A query request as JSON and its reply as JSON: any number on screen can be checked here. */
export function RawPanel({ reader, capture }: Props) {
  const [request, setRequest] = useState(DEFAULT_REQUEST);
  const [submitted, setSubmitted] = useState(DEFAULT_REQUEST);
  const [revision, setRevision] = useState(0);
  const { reply, error } = useMemo(() => {
    try {
      const parsed = JSON.parse(submitted) as QueryRequest;
      parsed.file = QUERY_FILE;
      parsed.filters = { side: capture.side, ...parsed.filters };
      return { reply: JSON.stringify(reader.query(capture.handle, parsed), null, 2), error: null };
    } catch (failure) {
      return { reply: "", error: failure instanceof Error ? failure.message : String(failure) };
    }
  }, [submitted, revision, reader, capture.handle, capture.side]);

  const run = () => { setSubmitted(request); setRevision((value) => value + 1); };

  return (
    <div className={styles.raw}>
      <label className={styles.field}>
        <span>{t("raw.request")}</span>
        <textarea
          className={styles.textarea}
          value={request}
          spellCheck={false}
          onChange={(event) => setRequest(event.target.value)}
        />
      </label>
      <button type="button" className={styles.button} onClick={run}>
        {t("raw.run")}
      </button>
      {error ? <p className={styles.error}>{error}</p> : null}
      <label className={styles.field}>
        <span>{t("raw.reply")}</span>
        <pre className={styles.pre} aria-label={t("raw.reply")}>
          {reply}
        </pre>
      </label>
    </div>
  );
}
