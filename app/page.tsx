import type { Metadata } from "next";
import Link from "next/link";
import BookshelfSection from "@/components/BookshelfSection";
import { getAllPosts } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const RECENT_COUNT = 10;

function formatDate(iso: string): string {
  return iso.replace(/-/g, ".");
}

export default function Home() {
  const recent = getAllPosts().slice(0, RECENT_COUNT);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE.url}/#blog`,
    name: SITE.title,
    description: SITE.description,
    url: `${SITE.url}/`,
    inLanguage: "ko-KR",
    publisher: { "@id": `${SITE.url}/#person` },
    blogPost: recent.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE.url}/${p.category}/${p.slug}/`,
      datePublished: p.date,
    })),
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mb-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-[var(--muted)]">
            최근 글
          </h2>
          <Link
            href="/posts/"
            className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            글 전체 보기 →
          </Link>
        </div>
        <ul className="divide-y divide-[var(--border)]">
          {recent.map((p) => (
            <li key={`${p.category}/${p.slug}`}>
              <Link
                href={`/${p.category}/${p.slug}/`}
                className="group flex items-baseline justify-between gap-4 py-3"
              >
                <span className="flex-1 transition-colors group-hover:text-[var(--accent)]">
                  {p.title}
                </span>
                <span className="shrink-0 text-xs text-[var(--muted)]">
                  {p.category}
                </span>
                <time className="shrink-0 tabular-nums text-xs text-[var(--muted)]">
                  {formatDate(p.date)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <BookshelfSection />
    </main>
  );
}
