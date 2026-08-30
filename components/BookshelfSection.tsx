import Link from "next/link";
import { getAllBooks } from "@/lib/books";

/** 홈 상단 '읽은 책' 섹션: 표지 그리드 + 전체 보기 링크 (kciter 스타일) */
export default function BookshelfSection() {
  const books = getAllBooks().slice(0, 10);
  if (books.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-[var(--muted)]">
          책장
        </h2>
        <Link
          href="/bookshelf/"
          className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          전체 보기 →
        </Link>
      </div>
      <ul className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-5">
        {books.map((book) => (
          <li key={book.slug}>
            <Link
              href={`/bookshelf/${book.slug}/`}
              className="group block"
              title={book.title}
            >
              {book.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.cover}
                  alt={book.title}
                  loading="lazy"
                  className="aspect-[2/3] w-full rounded-md border border-[var(--border)] object-cover transition-transform group-hover:-translate-y-1"
                />
              ) : (
                <div className="flex aspect-[2/3] w-full items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] p-2 text-center text-xs text-[var(--muted)] transition-transform group-hover:-translate-y-1">
                  {book.title}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
