// A small Markdown parser for the repository's own documents, so the website can show CHANGELOG.md,
// SECURITY.md, and the guides in docs/ without a third-party dependency. It covers what those files use:
// headings, paragraphs, lists (nested and task lists), fenced code, quotes, tables, and rules, plus
// inline code, emphasis, and links. Raw HTML isn't interpreted; it's shown as text.

export type Inline =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "strong"; children: Inline[] }
  | { type: "em"; children: Inline[] }
  | { type: "link"; href: string; children: Inline[] }
  | { type: "break" };

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type Align = "left" | "center" | "right" | null;

export interface ListItem {
  checked: boolean | null;
  children: Block[];
}

export type Block =
  | { type: "heading"; level: HeadingLevel; id: string; children: Inline[] }
  | { type: "paragraph"; children: Inline[] }
  | { type: "list"; ordered: boolean; start: number; items: ListItem[] }
  | { type: "code"; lang: string; value: string }
  | { type: "quote"; children: Block[] }
  | { type: "table"; align: Align[]; head: Inline[][]; rows: Inline[][][] }
  | { type: "rule" };

const FENCE = /^(\s*)(`{3,}|~{3,})\s*([\w+-]*)\s*$/;
const HEADING = /^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
const RULE = /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/;
const LIST_ITEM = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
const QUOTE = /^ {0,3}>\s?(.*)$/;
const TABLE_DELIMITER = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;
const ESCAPABLE = /[\\`*_{}[\]()#+\-.!|>~<]/;

export function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").replace(/\t/g, "    ").split("\n");
  return parseBlocks(lines, new Map());
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function plainText(inlines: readonly Inline[]): string {
  return inlines
    .map((node) => {
      if (node.type === "text" || node.type === "code") return node.value;
      if (node.type === "break") return " ";
      return plainText(node.children);
    })
    .join("");
}

function uniqueSlug(text: string, slugs: Map<string, number>): string {
  const base = slugify(text) || "section";
  const count = slugs.get(base) ?? 0;
  slugs.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

const indentOf = (line: string) => line.length - line.trimStart().length;
const isBlank = (line: string) => line.trim() === "";

function startsBlock(line: string): boolean {
  return FENCE.test(line) || HEADING.test(line) || QUOTE.test(line) || LIST_ITEM.test(line) || RULE.test(line);
}

function isTableStart(lines: readonly string[], i: number): boolean {
  const next = lines[i + 1];
  return lines[i].includes("|") && next !== undefined && next.includes("|") && next.includes("-") && TABLE_DELIMITER.test(next);
}

function splitRow(line: string): string[] {
  let row = line.trim();
  if (row.startsWith("|")) row = row.slice(1);
  if (row.endsWith("|") && !row.endsWith("\\|")) row = row.slice(0, -1);
  const cells: string[] = [];
  let cell = "";
  for (let i = 0; i < row.length; i += 1) {
    if (row[i] === "\\" && row[i + 1] === "|") {
      cell += "|";
      i += 1;
    } else if (row[i] === "|") {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += row[i];
    }
  }
  cells.push(cell.trim());
  return cells;
}

function parseBlocks(lines: readonly string[], slugs: Map<string, number>): Block[] {
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line)) {
      i += 1;
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      const [, indent, marker, lang] = fence;
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith(marker)) {
        body.push(lines[i].startsWith(indent) ? lines[i].slice(indent.length) : lines[i].trimStart());
        i += 1;
      }
      i += 1;
      blocks.push({ type: "code", lang, value: body.join("\n") });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const children = parseInline(heading[2]);
      blocks.push({
        type: "heading",
        level: heading[1].length as HeadingLevel,
        id: uniqueSlug(plainText(children), slugs),
        children,
      });
      i += 1;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push({ type: "rule" });
      i += 1;
      continue;
    }

    if (QUOTE.test(line)) {
      const inner: string[] = [];
      while (i < lines.length && QUOTE.test(lines[i])) {
        inner.push(QUOTE.exec(lines[i])?.[1] ?? "");
        i += 1;
      }
      blocks.push({ type: "quote", children: parseBlocks(inner, slugs) });
      continue;
    }

    if (isTableStart(lines, i)) {
      const head = splitRow(line).map(parseInline);
      const align: Align[] = splitRow(lines[i + 1]).map((cell) => {
        const left = cell.startsWith(":");
        const right = cell.endsWith(":");
        if (left && right) return "center";
        if (right) return "right";
        if (left) return "left";
        return null;
      });
      i += 2;
      const rows: Inline[][][] = [];
      while (i < lines.length && !isBlank(lines[i]) && lines[i].includes("|")) {
        rows.push(splitRow(lines[i]).map(parseInline));
        i += 1;
      }
      blocks.push({ type: "table", align, head, rows });
      continue;
    }

    if (LIST_ITEM.test(line)) {
      const { block, next } = parseList(lines, i, slugs);
      blocks.push(block);
      i = next;
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && !isBlank(lines[i]) && (paragraph.length === 0 || !startsBlock(lines[i]))) {
      paragraph.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: "paragraph", children: parseParagraph(paragraph) });
  }

  return blocks;
}

