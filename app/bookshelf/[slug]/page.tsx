import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllBookSlugs, getBookBySlug } from "@/lib/books";
import { renderMarkdown } from "@/lib/markdown";
import { SITE } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllBookSlugs().map((slug) => ({ slug }));
}

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const book = getBookBySlug(decodeURIComponent(slug));
  if (!book) return {};
  return {
    title: `${book.title} — 책`,
    description: `${book.author}${book.author ? " · " : ""}독서 기록`,
    alternates: { canonical: `/bookshelf/${book.slug}/` },
  };
}

function formatDate(iso: string): string {
  return iso.replace(/-/g, ".");
}

export default async function BookPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const book = getBookBySlug(decodeURIComponent(slug));
  if (!book) notFound();

  const html = book.content.trim() ? await renderMarkdown(book.content) : "";
  const url = `${SITE.url}/bookshelf/${book.slug}/`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    url,
    inLanguage: "ko-KR",
    itemReviewed: {
      "@type": "Book",
      name: book.title,
      ...(book.author ? { author: { "@type": "Person", name: book.author } } : {}),
    },
    author: { "@id": `${SITE.url}/#person` },
    datePublished: book.date,
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-1 text-sm text-[var(--muted)]">
        <Link
          href="/bookshelf/"
          className="transition-colors hover:text-[var(--foreground)]"
        >
          책
        </Link>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row">
        {book.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover}
            alt={book.title}
            className="h-64 w-44 shrink-0 self-start rounded-md border border-[var(--border)] object-cover"
          />
        ) : null}
        <div>
          <h1 className="text-2xl font-bold leading-snug tracking-tight">
            {book.title}
          </h1>
          {book.author && (
            <p className="mt-1 text-[var(--muted)]">{book.author}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            <time>{formatDate(book.date)}</time>
            {book.link && (
              <a
                href={book.link}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[var(--foreground)]"
              >
                링크 ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {html && (
        <article
          className="prose prose-neutral mt-10 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </main>
  );
}
