import { cacheLife, cacheTag } from "next/cache";
import { githubFetch } from "@/components/github-api";
import { TAGS } from "@/components/github-fresh";
import { TEAM } from "@/components/team";
import { REPO } from "./links";
import { parseTeamPulls, searchPath, teamQuery, type TeamPulls } from "./team-prs-parse";

export const TEAM_REPOS = [REPO, "sunrise-org/horizon"] as const;
export const TEAM_QUERY = teamQuery(TEAM.flatMap((m) => (m.login ? [m.login] : [])), TEAM_REPOS);

// The team's open pull requests; null when GitHub would not answer, and the page leaves the section out.
export async function getTeamPulls(): Promise<TeamPulls | null> {
  "use cache";
  cacheTag(TAGS.apiGaps);
  try {
    const res = await githubFetch(searchPath(TEAM_QUERY));
    if (!res.ok) throw new Error(`GitHub responded ${res.status} for the search`);
    const pulls = parseTeamPulls(await res.json());
    cacheLife({ stale: 300, revalidate: 900, expire: 86400 });
    return pulls;
  } catch (error) {
    console.error("[api-gaps] couldn't list the team's pull requests:", error);
    cacheLife("minutes");
    return null;
  }
}
