// A small HTML reader for the api-gaps export: the file is machine-generated and regular, so no parser dependency.
import { readFileSync } from "node:fs";

export const STATUSES = ["Covered", "Partial", "Missing", "Not applicable"];
const VOID = new Set(["br", "input", "meta", "link", "hr", "img"]);

export function fail(message) {
  throw new Error(`api-gaps export does not have the expected shape: ${message}`);
}

function decode(text) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (whole, body) => {
    if (body[0] === "#") return String.fromCodePoint(body[1].toLowerCase() === "x" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10));
    return named[body] ?? fail(`unknown entity ${whole}`);
  });
}

export function parse(html) {
  const tokens = /<!--[\s\S]*?-->|<\/(\w+)\s*>|<(\w+)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>|([^<]+)/g;
  const attr = /([^\s=>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  const top = { tag: "#root", attrs: {}, children: [] };
  const stack = [top];
  for (const [whole, close, open, rawAttrs, text] of html.matchAll(tokens)) {
    if (whole.startsWith("<!--")) continue;
    const parent = stack[stack.length - 1];
    if (text !== undefined) {
      parent.children.push(decode(text));
    } else if (close) {
      if (parent.tag !== close) fail(`</${close}> closes <${parent.tag}>`);
      stack.pop();
    } else {
      const attrs = {};
      for (const [, name, a, b, c] of rawAttrs.matchAll(attr)) attrs[name] = decode(a ?? b ?? c ?? "");
      const node = { tag: open, attrs, children: [] };
      parent.children.push(node);
      if (!VOID.has(open)) stack.push(node);
    }
  }
  if (stack.length !== 1) fail("unclosed elements");
  return top;
}

export const isEl = (node, tag, cls) => typeof node !== "string" && node.tag === tag && (cls === undefined || (node.attrs.class ?? "").split(/\s+/).includes(cls));
export const text = (node) => (typeof node === "string" ? node : node.children.map(text).join(""));
export const elements = (node) => node.children.filter((c) => typeof c !== "string");
export const one = (node, tag, cls) => {
  const found = elements(node).filter((c) => isEl(c, tag, cls));
  if (found.length !== 1) fail(`<${node.tag}> has ${found.length} <${tag}${cls ? `.${cls}` : ""}>, expected 1`);
  return found[0];
};
export const find = (node, pred, out = []) => {
  if (typeof node === "string") return out;
  if (pred(node)) out.push(node);
  for (const child of node.children) find(child, pred, out);
  return out;
};

// Inline prose: text and links; any other element only contributes its text.
export function rich(nodes) {
  const out = [];
  const push = (part) => {
    if (typeof part === "string" && typeof out[out.length - 1] === "string") out[out.length - 1] += part;
    else out.push(part);
  };
  const walk = (list) => {
    for (const node of list) {
      if (typeof node === "string") push(node);
      else if (node.tag === "a") push({ text: text(node), href: node.attrs.href });
      else if (node.tag === "br") fail("unexpected <br> inside prose");
      else walk(node.children);
    }
  };
  walk(nodes);
  if (typeof out[0] === "string") out[0] = out[0].trimStart();
  if (typeof out[out.length - 1] === "string") out[out.length - 1] = out[out.length - 1].trimEnd();
  return out.filter((part) => part !== "");
}

export function lines(nodes) {
  const groups = [[]];
  for (const node of nodes) {
    if (typeof node !== "string" && node.tag === "br") groups.push([]);
    else groups[groups.length - 1].push(node);
  }
  return groups.map(rich);
}


// The export's page content, read into plain structures (no URLs rewritten, nothing dropped).
export function readExport(path) {
  const doc = parse(readFileSync(path, "utf8"));
  const main = one(one(one(doc, "html"), "body"), "main");
  const kids = elements(main).filter((c) => !isEl(c, "script"));
  let at = 0;
  const next = (tag, cls) => {
    const node = kids[at++];
    if (!node || !isEl(node, tag, cls)) fail(`expected <${tag}${cls ? `.${cls}` : ""}> at child ${at - 1}, got ${node?.tag}.${node?.attrs.class ?? ""}`);
    return node;
  };
  const heading = (name, id) => {
    const h = next("h2");
    if (text(h) !== name || h.attrs.id !== id) fail(`expected h2 "${name}", got "${text(h)}"`);
  };

  const eyebrow = text(next("p", "eyebrow"));
  const title = text(next("h1"));
  const lede = text(next("p", "lede"));
  const meta = next("p", "meta");
  const metaMatch = /^Reviewed (.+?) · Horizon main (\S+) · (.+)$/.exec(text(meta));
  const commitLink = find(meta, (n) => n.tag === "a")[0];
  const commitMatch = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/commit\/([0-9a-f]{40})$/.exec(commitLink?.attrs.href ?? "");
  if (!metaMatch || !commitMatch || commitMatch[2].slice(0, 12) !== metaMatch[2]) fail("meta line");
  const stats = elements(next("div", "stats")).map((stat) => {
    const label = text(stat).slice(text(one(stat, "b")).length);
    if (!STATUSES.includes(label)) fail(`stat label ${label}`);
    return { value: Number(text(one(stat, "b"))), label };
  });
  const hub = elements(next("nav", "link-hub")).map((a) => ({ text: text(a), href: a.attrs.href }));

  heading("Claimable now");
  const claimIntro = rich(next("p", "sub").children);
  const claimable = elements(next("ul", "plan")).map((li) => {
    const link = one(li, "a");
    return { title: { text: text(link), href: link.attrs.href }, next: rich(one(li, "span", "next").children) };
  });
  const claimMore = next("details");
  if (text(one(claimMore, "summary")) !== "Other issues and claim history") fail("claim history summary");
  const more = elements(claimMore).filter((c) => c.tag !== "summary").map((p) => (isEl(p, "p", "sub") ? rich(p.children) : fail("claim history paragraph")));

  heading("Capability comparison", "comparison");
  const comparisonIntro = rich(next("p", "sub").children);
  const jump = next("details");
  if (text(one(jump, "summary")) !== "Jump to an area") fail("jump summary");
  const areaNav = elements(one(jump, "nav", "area-nav")).map((a) => ({ text: text(a), id: a.attrs.href.slice(1) }));
  const filters = next("div", "filters");
  if (find(filters, (n) => n.tag === "option").map(text).join("|") !== ["All statuses", ...STATUSES].join("|")) fail("status filter options");
  next("p", "sub");

  const areas = [];
  while (kids[at] && isEl(kids[at], "section")) {
    const section = kids[at++];
    const name = text(one(section, "h2"));
    const countLine = text(one(section, "p", "sub"));
    const capabilities = elements(one(section, "div", "capability-list")).map((article) => {
      const status = article.attrs["data-status"];
      if (!STATUSES.includes(status)) fail(`status ${status}`);
      const head = one(article, "header");
      if (text(one(head, "span", "badge")) !== status) fail("badge text differs from data-status");
      const cap = { title: text(one(head, "h3")), status, note: text(one(article, "p", "capability-note")), work: [] };
      const work = elements(article).find((c) => isEl(c, "p", "work-links"));
      if (work) {
        if (text(one(work, "strong")) !== "GitHub") fail("work-links label");
        cap.work = lines(work.children.filter((c) => !isEl(c, "strong")));
      }
      const details = one(article, "details", "source-links");
      if (text(one(details, "summary")) !== "Sources and counterpart") fail("sources summary");
      cap.sources = elements(one(details, "ul")).map((li) => ({ path: one(li, "a").attrs.title, href: one(li, "a").attrs.href, label: text(one(li, "a")) }));
      cap.counterpart = lines(one(details, "p").children);
      return cap;
    });
    areas.push({ id: section.attrs.id, name, countLine, capabilities });
  }
  if (areaNav.map((a) => a.id).join() !== areas.map((a) => a.id).join()) fail("area nav and sections differ");

  heading("Evidence inventory", "evidence");
  const evidence = [];
  while (kids[at] && isEl(kids[at], "details") && !find(kids[at], (n) => n.tag === "pre").length) evidence.push(kids[at++]);
  while (kids[at] && !isEl(kids[at], "p", "foot")) {
    if (!isEl(kids[at], "details") || !find(kids[at], (n) => n.tag === "pre").length) fail("unexpected element between the evidence and the foot");
    at++; // the embedded font's licence
  }
  const foot = rich(next("p", "foot").children);
  if (at !== kids.length) fail("elements after the foot");
  return {
    eyebrow, title, lede, repo: commitMatch[1], commit: commitMatch[2], reviewed: metaMatch[1], docs: metaMatch[3],
    stats, hub, claimIntro, claimable, more, comparisonIntro, areas, evidence, foot,
  };
}

// Evidence groups: symbol files, book pages, doc topics, changelog sections.
export function readEvidence(nodes) {
  return nodes.map((details) => {
    const summary = text(one(details, "summary"));
    const body = elements(details).filter((c) => c.tag !== "summary");
    const counted = /^(.+) · (\d+) symbols in (\d+) files$/.exec(summary);
    if (counted) {
      const files = body.map((p) => {
        const [head, br, ...links] = p.children;
        if (!isEl(head, "a") || !isEl(br, "br")) fail("evidence file head");
        return {
          path: head.attrs.title,
          symbols: links.filter((c) => typeof c !== "string").map((a) => {
            const m = /#L(\d+)$/.exec(a.attrs.href);
            if (!m) fail("evidence symbol link");
            return { name: text(a), line: Number(m[1]) };
          }),
        };
      });
      return { kind: "symbols", name: counted[1], symbols: Number(counted[2]), files };
    }
    if (body.length === 1 && isEl(body[0], "ul")) {
      return {
        kind: "docs",
        name: summary,
        files: elements(body[0]).map((li) => ({ path: one(li, "a").attrs.title, title: text(li).slice(text(one(li, "a")).length).replace(/^ · /, "") })),
      };
    }
    const changelog = /^(.+) · (\d+) entries$/.exec(summary);
    if (changelog) {
      const [introP, ...rest] = body;
      const sections = [];
      for (let i = 0; i < rest.length; i += 2) {
        const [, name] = /^(.+) · \d+$/.exec(text(rest[i])) ?? fail("changelog section heading");
        const tokens = [];
        for (const part of rest[i + 1].children) {
          if (typeof part === "string") tokens.push(...part.split(" · ").map((t) => t.replace(/^[,\s]+|[,\s]+$/g, "")).filter(Boolean));
          else tokens.push({ text: text(part), href: part.attrs.href });
        }
        const entries = [];
        for (const token of tokens) {
          if (typeof token === "string") entries.push({ version: token, prs: [] });
          else entries[entries.length - 1].prs.push(token);
        }
        sections.push({ name, entries });
      }
      const total = sections.reduce((n, s) => n + s.entries.length, 0);
      if (total !== Number(changelog[2])) fail(`changelog entries ${total} != ${changelog[2]}`);
      return { kind: "changelog", name: changelog[1], count: total, intro: rich(introP.children), sections };
    }
    if (body.every((p) => isEl(p, "p") && isEl(p.children[0], "a"))) {
      return {
        kind: "topics",
        name: summary,
        items: body.map((p) => ({
          link: { text: text(p.children[0]), href: p.children[0].attrs.href },
          headings: text(p).slice(text(p.children[0]).length).replace(/^ · /, "").split(" / ").filter(Boolean),
        })),
      };
    }
    return fail(`evidence group "${summary}"`);
  });
}
