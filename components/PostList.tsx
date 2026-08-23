"use client";

import Link from "next/link";
import { useState } from "react";
import type { CategoryCount } from "@/lib/posts";

export interface PostListItem {
  slug: string;
  title: string;
  date: string;
  category: string;
}

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
  const filtered = active ? posts.filter((p) => p.category === active) : posts;

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
        {filtered.map((p) => (
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
    </>
  );
}
