import assert from "node:assert/strict";
import { test } from "node:test";
import { driftOf } from "./drift.ts";
import { bookTitle, hookSymbols, hostSymbols, registrarSymbols } from "./parse.ts";

const HOST = `//! Host method declarations.
use crate::*;
pub trait ThingHost {
    /// Side: both.
    #[access(WorldOnly)]
    fn thing(&self, level: LevelRef) -> bool;
    fn other(&mut self);
}
pub fn helper() {}
`;

const HOOKS = `pub trait Hooks {
    /// docs
    #[hook(
        side = "client",
        contract = "listen",
        neoforge = "AddThingEvent",
        cancellable = false
    )]
    fn add_thing(
        a: u8,
    );
    #[hook(side = "server", contract = "cancel", neoforge = ["One.Event", "Two.Event"], cancellable = true)]
    fn put_thing();
    #[hook(side = "both", contract = "listen", cancellable = false)]
    pub fn bare();
}
pub trait Notes {
    #[notes = "x"]
    fn skipped();
}
`;

const REGISTRARS = `pub trait BlocksRegistrar {
    fn declare_block(&mut self, id: &str);
    fn declare_other(&mut self);
}
pub trait LevelHost {
    fn read(&self);
}
impl dyn Registrar + '_ {
    pub fn block_part(&mut self) {}
    fn private_helper(&self) {}
}
pub fn free_function() {}
`;

test("host methods are every indented fn, with its line", () => {
  assert.deepEqual(hostSymbols(HOST), [
    { name: "thing", line: 6 },
    { name: "other", line: 7 },
  ]);
});

test("hooks carry side, contract and every named counterpart, on the fn's line", () => {
  assert.deepEqual(hookSymbols(HOOKS), [
    { name: "add_thing", line: 9, note: "side client · contract listen · AddThingEvent" },
    { name: "put_thing", line: 13, note: "side server · contract cancel · One.Event · Two.Event" },
    { name: "bare", line: 15, note: "side both · contract listen" },
  ]);
});

test("registrar symbols are the registrar traits' methods and the registrar object's public ones", () => {
  assert.deepEqual(registrarSymbols(REGISTRARS), [
    { name: "declare_block", line: 2 },
    { name: "declare_other", line: 3 },
    { name: "block_part", line: 9 },
  ]);
});

test("a book page's title is its first level-one heading", () => {
  assert.equal(bookTitle("intro\n# Design: Joins\n## Sub\n# Later"), "Design: Joins");
  assert.equal(bookTitle("## only a subheading"), "");
});

test("a row is flagged when a source left main or a linked issue changed state since the review", () => {
  const ref = (number: number, state: "open" | "closed" | "merged") => ({ number, state });
  const cap = { area: "a", title: "t", status: "Partial" as const, note: "", refs: [ref(1, "open"), ref(2, "open"), ref(3, "open"), ref(4, "closed")], sources: ["a.rs", "b.rs"], counterpart: [] };
  const live = new Map([
    [1, { number: 1, kind: "pr" as const, title: "", state: "merged" as const, assignees: [] }],
    [2, { number: 2, kind: "issue" as const, title: "", state: "closed" as const, assignees: [] }],
    [3, { number: 3, kind: "issue" as const, title: "", state: "open" as const, assignees: ["x"] }],
    [4, { number: 4, kind: "issue" as const, title: "", state: "open" as const, assignees: [] }],
  ]);
  const drift = driftOf(cap, new Set(["b.rs"]), live);
  assert.deepEqual(drift.missing, ["b.rs"]);
  assert.deepEqual(drift.changed.map((r) => r.number), [1, 2, 4]);
});
