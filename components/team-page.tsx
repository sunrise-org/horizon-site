import Image from "next/image";
import Link from "next/link";
import { getSitePulls } from "@/components/contributors";
import { GitHubIcon } from "@/components/icons";
import { UPSTREAM_URL } from "@/components/links";
import { Initial } from "@/components/sunrise-team";
import { avatarUrl, memberOf, ORIGINAL_SITE_MAKER, profileUrl, SITE_MAKERS, TEAM } from "@/components/team";

const CARD = "team-chip glass-panel flex h-full flex-col rounded-2xl border border-line/60 p-6";
const LINK_CARD = `${CARD} soft-press focus-visible:outline-2 focus-visible:outline-offset-2`;
const NEW_TAB = <span className="sr-only"> (opens in a new tab)</span>;

function Name({ children }: { children: React.ReactNode }) {
  return <span className="mt-5 font-display text-xl font-semibold tracking-[-0.02em] text-foreground">{children}</span>;
}

function Handle({ login }: { login: string }) {
  return (
    <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[13px] text-accent-ink">
      <GitHubIcon className="size-3.5" />
      {login}
    </span>
  );
}

function Detail({ children }: { children: React.ReactNode }) {
  return <span className="mt-4 text-[15px] leading-relaxed text-pretty text-muted">{children}</span>;
}

export async function TeamPage() {
  const pulls = await getSitePulls();
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 pt-32 pb-24 sm:pt-40 lg:px-10">
      <p className="text-sm font-medium text-muted">Sunrise</p>
      <h1 className="mt-4 font-display text-[clamp(2.25rem,6vw,4rem)] leading-[1.04] font-semibold tracking-[-0.035em] text-foreground">
        The <span className="text-accent">team</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted">
        Sunrise is a community fork of{" "}
        <a href={UPSTREAM_URL} target="_blank" rel="noreferrer" className="sun-link text-accent-ink">
          Horizon
          {NEW_TAB}
        </a>
        , made to ease development and to ship features that are still in development. These are the people who make it.
      </p>

      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM.map(({ login, name }) => (
          <li key={name}>
            {login ? (
              <a href={profileUrl(login)} target="_blank" rel="noreferrer" className={LINK_CARD}>
                <Image src={avatarUrl(login)} alt="" width={72} height={72} className="size-18 rounded-full" />
                <Name>{name}</Name>
                <Handle login={login} />
                {NEW_TAB}
              </a>
            ) : (
              <div className={CARD}>
                <Initial name={name} className="size-18 text-2xl" />
                <Name>{name}</Name>
              </div>
            )}
          </li>
        ))}
      </ul>

      <h2 className="mt-24 font-display text-[clamp(1.6rem,3vw,2.25rem)] font-semibold tracking-[-0.03em] text-foreground">This site</h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-pretty text-muted">
        playsunrise.net is made by Xmilon and Umut. It grew out of the Horizon site, made by Anthony S.
      </p>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SITE_MAKERS.map((login) => {
          const n = pulls?.[login];
          return (
            <li key={login}>
              <a href={profileUrl(login)} target="_blank" rel="noreferrer" className={LINK_CARD}>
                <Image src={avatarUrl(login)} alt="" width={72} height={72} className="size-18 rounded-full" />
                <Name>{memberOf(login)?.name ?? login}</Name>
                <Handle login={login} />
                <Detail>{n === undefined ? "Site maker" : `Site maker · ${n} pull request${n === 1 ? "" : "s"} to this site`}</Detail>
                {NEW_TAB}
              </a>
            </li>
          );
        })}
        <li>
          <a href={ORIGINAL_SITE_MAKER.url} target="_blank" rel="noreferrer" className={LINK_CARD}>
            <Image src={ORIGINAL_SITE_MAKER.avatar} alt="" width={72} height={72} className="size-18 rounded-full" />
            <Name>{ORIGINAL_SITE_MAKER.name}</Name>
            <Detail>Made the original Horizon site, which this one grew out of.</Detail>
            {NEW_TAB}
          </a>
        </li>
      </ul>

      <p className="mt-16 text-[15px] leading-relaxed text-muted">
        Horizon was founded by Ludovic Marie. Everyone who wrote its code is listed under{" "}
        <Link href="/#contributors" className="sun-link text-accent-ink">
          Horizon contributors
        </Link>
        , and the people behind the mod API on{" "}
        <Link href="/modding-team" className="sun-link text-accent-ink">
          the modding team
        </Link>
        .
      </p>
    </main>
  );
}
