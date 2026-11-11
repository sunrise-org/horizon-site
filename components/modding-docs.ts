// Turns the copy of the modding book in content/docs/modding (scripts/sync-modding-docs.mjs) into docs pages:
// mdBook's parts become nav groups, the per-concept sources of its two aggregate chapters become pages of their
// own under them, and the book's relative links become site paths with this site's heading ids.
import { posix } from "node:path";
import { slug as siteSlug } from "./docs-markdown.ts";

export type BookSource = { repo: string; commit: string; path: string };
export type BookPage = { slug: string; file: string; title: string; text: string; parent: string | null };
export type BookGroup = { group: string; pages: string[] };
export type Book = { groups: BookGroup[]; pages: Map<string, BookPage>; parents: Record<string, string> };

// The chapters mdBook assembles from a folder of the same name (tools/modding_concept_pages.py in the game's repository).
const AGGREGATES = ["concepts/trait-mods.md", "how-to/native-mods.md"];
// Each page directly in one of these folders joins the part, after the pages SUMMARY.md lists, in title order.
const FOLDERS: Record<string, string> = { Concepts: "concepts", "How-to": "how-to" };
const CHAPTER = /^<!-- chapter: (.+) -->\n(?:<!-- separator: \d+ -->\n)?\n?/;
const LINK = /(!?\[[^\]\n]*\]\()([^)\s]+)(\))/g;

const fileSlug = (file: string) =>
  file === "introduction.md" ? "modding" : `modding/${file.replace(/\.md$/, "").replace(/(^|\/)\d+-/g, "$1")}`;

