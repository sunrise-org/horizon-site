import type { DocGroup, EvidenceSummary, SymbolGroup } from "./types";

export const HOST_GROUP = "Host methods";
export const HOOK_GROUP = "Hook catalog and named counterparts";
export const REGISTRAR_GROUP = "Registrar traits and registration methods";
export const BOOK_GROUP = "Horizon modding book";
export const LIVE_GROUPS = [HOST_GROUP, HOOK_GROUP, REGISTRAR_GROUP, BOOK_GROUP] as const;

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function summarize(group: SymbolGroup | DocGroup): EvidenceSummary {
  if (group.kind === "docs") return { name: group.name, detail: plural(group.files.length, "page") };
  const symbols = group.files.reduce((n, f) => n + f.symbols.length, 0);
  return { name: group.name, detail: `${plural(symbols, "symbol")} in ${plural(group.files.length, "file")}` };
}
