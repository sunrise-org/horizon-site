"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { GitHubIcon, MenuIcon, XIcon } from "@/components/icons";
import { HeaderExtras } from "@/components/header-extras";
import { LogoLink } from "@/components/logo-link";
import type { LauncherBuild } from "@/components/github-releases";
import type { Messages } from "@/components/i18n";
import { format, localePath, type Locale } from "@/components/i18n-text";
import { LauncherLink } from "@/components/launcher-download";
import { GITHUB_URL } from "@/components/links";
import { useUnseenCount } from "@/components/release-seen";

type NavKey = keyof Messages["header"]["nav"];

const NAV: { key: NavKey; href: string }[] = [
  { key: "about", href: "/#about" },
  { key: "team", href: "/team" },
  { key: "mods", href: "/mods" },
  { key: "releases", href: "/releases" },
  { key: "docs", href: "/docs" },
  { key: "apiGaps", href: "/api-gaps" },
  { key: "faq", href: "/faq" },
];

const NAV_LINK = "nav-link inline-flex items-center gap-1.5 transition-colors hover:text-foreground";

const subscribe = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
};

type SiteHeaderProps = { locale: Locale; t: Messages["header"]; releaseIds?: number[]; launcher?: LauncherBuild | null };

// The current path is runtime data: read outside <Suspense> it stops Next.js from rendering pages that aren't
// prerendered (CLIENT_HOOK_DYNAMIC). The fallback is the same header with no link marked as current.
export function SiteHeader(props: SiteHeaderProps) {
  return (
    <Suspense fallback={<SiteHeaderView {...props} pathname="" />}>
      <SiteHeaderAtPath {...props} />
    </Suspense>
  );
}

function SiteHeaderAtPath(props: SiteHeaderProps) {
  return <SiteHeaderView {...props} pathname={usePathname()} />;
}

function SiteHeaderView({ locale, t, releaseIds = [], launcher = null, pathname }: SiteHeaderProps & { pathname: string }) {
  const nav = NAV.map((item) => ({ ...item, href: localePath(locale, item.href) }));
  const scrolled = useSyncExternalStore(
    subscribe,
    () => window.scrollY > 8,
    () => false,
  );
  const unseen = useUnseenCount(releaseIds);
  const isCurrent = (href: string) => !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuOpen && menuPath !== pathname) {
    setMenuOpen(false);
    setMenuPath(pathname);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header
      className="glass-panel glass-chrome fixed inset-x-0 top-0 z-50 border-b border-line/70"
      data-scrolled={scrolled || undefined}
      data-menu-open={menuOpen || undefined}
    >
      <HeaderExtras />
      <div className="mx-auto flex h-18 w-full max-w-6xl items-center gap-8 px-6 xl:gap-12 lg:px-10">
        <LogoLink href={localePath(locale, "/")}>
          <span className="font-display text-[19px] font-semibold tracking-[-0.02em]">Sunrise</span>
        </LogoLink>

        <nav aria-label={t.mainNav} className={`hidden items-center text-sm text-muted lg:flex gap-5 xl:gap-8`}>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(item.href) ? "page" : undefined}
              className={isCurrent(item.href) ? `${NAV_LINK} text-foreground` : NAV_LINK}
            >
              {t.nav[item.key]}
              {item.key === "releases" && unseen > 0 && (
                <>
                  <span
                    aria-hidden
                    className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-lavender px-1 text-[10px] leading-none font-semibold text-foreground tabular-nums shadow-[0_0_10px_rgba(255,90,168,0.7)]"
                  >
                    {unseen > 9 ? "9+" : unseen}
                  </span>
                  <span className="sr-only">{format(t.unseen, { n: unseen })}</span>
                </>
              )}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <a
            href={GITHUB_URL}
            className="hidden h-9 items-center gap-2 px-3 text-sm text-muted transition-colors hover:text-foreground sm:inline-flex lg:hidden xl:inline-flex"
          >
            <GitHubIcon className="size-4" />
            GitHub
          </a>
          <LauncherLink
            build={launcher}
            className="sun-button soft-press inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-white"
          >
            {t.download}
          </LauncherLink>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t.closeMenu : t.openMenu}
            onClick={() => {
              setMenuOpen((o) => !o);
              setMenuPath(pathname);
            }}
            className="ml-1 inline-flex size-9 items-center justify-center rounded-lg bg-lavender text-muted transition-colors hover:bg-lavender hover:text-foreground lg:hidden"
          >
            {menuOpen ? <XIcon className="size-[18px]" /> : <MenuIcon className="size-[18px]" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" aria-label={t.mainNav} className="mx-auto h-[calc(100dvh-4.5rem)] w-full max-w-6xl overflow-y-auto px-6 pt-2 pb-6 lg:hidden">
          <ul className="grid gap-0.5">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  className={`flex h-12 items-center justify-between rounded-lg px-3 text-[17px] transition-colors hover:bg-surface/80 ${
                    isCurrent(item.href) ? "bg-lavender text-foreground" : "text-muted"
                  }`}
                >
                  {t.nav[item.key]}
                  {item.key === "releases" && unseen > 0 && (
                    <span className="text-sm text-accent-ink">{format(t.unseenMenu, { n: unseen > 9 ? "9+" : unseen })}</span>
                  )}
                </Link>
              </li>
            ))}
            <li>
              <a href={GITHUB_URL} className="flex h-12 items-center gap-2.5 rounded-lg px-3 text-[17px] text-muted transition-colors hover:bg-surface/80">
                <GitHubIcon className="size-4" />
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
