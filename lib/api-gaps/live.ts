import { cacheLife, cacheTag } from "next/cache";
import { githubFetch } from "@/components/github-api";
import { mainSha, TAGS } from "@/components/github-fresh";
import { curated } from "./capabilities";
import { REPO } from "./links";
import { bookTitle, hookSymbols, hostSymbols, nonEmpty, registrarSymbols } from "./parse";
import type { DocGroup, EvidenceFile, EvidenceSymbol, LiveEvidence, RefState, Sync, SymbolGroup } from "./types";

// Read from GitHub: the commit, one tree, the issues updated since the review, and file contents from raw.githubusercontent.com.

const SRC = "crates/horizon-mod-vocab/src/";
const BOOK = "docs/modding/src/";
const SHA = /^[0-9a-f]{40}$/;
const RAW_TIMEOUT = 20_000;
const PAGE = 100;
const MAX_PAGES = 6;

type TreeEntry = { path: string; type: string; sha: string };

type Tally = { api: number; raw: number };
type Tree = { entries: TreeEntry[]; truncated: boolean };

let treeCache: { commit: string; tree: Promise<Tree> } | null = null;
let lastSync: Sync | null = null;
let lastEvidence: LiveEvidence | null = null;
const pageMemo = new Map<number, { etag: string; size: number; refs: RefState[] }>();
const parsedByBlob = new Map<string, EvidenceSymbol[] | string>();

async function pool<T, R>(items: T[], size: number, run: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await run(items[i]);
      }
    }),
  );
  return out;
}

// One tree call per commit, shared by the sync and the evidence reads.
function readTree(commit: string, tally: Tally): Promise<Tree> {
  if (treeCache?.commit === commit) return treeCache.tree;
  tally.api++;
  const tree = (async () => {
    const res = await githubFetch(`/repos/${REPO}/git/trees/${commit}?recursive=1`);
    if (!res.ok) throw new Error(`GitHub responded ${res.status} for the tree`);
    const body = (await res.json()) as { tree?: Array<{ path: string; type: string; sha: string }>; truncated?: boolean };
    if (!Array.isArray(body.tree)) throw new Error("GitHub's tree has no entries");
    return { entries: body.tree.map(({ path, type, sha }) => ({ path, type, sha })), truncated: Boolean(body.truncated) };
  })();
  treeCache = { commit, tree };
  tree.catch(() => {
    if (treeCache?.tree === tree) treeCache = null;
  });
  return tree;
}

type IssueItem = {
  number: number;
  title: string;
  state: "open" | "closed";
  assignees?: Array<{ login: string }>;
  pull_request?: { merged_at: string | null };
};

export function linkedNumbers(): Set<number> {
  return new Set([...curated.capabilities.flatMap((c) => c.refs.map((r) => r.number)), ...curated.claimable.items.map((i) => i.number)]);
}

// The linked issues and pull requests that changed since the review: GitHub lists items by last update, a page at a time.
async function readUpdated(tally: Tally): Promise<RefState[]> {
  const wanted = linkedNumbers();
  const since = `${curated.reviewed.date}T00:00:00Z`;
  const out: RefState[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const known = pageMemo.get(page);
    tally.api++;
    const res = await githubFetch(`/repos/${REPO}/issues?state=all&sort=updated&direction=desc&since=${since}&per_page=${PAGE}&page=${page}`, {
      headers: known ? { "If-None-Match": known.etag } : undefined,
    });
    let entry = known;
    if (res.status !== 304 || !known) {
      if (!res.ok) throw new Error(`GitHub responded ${res.status} for the issues`);
      const items = (await res.json()) as IssueItem[];
      entry = {
        etag: res.headers.get("etag") ?? "",
        size: items.length,
        refs: items
          .filter((i) => wanted.has(i.number))
          .map((i): RefState => ({
            number: i.number,
            kind: i.pull_request ? "pr" : "issue",
            title: i.title,
            state: i.pull_request?.merged_at ? "merged" : i.state,
            assignees: (i.assignees ?? []).map((a) => a.login),
          })),
      };
      pageMemo.set(page, entry);
    }
    out.push(...(entry?.refs ?? []));
    if ((entry?.size ?? 0) < PAGE) break;
  }
  return out;
}

async function readSync(): Promise<Sync> {
  const tally: Tally = { api: 1, raw: 0 }; // the commit lookup is mainSha's
  const commit = await mainSha(REPO);
  if (!SHA.test(commit)) throw new Error("main's commit could not be read");
  const tree = await readTree(commit, tally);
  const onMain = new Set(tree.entries.map((e) => e.path));
  const sources = [...new Set(curated.capabilities.flatMap((c) => c.sources))];
  const missing = tree.truncated ? [] : sources.filter((p) => !onMain.has(p));
  let refs: RefState[];
  let refsFresh = true;
  try {
    refs = await readUpdated(tally);
  } catch (error) {
    console.error("[api-gaps] couldn't list the updated issues:", error);
    refs = [...pageMemo.values()].flatMap((entry) => entry.refs);
    refsFresh = false;
  }
  console.info(`[api-gaps] synced main ${commit.slice(0, 7)}: ${tally.api} GitHub API requests (commit, tree, ${tally.api - 2} pages of updated issues)`);
  return { fresh: true, syncedAt: new Date().toISOString(), commit, missing, refs, refsFresh };
}

