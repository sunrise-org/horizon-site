"use client";

import { Component, useRef, type KeyboardEvent, type ReactNode } from "react";
import { safeLink } from "@/components/staff/api";

export const FIELD =
  "w-full rounded-lg bg-lavender px-3.5 text-[15px] text-foreground placeholder:text-muted outline-none transition-colors focus:bg-lavender focus-visible:ring-2 focus-visible:ring-accent";
export const INPUT = `${FIELD} h-10`;
export const AREA = `${FIELD} py-2.5 leading-relaxed`;
const BASE = "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50";
export const PRIMARY = `${BASE} h-10 bg-sky-surface px-4 text-sm text-foreground hover:bg-accent/25`;
export const PRIMARY_SM = `${BASE} h-8 bg-sky-surface px-3 text-[13px] text-foreground hover:bg-accent/25`;
export const SECONDARY = `${BASE} h-10 bg-lavender px-4 text-sm text-foreground hover:bg-sky-surface`;
export const SECONDARY_SM = `${BASE} h-8 bg-lavender px-3 text-[13px] text-foreground hover:bg-sky-surface`;
export const GHOST_SM = `${BASE} h-8 px-2.5 text-[13px] text-muted hover:bg-lavender hover:text-foreground`;
export const CARD = "rounded-2xl bg-surface p-5 sm:p-6";
export const LINK = "text-accent-ink underline decoration-accent/40 underline-offset-4 transition-colors hover:text-foreground";
export const BADGE = "inline-flex items-center rounded-md bg-lavender px-2 py-0.5 text-xs font-medium text-muted";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

export function LinkText({ link }: { link?: string | null }) {
  const safe = safeLink(link);
  if (!safe) return null;
  return safe.href ? (
    <a href={safe.href} rel="noreferrer" className={LINK}>
      {safe.label}
    </a>
  ) : (
    <span>{safe.label}</span>
  );
}

export function Lines({ text, className = "" }: { text?: string | null; className?: string }) {
  if (!text) return null;
  return <p className={`whitespace-pre-line ${className}`}>{text}</p>;
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-relaxed text-muted">{children}</p>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-surface/80 px-4 py-6 text-center text-sm text-muted">{children}</p>;
}

export function Status({ text }: { text?: string }) {
  return (
    <span role="status" className="text-[13px] text-muted">
      {text}
    </span>
  );
}

export class Guard extends Component<{ what: string; children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error(`staff: ${this.props.what}`, error);
  }
  render() {
    if (this.state.error) {
      return (
        <p role="alert" className="rounded-xl bg-[#f07a6a]/10 px-4 py-3 text-sm text-danger-ink">
          {this.props.what} couldn&apos;t be shown ({this.state.error.message}). The rest of the dashboard works; tell the Team if this stays.
        </p>
      );
    }
    return this.props.children;
  }
}

export type Tab = { id: string; label: string; count?: number };

export function Tabs({ tabs, active, onSelect, label }: { tabs: Tab[]; active: string; onSelect: (id: string) => void; label: string }) {
  const list = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex((t) => t.id === active);
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = tabs[(i + step + tabs.length) % tabs.length];
    onSelect(next.id);
    list.current?.querySelector<HTMLButtonElement>(`#tab-${next.id}`)?.focus();
  };
  return (
    <div ref={list} role="tablist" aria-label={label} onKeyDown={onKey} className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={on}
            aria-controls={`panel-${t.id}`}
            tabIndex={on ? 0 : -1}
            onClick={() => onSelect(t.id)}
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              on ? "bg-sky-surface text-foreground" : "text-muted hover:bg-lavender hover:text-foreground"
            }`}
          >
            {t.label}
            {t.count ? <span className={`rounded-md px-1.5 text-xs tabular-nums ${on ? "bg-background/10" : "bg-lavender/20 text-accent-ink"}`}>{t.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function Panel({ id, active, children }: { id: string; active: string; children: ReactNode }) {
  return (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} hidden={id !== active} className="pt-6">
      {id === active ? children : null}
    </div>
  );
}
