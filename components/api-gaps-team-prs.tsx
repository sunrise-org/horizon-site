import Image from "next/image";
import { Synced } from "@/components/api-gaps-synced";
import { Ext } from "@/components/api-gaps-rich";
import { avatarUrl, memberOf } from "@/components/team";
import { searchUrl, type TeamPulls } from "@/lib/api-gaps/team-prs-parse";

const CARD = "rounded-2xl border border-white/10 bg-white/[0.035]";

export function TeamPullsSection({ data, query }: { data: TeamPulls | null; query: string }) {
  if (!data) return null;
  return (
    <section aria-labelledby="team-prs" className="mt-12">
      <h2 id="team-prs" className="font-display text-[1.6rem] leading-tight font-semibold tracking-[-0.02em] text-white">
        Team&apos;s open PRs
      </h2>
      {data.pulls.length === 0 ? (
        <p className="mt-3 text-sm text-white/60">No open pull requests from the team right now.</p>
      ) : (
        <ul className={`${CARD} mt-4 divide-y divide-white/10`}>
          {data.pulls.map((pull) => (
            <li key={pull.url} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
              <span className="w-full shrink-0 font-mono text-xs text-white/50 sm:w-44 sm:truncate">{pull.repo}</span>
              <Ext href={pull.url} className="min-w-0 flex-1 font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
                #{pull.number} {pull.title}
              </Ext>
              {pull.draft ? <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs text-white/60">Draft</span> : null}
              <span className="inline-flex items-center gap-1.5 text-white/65">
                <Image src={avatarUrl(pull.author)} alt="" width={20} height={20} className="size-5 rounded-full" />
                {memberOf(pull.author)?.name ?? pull.author}
              </span>
              <span className="text-xs text-white/50">
                <Synced iso={pull.updatedAt} />
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-sm">
        <Ext href={searchUrl(query)}>Show all {data.total} on GitHub</Ext>
      </p>
    </section>
  );
}