// Runs `change` on every line outside a fenced code block.
function outsideFences(text: string, change: (line: string) => string) {
  let fence = "";
  return text
    .split("\n")
    .map((line) => {
      const mark = line.match(/^\s*(```|~~~)/)?.[1];
      if (mark && (!fence || fence === mark)) {
        fence = fence ? "" : mark;
        return line;
      }
      return fence ? line : change(line);
    })
    .join("\n");
}

type Heading = { level: number; book: string; site: string };

// A page's headings with mdBook's id and the id docs-markdown.ts gives the same heading (levels 2 to 4 only).
function headings(text: string): Heading[] {
  const out: Heading[] = [];
  const counts = new Map<string, number>();
  outsideFences(text, (line) => {
    const m = line.match(/^(#{1,6})\s+(.*?)\s*#*$/);
    if (!m) return line;
    const base = m[2].toLowerCase().replace(/[^\p{L}\p{N}_\- ]/gu, "").replace(/ /g, "-");
    const n = counts.get(base) ?? 0;
    counts.set(base, n + 1);
    let site = "";
    if (m[1].length >= 2 && m[1].length <= 4) {
      site = siteSlug(m[2]);
      for (let i = 2; out.some((h) => h.site === site); i++) site = `${siteSlug(m[2])}-${i}`;
    }
    out.push({ level: m[1].length, book: n ? `${base}-${n}` : base, site });
    return line;
  });
  return out;
}

// A concept source starts at the heading level it has inside its aggregate: as a page it starts at level 1.
function chapter(text: string) {
  const title = text.match(CHAPTER)![1];
  let body = text.replace(CHAPTER, "");
  const top = body.match(/^(#{2,6}) /)?.[1].length;
  if (top) body = body.replace(/^.*\n+/, "");
  const shift = (top ?? 2) - 1;
  body = outsideFences(body, (line) => line.replace(/^#{2,6}(?= )/, (h) => "#".repeat(Math.max(2, h.length - shift))));
  return { title, text: `# ${title}\n\n${body}` };
}

export function book(files: Record<string, string>, source: BookSource): Book {
  const pages = new Map<string, BookPage>();
  const parents: Record<string, string> = {};
  const byFile = new Map<string, BookPage>();
  const add = (file: string, title: string, text: string, parent: string | null = null) => {
    const page = { slug: fileSlug(file), file, title: title.replace(/`/g, ""), text, parent };
    byFile.set(file, page);
    return page;
  };
  const children = new Map<string, BookPage[]>();

  for (const [file, raw] of Object.entries(files)) {
    if (!file.endsWith(".md") || file === "SUMMARY.md") continue;
    const text = raw.replace(/\r\n?/g, "\n");
    const group = AGGREGATES.find((a) => file.startsWith(a.replace(/\.md$/, "/")));
    if (group) {
      const part = chapter(text);
      children.set(group, [...(children.get(group) ?? []), add(file, part.title, part.text, fileSlug(group))]);
    } else if (!AGGREGATES.includes(file)) {
      add(file, text.match(/^# (.+)$/m)?.[1] ?? file, text);
    }
  }
  // An aggregate's page is its first source, followed by the list of the others.
  for (const group of AGGREGATES) {
    const [first, ...rest] = (children.get(group) ?? []).sort((a, b) => a.file.localeCompare(b.file));
    if (!first) continue;
    const title = files[group]?.match(/^# (.+)$/m)?.[1] ?? first.title;
    const list = rest.map((p) => `- [${p.title}](/docs/${p.slug})`).join("\n");
    const page = add(group, title, `${first.text.replace(/^# .+\n/, `# ${title}\n`).trimEnd()}\n\n## Chapters\n\n${list}\n`);
    byFile.set(first.file, page);
    children.set(group, rest);
    for (const p of rest) parents[p.slug] = page.slug;
  }

  const ids = new Map<BookPage, Heading[]>();
  const idsOf = (page: BookPage) => ids.get(page) ?? ids.set(page, headings(page.text)).get(page)!;
  const blob = (path: string) => `https://github.com/${source.repo}/blob/${source.commit}/${path}`;

  function link(from: BookPage, url: string) {
    if (/^([a-z][a-z0-9+.-]*:|\/)/i.test(url)) return url;
    const [path, anchor = ""] = url.split("#");
    const file = path ? posix.normalize(posix.join(posix.dirname(from.file), path)) : from.file;
    let target = path ? byFile.get(file) : from;
    if (!target) {
      // A chapter mdBook generates at build time has no source page: send the reader to the book's folder.
      const inBook = !file.startsWith("../") && file.endsWith(".md");
      return inBook ? `https://github.com/${source.repo}/tree/${source.commit}/${source.path}` : blob(posix.normalize(posix.join(source.path, file))) + (anchor ? `#${anchor}` : "");
    }
    // An anchor of an aggregate chapter belongs to the page of the source that has the heading.
    if (anchor && AGGREGATES.includes(target.file) && !idsOf(target).some((h) => h.book === anchor)) {
      target = (children.get(target.file) ?? []).find((p) => idsOf(p).some((h) => h.book === anchor)) ?? target;
    }
    const id = anchor && idsOf(target).find((h) => h.book === anchor)?.site;
    return (target === from && id ? "" : `/docs/${target.slug}`) + (id ? `#${id}` : "");
  }

  for (const page of new Set(byFile.values())) {
    pages.set(page.slug, { ...page, text: outsideFences(page.text, (line) => line.replace(LINK, (_, a, url, b) => a + link(page, url) + b)) });
  }

  // SUMMARY.md: "# Part" lines and "[Title](file)" entries; an entry with no file is a generated chapter.
  const groups: BookGroup[] = [{ group: "Modding book", pages: [] }];
  const listed = new Set<string>();
  for (const line of (files["SUMMARY.md"] ?? "").split("\n")) {
    const part = line.match(/^# (.+)$/)?.[1];
    if (part && part !== "Summary") groups.push({ group: part, pages: [] });
    const file = line.match(/^(?:- )?\[[^\]]+\]\(([^)]+)\)/)?.[1];
    if (file && byFile.has(file)) {
      groups.at(-1)!.pages.push(file);
      listed.add(file);
    }
  }
  for (const g of groups) {
    const folder = FOLDERS[g.group];
    if (!folder) continue;
    const rest = [...byFile.values()]
      .filter((p) => !p.parent && !listed.has(p.file) && posix.dirname(p.file) === folder)
      .sort((a, b) => a.title.localeCompare(b.title));
    g.pages.push(...new Set(rest.map((p) => p.file)));
  }
  // A part with no page of its own heading the book ("Start") joins the introduction; one-page parts close the book together.
  const [intro, ...parts] = groups;
  const merged: BookGroup[] = [];
  const tail: BookGroup = { group: "About the book", pages: [] };
  for (const g of parts) {
    if (g === parts[0]) merged.push({ group: "Modding book", pages: [...intro.pages, ...g.pages] });
    else if (g.pages.length === 1 && !FOLDERS[g.group]) tail.pages.push(...g.pages);
    else merged.push(g);
  }
  if (tail.pages.length) merged.push(tail);
  // Each page is followed by its chapters, so the order of the list is the reading order.
  const withChildren = (file: string) => [byFile.get(file)!.slug, ...(children.get(file) ?? []).map((p) => p.slug)];
  return { groups: merged.filter((g) => g.pages.length).map((g) => ({ group: g.group, pages: g.pages.flatMap(withChildren) })), pages, parents };
}
