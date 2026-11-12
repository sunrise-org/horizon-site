import { cacheLife, cacheTag } from "next/cache";
import { githubFetch } from "@/components/github-api";
import { GAME_REF, GAME_REPO } from "@/components/game-repo";

// What the site reads from GitHub, by cache tag. Kira calls POST /api/revalidate with these tags when GitHub's
// webhook says they changed (a push to the game's branch, an issue or pull request, a release), so the pages follow
// within a minute; without that call each loader keeps its own cacheLife, as before.
export const TAGS = {
  main: `github:${GAME_REPO}:${GAME_REF}`, // files on the game's branch (roadmap.json, docs/api, README), site-maker PR counts
  issues: `github:${GAME_REPO}:issues`, // the game's issues and pull requests (the hub, the journal)
  releases: `github:${GAME_REPO}:releases`, // the game's releases
  mods: "github:sunrise-org/horizon-mods:main", // horizon-mods' main (the mod policy, the registry index it publishes)
  apiGaps: "github:arismoko-horizon:main", // arismoko/horizon's contributors, main and issues (/api-gaps)
} as const;
export const REVALIDATE_TAGS: readonly string[] = Object.values(TAGS);

const tagOf = (repo: string) => (repo === "sunrise-org/horizon-mods" ? TAGS.mods : repo === "arismoko/horizon" ? TAGS.apiGaps : TAGS.main);

// The commit a repository's branch points at. raw.githubusercontent.com caches a branch's files for five minutes, so
// files are read at this commit instead: once Kira revalidates the tag, the next read gets the files just pushed.
export async function refSha(repo: string, ref: string): Promise<string> {
  "use cache";
  cacheTag(tagOf(repo));
  try {
    const res = await githubFetch(`/repos/${repo}/commits/${encodeURIComponent(ref)}`);
    const sha = res.ok ? String((await res.json())?.sha ?? "") : "";
    if (!res.ok || !/^[0-9a-f]{40}$/.test(sha)) throw new Error(`GitHub responded ${res.status} ${res.statusText}`);
    cacheLife({ stale: 300, revalidate: 900, expire: 86400 });
    return sha;
  } catch (error) {
    console.error(`Couldn't read ${ref}'s commit for ${repo}:`, error);
    cacheLife("minutes");
    return ref;
  }
}

// A repository's main branch, for the repositories that are not the game's.
export const mainSha = (repo: string) => refSha(repo, "main");

// A file of a repository's branch, as raw.githubusercontent.com serves it at the branch's current commit.
export async function rawUrl(repo: string, ref: string, path: string): Promise<string> {
  return `https://raw.githubusercontent.com/${repo}/${await refSha(repo, ref)}/${path}`;
}

export const rawMainUrl = (repo: string, path: string) => rawUrl(repo, "main", path);
export const rawGameUrl = (path: string) => rawUrl(GAME_REPO, GAME_REF, path);
