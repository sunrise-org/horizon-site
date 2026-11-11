import Image from "next/image";
import { avatarUrl, profileUrl, TEAM } from "@/components/team";

export function SunriseTeam({ newTab }: { newTab: string }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-3">
      {TEAM.map(({ login, name }) => (
        <li key={login}>
          <a
            href={profileUrl(login)}
            target="_blank"
            rel="noreferrer"
            className="team-chip glass-panel soft-press inline-flex items-center gap-2.5 rounded-xl border border-line px-3 py-2 text-[15px] text-foreground focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Image src={avatarUrl(login)} alt="" width={32} height={32} className="size-8 shrink-0 rounded-full" />
            <span>{name}</span>
            <span className="sr-only"> {newTab}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
