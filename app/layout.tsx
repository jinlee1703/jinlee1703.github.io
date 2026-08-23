import type { Metadata } from "next";
import Header from "@/components/Header";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s | ${SITE.title}`,
  },
  description: SITE.description,
  alternates: {
    // canonical은 페이지별로 지정한다(레이아웃에 고정하면 모든 글이 홈으로 canonical됨).
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE.title,
    title: SITE.title,
    description: SITE.description,
    url: SITE.url,
  },
};

// hydration 이전에 테마를 적용해 다크모드 깜빡임(FOUC)을 방지한다.
const themeScript = `
(function(){try{var t=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&m)){document.documentElement.classList.add('dark');}}catch(e){}})();
`;

// 사이트 전역 구조화 데이터: WebSite + Person (검색/AI가 사이트·저자를 이해)
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: `${SITE.url}/`,
      name: SITE.title,
      description: SITE.description,
      inLanguage: "ko-KR",
      publisher: { "@id": `${SITE.url}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${SITE.url}/#person`,
      name: SITE.author,
      url: SITE.url,
      sameAs: [SITE.authorUrl],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-[var(--border)]">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-8 text-sm text-[var(--muted)]">
            <span>© 2026 이진우</span>
            <a
              href="/feed.xml"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              RSS
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
