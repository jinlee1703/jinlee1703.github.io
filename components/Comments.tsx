"use client";

import { useEffect, useRef } from "react";

const REPO = "jinlee1703/jinlee1703.github.io";

/**
 * utterances(GitHub Issues 기반) 댓글.
 * - 글 경로(pathname)별로 이슈가 매핑된다.
 * - 다크/라이트는 최초 마운트 시점의 테마를 따른다.
 * - 레포에 utterances GitHub App 설치 필요: https://github.com/apps/utterances
 *
 * 주의: 컨테이너를 innerHTML로 비우면 utterances 로드 콜백이 parent 없는 노드에
 * 접근하며 예외를 던져 페이지가 크래시한다. cleanup에서 DOM을 건드리지 않고,
 * 중복 삽입만 가드한다. hydration 이후 클라이언트에서만 채워지므로
 * suppressHydrationWarning을 준다.
 */
export default function Comments() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.querySelector("script")) return;

    const isDark = document.documentElement.classList.contains("dark");
    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("repo", REPO);
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("label", "comment");
    script.setAttribute("theme", isDark ? "github-dark" : "github-light");
    el.appendChild(script);
  }, []);

  return (
    <section
      ref={ref}
      suppressHydrationWarning
      className="mt-16 border-t border-[var(--border)] pt-8"
    />
  );
}
