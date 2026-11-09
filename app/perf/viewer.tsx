"use client";

import { useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import { t } from "@/lib/perf/i18n";
import { fileFromLink, sharedFile } from "@/lib/perf/share-client";
import { CaptureView } from "./capture-view";
import { Landing } from "./landing";
import { useReader } from "./use-capture";
import styles from "./page.module.css";

export default function PerfViewer({ captureId }: { captureId?: string }) {
  const { reader, readerError, capture, error, open, close, showSide } = useReader();
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    if (!captureId || !reader) return;
    const controller = new AbortController();
    void sharedFile(captureId, controller.signal)
      .then((file) => { if (!controller.signal.aborted) return open(file, file.name); })
      .catch((failure: unknown) => { if (!controller.signal.aborted) setLinkError(failure instanceof Error ? failure.message : t("share.error.unavailable")); });
    return () => controller.abort();
  }, [captureId, reader, open]);

  const openLink = async () => {
    setLinkError(null);
    try {
      const file = await fileFromLink(link);
      await open(file, file.name);
    } catch (failure) {
      setLinkError(failure instanceof Error ? failure.message : t("share.invalidLink"));
    }
  };

  const choose = async (files: FileList | File[] | null) => {
    const file = Array.isArray(files) ? files[0] : files?.[0];
    if (file) await open(file, file.name);
  };

  const drop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragging(false);
    void choose(event.dataTransfer.files);
  };

  const openPicker = () => input.current?.click();

  useEffect(() => {
    const handler = (event: ClipboardEvent) => {
      const files = event.clipboardData?.files;
      if (files && files.length > 0) {
        event.preventDefault();
        void choose(files);
      }
    };
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [reader]);

  return (
    <main
      className={styles.page}
      data-tip-root=""
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={drop}
    >
      {linkError ? <p className={styles.error} role="alert">{linkError}</p> : null}
      {!capture ? (
        <form className={styles.linkForm} onSubmit={(event) => { event.preventDefault(); void openLink(); }}>
          <label htmlFor="capture-link">{t("share.openLink")}</label>
          <input id="capture-link" className={styles.input} type="url" required value={link} onChange={(event) => setLink(event.target.value)} placeholder={t("share.linkPlaceholder")} />
          <button className={styles.buttonSmall} type="submit" disabled={!reader}>{t("share.open")}</button>
        </form>
      ) : null}
      <input
        ref={input}
        type="file"
        accept=".hzperf,application/octet-stream"
        className={styles.fileInput}
        onChange={(event) => {
          void choose(event.target.files);
          event.target.value = "";
        }}
      />
      {capture && reader ? (
        <>
          {error ? <p className={styles.error}>{t("error.capture", { message: error })}</p> : null}
          <CaptureView reader={reader} capture={capture} showSide={showSide} onClose={close} />
        </>
      ) : (
        <Landing
          ready={Boolean(reader)}
          dragging={dragging}
          problem={
            readerError ? t("error.reader", { message: readerError }) : error ? t("error.capture", { message: error }) : null
          }
          onChoose={openPicker}
        />
      )}
    </main>
  );
}
