"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import type { DocIndexEntry } from "@/components/docs-data";
import { DocsSearch } from "@/components/docs-search";
import { ChevronDownIcon } from "@/components/icons";

export type DocsNavItem = { path: string; title: string; children: DocsNavItem[] };
export type DocsNavGroup = { group: string; section: string; items: DocsNavItem[]; book?: boolean };

type DocsNavProps = { groups: DocsNavGroup[]; index: DocIndexEntry[] };

// One line under each part's name, so the reader knows what the part is for before opening a group.
const PARTS: Record<string, string> = {
  Overview: "What Sunrise is, what it can do and who makes it.",
  Play: "Install, play, add mods and host a server.",
  Modding: "Make a mod: one folder, one .hmod file.",
  API: "Formats, commands and the server and launcher APIs.",
};

// The current path is runtime data: reading it outside <Suspense> stops Next.js from rendering /docs/[...slug]
// (CLIENT_HOOK_DYNAMIC, 500 on every doc page). The fallback is the same nav with no page marked as current.
export function DocsNav(props: DocsNavProps) {
  return (
    <Suspense fallback={<DocsNavView {...props} pathname="" />}>
      <DocsNavAtPath {...props} />
    </Suspense>
  );
}

function DocsNavAtPath(props: DocsNavProps) {
  return <DocsNavView {...props} pathname={usePathname()} />;
}

const holds = (item: DocsNavItem, path: string): boolean => item.path === path || item.children.some((c) => holds(c, path));

function Chevron({ open }: { open: boolean }) {
  return <ChevronDownIcon className={`size-3.5 shrink-0 text-muted transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />;
}

// Closed content keeps its place in the page for search engines and find-in-page, and animates its height.
function Fold({ open, id, children }: { open: boolean; id?: string; children: React.ReactNode }) {
  return (
    <div id={id} className="docs-fold" data-open={open || undefined} inert={!open}>
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

function NavLink({ item, pathname, depth }: { item: DocsNavItem; pathname: string; depth: number }) {
  const active = item.path === pathname;
  const inside = holds(item, pathname);
  const [toggled, setToggled] = useState<boolean | null>(null);
  const [seen, setSeen] = useState(pathname);
  if (seen !== pathname) {
    setSeen(pathname);
    setToggled(null);
  }
  const open = toggled ?? inside;
  const id = `docs-nav-${item.path.replace(/\W+/g, "-")}`;

  return (
    <li>
      <div className="relative flex items-stretch">
        <Link
          href={item.path}
          prefetch={depth === 0}
          aria-current={active ? "page" : undefined}
          className={`docs-nav-link min-w-0 flex-1 ${depth ? "text-[13px]" : "text-[14px]"}`}
        >
          {item.title}
        </Link>
        {item.children.length > 0 && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={id}
            aria-label={`${open ? "Hide" : "Show"} the chapters of ${item.title}`}
            onClick={() => setToggled(!open)}
            className="grid w-8 shrink-0 place-items-center rounded-lg text-muted outline-none hover:bg-lavender hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Chevron open={open} />
          </button>
        )}
      </div>
      {item.children.length > 0 && (
        <Fold open={open} id={id}>
          <ul className="docs-nav-rail mt-1 mb-1.5 ml-3 space-y-px pl-2">
            {item.children.map((child) => (
              <NavLink key={child.path} item={child} pathname={pathname} depth={depth + 1} />
            ))}
          </ul>
        </Fold>
      )}
    </li>
  );
}

function NavGroup({ group, pathname }: { group: DocsNavGroup; pathname: string }) {
  const inside = group.items.some((i) => holds(i, pathname));
  const [toggled, setToggled] = useState<boolean | null>(null);
  const open = toggled ?? (inside || !group.book);
  const id = `docs-nav-group-${group.section}-${group.group}`.replace(/\W+/g, "-");
  const label = group.book ? group.group.replace(/^Book: /, "") : group.group;
  return (
    <div className="docs-group" data-inside={inside || undefined}>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setToggled(!open)} className="docs-group-head">
        <Chevron open={open} />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span className="docs-group-count">{group.items.length}</span>
      </button>
      <Fold open={open} id={id}>
        <ul className="docs-group-list">
          {group.items.map((item) => (
            <NavLink key={item.path} item={item} pathname={pathname} depth={0} />
          ))}
        </ul>
      </Fold>
    </div>
  );
}

function DocsNavView({ groups, index, pathname }: DocsNavProps & { pathname: string }) {
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const [picked, setPicked] = useState<string | null>(null);
  if (openedAt !== pathname) {
    setOpen(false);
    setPicked(null);
    setOpenedAt(pathname);
  }
  const sections = [...new Set(groups.map((g) => g.section))];
  const here = groups.find((g) => g.items.some((i) => holds(i, pathname)));
  const section = picked ?? here?.section ?? sections[0];
  const current = here?.items.flatMap((i) => [i, ...i.children]).find((i) => i.path === pathname);
  const shown = groups.filter((g) => g.section === section);
  const list = useRef<HTMLElement>(null);

  // Bring the current page into view inside the menu's own scroll area, without moving the page.
  useEffect(() => {
    const nav = list.current;
    const link = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !link || nav.scrollHeight <= nav.clientHeight) return;
    const top = link.getBoundingClientRect().top - nav.getBoundingClientRect().top;
    if (top < 0 || top > nav.clientHeight - 48) nav.scrollTop += top - nav.clientHeight / 3;
  }, [pathname, section]);

  return (
    <aside className="relative z-20 lg:sticky lg:top-24 lg:self-start">
      <div className="docs-nav-panel glass-panel rounded-2xl border border-line p-3">
        <DocsSearch index={index} onNavigate={() => setOpen(false)} />

        <div role="group" aria-label="Parts of the documentation" className="docs-tabs mt-3" style={{ "--tabs": sections.length, "--tab": sections.indexOf(section) } as React.CSSProperties}>
          {sections.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={s === section}
              onClick={() => {
                setPicked(s);
                setOpen(true);
              }}
              className="docs-tab"
            >
              {s}
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="docs-nav-list"
          onClick={() => setOpen((o) => !o)}
          className="mt-3 flex h-11 w-full items-center justify-between rounded-lg bg-lavender px-3.5 text-left text-sm text-muted lg:hidden"
        >
          <span className="min-w-0 truncate">
            <span className="text-muted">Menu</span>
            {current && <span className="ml-2 font-medium text-foreground">{current.title}</span>}
          </span>
          <ChevronDownIcon className={`size-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        <nav
          ref={list}
          id="docs-nav-list"
          aria-label="Documentation"
          className={`${open ? "block" : "hidden"} docs-nav-scroll mt-3 lg:block lg:max-h-[calc(100vh-15.5rem)] lg:overflow-y-auto`}
        >
          <div key={section} className="docs-nav-section pb-1">
            <div className="docs-part-head">
              <p className="docs-part-title">{section}</p>
              {PARTS[section] && <p className="docs-part-blurb">{PARTS[section]}</p>}
            </div>
            {shown.map((group, i) => (
              <div key={group.group}>
                {group.book && !shown[i - 1]?.book && (
                  <div className="docs-book-divider">
                    <p className="docs-book-title">Reference book</p>
                    <p className="docs-part-blurb">Ari&rsquo;s complete mod API book, copied from arismoko/horizon.</p>
                  </div>
                )}
                <NavGroup group={group} pathname={pathname} />
              </div>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
}
