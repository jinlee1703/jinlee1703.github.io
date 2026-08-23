"use client";

import { useEffect, useRef } from "react";

const REPO = "jinlee1703/jinlee1703.github.io";

/**
 * utterances(GitHub Issues 기반) 댓글.
 * 글 경로(pathname)별로 이슈가 매핑된다.
 * 다크/라이트는 최초 마운트 시점의 테마를 따른다.
 *
 * 동작하려면 레포에 utterances GitHub App이 설치되어 있어야 한다:
 * https://github.com/apps/utterances
 */
export default function Comments() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const isDark = document.documentElement.classList.contains("dark");
    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("repo", REPO);
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("label", "comment");
    script.setAttribute("theme", isDark ? "github-dark" : "github-light");
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="mt-16 border-t border-[var(--border)] pt-8"
    />
  );
}
