import { describe, it, expect } from "vitest";
import { extractToc } from "./toc";

describe("extractToc", () => {
  it("h2/h3 헤딩을 depth·text·id로 추출한다", () => {
    const md = "## 소개\n내용\n### 배경\n더 많은 내용\n## 결론";
    expect(extractToc(md)).toEqual([
      { depth: 2, text: "소개", id: "소개" },
      { depth: 3, text: "배경", id: "배경" },
      { depth: 2, text: "결론", id: "결론" },
    ]);
  });

  it("h1과 h4 이하는 목차에서 제외한다", () => {
    const md = "# 제목\n## 섹션\n#### 아주작은제목";
    expect(extractToc(md)).toEqual([{ depth: 2, text: "섹션", id: "섹션" }]);
  });

  it("코드블록 안의 # 는 헤딩으로 오인하지 않는다", () => {
    const md = "## 진짜헤딩\n```bash\n## 주석처럼 보이는 것\n```";
    expect(extractToc(md)).toEqual([
      { depth: 2, text: "진짜헤딩", id: "진짜헤딩" },
    ]);
  });

  it("헤딩 텍스트의 마크다운 강조 기호를 제거한다", () => {
    const md = "## `코드` 와 **강조**";
    const toc = extractToc(md);
    expect(toc[0].text).toBe("코드 와 강조");
  });

  it("같은 텍스트의 헤딩은 id에 접미사를 붙여 유일하게 만든다", () => {
    const md = "## 정리\n## 정리";
    const toc = extractToc(md);
    expect(toc[0].id).toBe("정리");
    expect(toc[1].id).toBe("정리-1");
  });
});
