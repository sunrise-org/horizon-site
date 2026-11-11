import { gameBlob } from "./game-repo.ts";

const REPO_BLOB = gameBlob("");
const OFFICIAL = "https://playsunrise.net";
const LOCAL_PATHS = /^\/(docs(\/|$|#)|hub(\/|$|#)|releases(\/|$|#)|mods(\/?(#|$)|\/[a-z0-9_]+\/?(#|$))|#|$)/;

export type DocHeading = { level: number; text: string; id: string };
export type ImageSize = (src: string) => { width: number; height: number } | null;

export function escape(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function localPath(url: string) {
  if (url === "/docs/" || url.startsWith("/docs/#")) return url.replace("/docs/", "/docs");
  if (LOCAL_PATHS.test(url)) return url;
  return OFFICIAL + url;
}

function href(url: string) {
  url = url.trim();
  if (/^(https?:|mailto:)/i.test(url)) return url;
  if (url.startsWith("#")) return url;
  if (/^\/(?!\/)/.test(url)) return localPath(url);
  if (/^[a-z]+:/i.test(url)) return null;
  return REPO_BLOB + url.replace(/^\.?\//, "");
}

export function inline(text: string): string {
  const codes: string[] = [];
  let out = text.replace(/`([^`]+)`/g, (_, code: string) => {
    codes.push(code);
    return `\u0000${codes.length - 1}\u0000`;
  });
  const links: [string, string][] = [];
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, url: string) => {
    links.push([label, url]);
    return `\u0001${links.length - 1}\u0001`;
  });
  out = escape(out)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^\w*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/(^|[^\w])_([^_\s][^_]*)_(?!\w)/g, "$1<em>$2</em>")
    .replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, (_, u: string) => `<a href="${u}">${u}</a>`);
  out = out.replace(/\u0001(\d+)\u0001/g, (_, i: string) => {
    const [label, url] = links[Number(i)];
    const target = href(url);
    const body = inline(label.replace(/\u0000(\d+)\u0000/g, (__, c: string) => `\`${codes[Number(c)]}\``));
    if (!target) return body;
    const external = /^https?:/i.test(target) ? ' target="_blank" rel="noreferrer"' : "";
    return `<a href="${escape(target)}"${external}>${body}</a>`;
  });
  return out.replace(/\u0000(\d+)\u0000/g, (_, i: string) => `<code>${escape(codes[Number(i)])}</code>`);
}

// Code colours: for each language, the kinds of token in the order they are tried. A token is one <span class="tok-…">.
const STRING = String.raw`"(?:\\.|[^"\\\n])*"`;
const NUMBER = String.raw`\b\d[\d_]*(?:\.\d+)?\b`;
const TOKENS: Record<string, [string, string][]> = {
  rust: [
    ["comment", String.raw`\/\/.*|\/\*[\s\S]*?\*\/`],
    ["string", STRING],
    ["attr", String.raw`#!?\[[^\]\n]*\]`],
    ["keyword", String.raw`\b(?:as|async|await|break|const|continue|crate|dyn|else|enum|extern|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|type|unsafe|use|where|while|true|false)\b`],
    ["fn", String.raw`\b[a-z_]\w*!|\b[a-z_]\w*(?=\()`],
    ["type", String.raw`\b[A-Z]\w*\b`],
    ["number", NUMBER],
  ],
  toml: [
    ["comment", String.raw`(?<=^|\s)#.*`],
    ["string", String.raw`${STRING}|'[^'\n]*'`],
    ["type", String.raw`^\s*\[\[?[^\]\n]+\]\]?`],
    ["attr", String.raw`^\s*[\w.-]+(?=\s*=)`],
    ["keyword", String.raw`\b(?:true|false)\b`],
    ["number", NUMBER],
  ],
  json: [
    ["attr", String.raw`${STRING}(?=\s*:)`],
    ["string", STRING],
    ["keyword", String.raw`\b(?:true|false|null)\b`],
    ["number", String.raw`-?${NUMBER}`],
  ],
  sh: [
    ["comment", String.raw`(?<=^|\s)#.*`],
    ["string", String.raw`${STRING}|'[^'\n]*'`],
    ["fn", String.raw`^\s*[\w./-]+`],
    ["attr", String.raw`(?<=\s)--?[A-Za-z][\w-]*`],
    ["type", String.raw`\$\{?\w+\}?|<[^<>\n]+>`],
  ],
};
const ALIASES: Record<string, string> = { bash: "sh", shell: "sh", console: "sh", rs: "rust" };
const LEXERS = new Map(Object.entries(TOKENS).map(([lang, kinds]) => [lang, new RegExp(kinds.map(([, re]) => `(${re})`).join("|"), "gm")]));

