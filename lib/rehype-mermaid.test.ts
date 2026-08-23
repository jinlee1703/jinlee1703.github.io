import { describe, it, expect } from "vitest";
import { rehypeMermaid } from "./rehype-mermaid";

function makeTree(codeClass: string[] | undefined) {
  return {
    type: "root",
    children: [
      {
        type: "element",
        tagName: "pre",
        properties: {},
        children: [
          {
            type: "element",
            tagName: "code",
            properties: codeClass ? { className: codeClass } : {},
            children: [{ type: "text", value: "graph TD\nA-->B" }],
          },
        ],
      },
    ],
  };
}

describe("rehypeMermaid", () => {
  it("language-mermaid 코드블록을 div.mermaid로 변환한다", () => {
    const tree = makeTree(["language-mermaid"]);
    rehypeMermaid()(tree);
    const node = tree.children[0];
    expect(node.tagName).toBe("div");
    expect(node.properties.className).toContain("mermaid");
    expect(node.children[0].value).toBe("graph TD\nA-->B");
  });

  it("일반 코드블록(bash)은 그대로 둔다", () => {
    const tree = makeTree(["language-bash"]);
    rehypeMermaid()(tree);
    expect(tree.children[0].tagName).toBe("pre");
  });

  it("언어 클래스가 없는 코드블록도 그대로 둔다", () => {
    const tree = makeTree(undefined);
    rehypeMermaid()(tree);
    expect(tree.children[0].tagName).toBe("pre");
  });
});
