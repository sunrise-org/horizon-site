import type { CSSProperties } from "react";
import { getReleases, RELEASES_URL, type Release, type ReleaseKind } from "@/components/github-releases";
import { HorizonScene } from "@/components/horizon-scene";
import { format, getMessages, NUMBER_LOCALE, rich, type Locale, type Messages } from "@/components/i18n";
import { DownloadIcon, ExternalLinkIcon, GitHubIcon, MoonIcon } from "@/components/icons";
import { ReleaseItem, ReleaseList, ReleaseViews } from "@/components/release-seen";

type T = Messages["releases"];

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

const KINDS: { kind: ReleaseKind; chip: string }[] = [
  { kind: "horizon", chip: "bg-brand/25 text-accent-ink" },
  { kind: "launcher", chip: "bg-lavender text-muted" },
  {
    kind: "nightly",
    chip: "bg-[linear-gradient(100deg,#3a1233,#7a2350)] text-accent-ink shadow-[0_0_12px_-2px_rgba(255,90,168,0.45)] ring-1 ring-accent/25 ring-inset",
  },
];

function KindChip({ kind, t }: { kind: ReleaseKind; t: T }) {
  const { chip } = KINDS.find((k) => k.kind === kind)!;
  return (
    <span className={`inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${chip}`}>
      {kind === "nightly" && <MoonIcon fill="currentColor" strokeWidth={0} className="size-3 text-warning-ink" />}
      {t.kinds[kind]}
    </span>
  );
}

const clock = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
const when = (locale: Locale, iso: string) => {
  const day = new Intl.DateTimeFormat(NUMBER_LOCALE[locale], { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  return `${day.format(new Date(iso))} · ${clock.format(new Date(iso))} UTC`;
};

const fileSize = (bytes: number) =>
  bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : bytes >= 1e3 ? `${Math.round(bytes / 1e3)} KB` : `${bytes} B`;

function splitTitle(title: string) {
  const i = title.indexOf(": ");
  return i > 0 ? { name: title.slice(0, i), headline: title.slice(i + 2) } : { name: title, headline: null };
}

function Dot() {
  return (
    <span aria-hidden className="mx-2 text-muted">
      ·
    </span>
  );
}

function ReleaseSummary({ release, locale, t }: { release: Release; locale: Locale; t: T }) {
  const { name, headline } = splitTitle(release.title);
  return (
    <>
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <KindChip kind={release.kind} t={t} />
        <span className="text-[17px] font-medium text-foreground transition-colors group-data-seen:text-muted">{name}</span>
      </span>
      {headline && (
        <span className="mt-1.5 block text-[15px] text-pretty text-muted group-data-seen:text-muted">{headline}</span>
      )}
      <span className="mt-1.5 block text-sm text-muted">
        <time dateTime={release.published}>{when(locale, release.published)}</time>
        <Dot />
        {release.tag}
        <ReleaseViews id={release.id} t={t.list} numberLocale={NUMBER_LOCALE[locale]} />
      </span>
    </>
  );
}

function ReleaseBody({ release, t, newTab }: { release: Release; t: T; newTab: string }) {
  return (
    <>
      {release.notesHtml ? (
        <div className="release-notes" dangerouslySetInnerHTML={{ __html: release.notesHtml }} />
      ) : (
        <p className="text-[15px] text-muted">{t.noNotes}</p>
      )}

      {release.assets.length > 0 && (
        <div className="mt-7">
          <h3 className="text-sm font-medium text-muted">{t.downloads}</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {release.assets.map((a) => (
              <li key={a.name}>
                <a
                  href={a.url}
                  className="inline-flex items-center gap-2 rounded-lg bg-lavender px-3 py-2 text-sm text-muted transition-colors hover:bg-sky-surface hover:text-foreground"
                >
                  <DownloadIcon className="size-4" />
                  {a.name}
                  <span className="text-muted">{fileSize(a.size)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <a
        href={release.url}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent-ink underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent-ink"
      >
        {t.viewOnGitHub}
        <ExternalLinkIcon className="size-3.5" />
        <span className="sr-only">{newTab}</span>
      </a>
    </>
  );
}

// /releases in each language: app/(en)/releases/page.tsx and app/es/releases/page.tsx. Release names and notes stay as
// GitHub has them (English).
export async function ReleasesPage({ locale }: { locale: Locale }) {
  const { common, releases: t } = getMessages(locale);
  const releases = await getReleases();

  return (
    <main>
      <section className="relative isolate flex min-h-[85svh] flex-col overflow-hidden">
        <HorizonScene className="absolute inset-0 -z-10" wideSun={{ x: 0.74, scale: 1.5, rise: 0.6 }} />
        <div aria-hidden className="h-18 shrink-0" />

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pt-12 pb-10 lg:px-10 lg:pt-28">
          <div className="max-w-2xl">
            <p className="rise flex items-center text-sm font-medium text-muted" style={delay(0)}>
              {t.eyebrow}
              <Dot />
              <span className="inline-flex items-center gap-2">
                <GitHubIcon className="size-3.5" />
                sunrise-org/horizon
              </span>
            </p>
            <h1
              className="rise mt-5 font-display text-[clamp(2.5rem,7vw,4.75rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-foreground"
              style={delay(80)}
            >
              <span className="block">{t.title}</span>
              <span className="text-accent block pb-1">{t.titleAccent}</span>
            </h1>
            <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-muted" style={delay(160)}>
              {t.lead}
            </p>
            <div className="rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" style={delay(240)}>
              <a
                href="#all-releases"
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-[10px] bg-brand px-5 text-[15px] font-medium text-white transition-colors hover:bg-brand-hover"
              >
                {t.browse}
              </a>
              <a
                href={RELEASES_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-[10px] bg-lavender px-5 text-[15px] font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-sky-surface"
              >
                <GitHubIcon className="size-[17px]" />
                {t.allOnGitHub}
                <span className="sr-only">{common.newTab}</span>
              </a>
            </div>
          </div>
        </div>

        <div aria-hidden className="h-[clamp(180px,30svh,320px)] shrink-0 lg:h-[clamp(130px,16svh,220px)]" />
      </section>

      <section id="all-releases" aria-labelledby="all-releases-title" className="scroll-mt-20 pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
          <p className="text-sm font-medium text-muted">{t.changelog}</p>
          <h2
            id="all-releases-title"
            className="mt-5 font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-foreground"
          >
            {releases ? format(t.latest, { n: releases.length }) : t.latestFallback}
          </h2>

          {releases ? (
            <div className="mt-10">
              <ReleaseList t={t.list} entries={releases.map((r) => ({ id: r.id, kind: r.kind }))}>
                {releases.map((r) => (
                  <li key={r.id} data-kind={r.kind} className="border-b border-line">
                    <ReleaseItem id={r.id} t={t.list} summary={<ReleaseSummary release={r} locale={locale} t={t} />}>
                      <ReleaseBody release={r} t={t} newTab={common.newTab} />
                    </ReleaseItem>
                  </li>
                ))}
              </ReleaseList>
            </div>
          ) : (
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
              {rich(t.unreachable, {
                link: (chunks) => (
                  <a href={RELEASES_URL} className="text-accent-ink underline underline-offset-4">
                    {chunks}
                  </a>
                ),
              })}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
