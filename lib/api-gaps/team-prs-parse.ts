export const SHOWN = 12;

export type TeamPull = { repo: string; number: number; title: string; url: string; author: string; draft: boolean; updatedAt: string };
export type TeamPulls = { total: number; pulls: TeamPull[] };

type SearchItem = {
  number: number;
  title: string;
  html_url: string;
  draft?: boolean;
  updated_at: string;
  repository_url: string;
  user: { login: string } | null;
};
type SearchBody = { total_count: number; items: SearchItem[] };

// Several author: and repo: qualifiers each match any of their values.
export function teamQuery(logins: readonly string[], repos: readonly string[]): string {
  return ["is:pr", "is:open", ...logins.map((l) => `author:${l}`), ...repos.map((r) => `repo:${r}`)].join(" ");
}

export const searchPath = (query: string) => `/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=30`;
export const searchUrl = (query: string) => `https://github.com/pulls?q=${encodeURIComponent(query)}`;

export function parseTeamPulls(body: SearchBody, limit = SHOWN): TeamPulls {
  if (!Array.isArray(body.items) || typeof body.total_count !== "number") throw new Error("GitHub's search has no items");
  const pulls = body.items.slice(0, limit).map((item): TeamPull => ({
    repo: item.repository_url.replace(/^.*\/repos\//, ""),
    number: item.number,
    title: item.title,
    url: item.html_url,
    author: item.user?.login ?? "ghost",
    draft: item.draft === true,
    updatedAt: item.updated_at,
  }));
  return { total: body.total_count, pulls };
}
