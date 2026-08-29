import { describe, it, expect } from "vitest";
import { parseBook } from "./books";

const sample = `---
title: 클린 코드
author: 로버트 C. 마틴
cover: /books/clean-code.jpg
date: 2025-03-01
rating: 5
link: https://example.com/clean-code
---

읽고 나서 남긴 리뷰.
`;

describe("parseBook", () => {
  it("front matter의 서지 정보를 파싱한다", () => {
    const book = parseBook(sample, "clean-code");
    expect(book.slug).toBe("clean-code");
    expect(book.title).toBe("클린 코드");
    expect(book.author).toBe("로버트 C. 마틴");
    expect(book.cover).toBe("/books/clean-code.jpg");
    expect(book.link).toBe("https://example.com/clean-code");
  });

  it("YAML date를 YYYY-MM-DD로 정규화한다", () => {
    expect(parseBook(sample, "clean-code").date).toBe("2025-03-01");
  });

  it("리뷰 본문을 분리한다", () => {
    expect(parseBook(sample, "clean-code").content.trim()).toBe(
      "읽고 나서 남긴 리뷰.",
    );
  });

  it("선택 필드(cover/link)가 없으면 undefined다", () => {
    const raw = `---\ntitle: 제목만\nauthor: 저자\ndate: 2025-01-01\n---\n본문`;
    const book = parseBook(raw, "x");
    expect(book.cover).toBeUndefined();
    expect(book.link).toBeUndefined();
  });

  it("title이 없으면 slug를 쓴다", () => {
    const raw = `---\nauthor: 저자\ndate: 2025-01-01\n---\n본문`;
    expect(parseBook(raw, "no-title").title).toBe("no-title");
  });
});
