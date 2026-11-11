// Copies the modding book (docs/modding/src) of a Horizon checkout into content/docs/modding, at one commit.
//   node scripts/sync-modding-docs.mjs <horizon checkout> <commit> [owner/repo]
// Pages are copied as they are, except mdBook's {{#include file:anchor}} lines, which are replaced by the code
// they name: the site has no mdBook. components/modding-docs.ts turns the copies into pages.
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";

const [checkout, rev, repo = "arismoko/horizon"] = process.argv.slice(2);
if (!checkout || !rev) {
  console.error("usage: node scripts/sync-modding-docs.mjs <horizon checkout> <commit> [owner/repo]");
  process.exit(2);
}

const SRC = "docs/modding/src";
const OUT = join(import.meta.dirname, "..", "content", "docs", "modding");
const git = (...args) => execFileSync("git", ["-C", checkout, ...args], { encoding: "utf8", maxBuffer: 1 << 28 });

const commit = git("rev-parse", `${rev}^{commit}`).trim();
const show = (path) => git("show", `${commit}:${path}`).replace(/\r\n?/g, "\n");

function include(from, target) {
  const [file, anchor] = target.split(":");
  const path = posix.normalize(posix.join(posix.dirname(from), file));
  const lines = show(path).split("\n");
  if (!anchor) return lines.join("\n").trimEnd();
  const start = lines.findIndex((l) => l.trim().endsWith(`ANCHOR: ${anchor}`));
  const end = lines.findIndex((l) => l.trim().endsWith(`ANCHOR_END: ${anchor}`));
  if (start < 0 || end < start) throw new Error(`${from}: no anchor ${anchor} in ${path}`);
  const body = lines.slice(start + 1, end).filter((l) => !/ANCHOR(_END)?: /.test(l));
  const indent = Math.min(...body.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return body.map((l) => l.slice(indent)).join("\n");
}

rmSync(OUT, { recursive: true, force: true });
const files = git("ls-tree", "-r", "--name-only", commit, SRC).split("\n").filter((f) => f.endsWith(".md"));
for (const path of files) {
  // Keep the indentation of the include line on every line it brings in: a block inside a list item stays in it.
  const text = show(path).replace(/^([ \t]*)\{\{#(?:rustdoc_)?include ([^ }]+)\s*\}\}$/gm, (_, pad, target) =>
    include(path, target).split("\n").map((l) => (l ? pad + l : l)).join("\n"),
  );
  const out = join(OUT, path.slice(SRC.length + 1));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, text);
}
writeFileSync(join(OUT, "source.json"), `${JSON.stringify({ repo, commit, path: SRC }, null, 2)}\n`);
console.log(`${files.length} pages from ${repo}@${commit.slice(0, 7)}`);
