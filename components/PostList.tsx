"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CategoryCount } from "@/lib/posts";

export interface PostListItem {
  slug: string;
  title: string;
  date: string;
  category: string;
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
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = active
    ? posts.filter((p) => p.category === active)
    : posts;
  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  // 카테고리 필터가 바뀌면 처음부터 다시 보여준다.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [active]);

  // 무한 스크롤: sentinel이 뷰포트에 들어오면 다음 페이지를 노출한다.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((v) => v + PAGE_SIZE);
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, active]);

  const chip = (selected: boolean) =>
    `rounded-full px-3 py-1 text-sm transition-colors ${
      selected
        ? "bg-[var(--foreground)] text-[var(--background)]"
        : "text-[var(--muted)] hover:text-[var(--foreground)]"
    }`;

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-1">
        <button className={chip(active === null)} onClick={() => setActive(null)}>
          전체 {posts.length}
        </button>
        {categories.map((c) => (
          <button
            key={c.name}
            className={chip(active === c.name)}
            onClick={() => setActive(c.name)}
          >
            {c.name} {c.count}
          </button>
        ))}
      </div>

      <ul className="divide-y divide-[var(--border)]">
        {shown.map((p) => (
          <li key={`${p.category}/${p.slug}`}>
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
