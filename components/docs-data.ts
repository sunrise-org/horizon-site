import { readdir, readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join, posix } from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import { rawGameUrl, TAGS } from "@/components/github-fresh";
import { gameBlob } from "@/components/game-repo";
import { inline, markdown, plainText, type DocHeading } from "@/components/docs-markdown";
import { book, type Book, type BookSource } from "@/components/modding-docs";

const CONTENT = join(process.cwd(), "content", "docs");
const PUBLIC = join(process.cwd(), "public");

// `section` is the tab of the docs menu the group shows under; `parents` maps a chapter to the page it belongs to.
export type DocGroup = { group: string; section: string; pages: string[]; parents?: Record<string, string> };
export type Doc = {
  slug: string;
  path: string;
  group: string;
  title: string;
  lede: string;
  description: string;
  html: string;
  headings: DocHeading[];
  source: string;
  api: boolean;
  // Where the page is read and edited on GitHub, when it comes from another repository.
  sourceUrl: string | null;
  missing: boolean;
};
export type DocIndexEntry = { path: string; title: string; group: string; lede: string; headings: { id: string; text: string }[] };

const API_TITLES: Record<string, string> = {
  api: "Sunrise APIs",
  "api/stability": "API stability and versioning",
  "api/mod-index": "The registry index and .hpack",
  "api/server": "Server API",
  "api/server-reference": "Server reference",
  "api/agent-control": "Agent control API",
  "api/launcher": "Launcher API",
  "api/data-formats": "Data formats",
  "api/shaders": "Shader API",
};

const isApi = (slug: string) => slug === "api" || slug.startsWith("api/");
const apiSource = (slug: string) => `docs/api/${slug === "api" ? "README" : slug.slice(4)}.md`;
export const docPath = (slug: string) => (slug === "index" ? "/docs" : `/docs/${slug}`);

