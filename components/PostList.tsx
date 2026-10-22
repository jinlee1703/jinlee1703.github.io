"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CategoryCount } from "@/lib/posts";

export interface PostListItem {
  slug: string;
  title: string;
  date: string;
  category: string;
  description: string;
}

const PAGE_SIZE = 20;

function formatDate(iso: string): string {
  return iso.replace(/-/g, ".");
}

export default function PostList({
  posts,
  categories,
}: {
  posts: PostListItem[];
  categories: CategoryCount[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const filtered = posts
    .filter((p) => (active ? p.category === active : true))
    .filter((p) =>
      q
        ? p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        : true,
    );
  const hasMore = visible < filtered.length;

  // 검색어·카테고리가 바뀌면 처음부터 다시 보여준다.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [active, query]);

  // 무한 스크롤
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisible((v) => v + PAGE_SIZE);
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, active, query]);

  const chip = (selected: boolean) =>
    `rounded-full px-3 py-1 text-sm transition-colors ${
      selected
        ? "bg-[var(--foreground)] text-[var(--background)]"
        : "text-[var(--muted)] hover:text-[var(--foreground)]"
    }`;

  return (
    <>
      <div className="relative mb-6">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목·요약·카테고리 검색"
          aria-label="글 검색"
          className="w-full rounded-lg border border-[var(--border)] bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-1">
        <button className={chip(active === null)} onClick={() => setActive(null)}>
          전체 {posts.length}
        </button>
        {/* 크롤러에게는 카테고리 페이지 링크, 화면에서는 제자리 필터로 동작한다. */}
        {categories.map((c) => (
          <Link
            key={c.name}
            href={`/${c.name}/`}
            className={chip(active === c.name)}
            onClick={(e) => {
              e.preventDefault();
              setActive(c.name);
            }}
          >
            {c.name} {c.count}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-[var(--muted)]">
          검색 결과가 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {/* 크롤러가 모든 글 링크를 찾도록 전부 렌더링하고, 화면에는 visible개만 보여준다. */}
          {filtered.map((p, i) => (
            <li key={`${p.category}/${p.slug}`} hidden={i >= visible}>
              <Link
                href={`/${p.category}/${p.slug}/`}
                className="group flex items-baseline justify-between gap-4 py-3"
              >
                <span className="flex-1 transition-colors group-hover:text-[var(--accent)]">
                  {p.title}
                </span>
                <span className="shrink-0 text-xs text-[var(--muted)]">
                  {p.category}
                </span>
                <time className="shrink-0 tabular-nums text-xs text-[var(--muted)]">
                  {formatDate(p.date)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div
          ref={sentinelRef}
          className="py-8 text-center text-sm text-[var(--muted)]"
        >
          불러오는 중…
        </div>
      )}
    </>
  );
}
