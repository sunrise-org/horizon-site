import type { EvidenceFile, EvidenceSymbol } from "./types";

// A line-based reader of the vocabulary crate's Rust; it needs no Rust parser because the files follow one layout.

const FN = /^\s*(?:pub(?:\([^)]*\))?\s+)?(?:const\s+)?(?:unsafe\s+)?fn\s+(\w+)/;

function lineOf(source: string): string[] {
  return source.split("\n");
}

// Every `fn` of a host area file: the host's traits declare the whole surface.
export function hostSymbols(source: string): EvidenceSymbol[] {
  const out: EvidenceSymbol[] = [];
  lineOf(source).forEach((text, i) => {
    const m = /^\s+fn\s+(\w+)/.exec(text);
    if (m) out.push({ name: m[1], line: i + 1 });
  });
  return out;
}

// The `fn` under each `#[hook(...)]`, with its side, contract and the upstream counterparts the attribute names.
export function hookSymbols(source: string): EvidenceSymbol[] {
  const lines = lineOf(source);
  const out: EvidenceSymbol[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*#\[hook\b/.test(lines[i])) continue;
    let attr = lines[i];
    let j = i;
    while (!/\)\]\s*$/.test(lines[j]) && j + 1 < lines.length) attr += ` ${lines[++j]}`;
    let k = j + 1;
    while (k < lines.length && !FN.test(lines[k])) k++;
    const name = FN.exec(lines[k] ?? "")?.[1];
    if (!name) break;
    const side = /side\s*=\s*"([^"]*)"/.exec(attr)?.[1];
    const contract = /contract\s*=\s*"([^"]*)"/.exec(attr)?.[1];
    const counterparts = /\bneoforge\s*=\s*(\[[^\]]*\]|"[^"]*")/.exec(attr)?.[1];
    const note = [side && `side ${side}`, contract && `contract ${contract}`, ...[...(counterparts ?? "").matchAll(/"([^"]*)"/g)].map((m) => m[1])];
    out.push({ name, line: k + 1, note: note.filter(Boolean).join(" · ") });
    i = k;
  }
  return out;
}

const REGISTRAR_TRAIT = /^(?:pub(?:\([^)]*\))?\s+)?trait\s+\w*(?:Registrar|Listeners|Providers)\b/;
const REGISTRAR_IMPL = /^impl\s+dyn\s+(?:Registrar|ServerReloadListeners)\b/;

// The methods of the registrar traits (`*Registrar`, `*Listeners`, `*Providers`) and the public ones the registrar object adds.
export function registrarSymbols(source: string): EvidenceSymbol[] {
  const out: EvidenceSymbol[] = [];
  let inside: "trait" | "impl" | null = null;
  lineOf(source).forEach((text, i) => {
    if (/^\S/.test(text)) inside = REGISTRAR_TRAIT.test(text) ? "trait" : REGISTRAR_IMPL.test(text) ? "impl" : null;
    if (!inside) return;
    const m = /^\s+(pub(?:\([^)]*\))?\s+)?(?:const\s+)?(?:unsafe\s+)?fn\s+(\w+)/.exec(text);
    if (m && (inside === "trait" || m[1])) out.push({ name: m[2], line: i + 1 });
  });
  return out;
}

// A book page's title is its first level-one heading; a page without one has none.
export function bookTitle(source: string): string {
  return /^# (.+)$/m.exec(source)?.[1].trim() ?? "";
}

export function nonEmpty(files: EvidenceFile[]): EvidenceFile[] {
  return files.filter((f) => f.symbols.length > 0);
}
