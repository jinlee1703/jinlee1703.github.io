import type { Metadata } from "next";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "개발자 이진우",
  description: "시간보다 중요한 건 밀도.",
};

// hydration 이전에 테마를 적용해 다크모드 깜빡임(FOUC)을 방지한다.
const themeScript = `
(function(){try{var t=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&m)){document.documentElement.classList.add('dark');}}catch(e){}})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-[var(--border)]">
          <div className="mx-auto max-w-2xl px-6 py-8 text-sm text-[var(--muted)]">
            © 2026 이진우
          </div>
        </footer>
      </body>
    </html>
  );
}
