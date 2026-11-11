// Seeds lib/api-gaps/capabilities.ts and external.json: node scripts/api-gaps-extract.mjs <export.html> [--force]
import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fail, readEvidence, readExport } from "./api-gaps-html.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const [input, flag] = process.argv.slice(2);
if (!input) {
  console.error("usage: node scripts/api-gaps-extract.mjs <api-gaps.html> [--force]");
  process.exit(1);
}
const target = join(root, "lib/api-gaps/capabilities.ts");
if (existsSync(target) && flag !== "--force") {
  console.error("lib/api-gaps/capabilities.ts is hand-edited; pass --force to overwrite it with a fresh seed");
  process.exit(1);
}

const data = readExport(input);
const REPO = "arismoko/horizon";
if (data.repo !== REPO) fail(`repo ${data.repo}`);
const BOARD = "https://github.com/users/arismoko/projects/1/views/2";
const OLD_BOARD = "https://github.com/users/arismoko/projects/1/views/3";

const board = (href) => (href === OLD_BOARD ? BOARD : href);
const fixRich = (rich) => rich.map((part) => (typeof part === "string" ? part : { ...part, href: board(part.href) }));
const refNumber = (href) => {
  const m = new RegExp(`^https://github\\.com/${REPO}/(?:issues|pull)/(\\d+)$`).exec(href);
  return m ? Number(m[1]) : fail(`not an issue or pull link: ${href}`);
};
// A work line reads "#792 · open · no public claim found" or "PR #2731 · open".
function baseline(line) {
  const at = line.findIndex((part) => typeof part !== "string");
  const [, state, claim] = /^ · (open|closed|merged)(?: · (.+))?$/.exec(line.slice(at + 1).join("")) ?? fail(`work line ${JSON.stringify(line)}`);
  const ref = { number: refNumber(line[at].href), state };
  return claim && claim !== "no public claim found" ? { ...ref, claim } : ref;
}
const blob = `https://github.com/${REPO}/blob/${data.commit}/`;
const sourcePath = ({ path, href }) => {
  if (href !== blob + path) fail(`source ${path}`);
  return path;
};

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [, day, month, year] = /^(\d+) (\w+) (\d{4})$/.exec(data.reviewed) ?? fail(`review date ${data.reviewed}`);
const date = `${year}-${String(months.indexOf(month) + 1).padStart(2, "0")}-${day.padStart(2, "0")}`;

const curated = {
  eyebrow: data.eyebrow,
  title: data.title,
  lede: data.lede,
  reviewed: { date, commit: data.commit },
  docs: data.docs,
  hub: data.hub.map((link) => ({ ...link, href: board(link.href) })),
  claimable: {
    intro: fixRich(data.claimIntro),
    items: data.claimable.map((item) => {
      const [, number, title] = /^#(\d+) (.+)$/.exec(item.title.text) ?? fail(`claimable title ${item.title.text}`);
      if (refNumber(item.title.href) !== Number(number)) fail("claimable number and link differ");
      return { number: Number(number), title, note: fixRich(item.next) };
    }),
    more: data.more.map(fixRich),
  },
  comparison: { intro: data.comparisonIntro },
  areas: data.areas.map(({ id, name }) => ({ id, name })),
  capabilities: data.areas.flatMap((area) =>
    area.capabilities.map((c) => ({
      area: area.id,
      title: c.title,
      status: c.status,
      note: c.note,
      refs: c.work.map(baseline),
      sources: c.sources.map(sourcePath),
      counterpart: c.counterpart,
    })),
  ),
  foot: data.foot,
};

const external = readEvidence(data.evidence)
  .filter((g) => g.kind === "topics" || g.kind === "changelog")
  .map(({ count, ...group }) => {
    void count;
    return group;
  });

writeFileSync(
  target,
  `// Curated rows, seeded once by scripts/api-gaps-extract.mjs from an api-gaps.html export; edit by hand.\nimport type { Curated } from "./types";\n\nexport const curated: Curated = ${JSON.stringify(curated, null, 2)};\n`,
);
writeFileSync(join(root, "lib/api-gaps/external.json"), `${JSON.stringify({ groups: external })}\n`);
console.log(`${curated.areas.length} areas, ${curated.capabilities.length} capabilities, ${external.length} external groups`);
