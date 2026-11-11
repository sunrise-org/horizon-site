import Image from "next/image";
import { avatarUrl, profileUrl, TEAM } from "@/components/team";

const CHIP = "team-chip glass-panel inline-flex items-center gap-2.5 rounded-xl border border-line px-3 py-2 text-[15px] text-foreground";

export function SunriseTeam({ newTab }: { newTab: string }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-3">
      {TEAM.map(({ login, name }) => (
        <li key={name}>
          {login ? (
            <a
              href={profileUrl(login)}
              target="_blank"
              rel="noreferrer"
              className={`${CHIP} soft-press focus-visible:outline-2 focus-visible:outline-accent`}
            >
              <Image src={avatarUrl(login)} alt="" width={32} height={32} className="size-8 shrink-0 rounded-full" />
              <span>{name}</span>
              <span className="sr-only"> {newTab}</span>
            </a>
          ) : (
            <span className={CHIP}>
              <Initial name={name} className="size-8 text-sm" />
              <span>{name}</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

// Stands in for an avatar when a member has no GitHub account.
export function Initial({ name, className }: { name: string; className: string }) {
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-full bg-accent/20 font-display font-semibold text-accent-ink ${className}`}>
      {name.replace(/^\d+/, "").charAt(0).toUpperCase() || name.charAt(0)}
    </span>
  );
}