function parseList(lines: readonly string[], start: number, slugs: Map<string, number>): { block: Block; next: number } {
  const first = LIST_ITEM.exec(lines[start]);
  if (!first) throw new Error("parseList called on a line that isn't a list item");
  const baseIndent = first[1].length;
  const ordered = /\d/.test(first[2]);
  const items: ListItem[] = [];
  let i = start;

  const isSibling = (line: string | undefined) => {
    const match = line === undefined ? null : LIST_ITEM.exec(line);
    return match !== null && match[1].length === baseIndent && /\d/.test(match[2]) === ordered;
  };

  while (i < lines.length && isSibling(lines[i])) {
    const match = LIST_ITEM.exec(lines[i]);
    if (!match) break;
    const contentIndent = match[1].length + match[2].length + 1;
    const itemLines = [match[3]];
    i += 1;

    while (i < lines.length) {
      const current = lines[i];
      if (isBlank(current)) {
        let j = i + 1;
        while (j < lines.length && isBlank(lines[j])) j += 1;
        if (j < lines.length && indentOf(lines[j]) >= contentIndent) {
          itemLines.push("");
          i += 1;
          continue;
        }
        break;
      }
      if (indentOf(current) >= contentIndent) {
        itemLines.push(current.slice(contentIndent));
        i += 1;
        continue;
      }
      if (startsBlock(current)) break;
      itemLines.push(current.trim());
      i += 1;
    }

    let checked: boolean | null = null;
    const task = /^\[( |x|X)\]\s+/.exec(itemLines[0]);
    if (task) {
      checked = task[1] !== " ";
      itemLines[0] = itemLines[0].slice(task[0].length);
    }
    items.push({ checked, children: parseBlocks(itemLines, slugs) });

    // Blank lines may separate items of the same list.
    let j = i;
    while (j < lines.length && isBlank(lines[j])) j += 1;
    if (j > i && isSibling(lines[j])) i = j;
  }

  return { block: { type: "list", ordered, start: ordered ? parseInt(first[2], 10) : 1, items }, next: i };
}

function parseParagraph(lines: readonly string[]): Inline[] {
  const out: Inline[] = [];
  lines.forEach((line, index) => {
    if (index > 0) {
      const hardBreak = / {2,}$/.test(lines[index - 1]) || lines[index - 1].endsWith("\\");
      out.push(hardBreak ? { type: "break" } : { type: "text", value: " " });
    }
    out.push(...parseInline(line.trim().replace(/\\$/, "")));
  });
  return mergeText(out);
}

function mergeText(nodes: Inline[]): Inline[] {
  const merged: Inline[] = [];
  for (const node of nodes) {
    const last = merged[merged.length - 1];
    if (node.type === "text" && last?.type === "text") merged[merged.length - 1] = { type: "text", value: last.value + node.value };
    else merged.push(node);
  }
  return merged;
}

function matchLink(source: string, start: number): { label: string; href: string; end: number } | null {
  let depth = 0;
  let close = -1;
  for (let i = start; i < source.length; i += 1) {
    if (source[i] === "\\") {
      i += 1;
      continue;
    }
    if (source[i] === "[") depth += 1;
    if (source[i] === "]") {
      depth -= 1;
      if (depth === 0) {
        close = i;
        break;
      }
    }
  }
  if (close === -1 || source[close + 1] !== "(") return null;
  const end = source.indexOf(")", close + 2);
  if (end === -1) return null;
  const target = source.slice(close + 2, end).trim();
  const href = target.replace(/\s+["'].*["']$/, "").replace(/^<|>$/g, "");
  return { label: source.slice(start + 1, close), href, end: end + 1 };
}

function findClosing(source: string, from: number, marker: string): number {
  let index = source.indexOf(marker, from);
  while (index !== -1) {
    const before = source[index - 1];
    const after = source[index + marker.length];
    const touchesSameMarker = marker.length === 1 && (after === marker || before === marker);
    const flanked = before !== undefined && !/\s/.test(before);
    const wordAfter = marker[0] === "_" && after !== undefined && /\w/.test(after);
    if (flanked && !touchesSameMarker && !wordAfter) return index;
    index = source.indexOf(marker, index + 1);
  }
  return -1;
}

export function parseInline(source: string): Inline[] {
  const out: Inline[] = [];
  let text = "";
  const flush = () => {
    if (text) {
      out.push({ type: "text", value: text });
      text = "";
    }
  };

  let i = 0;
  while (i < source.length) {
    const char = source[i];

    if (char === "\\" && i + 1 < source.length && ESCAPABLE.test(source[i + 1])) {
      text += source[i + 1];
      i += 2;
      continue;
    }

    if (char === "`") {
      const run = /^`+/.exec(source.slice(i))?.[0] ?? "`";
      const end = source.indexOf(run, i + run.length);
      if (end !== -1) {
        flush();
        let value = source.slice(i + run.length, end);
        if (value.startsWith(" ") && value.endsWith(" ") && value.trim()) value = value.slice(1, -1);
        out.push({ type: "code", value });
        i = end + run.length;
        continue;
      }
      text += run;
      i += run.length;
      continue;
    }

    if (char === "[") {
      const link = matchLink(source, i);
      if (link) {
        flush();
        out.push({ type: "link", href: link.href, children: parseInline(link.label) });
        i = link.end;
        continue;
      }
    }

    if (char === "<") {
      const auto = /^<(https?:\/\/[^\s>]+)>/.exec(source.slice(i));
      if (auto) {
        flush();
        out.push({ type: "link", href: auto[1], children: [{ type: "text", value: auto[1] }] });
        i += auto[0].length;
        continue;
      }
    }

    if (char === "*" || char === "_") {
      const intraword = char === "_" && i > 0 && /\w/.test(source[i - 1]);
      const marker = source.startsWith(char + char, i) ? char + char : char;
      const next = source[i + marker.length];
      if (!intraword && next !== undefined && !/\s/.test(next)) {
        const close = findClosing(source, i + marker.length, marker);
        if (close > i + marker.length) {
          flush();
          const children = parseInline(source.slice(i + marker.length, close));
          out.push(marker.length === 2 ? { type: "strong", children } : { type: "em", children });
          i = close + marker.length;
          continue;
        }
      }
    }

    text += char;
    i += 1;
  }

  flush();
  return out;
}
