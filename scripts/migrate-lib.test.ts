import { describe, it, expect } from "vitest";
import { parseFilename, transformBody, buildMarkdown } from "./migrate-lib";

describe("parseFilename", () => {
  it("파일명에서 날짜와 slug(날짜 포함)를 추출한다", () => {
    expect(parseFilename("2025-07-05-server-sent-events-sse.md")).toEqual({
      date: "2025-07-05",
      slug: "2025-07-05-server-sent-events-sse",
    });
  });

  it("한글 slug도 보존한다", () => {
    const r = parseFilename("2023-03-22-늦디늦은-회고.md");
    expect(r.date).toBe("2023-03-22");
    expect(r.slug).toBe("2023-03-22-늦디늦은-회고");
  });

  it("파일명의 공백은 하이픈으로 정규화한다", () => {
    const r = parseFilename("2023-07-10-Spring-Exception Handling.md");
    expect(r.slug).toBe("2023-07-10-Spring-Exception-Handling");
  });
});

describe("transformBody", () => {
  it("{:toc} seed 블록을 제거한다", () => {
    const body =
      "\n---\n\n* this unordered seed list will be replaced by the toc\n{:toc}\n\n## 제목\n내용";
    const out = transformBody(body);
    expect(out).not.toContain("{:toc}");
    expect(out).not.toContain("this unordered seed list");
    expect(out).toContain("## 제목");
  });

  it("../../assets 상대경로 이미지를 절대경로로 바꾼다", () => {
    const body = "![alt](../../assets/img/docs/x/image.png)";
    const out = transformBody(body);
    expect(out).toContain("/assets/img/docs/x/image.png");
    expect(out).not.toContain("../../");
  });

  it("../assets 한 단계 상대경로도 변환한다", () => {
    expect(transformBody("![a](../assets/img/y.png)")).toContain(
      "/assets/img/y.png",
    );
  });

  it("본문 중간의 정상적인 수평선(---)은 보존한다", () => {
    const body = "문단1\n\n---\n\n문단2";
    expect(transformBody(body)).toContain("---");
  });

  it("본문 맨 앞의 장식용 수평선(---)은 제거한다", () => {
    const out = transformBody("---\n\n# 제목\n내용");
    expect(out.startsWith("#")).toBe(true);
  });
});

describe("buildMarkdown", () => {
  const original =
    "---\nlayout: post\ntitle: 테스트 글\ndescription: >\n  설명입니다\nsitemap: false\nhide_last_modified: true\n---\n\n본문";

  it("Jekyll 전용 필드(layout/sitemap/hide_last_modified)를 제거한다", () => {
    const out = buildMarkdown({
      original,
      category: "web",
      date: "2025-07-05",
      slug: "test",
    });
    expect(out).not.toContain("layout:");
    expect(out).not.toContain("sitemap:");
    expect(out).not.toContain("hide_last_modified:");
  });

  it("title/description을 보존하고 category/date를 주입한다", () => {
    const out = buildMarkdown({
      original,
      category: "web",
      date: "2025-07-05",
      slug: "test",
    });
    expect(out).toContain("category: web");
    expect(out).toMatch(/date:\s*'?2025-07-05'?/);
    expect(out).toContain("테스트 글");
    expect(out).toContain("설명입니다");
  });

  it("published: false는 보존한다", () => {
    const o = "---\ntitle: 초안\npublished: false\n---\n본문";
    const out = buildMarkdown({
      original: o,
      category: "etc",
      date: "2025-01-01",
      slug: "d",
    });
    expect(out).toMatch(/published:\s*false/);
  });
});
