import Image from "next/image";
import type { CSSProperties } from "react";
import { HorizonScene } from "@/components/horizon-scene";
import { AppleIcon, DownloadIcon, GitHubIcon, LinuxIcon, RustIcon, WindowsIcon } from "@/components/icons";
import { getLauncherDownloads, getReleases, launcherBuild } from "@/components/github-releases";
import { format, getMessages, NUMBER_LOCALE, rich, type Locale } from "@/components/i18n";
import { LauncherLink, LauncherMeta } from "@/components/launcher-download";
import { GITHUB_URL, RUST_WIKI_URL } from "@/components/links";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

function Dot({ className = "mx-2" }: { className?: string }) {
  return (
    <span aria-hidden className={`text-muted ${className}`}>
      ·
    </span>
  );
}

export async function Hero({ locale }: { locale: Locale }) {
  const { home } = getMessages(locale);
  const t = home.hero;
  const [releases, downloads] = await Promise.all([getReleases(), getLauncherDownloads()]);
  const launcher = launcherBuild(releases);
  return (
    <section className="relative isolate flex min-h-svh flex-col overflow-hidden">
      <HorizonScene className="absolute inset-0 -z-10" />
      <div aria-hidden className="h-18 shrink-0" />

      <div className="mx-auto grid w-full max-w-6xl flex-1 content-center items-start gap-x-16 gap-y-16 px-6 pt-12 pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center lg:px-10 xl:gap-x-20">
        <div className="@container max-w-2xl">
          <p className="rise flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm font-medium text-muted" style={delay(0)}>
            <span className="inline-flex items-center gap-2">
              <Image src="/minecraft.webp" alt="" width={64} height={71} className="h-[18px] w-auto" />
              Minecraft: Java Edition 26.3
            </span>
            <Dot className="hidden sm:inline" />
            <span className="inline-flex items-center gap-2">
              <RustIcon className="size-4" />
              <span>
                {rich(t.writtenIn, {
                  rust: (chunks) => (
                    <a
                      href={RUST_WIKI_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted underline decoration-accent/40 underline-offset-4 transition-colors hover:text-foreground hover:decoration-accent/40"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </span>
            </span>
          </p>

          <h1
            className="rise mt-5 font-display text-[clamp(2rem,10.4cqi,4.75rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-foreground"
            style={delay(80)}
          >
            <span className="sr-only">Sunrise: </span>
            <span className="block">{t.title}</span>
            <span className="text-accent block pb-1">{t.titleAccent}</span>
          </h1>

          <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-muted" style={delay(160)}>
            {t.lead}
          </p>

          <div className="rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" style={delay(240)}>
            <LauncherLink
              build={launcher}
              className="sun-button soft-press inline-flex h-12 items-center justify-center gap-2.5 rounded-[10px] bg-brand px-5 text-[15px] font-medium text-white hover:bg-brand-hover"
            >
              <DownloadIcon className="size-[18px]" />
              {t.download}
            </LauncherLink>
            <a
              href={GITHUB_URL}
              className="glass-panel soft-press inline-flex h-12 items-center justify-center gap-2.5 rounded-[10px] border border-line px-5 text-[15px] font-medium text-foreground"
            >
              <GitHubIcon className="size-[17px]" />
              {t.github}
            </a>
          </div>

          <div className="rise mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted" style={delay(300)}>
            <span className="flex items-center gap-4">
              <LauncherLink build={launcher} os="windows" className="inline-flex items-center gap-2 text-muted transition-colors hover:text-foreground">
                <WindowsIcon className="size-3.5" />
                Windows
              </LauncherLink>
              <LauncherLink build={launcher} os="macos" className="inline-flex items-center gap-2 text-muted transition-colors hover:text-foreground">
                <AppleIcon className="size-4" />
                macOS
              </LauncherLink>
              <LauncherLink build={launcher} os="linux" className="inline-flex items-center gap-2 text-muted transition-colors hover:text-foreground">
                <LinuxIcon className="size-4" />
                Linux
              </LauncherLink>
            </span>
            <span className="basis-full whitespace-nowrap sm:basis-auto">
              <Dot className="mr-2 hidden sm:inline" />
              <LauncherMeta build={launcher} label={t.launcher} dot={<Dot />} />
              {downloads !== null && (
                <>
                  {launcher && <Dot />}
                  <span title={t.downloadsTitle}>
                    {rich(format(t.downloads, { n: downloads.toLocaleString(NUMBER_LOCALE[locale]) }), {
                      n: (chunks) => <span className="tabular-nums">{chunks}</span>,
                    })}
                  </span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      <div aria-hidden className="h-[clamp(180px,30svh,320px)] shrink-0" />
    </section>
  );
}
