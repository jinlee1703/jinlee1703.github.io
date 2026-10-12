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

/** 요소가 그림(figure 대상)인지 — 이미지만 든 문단, mermaid, hbar 차트 */
function isFigureBody(node: HastNode): boolean {
  const cls = node.properties?.className;
  const hasClass = (name: string): boolean =>
    Array.isArray(cls) && cls.includes(name);
  if (node.tagName === "div" && (hasClass("mermaid") || hasClass("hbar"))) {
    return true;
  }
  // <p><img></p> — 이미지 하나만 든 문단
  if (node.tagName === "p") {
    const kids = (node.children ?? []).filter(
      (c) => !(c.type === "text" && (c.value ?? "").trim() === ""),
    );
    return kids.length === 1 && kids[0]?.tagName === "img";
  }
  return false;
}

/** 문단이 캡션(이탤릭 하나만)인지 — <p><em>…</em></p> */
function asCaption(node: HastNode): HastNode | null {
  if (node.tagName !== "p") return null;
  const kids = (node.children ?? []).filter(
    (c) => !(c.type === "text" && (c.value ?? "").trim() === ""),
  );
  if (kids.length === 1 && kids[0]?.tagName === "em") return kids[0] ?? null;
  return null;
}

/**
 * 그림 요소 바로 뒤에 이탤릭 캡션 문단이 오면 <figure><figcaption>으로 묶는다.
 * 이미지·mermaid·hbar 차트의 설명을 일관된 캡션 스타일로 통일한다.
 */
const isBlank = (n: HastNode): boolean =>
  n.type === "text" && (n.value ?? "").trim() === "";

function groupFigures(node: HastNode): void {
  if (!node.children) return;
  const out: HastNode[] = [];
  const kids = node.children;
  for (let i = 0; i < kids.length; i++) {
    const cur = kids[i] as HastNode;
    // 다음 비공백 형제를 찾는다 (요소 사이 개행 텍스트 노드 건너뛰기)
    let j = i + 1;
    while (j < kids.length && isBlank(kids[j] as HastNode)) j++;
    const nxt = kids[j] as HastNode | undefined;
    const caption = nxt ? asCaption(nxt) : null;
    if (isFigureBody(cur) && caption) {
      out.push({
        type: "element",
        tagName: "figure",
        properties: { className: ["post-figure"] },
        children: [
          cur,
          {
            type: "element",
            tagName: "figcaption",
            properties: {},
            children: caption.children ?? [],
          } as HastNode,
        ],
      });
      i = j; // 캡션(및 사이 공백)까지 소비
      continue;
    }
    out.push(cur);
  }
  node.children = out;
  for (const child of out) groupFigures(child);
}

export function rehypeFigures() {
  return (tree: HastNode): void => {
    groupFigures(tree);
  };
}
