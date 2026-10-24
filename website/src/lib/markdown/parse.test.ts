import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parseInline, parseMarkdown, plainText, slugify } from "./parse.ts";

test("headings get unique ids", () => {
  const blocks = parseMarkdown("# Oriel TV\n\n## Setup\n\n## Setup\n");
  assert.deepEqual(
    blocks.map((block) => (block.type === "heading" ? [block.level, block.id] : null)),
    [
      [1, "oriel-tv"],
      [2, "setup"],
      [2, "setup-1"],
    ],
  );
});

test("inline code, emphasis, and links", () => {
  const nodes = parseInline("Run `npm run tokens`, then **commit** the *output* from [CHANGELOG](CHANGELOG.md).");
  assert.deepEqual(
    nodes.map((node) => node.type),
    ["text", "code", "text", "strong", "text", "em", "text", "link", "text"],
  );
  const link = nodes.find((node) => node.type === "link");
  assert.equal(link?.type === "link" ? link.href : "", "CHANGELOG.md");
});

test("underscores inside words aren't emphasis", () => {
  assert.equal(plainText(parseInline("set user_name and GATEGUARD_EXEMPT_GLOBS")), "set user_name and GATEGUARD_EXEMPT_GLOBS");
  assert.deepEqual(parseInline("snake_case_name").map((node) => node.type), ["text"]);
});

test("escapes and unmatched markers stay as text", () => {
  assert.equal(plainText(parseInline("2 \\* 3 and a lone * star")), "2 * 3 and a lone * star");
});

test("nested and ordered lists", () => {
  const [list] = parseMarkdown("1. First\n2. Second\n   - Nested a\n   - Nested b\n3. Third\n");
  assert.equal(list.type, "list");
  if (list.type !== "list") return;
  assert.equal(list.ordered, true);
  assert.equal(list.items.length, 3);
  const nested = list.items[1].children[1];
  assert.equal(nested.type, "list");
  if (nested.type === "list") assert.equal(nested.items.length, 2);
});

test("task lists record their state", () => {
  const [list] = parseMarkdown("- [ ] Todo\n- [x] Done\n");
  assert.equal(list.type, "list");
  if (list.type === "list") assert.deepEqual(list.items.map((item) => item.checked), [false, true]);
});

test("fenced code keeps its content and language", () => {
  const [code] = parseMarkdown("```bash\nnpm ci\nnpm run build\n```\n");
  assert.deepEqual(code, { type: "code", lang: "bash", value: "npm ci\nnpm run build" });
});

test("tables with alignment", () => {
  const [table] = parseMarkdown("| Module | Stack |\n|:---|---:|\n| Launcher | Kotlin |\n| Website | Next.js |\n");
  assert.equal(table.type, "table");
  if (table.type !== "table") return;
  assert.deepEqual(table.align, ["left", "right"]);
  assert.equal(table.rows.length, 2);
  assert.equal(plainText(table.rows[1][1]), "Next.js");
});

test("quotes, rules, and hard breaks", () => {
  const blocks = parseMarkdown("> **Note:** read this.\n\n---\n\nLine one  \nLine two\n");
  assert.deepEqual(
    blocks.map((block) => block.type),
    ["quote", "rule", "paragraph"],
  );
  const paragraph = blocks[2];
  if (paragraph.type === "paragraph") assert.ok(paragraph.children.some((node) => node.type === "break"));
});

test("slugify strips punctuation and accents", () => {
  assert.equal(slugify("What's new in Oriel? (Café edition)"), "whats-new-in-oriel-cafe-edition");
});

test("parses every Markdown file the website renders", () => {
  const files = [
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "PRIVACY.md",
    "TRADEMARKS.md",
    "docs/guides/getting-started.md",
    "docs/guides/device-management.md",
    "docs/guides/troubleshooting.md",
  ];
  for (const file of files) {
    const source = readFileSync(new URL(`../../../../${file}`, import.meta.url), "utf8");
    const blocks = parseMarkdown(source);
    assert.ok(blocks.length > 0, `${file} has content`);
    assert.equal(blocks[0].type, "heading", `${file} starts with a heading`);
  }
});
