import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "개발자 이진우",
  description: "시간보다 중요한 건 밀도.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