function webpSize(file: Buffer) {
  if (file.toString("ascii", 0, 4) !== "RIFF" || file.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = file.toString("ascii", 12, 16);
  if (chunk === "VP8 ") return { width: file.readUInt16LE(26) & 0x3fff, height: file.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = file.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") return { width: file.readUIntLE(24, 3) + 1, height: file.readUIntLE(27, 3) + 1 };
  return null;
}

function imageSize(src: string) {
  try {
    return webpSize(readFileSync(join(PUBLIC, src)));
  } catch {
    return null;
  }
}

async function repoFile(path: string) {
  const res = await fetch(await rawGameUrl(path), { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${path}: GitHub responded ${res.status}`);
  return res.text();
}

function apiLinks(text: string, from: string, slugs: Set<string>) {
  return text.replace(/\]\(([^)\s]+)\)/g, (all, url: string) => {
    const own = url.match(/^https:\/\/(?:playsunrise\.net|playhorizon\.dev)(\/.*)$/);
    if (own) return `](${own[1]})`;
    if (/^([a-z]+:|#|\/)/i.test(url)) return all;
    const [file, id] = url.split("#");
    const path = posix.normalize(posix.join(posix.dirname(from), file));
    const page = path.match(/^docs\/api\/([\w-]+)\.md$/)?.[1];
    const slug = page === "README" ? "api" : page && `api/${page}`;
    const to = slug && slugs.has(slug) ? `/docs/${slug}` : gameBlob(path);
    return `](${to}${id ? `#${id}` : ""})`;
  });
}

async function parityNumbers() {
  try {
    const readme = await repoFile("README.md");
    const harnesses = readme.match(/all (\d[\d,]*) (?:parity )?harnesses/)?.[1];
    return { harnesses: harnesses ?? "281" };
  } catch {
    return { harnesses: "281" };
  }
}

// The modding book: a copy of the game's docs/modding/src at one commit (scripts/sync-modding-docs.mjs).
async function getBook(): Promise<{ book: Book; source: BookSource }> {
  "use cache";
  const root = join(CONTENT, "modding");
  const names = (await readdir(root, { recursive: true })).filter((f) => f.endsWith(".md"));
  const files = await Promise.all(names.map(async (f) => [f.replaceAll("\\", "/"), await readFile(join(root, f), "utf8")]));
  const source: BookSource = JSON.parse(await readFile(join(root, "source.json"), "utf8"));
  return { book: book(Object.fromEntries(files), source), source };
}

export async function getDocsNav(): Promise<DocGroup[]> {
  "use cache";
  const nav: (DocGroup | { book: string; section: string })[] = JSON.parse(await readFile(join(CONTENT, "nav.json"), "utf8"));
  const { book } = await getBook();
  return nav.flatMap((g) => ("book" in g ? book.groups.map((b) => ({ ...b, section: g.section, parents: book.parents })) : [g]));
}

export async function getDocs(): Promise<Doc[]> {
  "use cache";
  cacheTag(TAGS.main);
  const nav = await getDocsNav();
  const { book, source: bookSource } = await getBook();
  const slugs = new Set(nav.flatMap((g) => g.pages));
  const { harnesses } = await parityNumbers();
  let failed = false;
  const docs = await Promise.all(
    nav.flatMap(({ group, pages }) =>
      pages.map(async (slug): Promise<Doc> => {
        const api = isApi(slug);
        const page = book.pages.get(slug);
        const source = api ? apiSource(slug) : page ? `${bookSource.path}/${page.file}` : `docs/${slug}.md`;
        const sourceUrl = api ? gameBlob(source) : page ? `https://github.com/${bookSource.repo}/blob/${bookSource.commit}/${source}` : null;
        const path = docPath(slug);
        let text: string;
        try {
          text = api ? await repoFile(source) : (page?.text ?? (await readFile(join(CONTENT, `${slug}.md`), "utf8")));
        } catch (error) {
          console.error(`Couldn't load ${source}:`, error);
          failed = true;
          const title = API_TITLES[slug] ?? slug;
          const link = gameBlob(source);
          return {
            slug,
            path,
            group,
            title,
            lede: `This page couldn't be loaded from GitHub just now. Read it there: <a href="${link}">${source}</a>.`,
            description: title,
            html: "",
            headings: [],
            source,
            api,
            sourceUrl,
            missing: true,
          };
        }
        text = text.replace(/\r\n?/g, "\n");
        if (api) text = apiLinks(text.replace(/^<!--[\s\S]*?-->\n/, ""), source, slugs);
        text = text.replaceAll("{{HARNESSES}}", harnesses);
        // The lede is the paragraph under the title, when the page starts with one.
        const m = text.match(/^# (.+)\n\n((?![#|>`~<\s]|[-*+] |\d+[.)] )(?:[^\n]+\n)+)\n/);
        const title = (m?.[1] ?? text.match(/^# (.+)\n/)?.[1])?.replace(/`/g, "").trim() ?? API_TITLES[slug] ?? slug;
        const lede = m ? m[2].trim().replace(/\n/g, " ") : "";
        const body = m ? text.slice(m[0].length) : text.replace(/^# .+\n/, "");
        const headings: DocHeading[] = [];
        const html = markdown(body, headings, imageSize);
        return {
          slug,
          path,
          group,
          title,
          lede: inline(lede),
          description: plainText(lede).slice(0, 220),
          html,
          headings,
          source,
          api,
          sourceUrl,
          missing: false,
        };
      }),
    ),
  );
  if (failed) cacheLife("minutes");
  else cacheLife("hours");
  return docs;
}

export async function getDoc(slug: string) {
  const docs = await getDocs();
  const i = docs.findIndex((d) => d.slug === slug);
  if (i < 0) return null;
  return { doc: docs[i], prev: docs[i - 1] ?? null, next: docs[i + 1] ?? null };
}

export function searchIndex(docs: Doc[]): DocIndexEntry[] {
  return docs.map((d) => ({
    path: d.path,
    title: d.title,
    group: d.group,
    lede: d.description,
    // Deeper headings are found through the section index, which the search loads when it opens.
    headings: d.headings.filter((h) => h.level === 2).map((h) => ({ id: h.id, text: h.text })),
  }));
}

export type DocSection = { href: string; page: string; heading: string; text: string };

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };

function htmlToText(html: string) {
  return html
    .replace(/<button[^>]*>[\s\S]*?<\/button>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(amp|lt|gt|quot|#39);/g, (e) => ENTITIES[e])
    .replace(/\s+/g, " ")
    .trim();
}

export function sectionIndex(docs: Doc[]): DocSection[] {
  const out: DocSection[] = [];
  for (const doc of docs) {
    const parts = doc.html.split(/(?=<h[234] id=")/);
    for (const part of parts) {
      const id = part.match(/^<h[234] id="([^"]+)">([\s\S]*?)<\/h[234]>/);
      const heading = id ? htmlToText(id[2]) : doc.title;
      const text = htmlToText(id ? part.slice(id[0].length) : `${doc.lede} ${part}`);
      if (text) out.push({ href: id ? `${doc.path}#${id[1]}` : doc.path, page: doc.title, heading, text });
    }
  }
  return out;
}
