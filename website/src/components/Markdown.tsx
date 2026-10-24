import Link from "next/link";
import type { Block, Inline } from "@/lib/markdown/parse";

type ResolveLink = (href: string) => string;

interface MarkdownProps {
  blocks: readonly Block[];
  resolveLink?: ResolveLink;
}

export function Markdown({ blocks, resolveLink = (href) => href }: MarkdownProps) {
  return (
    <div className="prose">
      <Blocks blocks={blocks} resolveLink={resolveLink} />
    </div>
  );
}

function Blocks({ blocks, resolveLink }: { blocks: readonly Block[]; resolveLink: ResolveLink }) {
  return blocks.map((block, index) => <BlockView key={index} block={block} resolveLink={resolveLink} />);
}

function BlockView({ block, resolveLink }: { block: Block; resolveLink: ResolveLink }) {
  switch (block.type) {
    case "heading": {
      const Tag = `h${block.level}` as const;
      return (
        <Tag id={block.id}>
          <Inlines nodes={block.children} resolveLink={resolveLink} />
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p>
          <Inlines nodes={block.children} resolveLink={resolveLink} />
        </p>
      );
    case "list": {
      const items = block.items.map((item, index) => (
        <li key={index} className={item.checked === null ? undefined : "task"}>
          {item.checked !== null && <span aria-label={item.checked ? "Done" : "Not done"}>{item.checked ? "☑" : "☐"}</span>}
          <ListItemBody blocks={item.children} resolveLink={resolveLink} />
        </li>
      ));
      return block.ordered ? <ol start={block.start === 1 ? undefined : block.start}>{items}</ol> : <ul>{items}</ul>;
    }
    case "code":
      return (
        <pre data-lang={block.lang || undefined}>
          <code>{block.value}</code>
        </pre>
      );
    case "quote":
      return (
        <blockquote>
          <Blocks blocks={block.children} resolveLink={resolveLink} />
        </blockquote>
      );
    case "table":
      return (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {block.head.map((cell, index) => (
                  <th key={index} style={block.align[index] ? { textAlign: block.align[index] } : undefined}>
                    <Inlines nodes={cell} resolveLink={resolveLink} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, index) => (
                    <td key={index} style={block.align[index] ? { textAlign: block.align[index] } : undefined}>
                      <Inlines nodes={cell} resolveLink={resolveLink} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "rule":
      return <hr />;
  }
}

/** A list item made of one paragraph renders inline, so tight lists don't gain extra spacing. */
function ListItemBody({ blocks, resolveLink }: { blocks: readonly Block[]; resolveLink: ResolveLink }) {
  const [first, ...rest] = blocks;
  if (first?.type === "paragraph") {
    return (
      <>
        <Inlines nodes={first.children} resolveLink={resolveLink} />
        <Blocks blocks={rest} resolveLink={resolveLink} />
      </>
    );
  }
  return <Blocks blocks={blocks} resolveLink={resolveLink} />;
}

function Inlines({ nodes, resolveLink }: { nodes: readonly Inline[]; resolveLink: ResolveLink }) {
  return nodes.map((node, index) => {
    switch (node.type) {
      case "text":
        return node.value;
      case "code":
        return <code key={index}>{node.value}</code>;
      case "strong":
        return (
          <strong key={index}>
            <Inlines nodes={node.children} resolveLink={resolveLink} />
          </strong>
        );
      case "em":
        return (
          <em key={index}>
            <Inlines nodes={node.children} resolveLink={resolveLink} />
          </em>
        );
      case "break":
        return <br key={index} />;
      case "link": {
        const href = resolveLink(node.href);
        const children = <Inlines nodes={node.children} resolveLink={resolveLink} />;
        return href.startsWith("/") ? (
          <Link key={index} href={href}>
            {children}
          </Link>
        ) : (
          <a key={index} href={href}>
            {children}
          </a>
        );
      }
    }
  });
}
