"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

export function DocsProse({ html }: { html: string }) {
  const [announce, setAnnounce] = useState("");
  const markup = useMemo(() => ({ __html: html }), [html]);

  const onClick = async (e: MouseEvent<HTMLDivElement>) => {
    const button = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-copy], [data-wrap]");
    if (!button) return;
    const block = button.closest(".code-block");
    if (button.hasAttribute("data-wrap")) {
      const wrapped = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", String(wrapped));
      block?.classList.toggle("code-wrapped", wrapped);
      return;
    }
    const code = block?.querySelector("code");
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.textContent ?? "");
      button.textContent = "Copied";
      button.dataset.done = "";
      setAnnounce("Copied to the clipboard");
    } catch {
      window.getSelection()?.selectAllChildren(code);
      button.textContent = "Selected";
      setAnnounce("Code selected. Use your keyboard’s copy shortcut.");
    }
    setTimeout(() => {
      button.textContent = "Copy";
      delete button.dataset.done;
      setAnnounce("");
    }, 1600);
  };

  return (
    <>
      <div className="docs-prose" onClick={onClick} dangerouslySetInnerHTML={markup} />
      <span className="sr-only" aria-live="polite">
        {announce}
      </span>
    </>
  );
}

const OFFSET = 140;

export function DocsToc({ headings, className = "" }: { headings: { id: string; text: string }[]; className?: string }) {
  const [active, setActive] = useState(headings[0]?.id ?? "");
  const frame = useRef(0);

  useEffect(() => {
    const update = () => {
      frame.current = 0;
      let current = headings[0]?.id ?? "";
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= OFFSET) current = h.id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = headings.at(-1)?.id ?? current;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame.current) frame.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame.current);
    };
  }, [headings]);

  // The marker slides to the current heading: its place is measured, since entries wrap.
  const list = useRef<HTMLUListElement>(null);
  const mark = useRef<HTMLLIElement>(null);
  useEffect(() => {
    const link = list.current?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!link || !mark.current) return;
    mark.current.style.translate = `0 ${link.offsetTop}px`;
    mark.current.style.height = `${link.offsetHeight}px`;
  }, [active, headings]);

  return (
    <nav aria-label="On this page" className={className}>
      <p className="text-[11.5px] font-semibold tracking-[0.09em] text-muted uppercase">On this page</p>
      <ul ref={list} className="docs-toc relative mt-3">
        <li ref={mark} aria-hidden className="docs-toc-mark" />
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={h.id === active ? "location" : undefined}
              className={`block py-1.5 pl-4 text-[13px] leading-snug transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                h.id === active ? "font-medium text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
