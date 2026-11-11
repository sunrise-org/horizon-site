import assert from "node:assert/strict";
import { test } from "node:test";
import { highlight, markdown } from "./docs-markdown.ts";

test("code is coloured by token and stays escaped", () => {
  assert.equal(
    highlight('let s = "<b>"; // done', "rust"),
    '<span class="tok-keyword">let</span> s = <span class="tok-string">&quot;&lt;b&gt;&quot;</span>; <span class="tok-comment">// done</span>',
  );
  assert.equal(highlight('id = "x" # why', "toml"), '<span class="tok-attr">id</span> = <span class="tok-string">&quot;x&quot;</span> <span class="tok-comment"># why</span>');
  assert.equal(highlight("<x> & y", "unknown"), "&lt;x&gt; &amp; y");
});

test("a list item keeps its code block and second paragraph", () => {
  const html = markdown("1. Run it:\n\n   ```sh\n   cargo build\n   ```\n\n   Then wait.\n2. Done.\n");
  assert.match(html, /^<ol><li><p>Run it:<\/p>\n<div class="code-block">[\s\S]*<p>Then wait\.<\/p><\/li><li>Done\.<\/li><\/ol>$/);
  assert.ok(html.includes('<span class="tok-fn">cargo</span> build'));
});

test("code controls stay outside escaped code and preserve its whitespace", () => {
  const source = '  <script> & "quoted"\n\tsecond line';
  const html = markdown("```text\n" + source + "\n```");
  assert.match(html, /data-wrap aria-pressed="false">Wrap lines<\/button>/);
  assert.match(html, /data-copy>Copy<\/button><\/div><pre tabindex="0"/);
  assert.ok(html.includes('<code>  &lt;script&gt; &amp; &quot;quoted&quot;\n\tsecond line</code>'));
  assert.equal(html.includes("<script>"), false);
});

test("reference tables keep code fields and embedded pipes in their cells", () => {
  const html = markdown("| Field | Meaning |\n| --- | --- |\n| `projects[].id` | `a|b` |\n");
  assert.match(html, /role="region" aria-label="Reference table" tabindex="0"/);
  assert.ok(html.includes("<td><code>projects[].id</code></td><td><code>a|b</code></td>"));
});

test("an alert quote becomes a titled callout, a plain quote stays a quote", () => {
  assert.equal(
    markdown("> [!TIP] Which terminal?\n> Any one: `cargo` works the same."),
    '<div class="callout callout-tip" role="note"><p class="callout-title">Which terminal?</p><p>Any one: <code>cargo</code> works the same.</p></div>',
  );
  assert.match(markdown("> [!warning]\n> Native code is not sandboxed."), /^<div class="callout callout-warning" role="note"><p class="callout-title">Careful<\/p>/);
  assert.equal(markdown("> Just a quote."), "<blockquote><p>Just a quote.</p></blockquote>");
});

test("table code breaks only after / :: and _, so short names stay whole", () => {
  const html = markdown("| Kind | File |\n| --- | --- |\n| Mod | `.hmod` in `crates/mod_content.rs` |");
  assert.match(html, /<code>\.hmod<\/code>/);
  assert.match(html, /<code>crates\/<wbr>mod_<wbr>content\.rs<\/code>/);
});

test("tables with sentence-long cells become cards, short tables stay tables", () => {
  const long = "x".repeat(100);
  const cards = markdown(`| Data | Result | Example |\n| --- | --- | --- |\n| Tags | ${long} | \`a/b\` |`);
  assert.match(cards, /<ul class="ref-cards" aria-label="Data">/);
  assert.match(cards, /<p class="ref-card-title">Tags<\/p><dl><dt>Result<\/dt><dd>x+<\/dd><dt>Example<\/dt><dd><code>a\/<wbr>b<\/code><\/dd><\/dl>/);
  assert.match(markdown("| A | B | C |\n| --- | --- | --- |\n| 1 | 2 | 3 |"), /<table>/);
});