const EMPTY_SYNC: Sync = { fresh: false, syncedAt: "", commit: "", missing: [], refs: [], refsFresh: false };

export async function getSync(): Promise<Sync> {
  "use cache";
  cacheTag(TAGS.apiGaps);
  try {
    const sync = await readSync();
    lastSync = sync;
    cacheLife({ stale: 300, revalidate: 900, expire: 86400 });
    return sync;
  } catch (error) {
    console.error("[api-gaps] couldn't sync with GitHub:", error);
    cacheLife("minutes");
    return lastSync ? { ...lastSync, fresh: false } : EMPTY_SYNC;
  }
}

async function rawText(commit: string, path: string, tally: Tally): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    try {
      tally.raw++;
      const res = await fetch(`https://raw.githubusercontent.com/${REPO}/${commit}/${path}`, { signal: AbortSignal.timeout(RAW_TIMEOUT) });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await res.text();
    } catch (error) {
      if (attempt >= 1) throw new Error(`couldn't read ${path}: ${error instanceof Error ? error.message : error}`);
    }
  }
}

async function symbolsOf(commit: string, entry: TreeEntry, kind: "host" | "hook" | "registrar", tally: Tally): Promise<EvidenceSymbol[]> {
  const key = `${kind}:${entry.sha}`;
  const known = parsedByBlob.get(key);
  if (Array.isArray(known)) return known;
  const source = await rawText(commit, entry.path, tally);
  const symbols = kind === "host" ? hostSymbols(source) : kind === "hook" ? hookSymbols(source) : registrarSymbols(source);
  parsedByBlob.set(key, symbols);
  return symbols;
}

async function titleOf(commit: string, entry: TreeEntry, tally: Tally): Promise<string> {
  const key = `book:${entry.sha}`;
  const known = parsedByBlob.get(key);
  if (typeof known === "string") return known;
  const title = bookTitle(await rawText(commit, entry.path, tally));
  parsedByBlob.set(key, title);
  return title;
}

const children = (entries: TreeEntry[], dir: string) =>
  entries.filter((e) => e.type === "blob" && e.path.startsWith(dir) && !e.path.slice(dir.length).includes("/") && e.path.endsWith(".rs")).sort((a, b) => a.path.localeCompare(b.path));

async function symbolGroup(commit: string, name: string, entries: TreeEntry[], kind: "host" | "hook" | "registrar", tally: Tally): Promise<SymbolGroup> {
  const files: EvidenceFile[] = await pool(entries, 24, async (e) => ({ path: e.path, symbols: await symbolsOf(commit, e, kind, tally) }));
  return { kind: "symbols", name, files: nonEmpty(files) };
}

async function readEvidence(): Promise<LiveEvidence> {
  const tally: Tally = { api: 1, raw: 0 };
  const commit = await mainSha(REPO);
  if (!SHA.test(commit)) throw new Error("main's commit could not be read");
  const { entries } = await readTree(commit, tally);
  const host = await symbolGroup(commit, "Host methods", children(entries, `${SRC}host/`), "host", tally);
  const hooks = await symbolGroup(commit, "Hook catalog and named counterparts", children(entries, `${SRC}hooks/`).filter((e) => e.path !== `${SRC}hooks/mod.rs`), "hook", tally);
  const registrar = await symbolGroup(
    commit,
    "Registrar traits and registration methods",
    ["parts/", "client/", "world/"].flatMap((d) => children(entries, SRC + d)),
    "registrar",
    tally,
  );
  const pages = entries.filter((e) => e.type === "blob" && e.path.startsWith(BOOK) && e.path.endsWith(".md")).sort((a, b) => a.path.localeCompare(b.path));
  const book: DocGroup = { kind: "docs", name: "Horizon modding book", files: await pool(pages, 24, async (e) => ({ path: e.path, title: await titleOf(commit, e, tally) })) };
  console.info(`[api-gaps] read the evidence at ${commit.slice(0, 7)}: ${tally.api} API and ${tally.raw} raw requests`);
  return { fresh: true, commit, groups: [host, hooks, registrar, book] };
}

export async function getEvidence(): Promise<LiveEvidence> {
  "use cache";
  cacheTag(TAGS.apiGaps);
  try {
    const evidence = await readEvidence();
    lastEvidence = evidence;
    cacheLife({ stale: 300, revalidate: 900, expire: 86400 });
    return evidence;
  } catch (error) {
    console.error("[api-gaps] couldn't read the evidence from GitHub:", error);
    cacheLife("minutes");
    return lastEvidence ? { ...lastEvidence, fresh: false } : { fresh: false, commit: "", groups: [] };
  }
}
