// Checks lib/api-gaps/parse.ts against an export at its commit: node scripts/api-gaps-verify.mjs <export.html>
import { readEvidence, readExport } from "./api-gaps-html.mjs";
import { bookTitle, hookSymbols, hostSymbols, registrarSymbols } from "../lib/api-gaps/parse.ts";

const input = process.argv[2];
if (!input) {
  console.error("usage: node scripts/api-gaps-verify.mjs <api-gaps.html>");
  process.exit(1);
}
const data = readExport(input);
const exported = readEvidence(data.evidence);
const base = `https://raw.githubusercontent.com/${data.repo}/${data.commit}/`;
const SRC = "crates/horizon-mod-vocab/src/";

const res = await fetch(`https://api.github.com/repos/${data.repo}/git/trees/${data.commit}?recursive=1`, {
  headers: process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {},
});
if (!res.ok) throw new Error(`tree: ${res.status}`);
const paths = (await res.json()).tree.filter((e) => e.type === "blob").map((e) => e.path);
const children = (dir) => paths.filter((p) => p.startsWith(dir) && !p.slice(dir.length).includes("/") && p.endsWith(".rs")).sort();

async function mapPool(items, run) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: 24 }, async () => { while (next < items.length) { const i = next++; out[i] = await run(items[i]); } }));
  return out;
}
const read = async (p) => (await fetch(base + p)).text();
const symbolFiles = async (files, parse) => (await mapPool(files, async (p) => ({ path: p, symbols: parse(await read(p)) }))).filter((f) => f.symbols.length);

const mine = {
  "Host methods": await symbolFiles(children(`${SRC}host/`), hostSymbols),
  "Hook catalog and named counterparts": await symbolFiles(children(`${SRC}hooks/`).filter((p) => p !== `${SRC}hooks/mod.rs`), hookSymbols),
  "Registrar traits and public registration-related methods": await symbolFiles(["parts/", "client/", "world/"].flatMap((d) => children(SRC + d)), registrarSymbols),
};
const pages = paths.filter((p) => p.startsWith("docs/modding/src/") && p.endsWith(".md")).sort();
const titles = await mapPool(pages, async (p) => ({ path: p, title: bookTitle(await read(p)) }));

let failed = false;
const report = (name, ok, detail) => {
  console.log(`${ok ? "ok  " : "DIFF"} ${name}: ${detail}`);
  failed ||= !ok;
};
for (const group of exported.filter((g) => g.kind === "symbols")) {
  const got = mine[group.name];
  const key = (files) => new Map(files.map((f) => [f.path, f.symbols.map((s) => `${s.line}:${s.name}${s.note ? ` · ${s.note}` : ""}`)]));
  const want = key(group.files);
  const have = key(got ?? []);
  const sum = (m) => [...m.values()].reduce((n, v) => n + v.length, 0);
  if (group.name.startsWith("Registrar")) {
    // The export's list also holds hand-picked accessors and test helpers; the rule finds the registrar traits' methods.
    const missed = [...have].flatMap(([p, v]) => v.filter((x) => !want.get(p)?.includes(x)));
    report(group.name, missed.length === 0, `${sum(have)} of the export's ${sum(want)} symbols, none outside it`);
  } else {
    const same = want.size === have.size && [...want].every(([p, v]) => have.get(p)?.join("\n") === v.join("\n"));
    report(group.name, same, `${sum(have)} symbols in ${have.size} files (export: ${sum(want)} in ${want.size})`);
  }
}
const book = exported.find((g) => g.kind === "docs");
const sameBook = book.files.length === titles.length && book.files.every((f, i) => f.path === titles[i].path && f.title === titles[i].title);
report(book.name, sameBook, `${titles.length} pages (export: ${book.files.length})`);
process.exit(failed ? 1 : 0);
