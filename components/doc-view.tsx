import Link from "next/link";
import type { ReactNode } from "react";
import type { Doc } from "@/components/docs-data";
import { DocsProse, DocsToc } from "@/components/docs-page-tools";
import { GAME_URL } from "@/components/game-repo";
import { ChevronDownIcon, ExternalLinkIcon, GitHubIcon } from "@/components/icons";
import { DISCORD_URL } from "@/components/links";

function PagerLink({ doc, rel }: { doc: Doc | null; rel: "prev" | "next" }) {
  if (!doc) return <span className="hidden sm:block" />;
  const next = rel === "next";
  return (
    <Link
      href={doc.path}
      prefetch
      rel={rel}
      className={`docs-pager glass-panel soft-press group flex items-center gap-4 rounded-2xl border border-line px-5 py-4 ${next ? "sm:flex-row-reverse sm:text-right" : ""}`}
    >
      <span aria-hidden className={`docs-pager-arrow text-xl text-muted ${next ? "docs-pager-next" : "docs-pager-prev"}`}>
        {next ? "→" : "←"}
      </span>
      <span className="min-w-0">
        <span className="block text-[12px] font-semibold tracking-[0.09em] text-muted uppercase">{next ? "Next" : "Previous"}</span>
        <span className="mt-1 block text-[16px] font-medium text-pretty text-foreground group-hover:text-accent-ink">{doc.title}</span>
      </span>
    </Link>
  );
}

const START_HERE = [
  { href: "/docs/install", title: "Play", text: "Install the launcher and start your first world." },
  { href: "/docs/make-a-mod", title: "Make a mod", text: "Set up the tool and build a block in ten minutes." },
  { href: "/docs/apis", title: "Use the APIs", text: "Formats, launcher commands and server APIs." },
];