export function highlight(code: string, lang: string) {
  lang = ALIASES[lang] ?? lang;
  const lexer = LEXERS.get(lang);
  if (!lexer) return escape(code);
  let out = "";
  let at = 0;
  for (const m of code.matchAll(lexer)) {
    const kind = TOKENS[lang][m.slice(1).findIndex((g) => g !== undefined)][0];
    out += `${escape(code.slice(at, m.index))}<span class="tok-${kind}">${escape(m[0])}</span>`;
    at = m.index + m[0].length;
  }
  return out + escape(code.slice(at));
}

const ROW = /^\s*\|.*\|\s*$/;
const RULE = /^\s*\|(\s*:?-+:?\s*\|)+\s*$/;

function cells(row: string) {
  const s = row.trim().slice(1, -1);
  const out = [""];
  let code = false;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\\" && s[i + 1] === "|") out[out.length - 1] += s[++i];
    else if (s[i] === "|" && !code) out.push("");
    else {
      if (s[i] === "`") code = !code;
      out[out.length - 1] += s[i];
    }
  }
  return out.map((c) => c.trim());
}

function table(lines: string[], start: number): [string, number] {
  const row = (line: string, tag: string) => `<tr>${cells(line).map((c) => `<${tag}>${inline(c)}</${tag}>`).join("")}</tr>`;
  let i = start + 2;
  const body: string[] = [];
  while (i < lines.length && ROW.test(lines[i])) body.push(row(lines[i++], "td"));
  return [`<div class="table-wrap" role="region" aria-label="Reference table" tabindex="0"><table><thead>${row(lines[start], "th")}</thead><tbody>${body.join("")}</tbody></table></div>`, i];
}

const indentOf = (line: string) => line.match(/^ */)![0].length;
const ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;

// An item holding more than a line of text (a code block, a second paragraph) is rendered as blocks.
function item(lines: string[], imageSize: ImageSize) {
  if (!lines.some((l) => !l.trim() || /^\s*(```|~~~)/.test(l))) return inline(lines.map((l) => l.trim()).join(" "));
  const indent = Math.min(...lines.slice(1).filter((l) => l.trim()).map(indentOf));
  return markdown([lines[0], ...lines.slice(1).map((l) => l.slice(indent))].join("\n"), [], imageSize);
}

function list(lines: string[], start: number, imageSize: ImageSize): [string, number] {
  const base = indentOf(lines[start]);
  const ordered = /\d/.test(lines[start].match(ITEM)![2]);
  const items: { text: string[]; children: string[] }[] = [];
  let i = start;
  let fence = "";
  while (i < lines.length) {
    const line = lines[i];
    const mark = line.match(/^\s*(```|~~~)/)?.[1];
    if (items.length && (fence || (mark && indentOf(line) > base))) {
      if (mark && (!fence || fence === mark)) fence = fence ? "" : mark;
      items[items.length - 1].text.push(line);
      i++;
      continue;
    }
    if (!line.trim()) {
      const next = lines.slice(i + 1).find((l) => l.trim());
      if (next && indentOf(next) > base && !ITEM.test(next) && items.length) {
        items[items.length - 1].text.push("");
        i++;
        continue;
      }
      if (next && ITEM.test(next) && indentOf(next) >= base) {
        i++;
        continue;
      }
      break;
    }
    const m = line.match(ITEM);
    if (m && indentOf(line) === base) {
      items.push({ text: [m[3]], children: [] });
    } else if (m && indentOf(line) > base) {
      const [html, end] = list(lines, i, imageSize);
      items[items.length - 1].children.push(html);
      i = end;
      continue;
    } else if (indentOf(line) > base && items.length) {
      items[items.length - 1].text.push(line);
    } else {
      break;
    }
    i++;
  }
  const tag = ordered ? "ol" : "ul";
  const body = items.map((it) => `<li>${item(it.text, imageSize)}${it.children.join("")}</li>`).join("");
  return [`<${tag}>${body}</${tag}>`, i];
}

