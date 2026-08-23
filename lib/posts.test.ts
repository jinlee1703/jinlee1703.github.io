import { describe, it, expect } from "vitest";
import {
  parsePost,
  sortByDateDesc,
  groupByCategory,
  type Post,
} from "./posts";

const sample = `---
title: SSE 구현기
date: 2025-07-05
category: web
description: 실시간 알림 시스템 구현
---

본문 시작
`;

describe("parsePost", () => {
  it("front matter의 title/category/description을 메타로 추출한다", () => {
    const post = parsePost(sample, "sse-guide");
    expect(post.slug).toBe("sse-guide");
    expect(post.title).toBe("SSE 구현기");
    expect(post.category).toBe("web");
    expect(post.description).toBe("실시간 알림 시스템 구현");
  });

  it("YAML date(Date 객체)를 YYYY-MM-DD 문자열로 정규화한다", () => {
    const post = parsePost(sample, "sse-guide");
    expect(post.date).toBe("2025-07-05");
  });

  it("본문(content)을 front matter와 분리한다", () => {
    const post = parsePost(sample, "sse-guide");
    expect(post.content.trim()).toBe("본문 시작");
  });

  it("published 필드가 없으면 기본값 true다", () => {
    const post = parsePost(sample, "sse-guide");
    expect(post.published).toBe(true);
  });

  it("published가 false면 published=false로 파싱한다", () => {
    const raw = `---\ntitle: 초안\ndate: 2025-01-01\ncategory: etc\npublished: false\n---\n초안 본문`;
    const post = parsePost(raw, "draft");
    expect(post.published).toBe(false);
  });

  it("title이 없으면 slug를 title로 쓴다", () => {
    const raw = `---\ndate: 2025-01-01\ncategory: etc\n---\n본문`;
    const post = parsePost(raw, "no-title");
    expect(post.title).toBe("no-title");
  });

  it("category가 없으면 etc로 기본 분류한다", () => {
    const raw = `---\ntitle: 무분류\ndate: 2025-01-01\n---\n본문`;
    const post = parsePost(raw, "x");
    expect(post.category).toBe("etc");
  });
});

describe("sortByDateDesc", () => {
  it("날짜 내림차순(최신순)으로 정렬한다", () => {
    const posts = [
      { date: "2024-01-01" },
      { date: "2025-06-01" },
      { date: "2025-01-01" },
    ] as Post[];
    const sorted = sortByDateDesc(posts);
    expect(sorted.map((p) => p.date)).toEqual([
      "2025-06-01",
      "2025-01-01",
      "2024-01-01",
    ]);
  });

  it("원본 배열을 변형하지 않는다", () => {
    const posts = [{ date: "2024-01-01" }, { date: "2025-01-01" }] as Post[];
    const copy = [...posts];
    sortByDateDesc(posts);
    expect(posts).toEqual(copy);
  });
});

describe("groupByCategory", () => {
  it("카테고리별로 개수를 세어 내림차순으로 반환한다", () => {
    const posts = [
      { category: "web" },
      { category: "web" },
      { category: "database" },
    ] as Post[];
    const groups = groupByCategory(posts);
    expect(groups).toEqual([
      { name: "web", count: 2 },
      { name: "database", count: 1 },
    ]);
  });
});
