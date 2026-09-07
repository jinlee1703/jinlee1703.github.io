"use client";

import { useEffect, useMemo, useState } from "react";
import type { TocItem } from "@/lib/toc";

type Group = { head: TocItem; children: TocItem[] };

/** h2를 헤더로, 그 아래 h3들을 children으로 묶는다. */
function groupByHead(items: TocItem[]): Group[] {
  const groups: Group[] = [];
  for (const it of items) {
    if (it.depth === 2 || groups.length === 0) {
      groups.push({ head: it, children: [] });
    } else {
      groups[groups.length - 1].children.push(it);
    }
  }
  return groups;
}

/**
 * 본문 옆 고정(sticky) 목차. h2별 아코디언으로 하위 h3를 접고 펼친다.
 * 스크롤에 따라 현재 섹션을 하이라이트하고, 해당 h2 그룹은 자동으로 펼쳐진다.
 * 넓은 화면(xl+)에서만 노출하며, 좁은 화면은 기존 접이식 Toc가 대신한다.
 */
export default function TocSidebar({ items }: { items: TocItem[] }) {
  const groups = useMemo(() => groupByHead(items), [items]);
  const [activeId, setActiveId] = useState<string>("");
  const [manualOpen, setManualOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (items.length === 0) return;

    // 뷰포트 상단(100px)을 지나간 마지막 헤딩을 현재 섹션으로 본다.
    const onScroll = () => {
      let current = "";
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= 100) current = it.id;
      }
      setActiveId(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  // 현재 활성 항목이 속한 h2 그룹의 id (h3가 활성이면 그 부모 h2)
  const activeHeadId = useMemo(() => {
    for (const g of groups) {
      if (g.head.id === activeId) return g.head.id;
      if (g.children.some((c) => c.id === activeId)) return g.head.id;
    }
    return "";
  }, [groups, activeId]);

  if (items.length === 0) return null;

  const linkClass = (id: string) =>
    `block leading-snug transition-colors ${
      id === activeId
        ? "font-medium text-[var(--accent)]"
        : "text-[var(--muted)] hover:text-[var(--foreground)]"
    }`;

  return (
    <nav aria-label="목차" className="text-sm">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        목차
      </div>
      <ul className="space-y-1.5">
        {groups.map((g) => {
          const hasChildren = g.children.length > 0;
          // 수동 토글이 있으면 그 값을, 없으면 활성 그룹은 펼침
          const open = hasChildren
            ? (manualOpen[g.head.id] ?? g.head.id === activeHeadId)
            : false;

          return (
            <li key={g.head.id}>
              <div className="flex items-start gap-1">
                <a href={`#${g.head.id}`} className={`${linkClass(g.head.id)} flex-1`}>
                  {g.head.text}
                </a>
                {hasChildren && (
                  <button
                    type="button"
                    aria-label={open ? "접기" : "펼치기"}
                    aria-expanded={open}
                    onClick={() =>
                      setManualOpen((prev) => ({ ...prev, [g.head.id]: !open }))
                    }
                    className="mt-0.5 shrink-0 text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform ${open ? "rotate-90" : ""}`}
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                )}
              </div>
              {hasChildren && open && (
                <ul className="mt-1.5 space-y-1.5 pl-3">
                  {g.children.map((c) => (
                    <li key={c.id}>
                      <a href={`#${c.id}`} className={linkClass(c.id)}>
                        {c.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
