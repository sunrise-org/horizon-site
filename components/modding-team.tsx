import Image from "next/image";
import Link from "next/link";
import { ExternalLinkIcon, GitHubIcon } from "@/components/icons";
import { MOD_API_REPO_URL } from "@/components/links";
import { avatarUrl, memberOf, profileUrl } from "@/components/team";

// Who builds the mod API. Names come from the shared roster (components/team.ts), so a rename happens in one place.
const MEMBERS = [
  { login: "arismoko", role: "Leads the typed mod API and the modding book, in arismoko/horizon." },
  { login: "Xmilon", role: "The single-file .hmod, the mod tooling and the modding guides on this site." },
  { login: "levzzz5154", role: "Modding maintainer: hooks, packs, mod loading and menus." },
] as const;

export function ModdingTeamPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 pt-32 pb-24 sm:pt-40 lg:px-10">
      <p className="text-sm font-medium text-muted">Sunrise modding</p>
      <h1 className="mt-4 font-display text-[clamp(2.25rem,6vw,4rem)] leading-[1.04] font-semibold tracking-[-0.035em] text-foreground">
        The <span className="text-accent">modding team</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted">
        The people behind the typed mod API, the <code className="font-mono text-[0.9em] text-[#ffe6f0]">.hmod</code> file and the{" "}
        <Link href="/docs/make-a-mod" className="sun-link text-accent-ink">
          modding guides
        </Link>
        .
      </p>

      <ul className="mt-14 grid gap-5 sm:grid-cols-3">
        {MEMBERS.map(({ login, role }) => (
          <li key={login}>
            <a
              href={profileUrl(login)}
              target="_blank"
              rel="noreferrer"
              className="team-chip glass-panel soft-press group flex h-full flex-col rounded-2xl border border-line/60 p-6 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Image src={avatarUrl(login)} alt="" width={72} height={72} className="size-18 rounded-full" />
              <span className="mt-5 font-display text-xl font-semibold tracking-[-0.02em] text-foreground">{memberOf(login)?.name ?? login}</span>
              <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[13px] text-accent-ink">
                <GitHubIcon className="size-3.5" />
                {login}
              </span>
              <span className="mt-4 text-[15px] leading-relaxed text-pretty text-muted">{role}</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-12 text-[15px] leading-relaxed text-muted">
        With every modding contributor to{" "}
        <a href={`${MOD_API_REPO_URL}/graphs/contributors`} target="_blank" rel="noreferrer" className="sun-link inline-flex items-center gap-1 text-accent-ink">
          arismoko/horizon
          <ExternalLinkIcon className="size-3.5" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        .
      </p>
    </main>
  );
}
