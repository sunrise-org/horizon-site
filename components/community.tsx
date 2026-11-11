import type { ComponentType, SVGProps } from "react";
import {
  getMessages,
  type Locale,
  type Messages,
} from "@/components/i18n";
import { DiscordIcon, GitHubIcon, ShieldIcon } from "@/components/icons";
import { BUILD_URL, DISCORD_URL, GITHUB_URL } from "@/components/links";
import { PixelAurora } from "@/components/pixel-aurora";

const GLASS = {
  card: "glass-panel soft-press border border-line focus-visible:ring-accent",
  icon: "text-muted group-hover:text-foreground group-focus-visible:text-foreground",
  title: "text-foreground",
  body: "text-muted",
};

const DISCORD = {
  card: "soft-press bg-[#4b57cc] hover:bg-[#414bb5] focus-visible:ring-accent",
  icon: "text-white",
  title: "text-white",
  body: "text-white",
};

const LIGHT = {
  card: "glass-panel glass-sky soft-press border border-line focus-visible:ring-accent",
  icon: "text-foreground",
  title: "text-foreground",
  body: "text-muted",
};

type Card = {
  key: keyof Messages["home"]["community"]["links"];
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone: typeof GLASS;
};

const LINKS: Card[] = [
  ...(DISCORD_URL
    ? [
        {
          key: "discord" as const,
          href: DISCORD_URL,
          icon: DiscordIcon,
          tone: DISCORD,
        },
      ]
    : []),
  { key: "source", href: GITHUB_URL, icon: GitHubIcon, tone: LIGHT },
  { key: "build", href: BUILD_URL, icon: ShieldIcon, tone: GLASS },
];

export function Community({ locale }: { locale: Locale }) {
  const t = getMessages(locale).home.community;
  return (
    <section
      id="community"
      aria-labelledby="community-title"
      className="relative isolate mb-8 scroll-mt-14 overflow-hidden py-16  sm:py-24"
    >
      <PixelAurora className="absolute top-0 left-0 -z-10" />

      <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
        <div className="reveal">
          <p className="text-sm font-medium text-muted">{t.eyebrow}</p>
          <h2
            id="community-title"
            className="mt-5 font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-foreground"
          >
            {t.title}
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-pretty text-muted">
            {t.lead}
          </p>
        </div>

        <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
          {LINKS.map(({ key, href, icon: Icon, tone }) => (
            <li key={key} className="flex">
              <a
                href={href}
                className={`group flex w-full flex-col rounded-xl p-6 transition outline-none focus-visible:ring-2 motion-safe:hover:-translate-y-0.5 ${tone.card}`}
              >
                <span
                  className={`flex items-center gap-2.5 text-[17px] font-medium ${tone.title}`}
                >
                  <Icon
                    className={`size-5 shrink-0 transition-colors ${tone.icon}`}
                  />
                  {t.links[key].title}
                </span>
                <span
                  className={`mt-2 text-sm leading-relaxed text-pretty ${tone.body}`}
                >
                  {t.links[key].body}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
