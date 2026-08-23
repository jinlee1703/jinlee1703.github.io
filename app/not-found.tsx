import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-3 text-[var(--muted)]">페이지를 찾을 수 없습니다.</p>
      <Link
        href="/"
        className="mt-8 rounded-md border border-[var(--border)] px-4 py-2 text-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
