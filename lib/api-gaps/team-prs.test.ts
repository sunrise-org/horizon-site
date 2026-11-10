import assert from "node:assert/strict";
import { test } from "node:test";
import { parseTeamPulls, searchUrl, teamQuery } from "./team-prs-parse.ts";

const item = (number: number, extra: object = {}) => ({
  number,
  title: `PR ${number}`,
  html_url: `https://github.com/arismoko/horizon/pull/${number}`,
  updated_at: "2026-11-10T19:37:10Z",
  repository_url: "https://api.github.com/repos/arismoko/horizon",
  user: { login: "Xmilon" },
  ...extra,
});

test("the query lists every author and repo", () => {
  assert.equal(
    teamQuery(["A", "B"], ["o/x", "o/y"]),
    "is:pr is:open author:A author:B repo:o/x repo:o/y",
  );
});

test("the github.com search keeps the same query", () => {
  assert.equal(searchUrl("is:pr author:A"), "https://github.com/pulls?q=is%3Apr%20author%3AA");
});

test("rows name their owner and repo and carry the draft flag, capped at the limit, with the full count", () => {
  const body = { total_count: 30, items: [item(1), item(2, { draft: true }), item(3, { repository_url: "https://api.github.com/repos/sunrise-org/horizon" })] };
  const { total, pulls } = parseTeamPulls(body, 2);
  assert.equal(total, 30);
  assert.deepEqual(pulls.map((p) => [p.repo, p.number, p.draft, p.author]), [
    ["arismoko/horizon", 1, false, "Xmilon"],
    ["arismoko/horizon", 2, true, "Xmilon"],
  ]);
});

test("a reply with no items is an error", () => {
  assert.throws(() => parseTeamPulls({ message: "rate limited" } as never));
});
