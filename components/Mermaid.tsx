"use client";

import { useEffect } from "react";

/**
 * 본문의 <div class="mermaid"> 요소를 mermaid.js로 렌더한다.
 * 정적 export 환경이라 클라이언트에서 동적 import로 처리한다.
 * 다크/라이트는 최초 렌더 시점의 테마를 따른다.
 */
export default function Mermaid() {
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(".mermaid"),
    );
    if (nodes.length === 0) return;

    let cancelled = false;
    (async () => {
      const mermaid = (await import("mermaid")).default;
      if (cancelled) return;
      const isDark = document.documentElement.classList.contains("dark");
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? "dark" : "default",
        securityLevel: "strict",
      });
      try {
        await mermaid.run({ nodes });
      } catch (err) {
        console.error("mermaid render error:", err);
        // 렌더 실패 시 원본 코드라도 보이도록 처리 표시
        for (const n of nodes) n.setAttribute("data-processed", "error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
