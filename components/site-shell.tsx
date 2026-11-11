import { Geist, Geist_Mono, Sora } from "next/font/google";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { getReleases, launcherBuild } from "@/components/github-releases";
import { DawnBackdrop } from "@/components/dawn-backdrop";
import { getMessages, type Locale } from "@/components/i18n";
import { PointerGlow } from "@/components/pointer-glow";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Headings: a geometric face of Sunrise's own, so the site no longer reads as playhorizon.dev (Bricolage).
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

// The page around every page: one per language, since each language has its own root layout (app/(en), app/es) for
// its <html lang>. app/global-not-found.tsx draws it too.
export function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html
      lang={locale}
      className={`${geist.variable} ${geistMono.variable} ${sora.variable} h-full antialiased`}
    >
      {/* Browser extensions (e.g. Bitdefender) add attributes to <body> before React loads. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <DawnBackdrop />
        <PointerGlow />
        <Suspense fallback={<SiteHeader locale={locale} t={getMessages(locale).header} />}>
          <SiteNavigation locale={locale} />
        </Suspense>
        {children}
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}

async function SiteNavigation({ locale }: { locale: Locale }) {
  const releases = await getReleases();
  return <SiteHeader locale={locale} t={getMessages(locale).header} releaseIds={releases?.map((release) => release.id) ?? []} launcher={launcherBuild(releases)} />;
}