export function DocView({ doc, prev, next, children }: { doc: Doc; prev: Doc | null; next: Doc | null; children?: ReactNode }) {
  const headings = doc.headings.filter((h) => h.level === 2);
  const toc = doc.slug === "index"
    ? [{ id: "modding-cookbook", text: "Modding cookbook" }, ...headings, { id: "docs-team", text: "Meet the Sunrise team" }]
    : headings;
  const showToc = toc.length >= 4;
  return (
    <div key={doc.slug} className={`docs-page ${showToc ? "min-[80rem]:grid min-[80rem]:grid-cols-[minmax(0,1fr)_13rem] min-[80rem]:gap-12" : ""}`}>
      <article id="main" className="min-w-0 max-w-[58rem]">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
          <Link href="/docs" className="hover:text-foreground">
            Docs
          </Link>
          <span aria-hidden>/</span>
          <span>{doc.section}</span>
          <span aria-hidden>/</span>
          <span className="rounded-full bg-lavender px-2.5 py-0.5 font-medium text-accent-ink">{doc.group}</span>
        </nav>
        <h1 className="docs-title mt-4 font-display text-[clamp(2.1rem,4.6vw,3.15rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-foreground">{doc.title}</h1>
        {doc.lede && <p className="docs-lede mt-5 text-[1.1875rem] leading-[1.6] text-pretty text-muted" dangerouslySetInnerHTML={{ __html: doc.lede }} />}
        {doc.sourceUrl && !doc.api && (
          <p className="mt-5 flex flex-wrap items-center gap-2 text-[13px] text-muted">
            <a href={doc.sourceUrl} target="_blank" rel="noreferrer" className="docs-source soft-press inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 hover:text-foreground">
              <GitHubIcon className="size-3.5" />
              From the modding book of arismoko/horizon
              <code className="font-mono text-[12px] text-accent-ink">{doc.sourceUrl.match(/blob\/([0-9a-f]{7})/)?.[1]}</code>
              <ExternalLinkIcon className="size-3" />
            </a>
          </p>
        )}

        {doc.slug === "index" && (
          <>
            <nav aria-label="Start here" className="docs-cards mt-8 grid gap-3 sm:grid-cols-3">
              {START_HERE.map(({ href, title, text }) => (
                <Link key={href} href={href} className="glass-panel soft-press rounded-xl border border-line p-4 focus-visible:outline-2 focus-visible:outline-accent">
                  <span className="block font-display text-lg font-semibold">{title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{text}</span>
                </Link>
              ))}
            </nav>
            <section className="mt-10" aria-labelledby="modding-cookbook">
              <h2 id="modding-cookbook" className="scroll-mt-28 font-display text-2xl font-semibold">Modding cookbook</h2>
              <p className="mt-2 text-muted">Pick something to make. Each recipe takes you from the files to a game you can try.</p>
              <div className="docs-cards mt-4 grid gap-3 sm:grid-cols-2">
                <Link href="/docs/build-your-first-block" className="glass-panel glass-sky soft-press rounded-xl border border-line p-5 focus-visible:outline-2 focus-visible:outline-accent">
                  <span className="text-xs font-medium text-accent-ink">DATA & ASSETS</span>
                  <span className="mt-2 block font-display text-xl font-semibold">A block that glows and drops</span>
                  <span className="mt-2 block text-sm leading-relaxed text-muted">Build Glowing Amethyst with a model, a recipe, and a pickaxe drop.</span>
                </Link>
                <Link href="/docs/mod-code" className="glass-panel soft-press rounded-xl border border-line p-5 focus-visible:outline-2 focus-visible:outline-accent">
                  <span className="text-xs font-medium text-accent-ink">RUST CODE</span>
                  <span className="mt-2 block font-display text-xl font-semibold">Greet a player when they join</span>
                  <span className="mt-2 block text-sm leading-relaxed text-muted">Add one Rust file to the same mod: a hook that sends a welcome message.</span>
                </Link>
                <Link href="/docs/modding" className="glass-panel soft-press rounded-xl border border-line p-5 focus-visible:outline-2 focus-visible:outline-accent sm:col-span-2">
                  <span className="text-xs font-medium text-accent-ink">REFERENCE BOOK</span>
                  <span className="mt-2 block font-display text-xl font-semibold">Everything the mod API can do</span>
                  <span className="mt-2 block text-sm leading-relaxed text-muted">Ari’s own guide and reference: hooks, Parts, attachments, injections, the manifest and the registry.</span>
                </Link>
              </div>
            </section>
          </>
        )}

        {showToc && (
          <details className="group mt-7 rounded-xl border border-line bg-surface/80 min-[80rem]:hidden">
            <summary className="flex h-11 cursor-pointer list-none items-center justify-between px-4 text-sm font-medium text-muted [&::-webkit-details-marker]:hidden">
              On this page
              <ChevronDownIcon className="size-4 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <ul className="px-4 pb-3">
              {toc.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="block py-1.5 text-sm text-muted hover:text-foreground">
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}

        {doc.html && (
          <div className="docs-body mt-10">
            <DocsProse html={doc.html} />
          </div>
        )}

        {children}

        <nav aria-label="Next and previous pages" className="mt-16 grid gap-3 sm:grid-cols-2">
          <PagerLink doc={prev} rel="prev" />
          <PagerLink doc={next} rel="next" />
        </nav>

        <p className="mt-8 text-sm leading-relaxed text-muted">
          {doc.sourceUrl && (
            <>
              <a href={doc.sourceUrl} className="text-muted underline underline-offset-4 hover:text-foreground">
                Edit this page on GitHub
              </a>
              {" · "}
            </>
          )}
          Spotted something wrong?{" "}
          <a href={`${doc.sourceUrl?.includes("arismoko/horizon") ? "https://github.com/arismoko/horizon" : GAME_URL}/issues`} className="text-muted underline underline-offset-4 hover:text-foreground">
            Open an issue
          </a>{" "}
          {DISCORD_URL && (
            <>
              or ask on{" "}
              <a href={DISCORD_URL} className="text-muted underline underline-offset-4 hover:text-foreground">
                Discord
              </a>
            </>
          )}
          .
        </p>
      </article>

      {showToc && (
        <div className="hidden min-[80rem]:block">
          <DocsToc headings={toc} className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto" />
        </div>
      )}
    </div>
  );
}

export function DocSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading the page" className="max-w-[58rem] motion-safe:animate-pulse">
      <div className="h-4 w-32 rounded bg-lavender" />
      <div className="mt-5 h-11 w-3/4 rounded-lg bg-lavender" />
      <div className="mt-6 space-y-3">
        <div className="h-4 w-full rounded bg-surface/80" />
        <div className="h-4 w-11/12 rounded bg-surface/80" />
        <div className="h-4 w-2/3 rounded bg-surface/80" />
      </div>
      <div className="mt-12 space-y-3">
        <div className="h-4 w-full rounded bg-surface/80" />
        <div className="h-4 w-full rounded bg-surface/80" />
        <div className="h-4 w-4/5 rounded bg-surface/80" />
      </div>
    </div>
  );
}
