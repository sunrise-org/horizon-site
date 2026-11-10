import Image from "next/image";
import { ChipIcon, CodeIcon, DriveIcon, ExternalLinkIcon, HorizonLogo } from "@/components/icons";
import { getMessages, type Locale } from "@/components/i18n";
import { rich } from "@/components/i18n-text";
import { CONTRIBUTORS_URL, MOD_API_AUTHOR_URL, MOD_API_REPO_URL, NEOFORGE_URL, PROFILER_HELPER_URL, UPSTREAM_URL } from "@/components/links";
import { avatarUrl, profileUrl, TEAM } from "@/components/team";

const POINTS = [
  { icon: DriveIcon, key: "copy" },
  { icon: ChipIcon, key: "native" },
  { icon: CodeIcon, key: "open" },
] as const;

const CREDIT_LINK = "underline decoration-white/25 underline-offset-4 transition-colors hover:text-white";

export function About({ locale }: { locale: Locale }) {
  const { common, home } = getMessages(locale);
  const t = home.about;
  const out = (href: string) =>
    function OutLink(text: string) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={CREDIT_LINK}>
          {text}
          <span className="sr-only"> {common.newTab}</span>
        </a>
      );
    };
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-14 pt-8 pb-8">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
        <div className="grid lg:grid-cols-[minmax(0,25rem)_3rem_minmax(0,1fr)_3rem_23rem]">
          <div className="reveal relative z-20 lg:col-start-1 lg:row-start-1">
            <p className="flex items-center gap-2.5 text-sm font-medium text-white/60">
              {t.eyebrow}
              <HorizonLogo className="h-4 w-auto" />
            </p>
            <h2
              id="about-title"
              className="mt-5 font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-white"
            >
              {t.title}
            </h2>
          </div>

          <div className="reveal relative z-20 mt-5 lg:col-span-3 lg:col-start-1 lg:row-start-2 lg:mt-0 lg:pt-8">
            <p className="text-lg leading-relaxed text-pretty text-white/65">
              {t.lead}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-pretty text-white/55">
              {rich(t.fork, {
                upstream: (text) => (
                  <a href={UPSTREAM_URL} target="_blank" rel="noreferrer" className="underline decoration-white/25 underline-offset-4 transition-colors hover:text-white">
                    {text}
                    <span className="sr-only"> {common.newTab}</span>
                  </a>
                ),
              })}
            </p>
            <div className="mt-6">
              <h3 className="text-[14px] font-medium text-white/70">{t.team.title}</h3>
              <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
                {TEAM.map((member) => (
                  <li key={member.login}>
                    <a
                      href={profileUrl(member.login)}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-2.5 text-[15px] text-white/80 transition-colors hover:text-white"
                    >
                      <Image src={avatarUrl(member.login)} alt="" width={32} height={32} className="size-8 shrink-0 rounded-full" />
                      <span className="underline decoration-white/25 underline-offset-4 group-hover:decoration-white/60">{member.name}</span>
                      <span className="sr-only"> {common.newTab}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 text-[14px] leading-relaxed text-white/50">
              <h3 className="font-medium text-white/70">{t.credits.title}</h3>
              <ul className="mt-2 space-y-1">
                <li>{rich(t.credits.built, { horizon: out(UPSTREAM_URL) })}</li>
                <li>{rich(t.credits.api, { neoforge: out(NEOFORGE_URL) })}</li>
                <li>{rich(t.credits.modders, { ari: out(MOD_API_AUTHOR_URL), repo: out(MOD_API_REPO_URL) })}</li>
                <li>{rich(t.credits.profiler, { gigger: out(PROFILER_HELPER_URL) })}</li>
              </ul>
            </div>
            <a
              href={CONTRIBUTORS_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-[#a98fff] underline decoration-[#a98fff]/40 underline-offset-4 transition-colors hover:text-[#c4b5ff] hover:decoration-[#c4b5ff]"
            >
              {t.contributors}
              <ExternalLinkIcon className="size-4" />
              <span className="sr-only">{common.newTab}</span>
            </a>
          </div>

          <div
            className="reveal relative mt-10 h-[15rem] overflow-hidden [clip-path:inset(0_round_1rem)] sm:h-[17rem] lg:col-span-3 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:h-auto"
          >
            <Image
              src="/about-wallpaper.jpg"
              alt={t.imageAlt}
              fill
              sizes="(min-width: 1024px) 39rem, 100vw"
              className="-scale-x-100 object-cover object-[30%_center]"
            />
          </div>

          <div
            aria-hidden
            className="relative z-10 hidden rounded-tr-2xl bg-background lg:col-span-2 lg:col-start-3 lg:row-start-2 lg:block"
          >
            <span className="absolute -top-4 left-0 size-4 bg-[radial-gradient(circle_at_100%_0,transparent_16px,var(--background)_16.5px)]" />
            <span className="absolute bottom-0 left-full size-4 bg-[radial-gradient(circle_at_100%_0,transparent_16px,var(--background)_16.5px)]" />
          </div>
        </div>

        <ul className="mt-10 grid gap-10 md:grid-cols-3">
          {POINTS.map((point) => (
            <li key={point.key} className="reveal">
              <h3 className="flex items-center gap-2.5 text-lg font-medium text-white">
                <point.icon className="size-5 shrink-0" />
                {t.points[point.key].title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-pretty text-white/60">{t.points[point.key].body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
