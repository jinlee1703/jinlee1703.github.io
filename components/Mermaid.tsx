"use client";

import { useEffect } from "react";

/**
 * 본문의 <div class="mermaid"> 요소를 mermaid.js로 렌더한다.
 * 정적 export 환경이라 클라이언트에서 동적 import로 처리한다.
 * 다크/라이트 토글 시에는 원본 소스를 복원해 현재 테마로 재렌더한다.
 */
export default function Mermaid() {
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(".mermaid"),
    );
    if (nodes.length === 0) return;

    // 재렌더용 원본 보존 — mermaid.run이 노드 내용을 SVG로 대체하기 때문
    const sources = nodes.map((n) => n.textContent ?? "");

    let cancelled = false;
    let running = false;

    const render = async () => {
      if (running) return;
      running = true;
      try {
        const mermaid = (await import("mermaid")).default;
        if (cancelled) return;
        const isDark = document.documentElement.classList.contains("dark");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          // 손그림(rough.js) 룩 — 도식이 딱딱한 박스 대신 일러스트 느낌이 나게
          look: "handDrawn",
          theme: "base",
          fontFamily:
            '"Pretendard Variable", Pretendard, system-ui, sans-serif',
          themeVariables: isDark
            ? {
                fontSize: "14px",
                primaryColor: "#1f2937",
                primaryTextColor: "#ededed",
                primaryBorderColor: "#374151",
                lineColor: "#9ca3af",
                secondaryColor: "#1f2937",
                tertiaryColor: "#171717",
                // pie 차트 텍스트 — 다크 배경에서 제목·범례가 보이게
                pieTitleTextColor: "#ededed",
                pieLegendTextColor: "#ededed",
                pieSectionTextColor: "#1a1a1a",
                pieOpacity: "0.9",
              }
            : {
                fontSize: "14px",
                primaryColor: "#f9fafb",
                primaryTextColor: "#1a1a1a",
                primaryBorderColor: "#d1d5db",
                lineColor: "#9ca3af",
                secondaryColor: "#f3f4f6",
                tertiaryColor: "#ffffff",
                pieTitleTextColor: "#1a1a1a",
                pieLegendTextColor: "#1a1a1a",
                pieSectionTextColor: "#1a1a1a",
                pieOpacity: "0.9",
              },
          flowchart: {
            curve: "basis",
            htmlLabels: true,
            padding: 14,
            nodeSpacing: 50,
            rankSpacing: 55,
            useMaxWidth: true,
          },
        });
        // 원본 복원 후 렌더 (테마 토글 재렌더 포함)
        nodes.forEach((n, i) => {
          n.textContent = sources[i] ?? "";
          n.removeAttribute("data-processed");
        });
        await mermaid.run({ nodes });
      } catch (err) {
        console.error("mermaid render error:", err);
        // 렌더 실패 시 원본 코드라도 보이도록 처리 표시
        for (const n of nodes) n.setAttribute("data-processed", "error");
      } finally {
        running = false;
      }
    };

    void render();

    // 테마 토글(html.dark) 감지 → 현재 테마로 재렌더
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.attributeName === "class")) void render();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return null;
}
