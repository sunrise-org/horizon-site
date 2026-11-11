export type Status = "Covered" | "Partial" | "Missing" | "Not applicable";

export type Link = { text: string; href: string };

// Inline prose: plain text and links, no markup.
export type Rich = Array<string | Link>;

export type Area = { id: string; name: string };

export type RefName = "open" | "closed" | "merged";

// A linked issue or pull request of arismoko/horizon as it stood when the row was reviewed; the live state is laid over it.
export type RefBaseline = { number: number; state: RefName; claim?: string };

// A capability row.
export type Capability = {
  area: string;
  title: string;
  status: Status;
  note: string;
  refs: RefBaseline[];
  // Repo paths on main.
  sources: string[];
  counterpart: Rich[];
};

// The title is the fallback shown when the live one cannot be read.
export type ClaimableItem = { number: number; title: string; note: Rich };

export type Curated = {
  eyebrow: string;
  title: string;
  lede: string;
  // The day the statuses were last reviewed (ISO) and the commit they were reviewed against.
  reviewed: { date: string; commit: string };
  docs: string;
  hub: Link[];
  claimable: { intro: Rich; items: ClaimableItem[]; more: Rich[] };
  comparison: { intro: Rich };
  areas: Area[];
  capabilities: Capability[];
  foot: Rich;
};

export type RefState = {
  number: number;
  kind: "issue" | "pr";
  title: string;
  state: RefName;
  assignees: string[];
};

export type Sync = {
  // False when GitHub could not be reached and this is the last data that was read.
  fresh: boolean;
  syncedAt: string;
  commit: string;
  // Curated source paths that are no longer on main.
  missing: string[];
  // The linked issues and pull requests that changed since the review; the others stand as reviewed.
  refs: RefState[];
  // False when the issues could not be listed (the rate limit, say) and refs are the last that were read.
  refsFresh: boolean;
};

export type EvidenceSymbol = { name: string; line: number; note?: string };
export type EvidenceFile = { path: string; symbols: EvidenceSymbol[] };
export type SymbolGroup = { kind: "symbols"; name: string; files: EvidenceFile[] };
export type DocGroup = { kind: "docs"; name: string; files: Array<{ path: string; title: string }> };
export type TopicGroup = { kind: "topics"; name: string; items: Array<{ link: Link; headings: string[] }> };
export type ChangelogGroup = {
  kind: "changelog";
  name: string;
  intro: Rich;
  sections: Array<{ name: string; entries: Array<{ version: string; prs: Link[] }> }>;
};
export type EvidenceGroup = SymbolGroup | DocGroup | TopicGroup | ChangelogGroup;

// What a group's heading says before it is opened.
export type EvidenceSummary = { name: string; detail: string };

export type LiveEvidence = {
  fresh: boolean;
  commit: string;
  groups: Array<SymbolGroup | DocGroup>;
};
