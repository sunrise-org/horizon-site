import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { markdown } from "./docs-markdown.ts";
import { book } from "./modding-docs.ts";

const SOURCE = { repo: "o/r", commit: "c0ffee", path: "docs/modding/src" };

test("chapters of an aggregate become pages and anchors follow the heading", () => {
  const { groups, pages, parents } = book(
    {
      "SUMMARY.md": "# Summary\n\n[Intro](introduction.md)\n\n# Start\n\n- [First](start/first.md)\n\n# How-to\n\n- [Native mods](how-to/native-mods.md)\n- [Generated]()\n",
      "introduction.md": "# Intro\n\nSee [trust](how-to/native-mods.md#trust), [top](how-to/native-mods.md#native-mods), [a file](../../x.md) and [notes](reference/hook-notes.md#x).\n",
      "start/first.md": "# First\n\n```sh\n# not a heading [a](b.md)\n```\n",
      "how-to/native-mods.md": "# Native mods\n\n<!-- concept-pages -->\n",
      "how-to/native-mods/000-native-mods.md": "<!-- chapter: Native mods -->\n<!-- separator: 1 -->\n\n## Native mods\n\nBody.\n",
      "how-to/native-mods/033-trust.md": "<!-- chapter: Trust -->\n\n### Trust\n\nSee [first](../../start/first.md).\n\n#### A mod's own `key`\n",
      "how-to/zeta.md": "# Zeta\n",
      "how-to/alpha.md": "# Alpha\n",
    },
    SOURCE,
  );
  assert.deepEqual(groups, [
    { group: "Modding book", pages: ["modding", "modding/start/first"] },
    { group: "How-to", pages: ["modding/how-to/native-mods", "modding/how-to/native-mods/trust", "modding/how-to/alpha", "modding/how-to/zeta"] },
  ]);
  assert.deepEqual(parents, { "modding/how-to/native-mods/trust": "modding/how-to/native-mods" });
  assert.equal(
    pages.get("modding")!.text,
    "# Intro\n\nSee [trust](/docs/modding/how-to/native-mods/trust), [top](/docs/modding/how-to/native-mods), [a file](https://github.com/o/r/blob/c0ffee/docs/x.md) and [notes](https://github.com/o/r/tree/c0ffee/docs/modding/src).\n",
  );
  assert.equal(pages.get("modding/how-to/native-mods/trust")!.text, "# Trust\n\nSee [first](/docs/modding/start/first).\n\n## A mod's own `key`\n");
  assert.match(pages.get("modding/how-to/native-mods")!.text, /^# Native mods\n\nBody\.\n\n## Chapters\n\n- \[Trust\]\(\/docs\/modding\/how-to\/native-mods\/trust\)\n$/);
  assert.ok(pages.get("modding/start/first")!.text.includes("[a](b.md)"));
});

test("the copied book renders with no dead link between its pages", () => {
  const root = join(import.meta.dirname, "..", "content", "docs", "modding");
  const names = (readdirSync(root, { recursive: true }) as string[]).filter((f) => f.endsWith(".md"));
  const files = Object.fromEntries(names.map((f) => [f.replaceAll("\\", "/"), readFileSync(join(root, f), "utf8")]));
  const { groups, pages } = book(files, JSON.parse(readFileSync(join(root, "source.json"), "utf8")));
  const inNav = new Set(groups.flatMap((g) => g.pages));
  const html = new Map([...pages].map(([slug, page]) => [slug, markdown(page.text.replace(/^# .+\n/, ""))]));
  for (const [slug, page] of pages) {
    assert.ok(inNav.has(slug), `${slug} is in no group`);
    assert.match(page.text, /^# \S/, `${slug} has no title`);
    for (const [, href] of html.get(slug)!.matchAll(/href="([^"]+)"/g)) {
      if (/^https?:/.test(href)) continue;
      const [path, id] = href.split("#");
      const target = path ? path.replace(/^\/docs\//, "") : slug;
      if (path && !path.startsWith("/docs/modding")) continue;
      assert.ok(html.has(target), `${slug}: ${href} names no page`);
      if (id) assert.ok(html.get(target)!.includes(` id="${id}"`), `${slug}: ${href} names no heading`);
    }
  }
});
