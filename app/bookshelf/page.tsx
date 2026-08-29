import type { Metadata } from "next";
import Link from "next/link";
import { getAllBooks } from "@/lib/books";

export const metadata: Metadata = {
  title: "책",
  description: "읽은 책과 감상을 기록합니다.",
  alternates: { canonical: "/bookshelf/" },
};

export default function BookshelfPage() {
  const books = getAllBooks();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">책</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          읽은 책과 감상을 기록합니다.
        </p>
      </header>

      {books.length === 0 ? (
        <p className="py-16 text-center text-sm text-[var(--muted)]">
          아직 기록한 책이 없습니다.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
          {books.map((book) => (
            <li key={book.slug}>
              <Link href={`/bookshelf/${book.slug}/`} className="group block">
                {book.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.cover}
                    alt={book.title}
                    loading="lazy"
                    className="aspect-[2/3] w-full rounded-md border border-[var(--border)] object-cover transition-transform group-hover:-translate-y-1"
                  />
                ) : (
                  <div className="flex aspect-[2/3] w-full items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-center text-sm text-[var(--muted)] transition-transform group-hover:-translate-y-1">
                    {book.title}
                  </div>
                )}
                <div className="mt-2 line-clamp-2 text-sm font-medium transition-colors group-hover:text-[var(--accent)]">
                  {book.title}
                </div>
                {book.author && (
                  <div className="text-xs text-[var(--muted)]">
                    {book.author}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
