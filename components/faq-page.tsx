import Link from "next/link";
import type { ReactNode } from "react";
import { GAME_REF, GAME_REPO, GAME_URL } from "@/components/game-repo";
import { getMessages, rich, type Locale } from "@/components/i18n";
import { format, localePath } from "@/components/i18n-text";
import { JsonLd } from "@/components/json-ld";
import { UPSTREAM_URL } from "@/components/links";
import { absolute } from "@/components/site";
import { BOARD_URL } from "@/lib/api-gaps/links";

const LINK = "sun-link text-[#ffd2e4]";

const plain = (text: string) => text.replace(/<\/?\w+>/g, "");

export function FaqPage({ locale }: { locale: Locale }) {
  const { common, faq: t } = getMessages(locale);
  const out = (href: string) =>
    function OutLink(chunks: string): ReactNode {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={LINK}>
          {chunks}
          <span className="sr-only"> {common.newTab}</span>
        </a>
      );
    };
  const inSite = (href: string) =>
    function InSiteLink(chunks: string): ReactNode {
      return (
        <Link href={localePath(locale, href)} className={LINK}>
          {chunks}
        </Link>
      );
    };
  const values = { repo: GAME_REPO, ref: GAME_REF };
  const items = t.items.map((item) => ({ q: item.q, a: format(item.a, values) }));

  return (
    <main>
      <JsonLd
        data={{
          "@type": "FAQPage",
          url: absolute(localePath(locale, "/faq")),
          inLanguage: locale,
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: plain(item.a) },
          })),
        }}
      />
      <article className="mx-auto w-full max-w-3xl px-6 pt-32 pb-20 text-[16px] leading-relaxed text-pretty text-white/70 sm:pt-40 sm:pb-28 lg:px-10">
        <p className="text-sm font-medium text-white/60">{t.kicker}</p>
        <h1 className="mt-4 font-display text-[clamp(2.25rem,6vw,4rem)] leading-[1.04] font-semibold tracking-[-0.035em] text-white">
          <span className="block">{t.titleA}</span>
          <span className="text-accent block pb-1">{t.titleB}</span>
        </h1>
        <p className="mt-6 text-lg text-white/70">{t.lead}</p>

        {items.map((item) => (
          <section key={item.q} className="glass-panel soft-press mt-6 rounded-2xl border border-line/60 px-6 py-6 first-of-type:mt-12 sm:px-8 sm:py-7">
            <h2 className="font-display text-[1.45rem] leading-tight font-semibold tracking-[-0.02em] text-white">{item.q}</h2>
            <p className="mt-4">
              {rich(item.a, {
                horizon: out(UPSTREAM_URL),
                releases: inSite("/releases"),
                source: out(`${GAME_URL}/tree/${GAME_REF}`),
                mods: inSite("/mods"),
                apigaps: inSite("/api-gaps"),
                issues: out(`${GAME_URL}/issues`),
                board: out(BOARD_URL),
                privacy: inSite("/privacy"),
              })}
            </p>
          </section>
        ))}
      </article>
    </main>
  );
}
