export const REPO = "arismoko/horizon";
export const BOARD_URL = "https://github.com/users/arismoko/projects/1/views/2";

export const repoUrl = `https://github.com/${REPO}`;
export const commitUrl = (commit: string) => `${repoUrl}/commit/${commit}`;
export const refUrl = (number: number) => `${repoUrl}/issues/${number}`;
export const shortCommit = (commit: string) => commit.slice(0, 12);

export function blobUrl(commit: string, path: string, line?: number): string {
  return `${repoUrl}/blob/${commit}/${path}${line === undefined ? "" : `#L${line}`}`;
}

// Source paths show without the tree the page's rows mostly live in.
const ROOTS = ["crates/horizon-mod-vocab/src/", "docs/modding/src/"];

export function sourceLabel(path: string): string {
  const root = ROOTS.find((r) => path.startsWith(r));
  return root ? path.slice(root.length) : path;
}