export const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function plainText(md: string) {
  return md.replace(/`/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\*\*/g, "");
}

export function markdown(source: string, headings: DocHeading[] = [], imageSize: ImageSize = () => null): string {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || /^\s*<\/?[a-z][^>]*>\s*$/i.test(line) || /^\s*<!--.*-->\s*$/.test(line)) {
      i++;
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^(#{1,6})\s+(.*?)\s*#*$/))) {
      const level = m[1].length;
      const html = inline(m[2]);
      if (level >= 2 && level <= 4) {
        const base = slug(m[2]);
        let id = base;
        for (let n = 2; headings.some((h) => h.id === id); n++) id = `${base}-${n}`;
        headings.push({ level, text: plainText(m[2]), id });
        const body = html.includes("<a ") ? html : `<a class="heading-link" href="#${id}">${html}</a>`;
        out.push(`<h${level} id="${id}">${body}</h${level}>`);
      } else {
        out.push(`<h${level}>${html}</h${level}>`);
      }
      i++;
    } else if ((m = line.match(/^!\[([^\]]*)\]\((\/media\/[\w./-]+)\)\s*$/))) {
      const size = imageSize(m[2]);
      const dims = size ? ` width="${size.width}" height="${size.height}"` : "";
      out.push(
        `<figure><img src="${escape(m[2])}" alt="${escape(m[1])}"${dims} loading="lazy" decoding="async"><figcaption>${inline(m[1])}</figcaption></figure>`,
      );
      i++;
    } else if ((m = line.match(/^\s*(```|~~~)\s*([\w+-]*)/))) {
      const fence = m[1];
      const lang = m[2];
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence)) code.push(lines[i++]);
      i++;
      out.push(
        `<div class="code-block"><div class="code-toolbar"><span>${escape(lang || "text")}</span><button type="button" class="soft-press" data-wrap aria-pressed="false">Wrap lines</button><button type="button" class="soft-press" data-copy>Copy</button></div><pre tabindex="0" aria-label="${escape(lang || "Text")} code"><code>${highlight(code.join("\n"), lang)}</code></pre></div>`,
      );
    } else if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      out.push("<hr>");
      i++;
    } else if (ROW.test(line) && RULE.test(lines[i + 1] || "")) {
      const [html, end] = table(lines, i);
      out.push(html);
      i = end;
    } else if (ITEM.test(line)) {
      const [html, end] = list(lines, i, imageSize);
      out.push(html);
      i = end;
    } else if (line.startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) quote.push(lines[i++].replace(/^>\s?/, ""));
      out.push(`<blockquote>${markdown(quote.join("\n"), [], imageSize)}</blockquote>`);
    } else {
      const para: string[] = [];
      while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|>|\s*```|\s*~~~)/.test(lines[i]) && !ITEM.test(lines[i])) {
        para.push(lines[i++].trim());
      }
      out.push(`<p>${inline(para.join(" "))}</p>`);
    }
  }
  return out.join("\n");
}
