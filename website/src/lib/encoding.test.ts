import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { test } from "node:test";

// Text saved with the wrong encoding turns a curly apostrophe or an accented letter into two or three stray
// Latin-1 characters. Catch it before it reaches the site.
const char = String.fromCharCode;
const MOJIBAKE = new RegExp(`${char(0xe2, 0x20ac)}|${char(0xc3)}[${char(0x80)}-${char(0xbf)}]`);
const TEXT = new Set([".ts", ".tsx", ".css", ".md", ".json"]);

function files(dir: string, recurse = true): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return recurse && entry.name !== "node_modules" ? files(path) : [];
    return TEXT.has(extname(entry.name)) ? [path] : [];
  });
}

test("site sources and the docs it renders are free of mis-encoded text", () => {
  const checked = [...files("src"), ...files("..", false), ...files(join("..", "docs"))];
  const broken = checked.filter((path) => MOJIBAKE.test(readFileSync(path, "utf8")));
  assert.ok(checked.length > 20);
  assert.deepEqual(broken, []);
});
