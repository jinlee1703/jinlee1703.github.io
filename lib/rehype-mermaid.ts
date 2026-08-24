/**
 * ```mermaid 코드블록을 <div class="mermaid">원본 코드</div> 로 변환하는 rehype 플러그인.
 * rehype-pretty-code(Shiki) 앞에서 실행하여 mermaid 블록이 코드 하이라이트되지 않도록 한다.
 * 실제 다이어그램 렌더는 클라이언트(components/Mermaid.tsx)에서 수행한다.
 */

interface HastNode {
  type: string;
  tagName?: string;
  properties?: { className?: unknown; [key: string]: unknown };
  children?: HastNode[];
  value?: string;
}

function convertIfMermaid(pre: HastNode): void {
  const code = pre.children?.find((c) => c.tagName === "code");
  if (!code) return;

  const className = code.properties?.className;
  if (!Array.isArray(className) || !className.includes("language-mermaid")) {
    return;
  }

  const source = (code.children ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.value ?? "")
    .join("");

  pre.tagName = "div";
  pre.properties = { className: ["mermaid"] };
  pre.children = [{ type: "text", value: source }];
}

function walk(node: HastNode): void {
  if (!node.children) return;
  for (const child of node.children) {
    if (child.tagName === "pre") convertIfMermaid(child);
    walk(child);
  }
}

export function rehypeMermaid() {
  return (tree: HastNode): void => {
    walk(tree);
  };
}

/** 본문 이미지에 lazy loading + async decoding을 부여한다. (Core Web Vitals) */
function applyImageAttrs(node: HastNode): void {
  if (node.tagName === "img") {
    node.properties = node.properties ?? {};
    node.properties.loading = "lazy";
    node.properties.decoding = "async";
  }
  node.children?.forEach(applyImageAttrs);
}

export function rehypeImageAttrs() {
  return (tree: HastNode): void => {
    applyImageAttrs(tree);
  };
}
