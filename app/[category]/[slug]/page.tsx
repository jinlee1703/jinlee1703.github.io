import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllPosts,
  getPostBySlug,
  getAllPostParams,
  getRelatedPosts,
} from "@/lib/posts";
import { renderMarkdown } from "@/lib/markdown";
import { extractToc } from "@/lib/toc";
import { SITE } from "@/lib/site";
import Toc from "@/components/Toc";
import Mermaid from "@/components/Mermaid";
import Comments from "@/components/Comments";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPostParams();
}

type Params = { category: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category, slug } = await params;
  const post = getPostBySlug(
    decodeURIComponent(category),
    decodeURIComponent(slug),
  );
  if (!post) return {};
  const url = `${SITE.url}/${post.category}/${post.slug}/`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/${post.category}/${post.slug}/` },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: [SITE.author],
      section: post.category,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function formatDate(iso: string): string {
  return iso.replace(/-/g, ".");
}

export default async function PostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category, slug } = await params;
  const post = getPostBySlug(
    decodeURIComponent(category),
    decodeURIComponent(slug),
  );
  if (!post) notFound();

  const html = await renderMarkdown(post.content);
  const toc = extractToc(post.content);

  // getAllPosts는 최신순이므로 idx-1이 더 최신(다음), idx+1이 더 과거(이전)
  const all = getAllPosts();
  const idx = all.findIndex(
    (p) => p.category === post.category && p.slug === post.slug,
  );
  const newer = idx > 0 ? all[idx - 1] : null;
  const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  const related = getRelatedPosts(post.category, post.slug, 3);
  const url = `${SITE.url}/${post.category}/${post.slug}/`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        inLanguage: "ko-KR",
        url,
        mainEntityOfPage: url,
        articleSection: post.category,
        author: { "@type": "Person", name: SITE.author, url: SITE.url },
        publisher: { "@id": `${SITE.url}/#person` },
        wordCount: post.content.trim().split(/\s+/).length,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: `${SITE.url}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: post.category,
            item: `${SITE.url}/${post.category}/`,
          },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-sm text-[var(--muted)]">
          <Link
            href={`/${post.category}/`}
            className="transition-colors hover:text-[var(--foreground)]"
          >
            {post.category}
          </Link>
          <span>·</span>
          <time>{formatDate(post.date)}</time>
        </div>
        <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-4 whitespace-pre-line leading-relaxed text-[var(--muted)]">
            {post.description}
          </p>
        )}
      </header>

      <Toc items={toc} />

      <article
        className="prose prose-neutral max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <Mermaid />

      <nav className="mt-16 grid grid-cols-1 gap-3 border-t border-[var(--border)] pt-8 sm:grid-cols-2">
        {older ? (
          <Link
            href={`/${older.category}/${older.slug}/`}
            className="rounded-lg border border-[var(--border)] p-4 transition-colors hover:border-[var(--accent)]"
          >
            <div className="text-xs text-[var(--muted)]">이전 글</div>
            <div className="mt-1 line-clamp-2 text-sm font-medium">
              {older.title}
            </div>
          </Link>
        ) : (
          <span />
        )}
        {newer ? (
          <Link
            href={`/${newer.category}/${newer.slug}/`}
            className="rounded-lg border border-[var(--border)] p-4 text-right transition-colors hover:border-[var(--accent)]"
          >
            <div className="text-xs text-[var(--muted)]">다음 글</div>
            <div className="mt-1 line-clamp-2 text-sm font-medium">
              {newer.title}
            </div>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-sm font-semibold text-[var(--muted)]">
            관련 글
          </h2>
          <ul className="space-y-2">
            {related.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/${p.category}/${p.slug}/`}
                  className="text-sm transition-colors hover:text-[var(--accent)]"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Comments />
    </main>
  );
}
